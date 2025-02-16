import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import QRCode from "qrcode";
import { Command } from "../../functions/handleCommands";

const QRCodeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("qrcode")
        .setDescription("Generiert einen QR-Code aus einer angegebenen URL.")
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("Die URL, die in einen QR-Code umgewandelt werden soll.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Ein Titel, der den QR-Code beschreibt.")
                .setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const url = interaction.options.getString("url", true);
        const title = interaction.options.getString("title", true);

        try {
            new URL(url);
        } catch (error) {
            await interaction.reply({
                content: "⚠️ Bitte gib eine gültige URL an.",
                ephemeral: true,
            });
            return;
        }

        try {
            const qrBuffer = await QRCode.toBuffer(url, {
                type: "png",
                errorCorrectionLevel: "H",
            });
            const attachment = new AttachmentBuilder(qrBuffer, {
                name: "qrcode.png",
            });

            await interaction.reply({
                content: `📌 **${title}**\n🔗 **[Klicke hier](${url})**\n\nScanne den QR-Code unten, um die URL zu öffnen:`,
                files: [attachment],
            });
        } catch (error) {
            console.error("Error generating the QR code:", error);
            await interaction.reply({
                content: "⚠️ Es ist ein Fehler beim Generieren des QR-Codes aufgetreten.",
                ephemeral: true,
            });
        }
    },
};

export default QRCodeCommand;
