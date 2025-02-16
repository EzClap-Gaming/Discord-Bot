import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";

const UserInfoCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Zeigt detaillierte Informationen über einen Benutzer an.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Der Benutzer, über den Informationen angezeigt werden")
                .setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: `⚠️ Dieser Befehl kann nur in einem Server verwendet werden.`,
                ephemeral: true,
            });
            return;
        }

        const user = interaction.options.getUser("user") || interaction.user;
        const member = interaction.guild.members.cache.get(user.id) as GuildMember | undefined;

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`👤 **Benutzerinformationen**`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: "Benutzername", value: `${user.username}`, inline: true },
                { name: "Benutzer-ID", value: `||${user.id}||`, inline: true },
                {
                    name: "Beigetreten",
                    value: member
                        ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`
                        : `🚫 Nicht Mitglied des Servers`,
                    inline: true,
                },
                {
                    name: "Konto erstellt",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true,
                },
            )
            .setFooter({
                text: `Abgerufen von ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp().setDescription(`
                **Weitere Informationen:**\n
                🏅 **Benutzerstatus:** ${member?.presence ? member.presence.status : "Kein Status verfügbar"}\n
                👥 **Rollen des Benutzers:** ${member ? member.roles.cache.map((role) => role.name).join(", ") : "Keine Rollen vorhanden"}
            `);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

export default UserInfoCommand;
