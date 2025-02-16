import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActivityType } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const SetStatusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('set-status')
        .setDescription('Setzt die Statusnachricht des Bots. Dies kann nur vom Bot-Besitzer verwendet werden. 🛠️')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Die neue Statusnachricht für den Bot. 🌟')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const botOwnerId = process.env.BOT_OWNER_ID;

            if (interaction.user.id !== botOwnerId) {
                const permissionEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription('❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.');

                await interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
                return;
            }

            const newStatus = interaction.options.getString('status');
            if (!newStatus) {
                interaction.reply({
                    content: '⚠️ Bitte gib eine Statusnachricht an.',
                    ephemeral: true
                });
                return;
            }

            await interaction.client.user?.setPresence({
                activities: [{ name: newStatus, type: ActivityType.Playing }],
                status: 'online',
            });

            console.log(`Bot-Status wurde aktualisiert: "${newStatus}"`);

            const statusUpdatedEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`✅ Der Bot-Status wurde aktualisiert auf: "${newStatus}"`);

            await interaction.reply({ embeds: [statusUpdatedEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error updating status:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('⚠️ Ein Fehler ist beim Aktualisieren des Bot-Status aufgetreten. Bitte versuche es später erneut.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

export default SetStatusCommand;
