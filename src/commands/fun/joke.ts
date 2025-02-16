import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const JokeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Erzähle einen zufälligen Witz!"),

    async execute(interaction: ChatInputCommandInteraction) {
        const joke = [
            "Warum kämpfen Skelette nicht miteinander? Sie haben keinen Mumm.",
            "Warum war das Mathematikbuch traurig? Weil es zu viele Probleme hatte.",
            "Was nennt man falsche Spaghetti? Eine Impasta.",
            "Ich sagte meinem Computer, dass ich eine Pause brauche, und jetzt schickt er mir ständig Kätzchen.",
            "Warum mögen Programmierer die Natur nicht? Sie hat zu viele Bugs.",
        ];

        const randomJoke = joke[Math.floor(Math.random() * joke.length)];

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Hier ist ein Witz für dich!")
            .setDescription(randomJoke)
            .setFooter({
                text: `Angefordert von ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

export default JokeCommand;
