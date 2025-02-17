import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Report } from "../../models/Report";

const ReportCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Verwalte Reports")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Erstelle einen neuen Report")
                .addUserOption((option) =>
                    option
                        .setName("reported")
                        .setDescription("Das Mitglied, das gemeldet werden soll")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Grund für die Meldung")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("priority")
                        .setDescription("Priorität der Meldung (hoch, mittel, niedrig)")
                        .setRequired(true)
                        .addChoices(
                            { name: "Hoch", value: "hoch" },
                            { name: "Mittel", value: "mittel" },
                            { name: "Niedrig", value: "niedrig" },
                        ),
                )
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Typ der Meldung (z.B. Spam, Beleidigung, Betrug)")
                        .setRequired(true)
                        .addChoices(
                            { name: "Spam", value: "Spam" },
                            { name: "Beleidigung", value: "Beleidigung" },
                            { name: "Betrug", value: "Betrug" },
                            { name: "Sonstiges", value: "Sonstiges" },
                        ),
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Detaillierte Beschreibung der Meldung")
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("view")
                .setDescription("Zeige die Details eines Reports an")
                .addStringOption((option) =>
                    option
                        .setName("reportid")
                        .setDescription("Die ID des Reports, den du ansehen möchtest")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("update")
                .setDescription("Aktualisiere den Status eines Reports")
                .addStringOption((option) =>
                    option
                        .setName("reportid")
                        .setDescription("Die ID des Reports, den du aktualisieren möchtest")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Neuer Status des Reports")
                        .setRequired(true)
                        .addChoices(
                            { name: "Open", value: "Open" },
                            { name: "In Progress", value: "In Progress" },
                            { name: "Resolved", value: "Resolved" },
                            { name: "Closed", value: "Closed" },
                            { name: "Archived", value: "Archived" },
                        ),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("close")
                .setDescription("Schließe einen Report")
                .addStringOption((option) =>
                    option
                        .setName("reportid")
                        .setDescription("Die ID des Reports, den du schließen möchtest")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Liste alle offenen Reports auf"),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("archived").setDescription("Liste alle archivierten Reports auf"),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("closed").setDescription("Liste alle geschlossenen Reports auf"),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === "create") {
                const reported = interaction.options.getUser("reported");
                const reason = interaction.options.getString("reason")!;
                const priority = interaction.options.getString("priority")!;
                const type = interaction.options.getString("type")!;
                const description =
                    interaction.options.getString("description") || "Keine Beschreibung angegeben.";

                const report = new Report({
                    type,
                    reporterId: interaction.user.id,
                    reporterName: interaction.user.username,
                    reportedId: reported?.id!,
                    reportedName: reported?.username!,
                    reason,
                    description,
                    priority,
                    status: "Open",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await report.save();

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Report erstellt")
                    .setDescription(
                        `Dein Report gegen **${reported?.username}** wurde erfolgreich erstellt!`,
                    )
                    .addFields(
                        { name: "Grund", value: reason, inline: true },
                        { name: "Priorität", value: priority, inline: true },
                        { name: "Typ", value: type, inline: true },
                        { name: "Status", value: "Open", inline: true },
                        { name: "Beschreibung", value: description, inline: false },
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "view") {
                const reportId = interaction.options.getString("reportid")!;

                const report = await Report.findOne({ id: reportId });
                if (!report) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Report nicht gefunden")
                        .setDescription(`Kein Report mit der ID **${reportId}** gefunden.`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(`Report von ${report.reporterName}`)
                    .addFields(
                        { name: "Report ID", value: report.id, inline: true },
                        { name: "Gemeldetes Mitglied", value: report.reportedName, inline: true },
                        { name: "Grund", value: report.reason, inline: false },
                        { name: "Priorität", value: report.priority, inline: true },
                        { name: "Status", value: report.status, inline: true },
                        {
                            name: "Beschreibung",
                            value: report.description || "Keine Beschreibung",
                            inline: false,
                        },
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "update") {
                const reportId = interaction.options.getString("reportid")!;
                const status = interaction.options.getString("status")!;

                const report = await Report.findOne({ id: reportId });
                if (!report) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Report nicht gefunden")
                        .setDescription(`Kein Report mit der ID **${reportId}** gefunden.`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                report.status = status;
                report.updatedAt = new Date();
                await report.save();

                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("Report Status aktualisiert")
                    .setDescription(`Der Status des Reports wurde auf **${status}** geändert.`)
                    .addFields(
                        { name: "Report ID", value: report.id, inline: true },
                        { name: "Neuer Status", value: status, inline: true },
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "close") {
                const reportId = interaction.options.getString("reportid")!;

                const report = await Report.findOne({ id: reportId });
                if (!report) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Report nicht gefunden")
                        .setDescription(`Kein Report mit der ID **${reportId}** gefunden.`);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                report.status = "Closed";
                report.updatedAt = new Date();
                await report.save();

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("Report geschlossen")
                    .setDescription(
                        `Der Report mit der ID **${reportId}** wurde erfolgreich geschlossen.`,
                    )
                    .addFields(
                        { name: "Report ID", value: report.id, inline: true },
                        { name: "Neuer Status", value: "Closed", inline: true },
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "list") {
                const reports = await Report.find({
                    status: { $nin: ["Closed", "Archived"] },
                }).sort({ createdAt: -1 });

                if (reports.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Keine offenen Reports")
                        .setDescription(
                            "Es gibt derzeit keine Reports, die nicht geschlossen oder archiviert sind.",
                        );
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const reportList = reports
                    .map((report, index) => {
                        return `**${index + 1}.** Report ID: ||${report.id}|| - Gemeldet von: ${report.reporterName} - Grund: ${report.reason}`;
                    })
                    .join("\n");

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Reports (Nicht geschlossen oder archiviert)")
                    .setDescription(reportList)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "archived") {
                const reports = await Report.find({
                    status: "Archived",
                }).sort({ createdAt: -1 });

                if (reports.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Keine archivierten Reports")
                        .setDescription("Es gibt derzeit keine archivierten Reports.");
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const reportList = reports
                    .map((report, index) => {
                        return `**${index + 1}.** Report ID: ||${report.id}|| - Gemeldet von: ${report.reporterName} - Grund: ${report.reason}`;
                    })
                    .join("\n");

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Archivierte Reports")
                    .setDescription(reportList)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (subcommand === "closed") {
                const reports = await Report.find({
                    status: "Closed",
                }).sort({ createdAt: -1 });

                if (reports.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Keine geschlossenen Reports")
                        .setDescription("Es gibt derzeit keine geschlossenen Reports.");
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const reportList = reports
                    .map((report, index) => {
                        return `**${index + 1}.** Report ID: ||${report.id}|| - Gemeldet von: ${report.reporterName} - Grund: ${report.reason}`;
                    })
                    .join("\n");

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Geschlossene Reports")
                    .setDescription(reportList)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error("Error handling report command:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Fehler")
                .setDescription("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default ReportCommand;
