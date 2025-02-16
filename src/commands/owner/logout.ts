import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const LogoutCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("logout")
        .setDescription("Meldet den Bot ab. Dies kann nur vom Bot-Besitzer verwendet werden. 🔑"),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const botOwnerId = process.env.BOT_OWNER_ID;

            if (interaction.user.id !== botOwnerId) {
                const permissionEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription("❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.");

                await interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
                return;
            }

            const loggingOutEmbed = new EmbedBuilder()
                .setColor("#FFFF00")
                .setDescription("🔄 Der Bot meldet sich ab...");

            await interaction.deferReply({ ephemeral: true });

            await interaction.editReply({ embeds: [loggingOutEmbed] });

            await interaction.client.destroy();

            setTimeout(async () => {
                const loggedOutEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription("🔴 Der Bot wurde erfolgreich abgemeldet.");

                await interaction.editReply({ embeds: [loggedOutEmbed] });
            }, 3000);
        } catch (error) {
            console.error("Error logging out:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(
                    "⚠️ Ein Fehler ist beim Abmelden aufgetreten. Bitte versuche es später erneut.",
                );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};

export default LogoutCommand;
