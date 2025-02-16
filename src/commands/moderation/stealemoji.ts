import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import axios from "axios";

const StealEmojiCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("stealemoji")
        .setDescription("Steal an emoji from another server.")
        .addStringOption((option) =>
            option
                .setName("emoji")
                .setDescription("The emoji you want to steal.")
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
            return;
        }

        const emojiString = interaction.options.getString("emoji");
        if (!emojiString || !emojiString.startsWith("<") || !emojiString.endsWith(">")) {
            await interaction.reply({ content: "Invalid Emoji.", ephemeral: true });
            return;
        }

        const [name, id] = emojiString.slice(2, -1).split(":");
        const emojiId = id;

        try {
            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
            const member = interaction.member as GuildMember;
            const botMember = interaction.guild.members.me as GuildMember;

            if (!botMember.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
                await interaction.reply({
                    content: "I do not have the required permissions to manage emojis.",
                    ephemeral: true,
                });
                return;
            }

            if (!member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
                await interaction.reply({
                    content: "You do not have the required permissions to manage emojis.",
                    ephemeral: true,
                });
                return;
            }

            const response = await axios.get(emojiURL, {
                responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data);

            await interaction.guild.emojis.create({
                attachment: buffer,
                name: name,
            });

            await interaction.reply({
                content: `Emoji ${name} has been stolen and added to the server.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`[Discord] Error while stealing emoji: `, error);
            await interaction.reply({
                content: "There was an error while stealing the emoji.",
                ephemeral: true,
            });
        }
    },
};

export default StealEmojiCommand;
