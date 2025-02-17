import { Client, Events, Interaction } from "discord.js";
import { Giveaway } from "../models/Giveaway";

export const handleGiveawayReaction = (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "join_giveaway" && !interaction.user.bot) {
            try {
                const giveaway = await Giveaway.findOne({
                    messageId: interaction.message.id,
                });

                if (!giveaway) {
                    await interaction.reply({
                        content: "Das Giveaway existiert nicht!",
                        ephemeral: true,
                    });
                    return;
                }

                if (!giveaway.participants.includes(interaction.user.id)) {
                    giveaway.participants.push(interaction.user.id);
                    await giveaway.save();

                    const newButtonLabel = `🎉 Teilnehmen (${giveaway.participants.length})`;

                    await interaction.message.edit({
                        components: [
                            {
                                type: 1, // ActionRow
                                components: [
                                    {
                                        type: 2, // Button
                                        style: 1, // Primary Button
                                        label: newButtonLabel, // Setze das neue Label mit der Teilnehmerzahl
                                        customId: "join_giveaway", // Setze die customId für den Button
                                    },
                                ],
                            },
                        ],
                    });

                    await interaction.reply({
                        content: "🎉 Du hast am Giveaway teilgenommen!",
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: "Du bist bereits Teilnehmer!",
                        ephemeral: true,
                    });
                }
            } catch (error) {
                console.error("Fehler beim Hinzufügen zur Teilnehmerliste:", error);
                await interaction.reply({
                    content: "⚠️ Es gab ein Problem beim Hinzufügen zum Giveaway.",
                    ephemeral: true,
                });
            }
        }
    });
};
