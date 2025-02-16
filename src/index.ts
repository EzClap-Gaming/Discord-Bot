import path from "path";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import { Client, Collection, GatewayIntentBits, Interaction } from "discord.js";

import { connectDB } from "./database/connect";
import { Command } from "./functions/handleCommands";
import { registerCommands } from "./functions/register";

import { handleReactionButtonInteraction } from "./events/reaction_role";
import { handleAntiLink } from "./events/anti_link";
import {
    handleCreateTicketButton,
    handleClaimTicketButton,
    handleCloseTicketButton,
} from "./events/ticket_button";
import { handleXPListener } from "./events/xp_gain";
import { reputationEmitter } from "./utils/reputationEmitter";
import { handleReadyEvent } from "./events/ready";
import { handleActivityTracker } from "./events/activity_tracker";
import { handleWelcomeEvent } from "./events/welcome_message";

dotenv.config();

interface ExtendedClient extends Client {
    commands: Collection<string, Command>;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
}) as ExtendedClient;

client.commands = new Collection<string, Command>();
const commandFolders = readdirSync(path.join(__dirname, "commands"));

for (const folder of commandFolders) {
    const commandFiles = readdirSync(path.join(__dirname, "commands", folder)).filter((file) =>
        file.endsWith(".ts"),
    );

    for (const file of commandFiles) {
        // Verwende `import()` um dynamisch zu laden, da `require` in TypeScript nicht optimal ist
        import(path.join(__dirname, "commands", folder, file))
            .then((commandModule) => {
                const command = commandModule.default;

                console.info(`Loading Command: ${file}`);

                if (!command?.data?.name) {
                    console.error(
                        `Command in file ${file} is missing a 'data.name' property.`,
                    );
                    return;
                }

                client.commands.set(command.data.name, command);
            })
            .catch((err) => console.error(`Error loading command ${file}: ${err}`));
    }
}

client.once("ready", async () => {
    try {
        await connectDB();
        console.info(`${client.user?.tag} is started.`);

        await registerCommands();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error connecting to MongoDB: ${errorMessage}`);
    }
});

handleReadyEvent(client);
handleAntiLink(client);
handleActivityTracker(client);
handleXPListener(client);
handleWelcomeEvent(client);

handleCreateTicketButton(client);
handleClaimTicketButton(client);
handleCloseTicketButton(client);
handleReactionButtonInteraction(client);

client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error executing command: ${errorMessage}`);
        }
    }
});

client.on("messageCreate", async (message) => {
    reputationEmitter.emit("message", message.author.id, message.content);
});

client.login(process.env.TOKEN);
