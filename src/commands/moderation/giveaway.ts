import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Giveaways } from "../../models/Giveaway";

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
                    option.setName("id").setDescription("ID des Giveaways").setRequired(true),
                ),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "create") {
            const title = interaction.options.getString("title", true);
            const description = interaction.options.getString("description", true);
            const duration = interaction.options.getInteger("duration", true);
            const winnersCount = interaction.options.getInteger("winners", true);

            const endTime = new Date(Date.now() + duration * 60000);

            try {
                const giveaway = new Giveaways({
                    title,
                    description,
                    endTime,
                    winners: winnersCount,
                    participants: [],
                    status: "active",
                });

                await giveaway.save();

                const embed = new EmbedBuilder()
                    .setTitle(`🎉 Giveaway: ${title}`)
                    .setDescription(
                        `${description}\n\nEndet am: ${endTime.toLocaleString()}\n\nReagiere mit 🎉, um teilzunehmen!`,
                    )
                    .setColor("Random");

                const channel = interaction.channel as TextChannel;
                const message = await channel.send({ embeds: [embed] });

                giveaway.messageId = message.id;
                await giveaway.save();

                await message.react("🎉");
                await interaction.reply({
                    content: "🎉 Giveaway erstellt!",
                    ephemeral: true,
                });
            } catch (error) {
                console.error("Fehler:", error);
                await interaction.reply({
                    content: "⚠️ Fehler beim Erstellen des Giveaways.",
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "end") {
            const id = interaction.options.getString("id", true);

            const giveaway = await Giveaways.findById(id);

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

            const participants = giveaway.participants;
            if (participants.length === 0) {
                await interaction.reply({
                    content: "⚠️ Keine Teilnehmer für dieses Giveaway.",
                    ephemeral: true,
                });
                return;
            }

            const winners: string[] = [];
            while (winners.length < giveaway.winners && participants.length > 0) {
                const randomIndex = Math.floor(Math.random() * participants.length);
                const winner = participants.splice(randomIndex, 1)[0];
                winners.push(winner);
            }

            await channel.send({
                content: `🎉 Glückwunsch an die Gewinner: ${winners.map((w) => `<@${w}>`).join(", ")}`,
            });
            await interaction.reply({
                content: "🎉 Giveaway wurde erfolgreich beendet.",
                ephemeral: true,
            });
        }

        if (subcommand === "list") {
            const giveaways = await Giveaways.find({ status: "active" });

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
                        .map((g) => `${g.title} - Endet am ${g.endsAt.toLocaleString()}`)
                        .join("\n"),
                )
                .setColor("Random");

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === "reroll") {
            const id = interaction.options.getString("id", true);

            const giveaway = await Giveaways.findById(id);

            if (!giveaway || giveaway.status === "active") {
                await interaction.reply({
                    content: "⚠️ Kein beendetes Giveaway mit dieser ID gefunden.",
                    ephemeral: true,
                });
                return;
            }

            const participants = giveaway.participants;
            if (participants.length === 0) {
                await interaction.reply({
                    content: "⚠️ Keine Teilnehmer für dieses Giveaway.",
                    ephemeral: true,
                });
                return;
            }

            const winners: string[] = [];
            while (winners.length < giveaway.winners && participants.length > 0) {
                const randomIndex = Math.floor(Math.random() * participants.length);
                const winner = participants.splice(randomIndex, 1)[0];
                winners.push(winner);
            }

            await interaction.reply({
                content: `🎉 Neue Gewinner: ${winners.map((w) => `<@${w}>`).join(", ")}`,
            });
        }
    },
};

export default GiveawayCommand;
