import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Guild } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const ServerStatsCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Zeigt die Echtzeit-Serverstatistiken an.'),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({ content: '⚠️ Dieser Befehl kann nur auf einem Server verwendet werden.', ephemeral: true });
            return;
        }

        const guild: Guild = interaction.guild;

        try {
            const members = await guild.members.fetch();
            const totalMembers = guild.memberCount;
            const onlineMembers = members.filter(member => !member.user.bot && (member.presence?.status === 'online' || member.presence?.status === 'dnd' || member.presence?.status === 'idle')).size;
            const textChannels = guild.channels.cache.filter(channel => channel.isTextBased()).size;
            const voiceChannels = guild.channels.cache.filter(channel => channel.isVoiceBased()).size;
            const serverCreationDate = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
            const iconUrl = guild.iconURL() || '';

            const embed = new EmbedBuilder()
                .setTitle(`📊 **Server-Statistiken für ${guild.name}**`)
                .setColor('Random')
                .setThumbnail(guild.iconURL({ size: 1024 }) || '')
                .addFields(
                    { name: '👥 Gesamtmitglieder', value: `${totalMembers}`, inline: true },
                    { name: '🟢 Online Mitglieder', value: `${onlineMembers}`, inline: true },
                    { name: '💬 Textkanäle', value: `${textChannels}`, inline: true },
                    { name: '🔊 Sprachkanäle', value: `${voiceChannels}`, inline: true },
                    { name: '📅 Server erstellt am', value: serverCreationDate, inline: false },
                )
                .setImage(iconUrl)
                .setFooter({ text: `Abgerufen von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Fehler beim Abrufen der Mitglieder:', error);
            await interaction.reply({ content: '⚠️ Es gab einen Fehler beim Abrufen der Serverstatistiken.', ephemeral: true });
        }
    }
};

export default ServerStatsCommand;
