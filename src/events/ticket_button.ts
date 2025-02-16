import { Client, ButtonBuilder, TextChannel, CategoryChannel, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ChannelType, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle, Interaction, CacheType } from 'discord.js';
import * as discordTranscripts from "discord-html-transcripts";
import { Tickets } from '../models/Ticket';
import { UuidUtil } from '../utils/uuidUtil';

// Handle Ticket Creation
export const handleCreateTicketButton = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
        if (!interaction.guild) return;

        if (interaction.isButton() && interaction.customId === 'create_ticket') {
            try {
                const ticketSettings = await Tickets.findOne({ guildId: interaction.guild.id });

                if (!ticketSettings) {
                    await interaction.reply({ content: `❌ Das Ticketsystem ist für diesen Server nicht eingerichtet.`, ephemeral: true });
                    return;
                }

                const ticketCategory = interaction.guild.channels.cache.get(ticketSettings.category) as CategoryChannel;
                const supportRole = interaction.guild.roles.cache.get(ticketSettings.role);
                const advisorRole = interaction.guild.roles.cache.get(ticketSettings.advisorRole);

                if (!supportRole || !advisorRole) {
                    await interaction.reply({ content: `❌ Die erforderlichen Rollen für das Ticketsystem fehlen.`, ephemeral: true });
                    return;
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `┠${interaction.user.username}-ticket-${UuidUtil.generateId().substring(0, 5)}`,
                    type: ChannelType.GuildText,
                    parent: ticketCategory.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                            ],
                        },
                        {
                            id: supportRole.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels,
                            ],
                        },
                        {
                            id: advisorRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(`🎟️ Ticket erstellt`)
                    .setDescription(`Bitte warten Sie, das Support-Team wird Ihnen in Kürze helfen.\n\nIn der Zwischenzeit erklären Sie bitte Ihr Problem im Detail.`)
                    .addFields(
                        { name: 'Zugewiesen an:', value: 'Noch niemand.', inline: true },
                        { name: 'Grund für Zuweisung:', value: 'Noch nicht angegeben.', inline: true }
                    )
                    .setTimestamp();

                const claimButton = new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('🎯 Ticket übernehmen')
                    .setStyle(ButtonStyle.Primary);

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🚪 Ticket schließen')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton, closeButton);

                if (ticketChannel instanceof TextChannel) {
                    await ticketChannel.send({
                        content: `${supportRole}`,
                        embeds: [embed],
                        components: [row],
                    });
                }

                const newTicket = new Tickets({
                    guildId: interaction.guild.id,
                    category: ticketSettings.category,
                    channel: ticketChannel.id,
                    role: ticketSettings.role,
                    advisorRole: ticketSettings.advisorRole,
                    logsId: ticketSettings.logsId,
                    ownerId: interaction.user.id,
                });

                await newTicket.save();

                await interaction.reply({ content: `✅ Ticket wurde erstellt: ${ticketChannel}`, ephemeral: true });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error creating ticket: ${errorMessage}`);
                await interaction.reply({ content: `❌ Es gab einen Fehler beim Erstellen des Tickets. Bitte versuche es später erneut.`, ephemeral: true });
            }
        }
    });
};

// Handle ticket claim
export const handleClaimTicketButton = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
        if (!interaction.guild) return;

        if (interaction.isButton() && interaction.customId === 'claim_ticket') {
            try {
                const ticketSettings = await Tickets.findOne({ guildId: interaction.guild.id });
                if (!ticketSettings) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Das Ticketsystem ist für diesen Server nicht eingerichtet.`, ephemeral: true });
                    }
                    return;
                }

                const ticketChannel = interaction.channel as TextChannel;
                const supportRole = interaction.guild.roles.cache.get(ticketSettings.role);
                const advisorRole = interaction.guild.roles.cache.get(ticketSettings.advisorRole);

                if (!supportRole || !advisorRole) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Die erforderlichen Rollen für das Ticketsystem fehlen.`, ephemeral: true });
                    }
                    return;
                }

                const member = interaction.guild.members.cache.get(interaction.user.id);
                const userRoles = member?.roles.cache;

                const hasPermission = userRoles?.some(role => role.position >= advisorRole.position);

                if (!hasPermission) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Du benötigst eine Rolle, die gleich oder höher ist als der Customer Advisor, um dieses Ticket zu übernehmen.`, ephemeral: true });
                    }
                    return;
                }

                const userHasClaimed = ticketChannel.permissionOverwrites.cache.has(interaction.user.id);
                if (userHasClaimed) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Du hast dieses Ticket bereits übernommen.`, ephemeral: true });
                    }
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId('claim_ticket_modal')
                    .setTitle('📝 Grund für Übernahme')
                    .addComponents(
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                            new TextInputBuilder()
                                .setCustomId('claim_reason')
                                .setLabel('Warum übernimmst du dieses Ticket?')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                        )
                    );

                try {
                    await interaction.showModal(modal);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error showing modal: ${errorMessage}`);
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Es gab einen Fehler beim Anzeigen des Modals. Bitte versuche es später erneut.`, ephemeral: true });
                    }
                    return;
                }

                const filter = (i: ModalSubmitInteraction) => i.user.id === interaction.user.id;
                let modalInteraction: ModalSubmitInteraction | null = null;
                try {
                    modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error awaiting modal submit: ${errorMessage}`);
                }

                if (!modalInteraction) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: '❌ Du hast nicht rechtzeitig einen Grund angegeben.', ephemeral: true });
                    }
                    return;
                }

                const claimReason = modalInteraction.fields.getTextInputValue('claim_reason');

                try {
                    await ticketChannel.permissionOverwrites.edit(interaction.user.id, {
                        SendMessages: true,
                        ViewChannel: true,
                    });

                    const claimedRole = ticketChannel.permissionOverwrites.cache.find(perm => perm.id === supportRole.id && perm.allow.has(PermissionFlagsBits.SendMessages));

                    if (!claimedRole) {
                        await ticketChannel.permissionOverwrites.edit(supportRole.id, {
                            SendMessages: false,
                        });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error updating permissions: ${errorMessage}`);
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Es gab einen Fehler beim Aktualisieren der Berechtigungen. Bitte versuche es später erneut.`, ephemeral: true });
                    }
                    return;
                }

                const existingMessages = await ticketChannel.messages.fetch({ limit: 1 });
                const existingEmbedMessage = existingMessages.first();

                const currentTime = new Date().toLocaleString();

                const embed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(`🎟️ Ticket übernommen`)
                    .setDescription(`Bitte warten Sie, das Support-Team wird Ihnen in Kürze helfen.\n\nIn der Zwischenzeit erklären Sie bitte Ihr Problem im Detail.`)
                    .addFields(
                        { name: 'Zugewiesen an:', value: `${interaction.user.username}`, inline: true },
                        { name: 'Grund für Übernahme:', value: claimReason, inline: true },
                        { name: 'Übernahmezeit:', value: currentTime, inline: true }
                    )
                    .setTimestamp();

                try {
                    if (existingEmbedMessage && existingEmbedMessage.embeds.length > 0) {
                        const existingEmbed = existingEmbedMessage.embeds[0];
                        const claimTimeField = existingEmbed.fields.find(field => field.name === 'Übernahmezeit');
                        if (claimTimeField) {
                            claimTimeField.value = currentTime;
                            existingEmbedMessage.edit({ embeds: [existingEmbed] });
                        }
                    } else {
                        await ticketChannel.send({ embeds: [embed] });
                    }
                    await modalInteraction.reply({ content: `✅ Das Ticket wurde erfolgreich übernommen.`, ephemeral: true });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error handling claim: ${errorMessage}`);
                    if (!interaction.replied) {
                        await interaction.reply({ content: `❌ Es gab einen Fehler beim Übernehmen des Tickets. Bitte versuche es später erneut.`, ephemeral: true });
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error claiming ticket: ${errorMessage}`);
                await interaction.reply({ content: `❌ Es gab einen Fehler beim Übernehmen des Tickets. Bitte versuche es später erneut.`, ephemeral: true });
            }
        }
    });
};

