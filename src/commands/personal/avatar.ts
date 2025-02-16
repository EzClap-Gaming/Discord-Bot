import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const AvatarCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Zeigt den Avatar eines Benutzers an. 🖼️')
        .addUserOption(option => 
            option.setName('benutzer')
                .setDescription('Der Benutzer, dessen Avatar angezeigt werden soll 👤')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const benutzer = interaction.options.getUser('benutzer') || interaction.user;

        const avatarURL = benutzer.displayAvatarURL({ size: 512 });

        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`${benutzer.username}'s Avatar 🖼️`)
            .setDescription(`Hier ist der Avatar von **${benutzer.username}**. 🌟`)
            .setImage(avatarURL)
            .setFooter({ text: `Angefordert von ${interaction.user.username} 👑`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

export default AvatarCommand;
