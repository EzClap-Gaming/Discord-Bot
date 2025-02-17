import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    GuildMember,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Warn } from "../../models/Warn";

const WarnCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Verwaltet Warnungen für Mitglieder.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Warnt ein Mitglied.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das zu warnende Mitglied.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Grund der Warnung.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Entfernt eine bestimmte Warnung von einem Mitglied.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dessen Warnung entfernt wird.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("identifier")
                        .setDescription("Die zu entfernende Warnnummer oder der zu entfernende Warntext.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("removal-reason")
                        .setDescription("Grund für das Entfernen der Warnung.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Listet alle Warnungen für ein Mitglied auf.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, für das Warnungen aufgelistet werden sollen.")
                        .setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Zugriff verweigert")
                .setDescription("Sie sind nicht berechtigt, Warnungen zu verwalten.")
                .setFooter({
                    text: `Ausgeführt von ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member") as GuildMember;

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                .setFooter({
                    text: `Ausgeführt von ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === "add") {
            const reason = interaction.options.getString("reason")!;
            try {
                const warningCount = await Warn.countDocuments({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });
                const warning = new Warn({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    reason: `#${warningCount + 1}: ${reason}`,
                });
                await warning.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Mitglied gewarnt")
                    .setDescription(`${member.user.tag} wurde gewarnt.`)
                    .addFields({ name: "Grund", value: reason })
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a DM to the warned user
                const dmEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Sie wurden gewarnt!")
                    .setDescription(`Sie haben eine Warnung auf dem Server erhalten. Grund: ${reason}`)
                    .setFooter({
                        text: `Ausgestellt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error("Error saving warning:", error);
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Error")
                    .setDescription(
                        "Beim Hinzufügen der Warnung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                    )
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (subcommand === "remove") {
            const identifier = interaction.options.getString("identifier")!;
            const removalReason = interaction.options.getString("removal-reason")!;
            try {
                const warnings = await Warn.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });
                const warningToRemove = warnings.find((w) => w.reason.includes(identifier));

                if (!warningToRemove) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(
                            `Für ${member.user.tag} mit dem Bezeichner „${identifier}“ wurde keine Warnung gefunden.`,
                        )
                        .setFooter({
                            text: `Ausgeführt von ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await Warn.findByIdAndDelete(warningToRemove._id);

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Warnung entfernt")
                    .setDescription(
                        `Die folgende Warnung wurde aus ${member.user.tag} entfernt:`,
                    )
                    .addFields({ name: "Warnung entfernt", value: warningToRemove.reason })
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a DM to the user notifying the removal
                const dmEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Ihre Warnung wurde entfernt")
                    .setDescription(
                        `Eine Warnung wurde aus Ihrem Datensatz auf dem Server entfernt. Grund für Entfernung: ${removalReason}\nUrsprüngliche Warnung: ${warningToRemove.reason}`,
                    )
                    .setFooter({
                        text: `Entfernt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error("Error removing warning:", error);
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Error")
                    .setDescription(
                        "Beim Entfernen der Warnung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                    )
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (subcommand === "list") {
            try {
                const warnings = await Warn.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });

                if (warnings.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(`${member.user.tag} hat keine Warnungen.`)
                        .setFooter({
                            text: `Ausgeführt von ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const warningList = warnings.map((w) => `• ${w.reason} (ID: ${w._id})`).join("\n");

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`Warnungen für ${member.user.tag}`)
                    .setDescription(warningList)
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error("Error fetching warnings:", error);
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Error")
                    .setDescription(
                        "Beim Auflisten der Warnungen ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                    )
                    .setFooter({
                        text: `Ausgeführt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};

export default WarnCommand;
