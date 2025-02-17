import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { KickModel } from "../../models/Kick";

const KickCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Einen Benutzer vom Server werfen.")
        .addUserOption((option) =>
            option
                .setName("member")
                .setDescription("Das Mitglied, das rausgeschmissen werden soll")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("Der Grund für den Kick").setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "Dieser Befehl kann nur auf einem Server verwendet werden.",
                ephemeral: true,
            });
            return;
        }

        const memberToKick = interaction.options.getMember("member") as GuildMember;
        const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

        if (!interaction.guild.members.me!.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: "Ich habe keine Berechtigung, Mitglieder rauszuwerfen.",
                ephemeral: true,
            });
            return;
        }

        if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: `Sie sind nicht berechtigt, Mitglieder rauszuwerfen.`,
                ephemeral: true,
            });
            return;
        }

        if (memberToKick.id === interaction.user.id) {
            await interaction.reply({
                content: "Du kannst dich nicht selbst treten.",
                ephemeral: true,
            });
            return;
        }

        if (
            memberToKick.roles.highest.position >=
            (interaction.member as GuildMember).roles.highest.position
        ) {
            await interaction.reply({
                content: `Sie können dieses Mitglied nicht rauswerfen, da es eine höhere oder gleichwertige Rolle als Sie hat.`,
                ephemeral: true,
            });
            return;
        }

        if (!memberToKick.kickable) {
            await interaction.reply({
                content: `Ich kann dieses Mitglied nicht rauswerfen. Es hat möglicherweise eine höhere Rolle als ich oder mir fehlen die Berechtigungen.`,
                ephemeral: true,
            });
            return;
        }

        try {
            await memberToKick.kick(reason);

            const newKick = new KickModel({
                guildId: interaction.guildId,
                memberId: memberToKick.id,
                kickerId: interaction.user.id,
                reason: reason,
            });

            await newKick.save();

            await interaction.reply({
                content: `${memberToKick.user.tag} wurde erfolgreich vom Server geworfen.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`Error kicking member: `, error);
            await interaction.reply({
                content: "Beim Rauswerfen dieses Mitglieds ist ein Fehler aufgetreten.",
                ephemeral: true,
            });
        }
    },
};

export default KickCommand;
