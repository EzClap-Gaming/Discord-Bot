import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../functions/handleCommands";

const KickCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server.")
        .addUserOption((option) =>
            option.setName("member").setDescription("The member to kick").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for the kick").setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
            return;
        }

        const memberToKick = interaction.options.getMember("member") as GuildMember;
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!interaction.guild.members.me!.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: "I do not have permission to kick members.",
                ephemeral: true,
            });
            return;
        }

        if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: `You do not have permission to kick members.`,
                ephemeral: true,
            });
            return;
        }

        if (memberToKick.id === interaction.user.id) {
            await interaction.reply({
                content: "You cannot kick yourself.",
                ephemeral: true,
            });
            return;
        }

        if (
            memberToKick.roles.highest.position >=
            (interaction.member as GuildMember).roles.highest.position
        ) {
            await interaction.reply({
                content: `You cannot kick this member because they have a higher or equal role to yours.`,
                ephemeral: true,
            });
            return;
        }

        if (!memberToKick.kickable) {
            await interaction.reply({
                content: `I cannot kick this member. They might have a higher role than me or I lack permissions.`,
                ephemeral: true,
            });
            return;
        }

        try {
            await memberToKick.kick(reason);
            await interaction.reply({
                content: `Successfully kicked ${memberToKick.user.tag} from the server.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`[DISCORD] Error kicking member: `, error);
            await interaction.reply({
                content: "There was an error while kicking this member.",
                ephemeral: true,
            });
        }
    },
};

export default KickCommand;
