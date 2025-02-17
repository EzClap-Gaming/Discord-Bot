import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { AntiLink } from "../../models/AntiLink";

const AntiLinkCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("antilink")
        .setDescription("Verwalten Sie die Anti-Link-Funktion auf diesem Server.")
        .addSubcommand((subcommand) =>
            subcommand.setName("enable").setDescription("Aktivieren Sie den Anti-Link-Schutz."),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("disable").setDescription("Deaktivieren Sie den Anti-Link-Schutz."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-add")
                .setDescription(
                    "Fügen Sie zum Schutz vor Links einen Kanal zu den zulässigen Kanälen hinzu.",
                )
                .addStringOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Hinzufügende Kanal-ID.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-remove")
                .setDescription(
                    "Entfernen Sie zum Schutz vor Links einen Kanal aus den zulässigen Kanälen.",
                )
                .addStringOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Zu entfernende Kanal-ID.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-view")
                .setDescription("Zeigen Sie alle zulässigen Kanäle zum Anti-Link-Schutz an."),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: `Dieser Befehl kann nur auf einem Server verwendet werden.`,
                ephemeral: true,
            });
            return;
        }

        const { commandName, options } = interaction;
        const subcommand = options.getSubcommand();
        const channelId = options.getString("channel");

        try {
            let antiLink = await AntiLink.findOne({ guildId: interaction.guild.id });

            if (!antiLink) {
                if (
                    subcommand !== "allowed-channels-add" &&
                    subcommand !== "allowed-channels-remove" &&
                    subcommand !== "allowed-channels-view"
                ) {
                    antiLink = await AntiLink.create({ guildId: interaction.guild.id });
                } else {
                    await interaction.reply({
                        content: `Der Anti-Link-Schutz ist noch nicht eingerichtet. Bitte aktivieren Sie ihn zuerst!`,
                        ephemeral: true,
                    });
                    return;
                }
            }

            switch (subcommand) {
                case "enable":
                    if (antiLink.isAntiLinkEnabled) {
                        await interaction.reply({
                            content: `Der Anti-Link-Schutz ist bereits aktiviert.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    antiLink.isAntiLinkEnabled = true;
                    await antiLink.save();
                    await interaction.reply({
                        content: `Der Anti-Link-Schutz ist jetzt aktiviert.`,
                        ephemeral: true,
                    });
                    break;

                case "disable":
                    if (!antiLink.isAntiLinkEnabled) {
                        await interaction.reply({
                            content: `Der Anti-Link-Schutz ist bereits deaktiviert.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    antiLink.isAntiLinkEnabled = false;
                    await antiLink.save();
                    await interaction.reply({
                        content: `Der Anti-Link-Schutz ist jetzt deaktiviert.`,
                        ephemeral: true,
                    });
                    break;

                case "allowed-channels-add":
                    if (!channelId) {
                        await interaction.reply({
                            content: `Sie müssen eine Kanal-ID angeben.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const indexAdd = antiLink.allowedChannels.indexOf(channelId);

                    if (indexAdd === -1) {
                        antiLink.allowedChannels.push(channelId);
                        await interaction.reply({
                            content: `Die Kanal-ID <#${channelId}> wurde zu den zulässigen Kanälen hinzugefügt.`,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: `Die Kanal-ID <#${channelId}> befindet sich bereits in den zulässigen Kanälen.`,
                            ephemeral: true,
                        });
                    }
                    await antiLink.save();
                    break;

                case "allowed-channels-remove":
                    if (!channelId) {
                        await interaction.reply({
                            content: `Sie müssen eine Kanal-ID angeben.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const indexRemove = antiLink.allowedChannels.indexOf(channelId);

                    if (indexRemove !== -1) {
                        antiLink.allowedChannels.splice(indexRemove, 1);
                        await interaction.reply({
                            content: `Die Kanal-ID <#${channelId}> wurde aus den zulässigen Kanälen entfernt.`,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: `Die Kanal-ID <#${channelId}> befindet sich nicht in den zulässigen Kanälen.`,
                            ephemeral: true,
                        });
                    }
                    await antiLink.save();
                    break;

                case "allowed-channels-view":
                    const allowedChannels = antiLink.allowedChannels.length
                        ? antiLink.allowedChannels.join(", ")
                        : "Keiner";

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Erlaubte Kanäle")
                        .setDescription(allowedChannels);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;

                default:
                    await interaction.reply({
                        content: `Ungültiger Unterbefehl.`,
                        ephemeral: true,
                    });
            }
        } catch (error) {
            console.error(`Error executing command ${commandName}: `, error);
            await interaction.reply({
                content: `Beim Ausführen dieses Befehls ist ein Fehler aufgetreten!`,
                ephemeral: true,
            });
        }
    },
};

export default AntiLinkCommand;
