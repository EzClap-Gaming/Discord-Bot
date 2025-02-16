import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, GuildMember, User } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { Ban, IBan } from '../../models/Ban';

const BanCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Manage bans for a member in the server.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ban a member from the server.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member to ban')
                    .setRequired(true)
                )
                .addStringOption(option => option.setName('reason')
                    .setDescription('Reason for the ban')
                    .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a ban from a member.')
                .addUserOption(option => option.setName('member')
                    .setDescription('The member to unban')
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all banned members.')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            // Add Ban
            if (subcommand === 'add') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Permission Denied')
                        .setDescription('You do not have permission to ban members.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const member = interaction.options.getMember('member') as GuildMember;
                const reason = interaction.options.getString('reason') || 'No reason provided';

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Member Not Found')
                        .setDescription('Could not find the specified member.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Create a new ban entry in the database
                const ban = new Ban({
                    userId: member.user.id,
                    reason,
                    bannedBy: interaction.user.id,
                });

                await ban.save();  // Save the ban record in MongoDB

                // Ban the user
                await member.ban({ reason });

                const embed = new EmbedBuilder()
                    .setColor('#00AAFF')
                    .setTitle('Member Banned')
                    .setDescription(`${member.user.tag} has been banned from the server.`)
                    .addFields({ name: 'Reason', value: reason })
                    .setFooter({ text: `Banned by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Remove Ban
            if (subcommand === 'remove') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Permission Denied')
                        .setDescription('You do not have permission to unban members.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const user = interaction.options.getUser('member') as User;

                if (!user) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('User Not Found')
                        .setDescription('Could not find the specified user.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await interaction.guild?.members.unban(user);

                // Remove the ban entry from the database
                await Ban.deleteOne({ userId: user.id });

                const embed = new EmbedBuilder()
                    .setColor('#00AAFF')
                    .setTitle('Member Unbanned')
                    .setDescription(`${user.tag} has been unbanned from the server.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // List Bans
            if (subcommand === 'list') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Permission Denied')
                        .setDescription('You do not have permission to view the banned users.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Retrieve the list of banned users from the database
                const bans = await Ban.find();

                const bannedList = bans.map((ban: IBan) => `<@${ban.userId}>`).join('\n') || 'No banned members.';
                const embed = new EmbedBuilder()
                    .setColor('#00AAFF')
                    .setTitle('Banned Members')
                    .setDescription(bannedList)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            console.error('[BanCommand] Error:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while processing the command. Please try again later.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default BanCommand;
