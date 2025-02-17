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
        .setName("steal-emoji")
        .setDescription("Stehlen Sie ein Emoji von einem anderen Server.")
        .addStringOption((option) =>
            option
                .setName("emoji")
                .setDescription("Das Emoji, das Sie stehlen möchten.")
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "Dieser Befehl kann nur auf einem Server verwendet werden.",
                ephemeral: true,
            });
            return;
        }

        const emojiString = interaction.options.getString("emoji");
        if (!emojiString || !emojiString.startsWith("<") || !emojiString.endsWith(">")) {
            await interaction.reply({ content: "Ungültiges Emoji.", ephemeral: true });
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
                    content:
                        "Ich verfüge nicht über die erforderlichen Berechtigungen zum Verwalten von Emojis.",
                    ephemeral: true,
                });
                return;
            }

            if (!member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
                await interaction.reply({
                    content:
                        "Sie verfügen nicht über die erforderlichen Berechtigungen zum Verwalten von Emojis.",
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
                content: `Emoji ${name} wurde gestohlen und dem Server hinzugefügt.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`Error while stealing emoji: `, error);
            await interaction.reply({
                content: "Beim Stehlen des Emojis ist ein Fehler aufgetreten.",
                ephemeral: true,
            });
        }
    },
};

export default StealEmojiCommand;
