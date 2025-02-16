import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { Command } from '../../functions/handleCommands';

const CatCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('katze')
        .setDescription('Zeigt ein zufälliges Katzenbild.'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const response = await axios.get('https://api.thecatapi.com/v1/images/search');
            const catImage = response.data[0].url;

            const catEmbed = new EmbedBuilder()
                .setColor('Random')
                .setImage(catImage)
                .setDescription('Hier ist eine zufällige Katze für dich! 🐱');

            await interaction.reply({ embeds: [catEmbed] });
        } catch (error) {
            console.error('Error fetching cat image:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription('Es gab einen Fehler beim Abrufen eines Katzenbildes. Bitte versuche es später noch einmal.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default CatCommand;
