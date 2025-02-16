import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const NicknameCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Changes a member\'s nickname. This can only be used by moderators.')
        .addUserOption(option => option.setName('member')
            .setDescription('The member whose nickname to change')
            .setRequired(true)
        )
        .addStringOption(option => option.setName('nickname')
            .setDescription('The new nickname for the member')
            .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ChangeNickname)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Permission Denied')
                    .setDescription('You do not have permission to change nicknames.')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const member = interaction.options.getMember('member') as GuildMember;
            const nickname = interaction.options.getString('nickname')!;

            if (!member) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Member Not Found')
                    .setDescription('Member not found!')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Nickname Changed')
                .setDescription(`${member.user.tag}'s nickname has been changed to ${nickname}.`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('[Nickname] Error changing nickname:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while changing the nickname. Please try again later.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default NicknameCommand;
