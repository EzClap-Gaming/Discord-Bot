import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const EmojifyCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("emojify")
        .setDescription("Konvertiert deinen Text in Emojis.")
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("Text, der in Emojis umgewandelt werden soll")
                .setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("text")!;
        const emojifiedText = text
            .split("")
            .map((char) => {
                return char === " " ? "   " : `:regional_indicator_${char.toLowerCase()}:`;
            })
            .join(" ");

        const emojifyEmbed = new EmbedBuilder().setColor("Random").setDescription(emojifiedText);

        await interaction.reply({ embeds: [emojifyEmbed] });
    },
};

export default EmojifyCommand;
