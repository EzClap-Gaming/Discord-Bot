import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const FlipCoinCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('flip-coin')
        .setDescription('Wirf eine Münze und erhalte ein Ergebnis!'),

    async execute(interaction: ChatInputCommandInteraction) {
        const result = Math.random() < 0.5 ? 'Kopf' : 'Zahl';

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Münzwurf-Ergebnis')
            .setDescription(`Das Ergebnis ist: **${result}**`)
            .setFooter({ text: `Angefordert von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

export default FlipCoinCommand;
