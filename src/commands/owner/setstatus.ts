import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActivityType } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const SetStatusCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('set-status')
        .setDescription('Sets the bot\'s status message. This can only be used by the bot owner. 🛠️')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('The new status for the bot. 🌟')
                .setRequired(true)
        ),
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

            const newStatus = interaction.options.getString('status');
            if (!newStatus) {
                interaction.reply({
                    content: '⚠️ Please provide a status message.',
                    ephemeral: true
                });
                return;
            }

            await interaction.client.user?.setPresence({
                activities: [{ name: newStatus, type: ActivityType.Playing }],
                status: 'online',
            });

            const statusUpdatedEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`✅ Bot status has been updated to: "${newStatus}"`);

            await interaction.reply({ embeds: [statusUpdatedEmbed], ephemeral: true });
        } catch (error) {
            console.error('[SetStatus] Error updating status:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('⚠️ An error occurred while updating the bot status. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

export default SetStatusCommand;
