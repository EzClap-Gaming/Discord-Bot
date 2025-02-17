import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    GuildMember,
    User,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Ban, IBan } from "../../models/Ban";

const BanCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Verwalten Sie Sperren für ein Mitglied auf dem Server.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Ein Mitglied vom Server verbannen.")
                .addUserOption((option) =>
                    option.setName("member").setDescription("Das zu verbannende Mitglied").setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Grund für das Verbot")
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Heben Sie die Sperre eines Mitglieds auf.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das zu entsperrende Mitglied")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Liste aller gesperrten Mitglieder."),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            // Add Ban
            if (subcommand === "add") {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Zugriff verweigert")
                        .setDescription("Sie sind nicht berechtigt, Mitglieder zu sperren.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const member = interaction.options.getMember("member") as GuildMember;
                const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Create a new ban entry in the database
                const ban = new Ban({
                    userId: member.user.id,
                    reason,
                    bannedBy: interaction.user.id,
                });

                await ban.save(); // Save the ban record in MongoDB

                // Ban the user
                await member.ban({ reason });

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Mitglied gesperrt")
                    .setDescription(`${member.user.tag} wurde vom Server verbannt.`)
                    .addFields({ name: "Reason", value: reason })
                    .setFooter({
                        text: `Gesperrt von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Remove Ban
            if (subcommand === "remove") {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Zugriff verweigert")
                        .setDescription("Sie sind nicht berechtigt, die Sperre von Mitgliedern aufzuheben.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const user = interaction.options.getUser("member") as User;

                if (!user) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Benutzer nicht gefunden")
                        .setDescription("Der angegebene Benutzer konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await interaction.guild?.members.unban(user);

                // Remove the ban entry from the database
                await Ban.deleteOne({ userId: user.id });

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Mitglied entsperrt")
                    .setDescription(`Die Sperre für ${user.tag} wurde auf dem Server aufgehoben.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // List Bans
            if (subcommand === "list") {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Zugriff verweigert")
                        .setDescription("Sie sind nicht berechtigt, die gesperrten Benutzer anzuzeigen.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Retrieve the list of banned users from the database
                const bans = await Ban.find();

                const bannedList =
                    bans.map((ban: IBan) => `<@${ban.userId}>`).join("\n") || "Keine gesperrten Mitglieder.";
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Gesperrte Mitglieder")
                    .setDescription(bannedList)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error("Error:", error);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Error")
                .setDescription(
                    "Beim Verarbeiten des Befehls ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default BanCommand;
