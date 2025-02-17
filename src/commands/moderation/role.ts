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
        .setDescription("Rollen von Mitgliedern verwalten.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("give")
                .setDescription("Weisen Sie einem Mitglied eine Rolle zu.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dem die Rolle zugewiesen werden soll.")
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option.setName("role").setDescription("Die zu vergebende Rolle.").setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Entfernen Sie eine Rolle von einem Mitglied.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("Das Mitglied, dem die Rolle entzogen werden soll.")
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option.setName("role").setDescription("Die zu entfernende Rolle.").setRequired(true),
                ),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: `Dieser Befehl kann nur auf einem Server verwendet werden.`,
                ephemeral: true,
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member") as GuildMember;
        const role = interaction.options.getRole("role") as Role;

        if (!member || !role) {
            await interaction.reply({
                content: `Mitglied oder Rolle nicht gefunden.`,
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
                    content: `Sie verfügen nicht über die erforderlichen Berechtigungen, um diesen Befehl zu verwenden.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                await interaction.reply({
                    content: `Ich kann keine Rolle vergeben, die höher oder gleich meiner höchsten Rolle ist.`,
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.add(role);
                await interaction.reply({
                    content: `Die Rolle ${role.name} wurde an ${member.user.tag} zugewiesen.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`Error while executing the role command: `, error);
                await interaction.reply({
                    content: `Beim Ausführen dieses Befehls ist ein Fehler aufgetreten!`,
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
                    content: `Sie verfügen nicht über die erforderlichen Berechtigungen, um diesen Befehl zu verwenden.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= (interaction.member as GuildMember).roles.highest.position) {
                await interaction.reply({
                    content: `Sie können keine Rolle entfernen, die höher oder gleich Ihrer höchsten Rolle ist.`,
                    ephemeral: true,
                });
                return;
            }

            if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                await interaction.reply({
                    content: `Ich kann keine Rolle entfernen, die höher oder gleich meiner höchsten Rolle ist.`,
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.remove(role);
                await interaction.reply({
                    content: `Rolle ${role.name} wurde von ${member.user.tag} entfernt.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`Error while executing the role command: `, error);
                await interaction.reply({
                    content: `Beim Ausführen dieses Befehls ist ein Fehler aufgetreten!`,
                    ephemeral: true,
                });
            }
        }
    },
};

export default RoleCommand;
