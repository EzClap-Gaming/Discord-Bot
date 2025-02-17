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
        .setDescription("Verwaltet den Sperrstatus eines Textkanals.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Sperrt den aktuellen Textkanal, um Nachrichten zu verhindern.")
                .addIntegerOption((option) =>
                    option
                        .setName("duration")
                        .setDescription("Dauer in Minuten (optional, 0 für dauerhafte Sperre)")
                        .setRequired(false)
                        .setMinValue(0),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("remove").setDescription("Schaltet den aktuellen Textkanal frei."),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                const noPermissionEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription("Sie sind nicht berechtigt, den Kanal zu sperren.");
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
                            .setColor("Random")
                            .setDescription("Dieser Kanal ist bereits gesperrt.");
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
                        .setColor("Random")
                        .setDescription(
                            `Der Kanal wurde gesperrt. Er wird nach ${duration} Minuten entsperrt.`,
                        );
                    await interaction.reply({ embeds: [lockdownEmbed] });

                    if (duration > 0) {
                        setTimeout(async () => {
                            await Lockdown.deleteOne({ channelId: channel.id }); // Remove Lockdown from DB
                            if (permissions) {
                                permissions.add(PermissionFlagsBits.SendMessages);
                            }
                            const unlockEmbed = new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Der Kanal wurde entsperrt.");
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
                            .setColor("Random")
                            .setDescription("Dieser Kanal ist nicht gesperrt.");
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
                        .setColor("Random")
                        .setDescription("Der Kanal wurde entsperrt.");
                    await interaction.reply({ embeds: [unlockEmbed] });
                }
            } else {
                const noTextChannelEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription("Dieser Befehl kann nur in Textkanälen verwendet werden.");
                await interaction.reply({
                    embeds: [noTextChannelEmbed],
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(
                    "Beim Verwalten der Kanalsperre ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                )
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default LockdownCommand;
