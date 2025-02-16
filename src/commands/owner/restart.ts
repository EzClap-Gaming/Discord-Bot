import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { exec } from 'child_process';

const RestartCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Startet den Bot neu. Dies kann nur vom Bot-Besitzer verwendet werden. 🔄'),
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

            const restartingEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('🔄 Der Bot wird neu gestartet...');

            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ embeds: [restartingEmbed] });

            exec('pm2 restart Bot-EzClap', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('Random')
                        .setDescription('⚠️ Ein Fehler ist beim Neustart des Bots über PM2 aufgetreten. Bitte versuche es später erneut.');

                    interaction.editReply({ embeds: [errorEmbed] });
                    return;
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                console.log(`stdout: ${stdout}`);

                const successEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription('✅ Der Bot wurde erfolgreich neu gestartet.');

                interaction.editReply({ embeds: [successEmbed] });
            });

        } catch (error) {
            console.error('Error restarting:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('⚠️ Ein Fehler ist beim Neustart aufgetreten. Bitte versuche es später erneut.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

export default RestartCommand;
