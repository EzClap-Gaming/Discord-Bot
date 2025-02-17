import {
    Client,
    EmbedBuilder,
    TextChannel,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import axios from "axios";
import { Release, IRelease } from "../models/Release";

const GITHUB_REPO = "EzClap-Gaming/Discord-Bot";

export const checkForNewRelease = async (client: Client) => {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        );
        const latestRelease = response.data;

        const storedRelease = (await Release.findOne({ repo: GITHUB_REPO })) as IRelease | null;
        if (storedRelease?.latestReleaseId === latestRelease.id) {
            console.log("Kein neues Release gefunden.");
            return;
        }

        await Release.updateOne(
            { repo: GITHUB_REPO },
            {
                latestReleaseId: latestRelease.id,
                latestReleaseName: latestRelease.name,
                latestReleaseUrl: latestRelease.html_url,
                latestReleaseBody: latestRelease.body,
                latestReleaseThumbnail: latestRelease.assets?.[0]?.browser_download_url || "",
            },
            { upsert: true },
        );

        const config = (await Release.findOne({ repo: GITHUB_REPO })) as IRelease | null;
        if (!config || !config.announcementChannelId) {
            console.log("Kein Announcement-Channel gefunden.");
            return;
        }

        const channel = client.channels.cache.get(config.announcementChannelId);
        if (!channel || !(channel instanceof TextChannel)) {
            console.error("Ungültiger oder nicht vorhandener Kanal.");
            return;
        }

        const thumbnailUrl =
            latestRelease.assets?.[0]?.browser_download_url || client.user?.avatarURL();

        const embed = new EmbedBuilder()
            .setTitle(latestRelease.name)
            .setDescription(latestRelease.body || "Keine Beschreibung verfügbar.")
            .setColor("Blue")
            .setTimestamp()
            .setFooter({ text: "Neues Release verfügbar!" })
            .setThumbnail(thumbnailUrl);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel("Release ansehen")
                .setStyle(ButtonStyle.Link)
                .setURL(latestRelease.html_url),
        );

        await channel.send({ embeds: [embed], components: [row] });
        console.log(`Neues Release gepostet: ${latestRelease.name}`);
    } catch (error) {
        console.error("Fehler beim Abrufen des neuesten Releases:", error);
    }
};

export const startReleaseCheck = (client: Client) => {
    checkForNewRelease(client);
    setInterval(() => checkForNewRelease(client), 30 * 60 * 1000);
};
