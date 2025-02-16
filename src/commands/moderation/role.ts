import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    Role,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../functions/handleCommands";

const RoleCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Manage role from members.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("give")
                .setDescription("Give a role to a member.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("The member to give the role to.")
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option.setName("role").setDescription("The role to give.").setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Remove a role from a member.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("The member to remove the role from.")
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option.setName("role").setDescription("The role to remove.").setRequired(true),
                ),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: `This command can only be used in a server.`,
                ephemeral: true,
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member") as GuildMember;
        const role = interaction.options.getRole("role") as Role;

        if (!member || !role) {
            await interaction.reply({
                content: `Member or role not found.`,
                ephemeral: true,
            });
            return;
        }

        if (subcommand === "give") {
            if (
                !(interaction.member as GuildMember).permissions.has(
                    PermissionFlagsBits.ManageRoles,
                )
            ) {
                await interaction.reply({
                    content: `You do not have the required permissions to use this command.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                await interaction.reply({
                    content: `I cannot give a role that is higher or equal to my highest role.`,
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.add(role);
                await interaction.reply({
                    content: `Role ${role.name} has been given to ${member.user.tag}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`[Discord] Error while executing the role command: `, error);
                await interaction.reply({
                    content: `There was an error while executing this command!`,
                    ephemeral: true,
                });
            }
        } else if (subcommand === "remove") {
            if (
                !(interaction.member as GuildMember).permissions.has(
                    PermissionFlagsBits.ManageRoles,
                )
            ) {
                await interaction.reply({
                    content: `You do not have the required permissions to use this command.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= (interaction.member as GuildMember).roles.highest.position) {
                await interaction.reply({
                    content: `You cannot remove a role that i higher or equal to your highest role.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                await interaction.reply({
                    content: `I cannot remove a role that is higher or equal to my highest role.`,
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.remove(role);
                await interaction.reply({
                    content: `Role ${role.name} has been removed from ${member.user.tag}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`[Discord] Error while executing the role command: `, error);
                await interaction.reply({
                    content: `There was an error while executing this command!`,
                    ephemeral: true,
                });
            }
        }
    },
};

export default RoleCommand;
