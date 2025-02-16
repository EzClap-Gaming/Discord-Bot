import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, ChannelType, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const InviteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('einladen')
        .setDescription('Erhalte einen Einladungslink für den Server.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const textChannel = interaction.guild?.channels.cache.find(channel => channel.type === ChannelType.GuildText) as TextChannel;

        if (!textChannel) {
            await interaction.reply({ content: 'Kein Textkanal gefunden, um eine Einladung zu erstellen.', ephemeral: true });
            return;
        }

        try {
            const invite = await textChannel.createInvite({ unique: true, maxAge: 0 });

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Server Einladungslink')
                .setDescription('Klicke auf den Link unten, um dem Server beizutreten!')
                .addFields({ name: 'Einladungslink', value: `[Hier Beitreten](${invite.url})` }, { name: 'Einladungs-URL', value: `${invite.url}` })
                .setFooter({ text: `Angefordert von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error creating invite:', error);
            await interaction.reply({ content: 'Es konnte kein Einladungslink erstellt werden.', ephemeral: true });
        }
    },
};

export default InviteCommand;
