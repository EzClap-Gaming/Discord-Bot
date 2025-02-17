import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    TextChannel,
    CategoryChannel,
    Role,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
    ChannelType,
    Message,
    MessageComponentInteraction,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Tickets } from "../../models/Ticket";

const TicketCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Richten Sie das Ticketsystem ein.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("setup")
                .setDescription("Richten Sie das Ticketsystem für diesen Server ein.")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Der Kanal, an den das Ticket-Panel gesendet wird.")
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("category")
                        .setDescription("Die Kategorie, in der Tickets erstellt werden.")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option
                        .setName("role")
                        .setDescription(
                            "Die Rolle, die angepingt wird, wenn ein Ticket erstellt wird.",
                        )
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option
                        .setName("advisorrole")
                        .setDescription("Die Rolle, die Tickets beanspruchen und lösen kann.")
                        .setRequired(true),
                )
                .addChannelOption((option) =>
                    option
                        .setName("logs")
                        .setDescription("Der Kanal, an den Tickettranskripte gesendet werden.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("panel")
                .setDescription("Senden Sie ein benutzerdefiniertes Ticketfeld.")
                .addStringOption((option) =>
                    option
                        .setName("embed_title")
                        .setDescription("Der Titel des Embeds.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("embed_description")
                        .setDescription("Die Beschreibung des eingebetteten Elements.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("embed_image")
                        .setDescription("Die URL des Bildes für die Einbettung.")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("embed_thumbnail")
                        .setDescription("Die Beschriftung für die Schaltfläche.")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("button_text")
                        .setDescription("Der Text auf der Schaltfläche")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("button_emoji")
                        .setDescription("Das Emoji für den Button")
                        .setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("button_color")
                        .setDescription("Die Farbe des Knopfes")
                        .addChoices(
                            { name: "Primary", value: "Primary" },
                            { name: "Danger", value: "Danger" },
                            { name: "Secondary", value: "Secondary" },
                            { name: "Success", value: "Success" },
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Listet alle offenen Ticketkanäle auf."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Löscht ein Ticket.")
                .addStringOption((option) =>
                    option
                        .setName("ticket_id")
                        .setDescription("Die Nachrichten-ID des zu löschenden Tickets.")
                        .setRequired(true),
                ),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "setup") {
            if (!interaction.guild) {
                await interaction.reply({
                    content: `Dieser Befehl kann nur auf einem Server verwendet werden.`,
                    ephemeral: true,
                });
                return;
            }

            const guildId = interaction.guild.id;
            const ticketChannel = interaction.options.getChannel("channel") as TextChannel;
            const ticketCategory = interaction.options.getChannel("category") as CategoryChannel;
            const ticketRole = interaction.options.getRole("role") as Role;
            const advisorRole = interaction.options.getRole("advisorrole") as Role;
            const logsChannel = interaction.options.getChannel("logs") as TextChannel;

            try {
                const existingTicket = await Tickets.findOne({ guildId });

                if (existingTicket) {
                    await interaction.reply({
                        content: `Das Ticketsystem ist für diesen Server bereits eingerichtet.`,
                        ephemeral: true,
                    });
                    return;
                }

                const newTicketSettings = new Tickets({
                    guildId,
                    category: ticketCategory.id,
                    channel: ticketChannel.id,
                    role: ticketRole.id,
                    advisorRole: advisorRole.id,
                    logsId: logsChannel.id,
                });

                await newTicketSettings.save();

                await interaction.reply({
                    content: `Ticketsystem wurde eingerichtet!\n\n**Panel-Kanal**: ${ticketChannel}\n**Ticketkategorie**: ${ticketCategory.name}\n**Supportrolle**: ${ticketRole.name}\n**Beraterrolle**: ${advisorRole.name}\n**Protokollkanal**: ${logsChannel}`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`Error setting up ticket system: `, error);
                await interaction.reply({
                    content: `Beim Einrichten des Ticketsystems ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.`,
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "panel") {
            const guildId = interaction.guild?.id;

            const ticketSettings = await Tickets.findOne({ guildId });

            if (!ticketSettings) {
                await interaction.reply({
                    content: `Das Ticketsystem ist für diesen Server nicht eingerichtet.`,
                    ephemeral: true,
                });
                return;
            }

            const ticketChannelId = ticketSettings?.channel || "";
            const ticketChannel = interaction.guild!.channels.cache.get(
                ticketChannelId,
            ) as TextChannel;

            const embedTitle = interaction.options.getString("embed_title")!;
            const embedDescription = interaction.options.getString("embed_description")!;
            const embedImage = interaction.options.getString("embed_image")!;
            const embedThumbnail = interaction.options.getString("embed_thumbnail")!;
            const buttonText = interaction.options.getString("button_text")!;
            const buttonEmoji = interaction.options.getString("button_emoji")!;
            const buttonColor = interaction.options.getString("button_color") || "Primary";

            const embed = new EmbedBuilder()
                .setTitle(embedTitle)
                .setDescription(embedDescription)
                .setTimestamp();

            if (embedImage) embed.setImage(embedImage);
            if (embedThumbnail) embed.setThumbnail(embedThumbnail);

            const button = new ButtonBuilder()
                .setLabel(buttonText || "Ticket erstellen")
                .setStyle(
                    ButtonStyle[buttonColor.toUpperCase() as keyof typeof ButtonStyle] ??
                        ButtonStyle.Primary,
                )
                .setCustomId("create_ticket");

            if (buttonEmoji) {
                button.setEmoji(buttonEmoji);
            }

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            if (
                !ticketChannel
                    .permissionsFor(interaction.client.user!)
                    ?.has(PermissionFlagsBits.SendMessages)
            ) {
                console.error(
                    "Bot does not have permission to send messages in the ticket channel.",
                );
                await interaction.reply({
                    content: `Ich bin nicht berechtigt, Nachrichten im Ticketkanal zu senden.`,
                    ephemeral: true,
                });
                return;
            }

            try {
                await interaction.deferReply({ ephemeral: true });
                await ticketChannel.send({ embeds: [embed], components: [row] });
                await interaction.followUp({
                    content: `Das Ticket-Panel wurde an ${ticketChannel} gesendet.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`Error sending ticket panel:`, error);
                await interaction.followUp({
                    content: `Beim Senden des Ticket-Panels ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.`,
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "list") {
            try {
                if (!interaction.guild) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Error")
                        .setDescription("Dieser Befehl kann nur auf einem Server verwendet werden.")
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const ticketSettings = await Tickets.findOne({
                    guildId: interaction.guild.id,
                });

                if (!ticketSettings) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Error")
                        .setDescription(
                            "Das Ticketsystem ist für diesen Server nicht eingerichtet.",
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const ticketCategory = interaction.guild.channels.cache.get(
                    ticketSettings.category,
                ) as CategoryChannel;

                if (!ticketCategory) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Error")
                        .setDescription(
                            "Ticketkategorie nicht gefunden. Bitte überprüfen Sie die Konfiguration.",
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const ticketChannels = Array.from(ticketCategory.children.cache.values()).filter(
                    (channel): channel is TextChannel => channel.type === ChannelType.GuildText,
                );

                if (ticketChannels.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("Keine Tickets gefunden")
                        .setDescription("In dieser Kategorie sind keine Ticketkanäle vorhanden.")
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                let ticketList = "";
                let ticketIdCounter = 1;

                for (const channel of ticketChannels) {
                    const messages = await channel.messages.fetch({ limit: 10 });

                    const embedMessage = messages.find((msg) => msg.embeds.length > 0);
                    if (embedMessage) {
                        const embedTitle = embedMessage.embeds[0]?.title || "Kein Titel";
                        ticketList += `• ${embedTitle} (Nachricht ID: ${embedMessage.id})\n`;
                    }

                    ticketIdCounter++;
                }

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Offene Tickets")
                    .setDescription(
                        ticketList ||
                            "In der Kategorie wurden keine Tickets mit gültigen Einbettungen gefunden.",
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error("Error fetching tickets:", error);
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription(
                        "Beim Abrufen der Tickets ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.",
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (subcommand === "delete") {
            const ticketId = interaction.options.getString("ticket_id");
            const deleteReason = interaction.options.getString("reason")!;

            if (!ticketId) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription("Bitte geben Sie zum Löschen eine gültige Ticket-ID ein.")
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (!interaction.guild) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription("Dieser Befehl kann nur auf einem Server verwendet werden.")
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const ticketSettings = await Tickets.findOne({
                guildId: interaction.guild.id,
            });

            if (!ticketSettings) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription("Das Ticketsystem ist für diesen Server nicht eingerichtet.")
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const logsChannel = interaction.guild.channels.cache.get(
                ticketSettings.logsId,
            ) as TextChannel;

            if (!logsChannel) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription(
                        "Protokollkanal nicht gefunden. Bitte wenden Sie sich an einen Administrator.",
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const ticketMessage = await logsChannel.messages.fetch(ticketId).catch(() => null);

            if (!ticketMessage) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Error")
                    .setDescription(
                        "Ticketnachricht nicht gefunden. Bitte überprüfen Sie die Nachrichten-ID.",
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId("confirmDelete")
                .setLabel("Löschung bestätigen")
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancelDelete")
                .setLabel("Stornieren")
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                confirmButton,
                cancelButton,
            );

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Bestätigung erforderlich")
                .setDescription(
                    `Möchten Sie das Ticket mit der ID **${ticketId}** wirklich löschen?`,
                )
                .setFooter({
                    text: `Ausgeführt von ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

            const replyMessage = await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true,
                fetchReply: true,
            });

            if (replyMessage && replyMessage instanceof Message) {
                const filter = (i: MessageComponentInteraction) =>
                    i.user.id === interaction.user.id;
                const collector = replyMessage.createMessageComponentCollector({
                    filter,
                    time: 15000,
                });

                collector.on("collect", async (i) => {
                    if (i.customId === "confirmDelete") {
                        try {
                            await ticketMessage.delete();

                            const successEmbed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Ticket gelöscht")
                                .setDescription(
                                    `Das Ticket mit der ID **${ticketId}** wurde erfolgreich gelöscht. Grund: ${deleteReason}`,
                                )
                                .setFooter({
                                    text: `Ausgeführt von ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL(),
                                })
                                .setTimestamp();

                            await i.update({ embeds: [successEmbed], components: [] });

                            const logChannel = interaction.guild?.channels.cache.find(
                                (ch) => ch.name === "logging",
                            );
                            if (logChannel && logChannel.isTextBased()) {
                                const logEmbed = new EmbedBuilder()
                                    .setColor("Random")
                                    .setTitle("Ticket gelöscht")
                                    .addFields(
                                        { name: "Ticket ID", value: ticketId },
                                        { name: "Gelöscht von", value: interaction.user.tag },
                                        { name: "Grund", value: deleteReason },
                                    )
                                    .setFooter({
                                        text: `Ticket gelöscht am`,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    })
                                    .setTimestamp();
                                await logChannel.send({ embeds: [logEmbed] });
                            }
                        } catch (error) {
                            console.error("Error deleting the ticket:", error);
                            const errorEmbed = new EmbedBuilder()
                                .setColor("Random")
                                .setTitle("Error")
                                .setDescription(
                                    "Beim Löschen des Tickets ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                                )
                                .setFooter({
                                    text: `Ausgeführt von ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL(),
                                })
                                .setTimestamp();
                            await i.update({ embeds: [errorEmbed], components: [] });
                        }
                    } else if (i.customId === "cancelDelete") {
                        const cancelEmbed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Löschung abgebrochen")
                            .setDescription("Die Ticketlöschung wurde abgebrochen.")
                            .setFooter({
                                text: `Ausgeführt von ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTimestamp();

                        await i.update({ embeds: [cancelEmbed], components: [] });
                    }
                });

                collector.on("end", (collected) => {
                    if (collected.size === 0) {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Time-out")
                            .setDescription(
                                "Die Ticketlöschung wurde nicht bestätigt und abgebrochen.",
                            )
                            .setFooter({
                                text: `Ausgeführt von ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTimestamp();

                        interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                    }
                });
            }
        }
    },
};

export default TicketCommand;
