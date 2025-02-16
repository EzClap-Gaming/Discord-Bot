import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const ShutdownCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot. This can only be used by the bot owner. ⚠️'),
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

            const shuttingDownEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setDescription('🛑 Shutting down...');

            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ embeds: [shuttingDownEmbed] });

            setTimeout(() => {
                process.exit();
            }, 1000);

        } catch (error) {
            console.error('[Shutdown] Error shutting down:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('⚠️ An error occurred while shutting down. Please try again later.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

export default ShutdownCommand;