// Handle Ticket Closure
export const handleCloseTicketButton = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
        if (!interaction.guild) return;

        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            try {
                const ticketSettings = await Tickets.findOne({ guildId: interaction.guild.id });
                if (!ticketSettings) {
                    await interaction.reply({ content: `❌ Das Ticketsystem ist für diesen Server nicht eingerichtet.`, ephemeral: true });
                    return;
                }

                const ticketChannel = interaction.channel as TextChannel;
                const logsChannel = interaction.guild.channels.cache.get(ticketSettings?.logsId) as TextChannel;

                if (!logsChannel) {
                    await interaction.reply({ content: `❌ Logs-Kanal nicht gefunden. Bitte kontaktiere einen Admin.`, ephemeral: true });
                    return;
                }

                const transcript = await discordTranscripts.createTranscript(ticketChannel);

                await logsChannel.send({
                    content: `📝 Transkript für das Ticket: ${ticketChannel.name}`,
                    files: [transcript],
                });

                await interaction.reply({ content: `✅ Dieses Ticket wird in 5 Sekunden geschlossen und das Transkript wurde gesendet.`, ephemeral: true });

                setTimeout(async () => {
                    await ticketChannel.delete();
                }, 5000);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error closing ticket: ${errorMessage}`);
                await interaction.reply({ content: `❌ Es gab einen Fehler beim Schließen des Tickets. Bitte versuche es später erneut.`, ephemeral: true });
            }
        }
    });
};
