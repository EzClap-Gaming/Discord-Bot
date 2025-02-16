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
        .setDescription("Manage the anti-link feature in this server.")
        .addSubcommand((subcommand) =>
            subcommand.setName("enable").setDescription("Enable the anti-link protection."),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("disable").setDescription("Disable the anti-link protection."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-add")
                .setDescription("Add a channel to allowed channels for anti-link protection.")
                .addStringOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel ID to add.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-remove")
                .setDescription("Remove a channel from allowed channels for anti-link protection.")
                .addStringOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel ID to remove.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allowed-channels-view")
                .setDescription("View all allowed channels for anti-link protection."),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: `This command can only be used in a server.`,
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
                        content: `Anti-Link protection is not set up yet. Please enable it first!`,
                        ephemeral: true,
                    });
                    return;
                }
            }

            switch (subcommand) {
                case "enable":
                    if (antiLink.isAntiLinkEnabled) {
                        await interaction.reply({
                            content: `Anti-Link protection is already enabled.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    antiLink.isAntiLinkEnabled = true;
                    await antiLink.save();
                    await interaction.reply({
                        content: `Anti-Link protection is now enabled.`,
                        ephemeral: true,
                    });
                    break;

                case "disable":
                    if (!antiLink.isAntiLinkEnabled) {
                        await interaction.reply({
                            content: `Anti-Link protection is already disabled.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    antiLink.isAntiLinkEnabled = false;
                    await antiLink.save();
                    await interaction.reply({
                        content: `Anti-Link protection is now disabled.`,
                        ephemeral: true,
                    });
                    break;

                case "allowed-channels-add":
                    if (!channelId) {
                        await interaction.reply({
                            content: `You must provide a channel ID.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const indexAdd = antiLink.allowedChannels.indexOf(channelId);

                    if (indexAdd === -1) {
                        antiLink.allowedChannels.push(channelId);
                        await interaction.reply({
                            content: `Channel ID <#${channelId}> has been added to allowed channels.`,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: `Channel ID <#${channelId}> is already in allowed channels.`,
                            ephemeral: true,
                        });
                    }
                    await antiLink.save();
                    break;

                case "allowed-channels-remove":
                    if (!channelId) {
                        await interaction.reply({
                            content: `You must provide a channel ID.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const indexRemove = antiLink.allowedChannels.indexOf(channelId);

                    if (indexRemove !== -1) {
                        antiLink.allowedChannels.splice(indexRemove, 1);
                        await interaction.reply({
                            content: `Channel ID <#${channelId}> has been removed from allowed channels.`,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: `Channel ID <#${channelId}> is not in allowed channels.`,
                            ephemeral: true,
                        });
                    }
                    await antiLink.save();
                    break;

                case "allowed-channels-view":
                    const allowedChannels = antiLink.allowedChannels.length
                        ? antiLink.allowedChannels.join(", ")
                        : "None";

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Allowed Channels")
                        .setDescription(allowedChannels);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;

                default:
                    await interaction.reply({
                        content: `Invalid subcommand.`,
                        ephemeral: true,
                    });
            }
        } catch (error) {
            console.error(`[Discord] Error executing command ${commandName}: `, error);
            await interaction.reply({
                content: `There was an error while executing this command!`,
                ephemeral: true,
            });
        }
    },
};

export default AntiLinkCommand;
