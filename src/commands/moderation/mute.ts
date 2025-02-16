import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { Mute } from '../../models/Mute';

const MuteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute management commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Mutes a member in the server.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member to mute')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('reason')
                    .setDescription('Reason for muting')
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Unmutes a member in the server.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member to unmute')
                    .setRequired(true)
                )
                .addIntegerOption(option => option.setName('mute_number')
                    .setDescription('Mute number to remove')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('reason')
                    .setDescription('Reason for unmuting the member')
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lists all mutes for a member.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member whose mutes to list')
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('tempmute')
                .setDescription('Temporarily mutes a member in the server for a specified time.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member to mute')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('time')
                    .setDescription('The duration of the mute in seconds')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('reason')
                    .setDescription('Reason for muting')
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-all')
                .setDescription('Removes all mutes for a member from the server and database.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member whose mutes to remove')
                    .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Permission Denied')
                    .setDescription('You do not have permission to mute/unmute members.')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (subcommand === 'add') {
                const member = interaction.options.getMember('member') as GuildMember;
                const reason = interaction.options.getString('reason')!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const muteRole = interaction.guild?.roles.cache.find(role => role.name === 'Muted');
                if (!muteRole) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Mute Role Not Found')
                        .setDescription('Mute role not found. Please create a "Muted" role and try again.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await member.roles.add(muteRole, reason);

                const lastMute = await Mute.findOne({ guildId: interaction.guildId!, userId: member.id }).sort({ muteNumber: -1 });
                const muteNumber = lastMute ? lastMute.muteNumber + 1 : 1;

                const muteRecord = new Mute({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    reason,
                    muteNumber,
                    duration: 'Permanent',
                });
                await muteRecord.save();

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Member Muted')
                    .setDescription(`${member.user.tag} has been muted.`)
                    .addFields({ name: 'Reason', value: reason })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a message to the muted user
                const userEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('You have been muted')
                    .setDescription(`You have been muted by ${interaction.user.tag} for the following reason: ${reason}.`)
                    .setTimestamp();
                await member.send({ embeds: [userEmbed] });
            } else if (subcommand === 'remove') {
                const member = interaction.options.getMember('member') as GuildMember;
                const muteNumber = interaction.options.getInteger('mute_number')!;
                const reason = interaction.options.getString('reason')!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Find and remove the specified mute by mute number
                const muteRecord = await Mute.findOne({ guildId: interaction.guildId!, userId: member.id, muteNumber });
                if (muteRecord) {
                    // Remove the mute role
                    const muteRole = interaction.guild?.roles.cache.find(role => role.name === 'Muted');
                    if (muteRole && member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole);

                        // Log the unmute in the database
                        await Mute.deleteOne({ guildId: interaction.guildId!, userId: member.id, muteNumber });

                        const embed = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('Member Unmuted')
                            .setDescription(`${member.user.tag} has been unmuted.`)
                            .addFields({ name: 'Last mute reason', value: muteRecord.reason }, { name: 'Unmute reason', value: reason })
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });

                        // Send a message to the unmuted user
                        const userEmbed = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('You have been unmuted')
                            .setDescription(`You have been unmuted by ${interaction.user.tag}. Reason: ${reason}`)
                            .setTimestamp();
                        await member.send({ embeds: [userEmbed] });
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Mute Not Found')
                        .setDescription(`No mute with number ${muteNumber} found for ${member.user.tag}.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (subcommand === 'list') {
                const member = interaction.options.getMember('member') as GuildMember;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // List all mutes for the member
                const mutes = await Mute.find({ guildId: interaction.guildId!, userId: member.id }).sort({ muteNumber: -1 });
                if (mutes.length > 0) {
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`${member.user.tag}'s Mutes`)
                        .setDescription(`Listed below are all the mutes for ${member.user.tag}:`)
                        .addFields(
                            mutes.map((mute) => ({
                                name: `Mute #${mute.muteNumber} on ${new Date(mute.mutedAt).toLocaleString()}`,
                                value: `${mute.reason} (Duration: ${mute.duration})`,
                            }))
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('No Mutes Found')
                        .setDescription(`${member.user.tag} has never been muted.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (subcommand === 'tempmute') {
                const member = interaction.options.getMember('member') as GuildMember;
                const time = interaction.options.getString('time')!;
                const reason = interaction.options.getString('reason')!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Parse the time input
                const timeInSeconds = parseTime(time);
                if (!timeInSeconds) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Invalid Time Format')
                        .setDescription('Please provide a valid time format (e.g., 10s, 10m, 1h, 1d, 1w).')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Mute the user temporarily
                const muteRole = interaction.guild?.roles.cache.find(role => role.name === 'Muted');
                if (!muteRole) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Mute Role Not Found')
                        .setDescription('Mute role not found. Please create a "Muted" role and try again.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await member.roles.add(muteRole, reason);

                // Find the latest mute number for the user in this guild
                const latestMute = await Mute.findOne({ guildId: interaction.guildId!, userId: member.id }).sort({ muteNumber: -1 });
                const muteNumber = latestMute ? latestMute.muteNumber + 1 : 1;

                // Save temp mute in the database
                const muteRecord = new Mute({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    muteNumber,
                    reason,
                    duration: time, // Save the duration in the format provided by the user
                    mutedAt: new Date(),
                });
                await muteRecord.save();

                const successEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(`${member.user.tag} has been muted for ${time}.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [successEmbed] });

                // Send a Direct Message to the member
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('You Have Been Muted')
                    .setDescription(`You have been muted for ${time} due to: ${reason}.`)
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });

                // Unmute after the time expires
                setTimeout(async () => {
                    await member.roles.remove(muteRole);
                    await Mute.deleteOne({ userId: member.id, guildId: interaction.guildId!, reason });

                    const unmuteEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('You Have Been Unmuted')
                        .setDescription(`You have been unmuted. The mute duration of ${time} has expired.`)
                        .setTimestamp();
                    await member.send({ embeds: [unmuteEmbed] });
                }, timeInSeconds * 1000);
            } else if (subcommand === 'remove-all') {
                const member = interaction.options.getMember('member') as GuildMember;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Find all mutes for the member
                const mutes = await Mute.find({ guildId: interaction.guildId!, userId: member.id });

                if (mutes.length > 0) {
                    // Remove all mutes in the database
                    await Mute.deleteMany({ guildId: interaction.guildId!, userId: member.id });

                    // Remove the "Muted" role from the member
                    const muteRole = interaction.guild?.roles.cache.find(role => role.name === 'Muted');
                    if (muteRole && member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole);
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('All Mutes Removed')
                        .setDescription(`All mutes for ${member.user.tag} have been removed.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    // Send a message to the unmuted user
                    const userEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('All Your Mutes Have Been Removed')
                        .setDescription(`All of your mutes have been cleared by ${interaction.user.tag}.`)
                        .setTimestamp();
                    await member.send({ embeds: [userEmbed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('No Mutes Found')
                        .setDescription(`${member.user.tag} has no mutes to remove.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while processing the command.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

// Helper function to parse time strings
function parseTime(time: string): number | null {
    const timeRegex = /^(\d+)(s|m|h|d|w)$/;
    const match = time.match(timeRegex);
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
            case 'w':
                return value * 604800;
            default:
                return null;
        }
    }
    return null;
}

export default MuteCommand;
