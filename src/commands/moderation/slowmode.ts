import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { SlowmodeModel } from "../../models/Slowmode";

const SlowmodeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Verwaltet den Slowmode für den Server.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Legt den Slowmode für den angegebenen Kanal fest.")
                .addIntegerOption((option) =>
                    option
                        .setName("time")
                        .setDescription(
                            "Zeit in Sekunden zwischen Nachrichten (1–21600), 0 zum Deaktivieren.",
                        )
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(21600),
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Der Kanal, für den der Slowmode eingestellt werden soll.")
                        .setRequired(true)
                        .addChannelTypes(0),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Entfernt den Slowmode für den angegebenen Kanal.")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Der Kanal, aus dem der Slowmode entfernt werden soll.")
                        .setRequired(true)
                        .addChannelTypes(0),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                const noPermissionEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription("Sie sind nicht berechtigt, den Slowmode zu ändern.");
                await interaction.reply({
                    embeds: [noPermissionEmbed],
                    ephemeral: true,
                });
                return;
            }

            const subcommand = interaction.options.getSubcommand();
            const channel = interaction.options.getChannel("channel") as TextChannel;

            if (subcommand === "add") {
                const time = interaction.options.getInteger("time")!;

                if (channel instanceof TextChannel) {
                    await channel.setRateLimitPerUser(time);

                    await SlowmodeModel.findOneAndUpdate(
                        { guildId: interaction.guildId!, channelId: channel.id },
                        { slowmode: time, lastUpdated: new Date() },
                        { upsert: true },
                    );

                    const slowmodeEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(
                            `Der Slowmode wurde in ${channel} auf ${time} Sekunden eingestellt.`,
                        );
                    await interaction.reply({ embeds: [slowmodeEmbed], ephemeral: true });
                } else {
                    const notTextChannelEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription("Der angegebene Kanal ist kein Textkanal.");
                    await interaction.reply({
                        embeds: [notTextChannelEmbed],
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "remove") {
                if (channel instanceof TextChannel) {
                    await channel.setRateLimitPerUser(0);

                    await SlowmodeModel.findOneAndUpdate(
                        { guildId: interaction.guildId!, channelId: channel.id },
                        { slowmode: 0, lastUpdated: new Date() },
                        { upsert: true },
                    );

                    const removeSlowmodeEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(`Der Slowmode wurde aus ${channel} entfernt.`);
                    await interaction.reply({
                        embeds: [removeSlowmodeEmbed],
                        ephemeral: true,
                    });
                } else {
                    const notTextChannelEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription("Der angegebene Kanal ist kein Textkanal.");
                    await interaction.reply({
                        embeds: [notTextChannelEmbed],
                        ephemeral: true,
                    });
                }
            }
        } catch (error) {
            console.error("Error setting or removing slowmode:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(
                    "Beim Setzen oder Entfernen des Slowmode ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default SlowmodeCommand;
