import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Release } from "../../models/Release";

const GITHUB_REPO = "EzClap-Gaming/Discord-Bot";

const ReleaseCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("release")
        .setDescription("Verwalte Release-Ankündigungen")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("set-channel")
                .setDescription("Setzt den Kanal für Release-Ankündigungen")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Kanal für Release-Ankündigungen")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Zeigt die letzten Releases an"),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "set-channel") {
            const channel = interaction.options.getChannel("channel") as TextChannel;
            if (!channel) {
                await interaction.reply({ content: "Ungültiger Kanal.", ephemeral: true });
                return;
            }

            try {
                await Release.updateOne(
                    { repo: `https://api.github.com/repos/${GITHUB_REPO}/releases/latest` },
                    { announcementChannelId: channel.id },
                    { upsert: true },
                );
                await interaction.reply({
                    content: `Der Kanal für Release-Ankündigungen wurde auf ${channel} gesetzt.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "Fehler beim Setzen des Kanals. Versuche es später erneut.",
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "list") {
            try {
                const releases = await Release.find({ repo: GITHUB_REPO });

                if (!releases || releases.length === 0) {
                    await interaction.reply({
                        content: "Keine Releases gefunden.",
                        ephemeral: true,
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle("Alle gespeicherten Releases")
                    .setColor("Blue")
                    .setTimestamp();

                releases.forEach((release) => {
                    embed.addFields({
                        name: release.latestReleaseName || "Unbekannt",
                        value: `[Link zum Release](${release.latestReleaseUrl || "#"})`,
                    });
                });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "Fehler beim Abrufen der Releases. Versuche es später erneut.",
                    ephemeral: true,
                });
            }
        }
    },
};

export default ReleaseCommand;
