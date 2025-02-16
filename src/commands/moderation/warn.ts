import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    GuildMember,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Warn } from "../../models/Warn";

const WarnCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Manages warnings for members.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Warns a member.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("The member to warn.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Reason for the warning.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Removes a specific warning from a member.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("The member whose warning will be removed.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("identifier")
                        .setDescription("The warning number or text to remove.")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("removal-reason")
                        .setDescription("Reason for removing the warning.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Lists all warnings for a member.")
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription("The member to list warnings for.")
                        .setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("Permission Denied")
                .setDescription("You do not have permission to manage warnings.")
                .setFooter({
                    text: `Executed by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getMember("member") as GuildMember;

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("Could not find the specified member.")
                .setFooter({
                    text: `Executed by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (subcommand === "add") {
            const reason = interaction.options.getString("reason")!;
            try {
                const warningCount = await Warn.countDocuments({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });
                const warning = new Warn({
                    guildId: interaction.guildId!,
                    userId: member.id,
                    moderatorId: interaction.user.id,
                    reason: `#${warningCount + 1}: ${reason}`,
                });
                await warning.save();

                const embed = new EmbedBuilder()
                    .setColor("#FFFF00")
                    .setTitle("Member Warned")
                    .setDescription(`${member.user.tag} has been warned.`)
                    .addFields({ name: "Reason", value: reason })
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a DM to the warned user
                const dmEmbed = new EmbedBuilder()
                    .setColor("#FFFF00")
                    .setTitle("You have been warned!")
                    .setDescription(`You have received a warning in the server. Reason: ${reason}`)
                    .setFooter({
                        text: `Issued by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error("[Warn Add] Error saving warning:", error);
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Error")
                    .setDescription(
                        "An error occurred while adding the warning. Please try again later.",
                    )
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (subcommand === "remove") {
            const identifier = interaction.options.getString("identifier")!;
            const removalReason = interaction.options.getString("removal-reason")!;
            try {
                const warnings = await Warn.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });
                const warningToRemove = warnings.find((w) => w.reason.includes(identifier));

                if (!warningToRemove) {
                    const embed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(
                            `No warning found for ${member.user.tag} with identifier: "${identifier}".`,
                        )
                        .setFooter({
                            text: `Executed by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                await Warn.findByIdAndDelete(warningToRemove._id);

                const embed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("Warning Removed")
                    .setDescription(
                        `The following warning has been removed from ${member.user.tag}:`,
                    )
                    .addFields({ name: "Removed Warning", value: warningToRemove.reason })
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send a DM to the user notifying the removal
                const dmEmbed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("Your warning was removed")
                    .setDescription(
                        `A warning has been removed from your record in the server. Removed Reason: ${removalReason}\nOriginal Warning: ${warningToRemove.reason}`,
                    )
                    .setFooter({
                        text: `Removed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await member.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error("[Warn Remove] Error removing warning:", error);
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Error")
                    .setDescription(
                        "An error occurred while removing the warning. Please try again later.",
                    )
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (subcommand === "list") {
            try {
                const warnings = await Warn.find({
                    guildId: interaction.guildId!,
                    userId: member.id,
                });

                if (warnings.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${member.user.tag} has no warnings.`)
                        .setFooter({
                            text: `Executed by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const warningList = warnings.map((w) => `• ${w.reason} (ID: ${w._id})`).join("\n");

                const embed = new EmbedBuilder()
                    .setColor("#00FFFF")
                    .setTitle(`Warnings for ${member.user.tag}`)
                    .setDescription(warningList)
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error("[Warn List] Error fetching warnings:", error);
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Error")
                    .setDescription(
                        "An error occurred while listing the warnings. Please try again later.",
                    )
                    .setFooter({
                        text: `Executed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};

export default WarnCommand;
