import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Giveaway } from "../../models/Giveaway";

const GiveawayCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Verwaltet Giveaways")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Erstellt ein neues Giveaway.")
                .addStringOption((option) =>
                    option.setName("title").setDescription("Titel des Giveaways").setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Beschreibung des Giveaways")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Dauer des Giveaways in Minuten")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("winners")
                        .setDescription("Anzahl der Gewinner")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("end")
                .setDescription("Beendet ein aktives Giveaway.")
                .addStringOption((option) =>
                    option.setName("id").setDescription("ID des Giveaways").setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Zeigt alle aktiven Giveaways an."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reroll")
                .setDescription("Ermittelt neue Gewinner für ein beendetes Giveaway.")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription("Message ID des Giveaways")
                        .setRequired(true),
                ),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "create") {
            const title = interaction.options.getString("title", true);
            const description = interaction.options.getString("description", true);
            const duration = interaction.options.getInteger("duration", true);
            const winnersCount = interaction.options.getInteger("winners", true);
            const endsAt = new Date(Date.now() + duration * 60000);

            try {
                const embed = new EmbedBuilder()
                    .setTitle(`🎉 Giveaway: ${title}`)
                    .setDescription(
                        `${description}\n\nKlicke auf den Button, um teilzunehmen!\n\nEndet am: ${endsAt.toLocaleString()}`,
                    )
                    .setColor("Random");

                const channel = interaction.channel as TextChannel;
                const message = await channel.send({
                    embeds: [embed],
                    components: [
                        {
                            type: 1, // ActionRow
                            components: [
                                {
                                    type: 2, // Button
                                    style: 1, // Primary Button
                                    label: "🎉 Teilnehmen (0)", // Anfangs 0 Teilnehmer
                                    customId: "join_giveaway", // Setze die customId für den Button
                                },
                            ],
                        },
                    ],
                });

                const giveaway = new Giveaway({
                    guildId: interaction.guildId,
                    messageId: message.id,
                    channelId: interaction.channelId,
                    title,
                    description,
                    winnerNumber: winnersCount,
                    participants: [], // Initial empty participants array
                    winner: "", // Winner is empty initially
                    endsAt,
                    status: "active",
                });

                await giveaway.save();
                await interaction.reply({
                    content: "🎉 Giveaway erstellt! Du kannst jetzt teilnehmen!",
                    ephemeral: true,
                });

                setTimeout(async () => {
                    const updatedGiveaway = await Giveaway.findById(giveaway._id);
                    if (!updatedGiveaway || updatedGiveaway.status !== "active") return;

                    updatedGiveaway.status = "ended";
                    await updatedGiveaway.save();

                    let winners: string[] = [];
                    if (updatedGiveaway.participants.length > 0) {
                        winners = [...updatedGiveaway.participants]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, updatedGiveaway.winnerNumber);
                    }

                    updatedGiveaway.winner = winners.join(", ");
                    await updatedGiveaway.save();

                    const resultEmbed = new EmbedBuilder()
                        .setTitle(`🏆 Giveaway Beendet: ${updatedGiveaway.title}`)
                        .setDescription(
                            winners.length > 0
                                ? `🎉 **Glückwunsch an:** ${winners.map((w) => `<@${w}>`).join(", ")}`
                                : "⚠️ Keine Teilnehmer, daher keine Gewinner!",
                        )
                        .setColor("Gold");

                    await channel.send({ embeds: [resultEmbed] });
                }, duration * 60000);
            } catch (error) {
                console.error("Fehler:", error);
                await interaction.reply({
                    content: "⚠️ Fehler beim Erstellen des Giveaways.",
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "end") {
            const messageId = interaction.options.getString("id", true);
            const giveaway = await Giveaway.findOne({ messageId });

            if (!giveaway || giveaway.status !== "active") {
                await interaction.reply({
                    content: "⚠️ Kein aktives Giveaway mit dieser ID gefunden.",
                    ephemeral: true,
                });
                return;
            }

            giveaway.status = "ended";
            await giveaway.save();

            const embed = new EmbedBuilder()
                .setTitle(`🎉 Giveaway Beendet: ${giveaway.title}`)
                .setDescription("Das Giveaway ist beendet. Die Gewinner werden bekannt gegeben.")
                .setColor("Random");

            const channel = interaction.channel as TextChannel;
            await channel.send({ embeds: [embed] });

            if (giveaway.participants.length === 0) {
                await interaction.reply({
                    content: "⚠️ Keine Teilnehmer für dieses Giveaway.",
                    ephemeral: true,
                });
                return;
            }

            const winners = giveaway.participants
                .sort(() => Math.random() - 0.5)
                .slice(0, giveaway.winnerNumber);

            await channel.send({
                content: `🎉 Glückwunsch an die Gewinner: ${winners.map((w) => `<@${w}>`).join(", ")}`,
            });

            await interaction.reply({
                content: "🎉 Giveaway wurde erfolgreich beendet.",
                ephemeral: true,
            });
        }

        if (subcommand === "list") {
            const giveaways = await Giveaway.find({ status: "active" });

            if (giveaways.length === 0) {
                await interaction.reply({
                    content: "⚠️ Keine aktiven Giveaways gefunden.",
                    ephemeral: true,
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("🎉 Aktive Giveaways")
                .setDescription(
                    giveaways
                        .map(
                            (g) =>
                                `${g.title} - Endet am ${g.endsAt.toLocaleString()} - ||${g.messageId}||`,
                        )
                        .join("\n"),
                )
                .setColor("Random");

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === "reroll") {
            const messageId = interaction.options.getString("id", true);
            const giveaway = await Giveaway.findOne({ messageId });

            if (!giveaway || giveaway.status !== "ended") {
                await interaction.reply({
                    content: "⚠️ Kein beendetes Giveaway mit dieser ID gefunden.",
                    ephemeral: true,
                });
                return;
            }

            if (giveaway.participants.length === 0) {
                await interaction.reply({
                    content: "⚠️ Keine Teilnehmer für dieses Giveaway.",
                    ephemeral: true,
                });
                return;
            }

            const winners = giveaway.participants
                .sort(() => Math.random() - 0.5)
                .slice(0, giveaway.winnerNumber);

            giveaway.winner = winners.join(", ");
            await giveaway.save();

            await interaction.reply({
                content: `🎉 Neue Gewinner: ${winners.map((w) => `<@${w}>`).join(", ")}`,
                ephemeral: true,
            });
        }
    },
};

export default GiveawayCommand;
