import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Mute } from "../../models/Mute";

const MuteCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Stummschaltungsverwaltungsbefehle.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Schaltet ein Mitglied auf dem Server stumm.")
                .addUserOption((option) =>
                    option.setName("member").setDescription("Das stummzuschaltende Mitglied").setRequired(true),
                )
                .addStringOption((option) =>
                    option.setName("reason").setDescription("Grund für die Stummschaltung").setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Hebt die Stummschaltung eines Mitglieds auf dem Server auf.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dessen Stummschaltung aufgehoben werden soll")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("mute_number")
                        .setDescription("Stummschaltungsnummer zum Entfernen")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Grund für die Aufhebung der Stummschaltung des Mitglieds")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Listet alle Stummschaltungen für ein Mitglied auf.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dessen Stummschaltungen aufgelistet werden sollen")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("tempmute")
                .setDescription("Schaltet ein Mitglied auf dem Server vorübergehend für eine angegebene Zeit stumm.")
                .addUserOption((option) =>
                    option.setName("member").setDescription("Das stummzuschaltende Mitglied").setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("time")
                        .setDescription("Die Dauer der Stummschaltung in Sekunden")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option.setName("reason").setDescription("Grund für die Stummschaltung").setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove-all")
                .setDescription("Entfernt alle Stummschaltungen für ein Mitglied vom Server und aus der Datenbank.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dessen Stummschaltungen aufgehoben werden sollen")
                        .setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Zugriff verweigert")
                    .setDescription("Sie sind nicht berechtigt, Mitglieder stummzuschalten bzw. die Stummschaltung aufzuheben.")
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (subcommand === "add") {
                const member = interaction.options.getMember("member") as GuildMember;
                const reason = interaction.options.getString("reason")!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const muteRole = interaction.guild?.roles.cache.find(
                    (role) => role.name === "Muted",
                );
                if (!muteRole) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Stummschaltungsrolle nicht gefunden")
                        .setDescription(
                            'Stummschaltungsrolle nicht gefunden. Bitte erstellen Sie eine „Stummschaltungsrolle“ und versuchen Sie es erneut.',
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await member.roles.add(muteRole, reason);

                const lastMute = await Mute.findOne({
                    guildId: interaction.guildId!,
                    userId: member.id,
                }).sort({ muteNumber: -1 });
                const muteNumber = lastMute ? lastMute.muteNumber + 1 : 1;

                const muteRecord = new Mute({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    reason,
                    muteNumber,
                    duration: "Permanent",
                });
                await muteRecord.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Mitglied stummgeschaltet")
                    .setDescription(`${member.user.tag} wurde stummgeschaltet.`)
                    .addFields({ name: "Reason", value: reason })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a message to the muted user
                const userEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Du wurdest stummgeschaltet")
                    .setDescription(
                        `Sie wurden von ${interaction.user.tag} aus folgendem Grund stummgeschaltet: ${reason}.`,
                    )
                    .setTimestamp();
                await member.send({ embeds: [userEmbed] });
            } else if (subcommand === "remove") {
                const member = interaction.options.getMember("member") as GuildMember;
                const muteNumber = interaction.options.getInteger("mute_number")!;
                const reason = interaction.options.getString("reason")!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Find and remove the specified mute by mute number
                const muteRecord = await Mute.findOne({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    muteNumber,
                });
                if (muteRecord) {
                    // Remove the mute role
                    const muteRole = interaction.guild?.roles.cache.find(
                        (role) => role.name === "Muted",
                    );
                    if (muteRole && member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole);

                        // Log the unmute in the database
                        await Mute.deleteOne({
                            guildId: interaction.guildId!,
                            userId: member.id,
                            muteNumber,
                        });

                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Mitglied nicht stummgeschaltet")
                            .setDescription(`Die Stummschaltung von ${member.user.tag} wurde aufgehoben.`)
                            .addFields(
                                { name: "Letzter Stummschaltgrund", value: muteRecord.reason },
                                { name: "Grund für Aufhebung der Stummschaltung", value: reason },
                            )
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });

                        // Send a message to the unmuted user
                        const userEmbed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Ihre Stummschaltung wurde aufgehoben")
                            .setDescription(
                                `Ihre Stummschaltung wurde von ${interaction.user.tag} aufgehoben. Grund: ${reason}`,
                            )
                            .setTimestamp();
                        await member.send({ embeds: [userEmbed] });
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Stummschaltung nicht gefunden")
                        .setDescription(
                            `Für ${member.user.tag} wurde keine Stummschaltung mit der Nummer ${muteNumber} gefunden.`,
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (subcommand === "list") {
                const member = interaction.options.getMember("member") as GuildMember;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // List all mutes for the member
                const mutes = await Mute.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                }).sort({ muteNumber: -1 });
                if (mutes.length > 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle(`Stummschaltungen von ${member.user.tag}`)
                        .setDescription(`Nachfolgend sind alle Stummschaltungen für ${member.user.tag} aufgeführt:`)
                        .addFields(
                            mutes.map((mute) => ({
                                name: `Stummschalten #${mute.muteNumber} am ${new Date(mute.mutedAt).toLocaleString()}`,
                                value: `${mute.reason} (Dauer: ${mute.duration})`,
                            })),
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Keine Stummschaltungen gefunden")
                        .setDescription(`${member.user.tag} wurde nie stummgeschaltet.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (subcommand === "tempmute") {
                const member = interaction.options.getMember("member") as GuildMember;
                const time = interaction.options.getString("time")!;
                const reason = interaction.options.getString("reason")!;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Parse the time input
                const timeInSeconds = parseTime(time);
                if (!timeInSeconds) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Ungültiges Zeitformat")
                        .setDescription(
                            "Bitte geben Sie ein gültiges Zeitformat an (z. B. 10 s, 10 m, 1 h, 1 d, 1 w).",
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Mute the user temporarily
                const muteRole = interaction.guild?.roles.cache.find(
                    (role) => role.name === "Muted",
                );
                if (!muteRole) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Stummschaltungsrolle nicht gefunden")
                        .setDescription(
                            'Stummschaltungsrolle nicht gefunden. Bitte erstellen Sie eine „Stummschaltungsrolle“ und versuchen Sie es erneut.',
                        )
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await member.roles.add(muteRole, reason);

                // Find the latest mute number for the user in this guild
                const latestMute = await Mute.findOne({
                    guildId: interaction.guildId!,
                    userId: member.id,
                }).sort({ muteNumber: -1 });
                const muteNumber = latestMute ? latestMute.muteNumber + 1 : 1;

                // Save temp mute in the database
                const muteRecord = new Mute({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    muteNumber,
                    reason,
                    duration: time, // Save the duration in the format provided by the user
                    mutedAt: new Date(),
                });
                await muteRecord.save();

                const successEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(`${member.user.tag} wurde für ${time} stummgeschaltet.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [successEmbed] });

                // Send a Direct Message to the member
                const dmEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Sie wurden stummgeschaltet")
                    .setDescription(`Sie wurden für ${time} stummgeschaltet aufgrund von: ${reason}.`)
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });

                // Unmute after the time expires
                setTimeout(async () => {
                    await member.roles.remove(muteRole);
                    await Mute.deleteOne({
                        userId: member.id,
                        guildId: interaction.guildId!,
                        reason,
                    });

                    const unmuteEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Ihre Stummschaltung wurde aufgehoben")
                        .setDescription(
                            `Ihre Stummschaltung wurde aufgehoben. Die Stummschaltdauer von ${time} ist abgelaufen.`,
                        )
                        .setTimestamp();
                    await member.send({ embeds: [unmuteEmbed] });
                }, timeInSeconds * 1000);
            } else if (subcommand === "remove-all") {
                const member = interaction.options.getMember("member") as GuildMember;

                if (!member) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Mitglied nicht gefunden")
                        .setDescription("Das angegebene Mitglied konnte nicht gefunden werden.")
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Find all mutes for the member
                const mutes = await Mute.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });

                if (mutes.length > 0) {
                    // Remove all mutes in the database
                    await Mute.deleteMany({
                        guildId: interaction.guildId!,
                        userId: member.id,
                    });

                    // Remove the "Muted" role from the member
                    const muteRole = interaction.guild?.roles.cache.find(
                        (role) => role.name === "Muted",
                    );
                    if (muteRole && member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole);
                    }

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Alle Stummschaltungen entfernt")
                        .setDescription(`Alle Stummschaltungen für ${member.user.tag} wurden entfernt.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    // Send a message to the unmuted user
                    const userEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Alle Ihre Stummschaltungen wurden entfernt")
                        .setDescription(
                            `Alle Ihre Stummschaltungen wurden von ${interaction.user.tag} aufgehoben.`,
                        )
                        .setTimestamp();
                    await member.send({ embeds: [userEmbed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Keine Stummschaltungen gefunden")
                        .setDescription(`${member.user.tag} hat keine Stummschaltungen zum Entfernen.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Error")
                .setDescription("Beim Verarbeiten des Befehls ist ein Fehler aufgetreten.")
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

// Helper function to parse time strings
function parseTime(time: string): number | null {
    const timeRegex = /^(\d+)(s|m|h|d|w)$/;
    const match = time.match(timeRegex);
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case "s":
                return value;
            case "m":
                return value * 60;
            case "h":
                return value * 3600;
            case "d":
                return value * 86400;
            case "w":
                return value * 604800;
            default:
                return null;
        }
    }
    return null;
}

export default MuteCommand;
