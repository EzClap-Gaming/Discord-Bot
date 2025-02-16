import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const ShutdownCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Fährt den Bot herunter. Dies kann nur vom Bot-Besitzer verwendet werden.'),
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

            const shuttingDownEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('🛑 Der Bot wird heruntergefahren...');

            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ embeds: [shuttingDownEmbed] });

            console.log('Bot wird in 1 Sekunde heruntergefahren...');

            setTimeout(() => {
                console.log('Der Bot wurde erfolgreich gestoppt.');
                process.exit();
            }, 1000);

        } catch (error) {
            console.error('Error shutting down:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('⚠️ Ein Fehler ist beim Herunterfahren aufgetreten. Bitte versuche es später erneut.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

export default ShutdownCommand;
