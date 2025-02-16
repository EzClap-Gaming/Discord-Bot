import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { Command } from '../../functions/handleCommands';

const DogCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('hund')
        .setDescription('Zeigt ein zufälliges Hundebild.'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const response = await axios.get('https://dog.ceo/api/breeds/image/random');
            const dogImage = response.data.message;

            const dogEmbed = new EmbedBuilder()
                .setColor('#FF6347')
                .setImage(dogImage)
                .setDescription('Hier ist ein zufälliger Hund für dich! 🐶');

            await interaction.reply({ embeds: [dogEmbed] });
        } catch (error) {
            console.error('Error fetching dog image:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Es gab einen Fehler beim Abrufen eines Hundebildes. Bitte versuche es später noch einmal.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default DogCommand;
