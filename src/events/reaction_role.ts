import { Client, Interaction, ButtonInteraction, EmbedBuilder } from "discord.js";
import { ReactionRole } from "../models/ReactionRole";

export const handleReactionButtonInteraction = (client: Client) => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const buttonInteraction = interaction as ButtonInteraction;

        if (buttonInteraction.user.bot || !buttonInteraction.guild) return;

        const emoji = buttonInteraction.customId.split("_")[2];
        if (!emoji) return;

        try {
            const reactionRole = await ReactionRole.findOne({
                messageId: buttonInteraction.message.id,
            });
            if (!reactionRole) {
                await buttonInteraction.reply({
                    content: "⚠️ Keine Reaktionsrollen für diese Nachricht gefunden.",
                    ephemeral: true,
                });
                return;
            }

            const roleData = reactionRole.roles.find((r) => r.emoji === emoji);
            if (!roleData) {
                await buttonInteraction.reply({
                    content: `⚠️ Keine Rolle für Emoji gefunden: ${emoji}`,
                    ephemeral: true,
                });
                return;
            }

            const member = await buttonInteraction.guild.members.fetch(buttonInteraction.user.id);
            if (!member) return;

            const role = buttonInteraction.guild.roles.cache.get(roleData.roleId);
            const hasRole = member.roles.cache.has(roleData.roleId);

            if (hasRole) {
                await member.roles.remove(roleData.roleId);

                console.info(
                    `Removed role ${role?.name || roleData.roleId} from user ${member.user.tag || member.user.id}.`,
                );

                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle(`❌ Rolle entfernt: ${reactionRole.title}`)
                    .setDescription(
                        `Du wurdest von der Rolle entfernt, die mit diesem Emoji verknüpft ist:\n${roleData.emoji} -> <@&${roleData.roleId}>\n\n${reactionRole.description}`,
                    )
                    .setTimestamp();

                await buttonInteraction.reply({ embeds: [embed], ephemeral: true });

                reactionRole.logs.push({
                    userId: member.user.id,
                    userName: member.user.tag,
                    roleId: roleData.roleId,
                    roleName: role?.name || roleData.roleId,
                    action: "removed",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                await reactionRole.save();
            } else {
                await member.roles.add(roleData.roleId);

                console.info(
                    `Added role ${role?.name || "Unknown Role"} to user ${member.user.tag || member.user.id}.`,
                );

                const embed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle(`✅ Rolle hinzugefügt: ${reactionRole.title}`)
                    .setDescription(
                        `Du hast die Rolle erhalten, die mit diesem Emoji verknüpft ist:\n${roleData.emoji} -> <@&${roleData.roleId}>\n\n${reactionRole.description}`,
                    )
                    .setTimestamp();

                await buttonInteraction.reply({ embeds: [embed], ephemeral: true });

                reactionRole.logs.push({
                    userId: member.user.id,
                    userName: member.user.tag,
                    roleId: roleData.roleId,
                    roleName: role?.name || roleData.roleId,
                    action: "added",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                await reactionRole.save();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error handling button interaction: ${errorMessage}`);
            await buttonInteraction.reply({
                content:
                    "⚠️ Es gab einen Fehler beim Hinzufügen oder Entfernen der Rolle. Bitte versuche es später erneut.",
                ephemeral: true,
            });
        }
    });
};
