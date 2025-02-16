import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const VersionCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("version")
        .setDescription("Zeigt die aktuelle Version des Bots an."),
    async execute(interaction: ChatInputCommandInteraction) {
        const botVersion = process.env.VERSION;
        const repositoryLink = process.env.REPOSITORY;
        const inviteLink =
            "https://discord.com/oauth2/authorize?client_id=1340341883108458516&scope=bot&permissions=8";

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("🔧 **Bot Version**")
            .setDescription(
                `
                Die aktuelle Version des Bots ist **${botVersion}**.\n\n
                🛠️ **Weitere Informationen:**\n
                - [Repository Link]( ${repositoryLink} )\n
                - [Bot Einladen]( ${inviteLink} )\n\n
                💡 **Hinweis:** Wenn du den Bot verbessern möchtest, schau dir das Repository an!`,
            )
            .setFooter({
                text: "Bot-Info",
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

export default VersionCommand;
