import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    TextChannel,
} from "discord.js";
import { ReactionRole } from "../../models/ReactionRole";
import { Command } from "../../functions/handleCommands";

const ReactionRoleCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("reaction-role")
        .setDescription("Reaktionsrollen erstellen und verwalten.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Erstellen Sie eine neue Reaktionsrollennachricht.")
                .addStringOption((option) =>
                    option
                        .setName("title")
                        .setDescription("Der Titel des Embeds.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Die Beschreibung des eingebetteten Elements.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("roles")
                        .setDescription(
                            "Rollen und Emojis im Format: „Emoji -> @Rolle“ (mehrere durch Kommas trennen).",
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Listet alle Reaktionsrollennachrichten auf diesem Server auf."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Löschen Sie eine bestimmte Reaktionsrollennachricht.")
                .addStringOption((option) =>
                    option
                        .setName("message_id")
                        .setDescription("Die Nachrichten-ID der zu löschenden Reaktionsrolle.")
                        .setRequired(true),
                ),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Zugriff verweigert")
                .setDescription("Sie sind nicht berechtigt, Reaktionsrollen zu verwalten.")
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === "create") {
            const title = interaction.options.getString("title", true);
            const description = interaction.options.getString("description", true);
            const rolesInput = interaction.options.getString("roles", true);

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(title)
                .setDescription(description)
                .setTimestamp();

            const roles: { emoji: string; roleId: string }[] = [];
            const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

            const rolePairs = rolesInput.split(",").map((pair) => pair.trim());
            let currentRow = new ActionRowBuilder<ButtonBuilder>();

            for (const pair of rolePairs) {
                const [emoji, roleMention] = pair.split("->").map((str) => str.trim());
                if (!emoji || !roleMention) {
                    await interaction.reply({
                        content:
                            "Ungültiges Format. Verwenden Sie für jeden Eintrag „emoji -> @Rolle“.",
                    });
                    return;
                }

                const role = interaction.guild?.roles.cache.find(
                    (r) => r.toString() === roleMention,
                );

                if (!role) {
                    await interaction.reply({
                        content: `Rolle „${roleMention}“ nicht gefunden.`,
                    });
                    return;
                }

                roles.push({ emoji, roleId: role.id });

                currentRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`reaction_role_${emoji}`)
                        .setEmoji(emoji)
                        .setStyle(ButtonStyle.Primary),
                );

                if (currentRow.components.length === 5) {
                    actionRows.push(currentRow);
                    currentRow = new ActionRowBuilder<ButtonBuilder>();
                }
            }

            if (currentRow.components.length > 0) {
                actionRows.push(currentRow);
            }

            const roleDescription = roles
                .map(({ emoji, roleId }) => `${emoji} -> <@&${roleId}>`)
                .join("\n");
            embed.addFields({ name: "Zugewiesene Rollen", value: roleDescription });

            if (interaction.channel instanceof TextChannel) {
                const message = await interaction.channel.send({
                    embeds: [embed],
                    components: actionRows,
                });

                const reactionRole = new ReactionRole({
                    guildId: interaction.guildId!,
                    messageId: message.id,
                    channelId: message.channelId,
                    roles,
                    title,
                    description,
                });
                await reactionRole.save();

                const successEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Reaktionsrolle erstellt")
                    .setDescription("Reaktionsrollennachricht erstellt und gespeichert.")
                    .setTimestamp();
                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Ungültiger Kanal")
                    .setDescription("Die Nachricht kann im aktuellen Kanal nicht gesendet werden.")
                    .setTimestamp();
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }

        if (subcommand === "list") {
            const reactionRoles = await ReactionRole.find({
                guildId: interaction.guildId!,
            });

            if (reactionRoles.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("No Reaction Roles Found")
                    .setDescription("There are no reaction roles in this server.")
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#00FFFF")
                .setTitle("Reaction Role Messages")
                .setDescription(
                    reactionRoles
                        .map(
                            (rr) =>
                                `• **Title:** ${rr.title}\n  **Message ID:** ||${rr.messageId}||`,
                        )
                        .join("\n\n"),
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === "delete") {
            const messageId = interaction.options.getString("message_id")!;

            const reactionRole = await ReactionRole.findOneAndDelete({
                guildId: interaction.guildId!,
                messageId,
            });

            if (!reactionRole) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Reaction Role Not Found")
                    .setDescription(`No reaction role found with message ID: ${messageId}`)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("Reaction Role Deleted")
                .setDescription(`Reaction role with message ID: ${messageId} has been deleted.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default ReactionRoleCommand;
