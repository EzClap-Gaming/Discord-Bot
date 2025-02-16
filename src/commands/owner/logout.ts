import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const LogoutCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Logs out the bot. This can only be used by the bot owner. 🔑'),
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

            const loggingOutEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setDescription('🔄 Logging out...');

            await interaction.deferReply({ ephemeral: true });

            await interaction.editReply({ embeds: [loggingOutEmbed] });

            await interaction.client.destroy();

            setTimeout(async () => {
                const loggedOutEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('🔴 Logged out already.');

                await interaction.editReply({ embeds: [loggedOutEmbed] });
            }, 3000);
        } catch (error) {
            console.error('[Logout] Error logging out:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('⚠️ An error occurred while logging out. Please try again later.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};

export default LogoutCommand;
