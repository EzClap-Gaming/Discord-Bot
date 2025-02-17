import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import PingCommand from "../commands/utility/ping";
import UserInfoCommand from "../commands/utility/userinfo";
import ServerInfoCommand from "../commands/utility/serverinfo";
import BotInfoCommand from "../commands/utility/botinfo";
import StealEmojiCommand from "../commands/moderation/stealemoji";
import VersionCommand from "../commands/utility/version";
import KickCommand from "../commands/moderation/kick";
import RoleCommand from "../commands/moderation/role";
import AntiLinkCommand from "../commands/moderation/antilink";
import TicketCommand from "../commands/moderation/ticket";
import BanCommand from "../commands/moderation/ban";
import MuteCommand from "../commands/moderation/mute";
import LockdownCommand from "../commands/moderation/lockdown";
import NicknameCommand from "../commands/moderation/nickname";
import ClearCommand from "../commands/moderation/clear";
import WarnCommand from "../commands/moderation/warn";
import AvatarCommand from "../commands/personal/avatar";
import InviteCommand from "../commands/general/invite";
import HelpCommand from "../commands/utility/help";
import LogoutCommand from "../commands/owner/logout";
import SlowmodeCommand from "../commands/moderation/slowmode";
import FlipCoinCommand from "../commands/fun/flipcoin";
import ReminderCommand from "../commands/personal/reminder";
import DogCommand from "../commands/fun/dog";
import CatCommand from "../commands/fun/cat";
import PollCommand from "../commands/general/poll";
import UptimeCommand from "../commands/utility/uptime";
import EmojifyCommand from "../commands/fun/emojify";
import EconomyCommand from "../commands/general/economy";
import RollDiceCommand from "../commands/fun/rolldice";
import LevelCommand from "../commands/general/level";
import JokeCommand from "../commands/fun/joke";
import EvalCommand from "../commands/owner/eval";
import RestartCommand from "../commands/owner/restart";
import SetStatusCommand from "../commands/owner/setstatus";
import ShutdownCommand from "../commands/owner/shutdown";
import ReactionRoleCommand from "../commands/moderation/reactionrole";
import GiveawayCommand from "../commands/moderation/giveaway";
import ServerStatsCommand from "../commands/utility/serverstats";
import QRCodeCommand from "../commands/utility/qrcode";
import PDFCommand from "../commands/utility/pdf";

dotenv.config();

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing variable: ${name}`);
    }
    return value;
}

const token: string = getEnvVar("TOKEN");
const clientId: string = getEnvVar("CLIENT_ID");
const guildId: string = getEnvVar("TEST_SERVER_ID");

const commandFiles = [
    PingCommand,
    UserInfoCommand,
    ServerInfoCommand,
    BotInfoCommand,
    VersionCommand,
    StealEmojiCommand,
    KickCommand,
    RoleCommand,
    AntiLinkCommand,
    TicketCommand,
    BanCommand,
    ClearCommand,
    MuteCommand,
    LockdownCommand,
    NicknameCommand,
    WarnCommand,
    AvatarCommand,
    InviteCommand,
    HelpCommand,
    LogoutCommand,
    SlowmodeCommand,
    FlipCoinCommand,
    JokeCommand,
    ReminderCommand,
    DogCommand,
    CatCommand,
    PollCommand,
    UptimeCommand,
    EmojifyCommand,
    EconomyCommand,
    RollDiceCommand,
    LevelCommand,
    EvalCommand,
    RestartCommand,
    SetStatusCommand,
    ShutdownCommand,
    ReactionRoleCommand,
    GiveawayCommand,
    ServerStatsCommand,
    QRCodeCommand,
    PDFCommand,
];

const commands: any[] = [];

for (const command of commandFiles) {
    if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
    } else {
        console.info(`The command is missing a required 'data' or 'execute' property.`);
    }
}

const rest = new REST({ version: "9" }).setToken(token);

export const registerCommands = async () => {
    try {
        console.info(`Started refreshing ${commands.length} application (/) commands.`);

        const data: any = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};
