import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    TextChannel,
    ChannelType,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { InviteModel } from "../../models/Invite";

const InviteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Verwalte Server Einladungslinks.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Erstelle einen Einladungslink für den Server."),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Liste alle gespeicherten Einladungen."),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "create") {
            const textChannel = interaction.guild?.channels.cache.find(
                (channel) => channel.type === ChannelType.GuildText,
            ) as TextChannel;

            if (!textChannel) {
                await interaction.reply({
                    content: "Kein Textkanal gefunden, um eine Einladung zu erstellen.",
                    ephemeral: true,
                });
                return;
            }

            try {
                const invite = await textChannel.createInvite({
                    unique: true,
                    maxAge: 0,
                });

                const newInvite = new InviteModel({
                    guildId: interaction.guildId,
                    channelId: textChannel.id,
                    inviteUrl: invite.url,
                });

                await newInvite.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Server Einladungslink")
                    .setDescription("Klicke auf den Link unten, um dem Server beizutreten!")
                    .addFields(
                        { name: "Einladungslink", value: `[Hier Beitreten](${invite.url})` },
                        { name: "Einladungs-URL", value: `${invite.url}` },
                    )
                    .setFooter({
                        text: `Angefordert von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error("Error creating invite:", error);
                await interaction.reply({
                    content: "Es konnte kein Einladungslink erstellt werden.",
                    ephemeral: true,
                });
            }
        }

        if (subcommand === "list") {
            try {
                const invites = await InviteModel.find({
                    guildId: interaction.guildId,
                });

                if (invites.length === 0) {
                    await interaction.reply({
                        content: "Es wurden keine Einladungen gefunden.",
                        ephemeral: true,
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Aktive Einladungen")
                    .setDescription("Hier sind alle aktiven Einladungslinks:");

                invites.forEach((invite, index) => {
                    embed.addFields({
                        name: `Einladung ${index + 1}`,
                        value: `[Hier Beitreten](${invite.inviteUrl})\n**Erstellt am:** ${invite.createdAt.toLocaleString()}`,
                    });
                });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error("Error fetching invites:", error);
                await interaction.reply({
                    content: "Es konnte keine Einladungen abgerufen werden.",
                    ephemeral: true,
                });
            }
        }
    },
};

export default InviteCommand;
