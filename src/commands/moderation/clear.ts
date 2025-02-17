import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";

const ClearCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Löscht Befehle oder Nachrichten.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("commands")
                .setDescription("Löscht alle Bot-Befehle.")
                .addStringOption((option) =>
                    option
                        .setName("amount")
                        .setDescription(
                            "Geben Sie die Anzahl der zu löschenden Befehle an oder geben Sie „all“ ein, um alle zu löschen.",
                        )
                        .setRequired(false)
                        .addChoices({ name: "All", value: "all" }),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("messages")
                .setDescription("Löscht eine angegebene Anzahl von Nachrichten im aktuellen Kanal.")
                .addStringOption((option) =>
                    option
                        .setName("amount")
                        .setDescription(
                            "Geben Sie die Anzahl der zu löschenden Nachrichten an oder geben Sie „alle“ ein, um alle zu löschen.",
                        )
                        .setRequired(false)
                        .addChoices({ name: "All", value: "all" }),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === "commands") {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Zugriff verweigert")
                        .setDescription(
                            "Sie verfügen nicht über die erforderlichen Berechtigungen zum Löschen von Befehlen.",
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const amount = interaction.options.getString("amount");

                if (amount === "all") {
                    // Clear all commands
                    await interaction.client.application?.commands.set([]);
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Gelöschte Befehle")
                        .setDescription("Alle Befehle wurden erfolgreich gelöscht.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Ungültige Eingabe")
                        .setDescription("Bitte geben Sie „alle“ an, um alle Befehle zu löschen.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            if (subcommand === "messages") {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Zugriff verweigert")
                        .setDescription("Sie sind nicht berechtigt, Nachrichten zu löschen.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const amount = interaction.options.getString("amount") || "10";

                if (amount === "all") {
                    const channel = interaction.channel;
                    if (channel instanceof TextChannel) {
                        const messages = await channel.messages.fetch({ limit: 100 });
                        if (messages.size > 0) {
                            await channel.bulkDelete(messages, true);
                            const embed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Gelöschte Nachrichten")
                                .setDescription(`Alle Nachrichten wurden gelöscht.`)
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Keine Nachrichten gefunden")
                                .setDescription("Keine zu löschenden Nachrichten gefunden.")
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Ungültiger Kanal")
                            .setDescription(
                                "Dieser Befehl kann nur in einem Textkanal verwendet werden.",
                            )
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                } else {
                    const numAmount = parseInt(amount, 10);

                    const channel = interaction.channel;
                    if (channel instanceof TextChannel) {
                        const messages = await channel.messages.fetch({ limit: numAmount });
                        if (messages.size > 0) {
                            await channel.bulkDelete(messages, true);
                            const embed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Gelöschte Nachrichten")
                                .setDescription(`${numAmount} Nachrichten wurden gelöscht.`)
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Keine Nachrichten gefunden")
                                .setDescription("Keine zu löschenden Nachrichten gefunden.")
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Ungültiger Kanal")
                            .setDescription(
                                "Dieser Befehl kann nur in einem Textkanal verwendet werden.",
                            )
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Error")
                .setDescription(
                    "Beim Verarbeiten des Befehls ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default ClearCommand;
