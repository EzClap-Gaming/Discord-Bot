import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import PDFDocument from "pdfkit";
import { Command } from "../../functions/handleCommands";
import { Writable } from "stream";

const PDFCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("pdf")
        .setDescription("Konvertiert Text in eine gut formatierte PDF-Datei.")
        .addStringOption((option) =>
            option.setName("title").setDescription("Titel des PDF-Dokuments").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("Der Inhalt, der in ein PDF konvertiert werden soll")
                .setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const title = interaction.options.getString("title", true);
        const text = interaction.options.getString("text", true);

        try {
            const pdfBuffer = await generatePDF(title, text);
            const attachment = new AttachmentBuilder(pdfBuffer, {
                name: "dokument.pdf",
            });

            await interaction.reply({
                content: `📄 **PDF erstellt: ${title}**\nLade es hier herunter:`,
                files: [attachment],
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            await interaction.reply({
                content: "⚠️ Es ist ein Fehler beim Erstellen der PDF aufgetreten.",
                ephemeral: true,
            });
        }
    },
};

export default PDFCommand;

/**
 * Erstellt eine formatierte PDF-Datei.
 * @param title Titel des PDFs
 * @param text Inhalt des PDFs
 * @returns Buffer mit PDF-Daten
 */
async function generatePDF(title: string, text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        const stream = new Writable({
            write(chunk, _, callback) {
                chunks.push(chunk);
                callback();
            },
        });

        doc.pipe(stream);

        // Titel
        doc.font("Helvetica-Bold").fontSize(20).text(title, { align: "center" }).moveDown(1);

        // Inhalt
        doc.font("Helvetica").fontSize(12).text(text, {
            align: "justify",
            lineGap: 6,
        });

        doc.end();

        stream.on("finish", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}
