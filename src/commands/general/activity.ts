import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Activity } from '../../models/Activity';

export default {
    data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('Verwaltet Aktivitätsstatistiken.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Zeigt die Rangliste für Nachrichten und Sprachaktivität.')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (interaction.options.getSubcommand() === 'leaderboard') {
                const guildId = interaction.guildId;
                if (!guildId) return;

                const topUsers = await Activity.find({ guildId })
                    .sort({ messagesSent: -1, voiceTime: -1 })
                    .limit(10);

                if (topUsers.length === 0) {
                    await interaction.reply({ content: 'Es wurden noch keine Aktivitäten aufgezeichnet.', ephemeral: true });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle('🏆 Aktivitäts-Rangliste')
                    .setColor('Random')
                    .setDescription('Top 10 Benutzer basierend auf gesendeten Nachrichten und Sprachzeit.')
                    .setTimestamp();

                topUsers.forEach((user, index) => {
                    embed.addFields({
                        name: `#${index + 1} <@${user.userId}>`,
                        value: `📝 Nachrichten: **${user.messagesSent}**\n🎙 Sprachzeit: **${Math.floor(user.voiceTime / 60)} min**`,
                        inline: false,
                    });
                });

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.reply({ content: 'Es ist ein Fehler beim Abrufen der Rangliste aufgetreten.', ephemeral: true });
        }
    },
};
