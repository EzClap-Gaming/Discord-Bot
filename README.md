# EzClap Gaming Discord Bot

Ein leistungsstarker Discord-Bot in TypeScript mit MongoDB, speziell entwickelt für das EzClap Gaming Team. Der Bot bietet Funktionen für Teammanagement, Matchmaking, Statistiken, Community-Interaktion, Moderation, Wirtschaftssystem, XP-System, Ranglisten und vieles mehr.

## Features

    - **Teammanagement**: Erstelle und verwalte Teams.
    - **Matchmaking**: Organisiere Matches und Turniere.
    - **Statistiken**: Analysiere Spielerleistungen.
    - **Community-Interaktion**: Umfragen, Events und mehr.
    - **Moderation**: Kick, Ban, Mute und Warnungen.
    - **Wirtschaftssystem**: Virtuelle Währung, Shop und Belohnungen.
    - **XP-System**: Levelaufstieg basierend auf Aktivität.
    - **Ranglisten**: Zeigt die aktivsten Nutzer an.

## Installation

### Voraussetzungen

    - Node.js (Version 18 oder höher)
    - MongoDB-Datenbank
    - Ein Discord-Bot-Token

### Einrichtung

    1. Repository klonen:

        ```bash
        git clone https://github.com/EzClapGaming/discord-bot.git
        cd discord-bot
        ```

    2. Abhängigkeiten installieren:

        ```bash
        npm install
        ```

    3. ```.env``` Datei erstellen und konfigurieren:

        ```bash
        NAME=your_name
        VERSION=your_version
        REPOSITORY=your_repository_url
        BOT_OWNER_ID=your_user_id
        TOKEN=your_bot_token
        CLIENT_ID=your_bot_client_id
        TEST_SERVER_ID=your_test_server_id
        MONGO_URI=your_mongo_uri
        ```

    4. Bot starten:

        ```bash
        npm run dev
        ```

## Nutzung

### Verfügbare Befehle

| Befehl                | Beschreibung                           |
|-----------------------|----------------------------------------|
| /shutdown             | Fährt den Bot herunter (nur Owner).    |
| /set-status           | Setzt den Status des Bots (nur Owner). |
| /restart              | Startet den Bot neu (nur Owner).       |
| /logout               | Loggt den Bot aus (nur Owner).         |
| /eval                 | Führt Code aus (nur Owner).            |
| /poll                 | Erstellt eine Umfrage.                 |
| /activity leaderboard | Zeigt die aktivsten Nutzer.            |

## Entwicklung

### Code-Formatierung

Verwende ESLint und Prettier:

    ```bash
    npm run lint
    npm run format
    ```

### Tests ausführen

    ```bash
    npm test
    ```

### Deployment

Der Bot kann mit PM2 betrieben werden:

    ```bash
    pm2 start npm --name "EzClapBot" -- run start
    ```

## Lizenz

Dieses Projekt steht unter der [BSL-1.0-Lizenz](https://github.com/EzClap-Gaming/Discord-Bot/blob/development/LICENSE).
