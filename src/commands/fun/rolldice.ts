import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const RollDiceCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("roll-dice")
        .setDescription("Würfle einen Würfel und erhalte eine Zahl zwischen 1 und 6!"),

    async execute(interaction: ChatInputCommandInteraction) {
        const ergebnis = Math.floor(Math.random() * 6) + 1;

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Würfelergebnis")
            .setDescription(`Du hast eine **${ergebnis}** geworfen!`)
            .setFooter({
                text: `Angefordert von ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        await interaction.reply({ embeds: [embed] });
    },
};

export default RollDiceCommand;
