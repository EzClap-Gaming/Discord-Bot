import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Lockdown } from "../../models/Lockdown";

const LockdownCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription("Manages the lockdown state of a text channel.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Locks the current text channel to prevent messages.")
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Duration in minutes (optional, 0 for permanent lock)")
                        .setRequired(false)
                        .setMinValue(0),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("remove").setDescription("Unlocks the current text channel."),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                const noPermissionEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription("You do not have permission to lock down the channel.");
                await interaction.reply({
                    embeds: [noPermissionEmbed],
                    ephemeral: true,
                });
                return;
            }

            const subcommand = interaction.options.getSubcommand();
            const channel = interaction.channel;
            const everyone = interaction.guild?.roles.everyone;

            if (channel instanceof TextChannel) {
                // Handle Lockdown Add
                if (subcommand === "add") {
                    const duration = interaction.options.getInteger("duration") || 0;

                    // Check if the channel is already locked down
                    const existingLockdown = await Lockdown.findOne({
                        channelId: channel.id,
                    });
                    if (existingLockdown) {
                        const embed = new EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription("This channel is already locked down.");
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    // Lock the channel
                    const permissions = channel.permissionsFor(everyone!);
                    if (permissions) {
                        permissions.remove(PermissionFlagsBits.SendMessages);
                    }

                    // Save Lockdown record in database
                    const lockdown = new Lockdown({
                        channelId: channel.id,
                        duration,
                    });
                    await lockdown.save();

                    const lockdownEmbed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(
                            `The channel has been locked down. It will be unlocked after ${duration} minutes.`,
                        );
                    await interaction.reply({ embeds: [lockdownEmbed] });

                    if (duration > 0) {
                        setTimeout(async () => {
                            await Lockdown.deleteOne({ channelId: channel.id }); // Remove Lockdown from DB
                            if (permissions) {
                                permissions.add(PermissionFlagsBits.SendMessages);
                            }
                            const unlockEmbed = new EmbedBuilder()
                                .setColor("#00FF00")
                                .setDescription("The channel has been unlocked.");
                            await interaction.followUp({ embeds: [unlockEmbed] });
                        }, duration * 60000);
                    }
                }

                // Handle Lockdown Remove
                if (subcommand === "remove") {
                    const existingLockdown = await Lockdown.findOne({
                        channelId: channel.id,
                    });
                    if (!existingLockdown) {
                        const embed = new EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription("This channel is not locked down.");
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    // Unlock the channel
                    const permissions = channel.permissionsFor(everyone!);
                    if (permissions) {
                        permissions.add(PermissionFlagsBits.SendMessages);
                    }

                    // Remove Lockdown record from database
                    await Lockdown.deleteOne({ channelId: channel.id });

                    const unlockEmbed = new EmbedBuilder()
                        .setColor("#00FF00")
                        .setDescription("The channel has been unlocked.");
                    await interaction.reply({ embeds: [unlockEmbed] });
                }
            } else {
                const noTextChannelEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription("This command can only be used in text channels.");
                await interaction.reply({
                    embeds: [noTextChannelEmbed],
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("[Lockdown] Error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "An error occurred while managing the channel lockdown. Please try again later.",
                )
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default LockdownCommand;
