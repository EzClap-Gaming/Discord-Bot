import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { exec } from 'child_process';

const RestartCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot. This can only be used by the bot owner. 🔄'),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const botOwnerId = process.env.BOT_OWNER_ID;

            if (interaction.user.id !== botOwnerId) {
                const permissionEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You do not have permission to use this command.');

                await interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
                return;
            }

            const restartingEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setDescription('🔄 Restarting...');

            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ embeds: [restartingEmbed] });

            exec('pm2 restart API-DEV', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('⚠️ An error occurred while restarting the bot using PM2. Please try again later.');

                    interaction.editReply({ embeds: [errorEmbed] });
                    return;
                }

                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }

                console.log(`stdout: ${stdout}`);

                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setDescription('✅ The bot has been restarted successfully.');

                interaction.editReply({ embeds: [successEmbed] });
            });

        } catch (error) {
            console.error('[Restart] Error restarting:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('⚠️ An error occurred while restarting. Please try again later.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

export default RestartCommand;
