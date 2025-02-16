# EzClap Gaming Bot - Dokumentation

Willkommen zur Dokumentation des EzClap Gaming Bots. Dieses Dokument beschreibt die Funktionen, Befehle und Systeme des Bots sowie technische Details zur Implementierung.

## Inhaltsverzeichnis

[Einleitung](#einleitung)
[Installation](#installation)
[Konfiguration](#konfiguration)
[Befehle](#befehle)
[Systeme](#systeme)
[Datenbankstruktur](#datenbankstruktur)
[Fehlersuche & Debugging](#fehlersuche--debugging)
[Lizenz](#lizenz)

## Einleitung

EzClap Gaming Bot ist ein leistungsstarker Discord-Bot für eSports-Teams. Er bietet Team-Management, Matchmaking, Statistik-Tracking und viele weitere Funktionen.

## Installation

1. Klone das Repository:

    ```bash
    git clone https://github.com/EzClapGaming/ezclap-bot.git
    cd ezclap-bot
    ```

2. Installiere die Abhängigkeiten:

    ```bash
    npm install
    ```

3. Erstelle eine ```.env```-Datei basierend auf ```.env.example```.

4. Starte den Bot:

    ```bash
    npm run start
    ```

## Konfiguration

Alle Konfigurationswerte werden über die ```.env```-Datei verwaltet. Zu den wichtigsten Variablen gehören:

- ```DISCORD_TOKEN```: Token für die Discord API
- ```MONGO_URI```: Verbindung zur MongoDB-Datenbank
- ```PREFIX```: Präfix für Bot-Befehle

## Befehle

| Fun Befehle  | Beschreibung                                                   |
|--------------|----------------------------------------------------------------|
| /cat         | Zeigt ein zufälliges Katzenbild.                               |
| /dog         | Zeigt ein zufälliges Hundebild.                                |
| /emojify     | Konvertiert deinen Text in Emojis.                             |
| /flipcoin    | Wirf eine Münze und erhalte ein Ergebnis.                      |
| /joke        | Erzähle einen zufälligen Witz.                                 |
| /roll-dice   | Würfle einen Würfel und erhalte eine Zahl zwischen 1 und 6.    |

| General Befehle           | Beschreibung                                                  |
|---------------------------|---------------------------------------------------------------|
| /activity leaderboard     | Zeigt die Rangliste für Nachrichten und Sprachaktivität.      |
| /                         |                                                               |
| /invite                   | Erhalte einen Einladungslink für den Server.                  |
| /level current            | Überprüfe dein aktuelles Level und XP.                        |
| /level progress           | Überprüfe deinen Fortschritt zum nächsten Level.              |
| /level leaderboard        | Zeige die Rangliste der höchsten Level-Nutzer im Server.      |
| /level statistics         | Überprüfe deine Level-Statistiken der letzten 30 Tage.        |
| /poll                     | Erstellt eine Umfrage mit Ja/Nein-Antworten.                  |

| Moderation Befehle  | Beschreibung                                            |
|--------------|----------------------------------------------------------------|
| /         |                                |
| /         |                                 |
| /     |                              |
| /    |                       |
| /        |                                  |
| /   |     |

| Owner Befehle  | Beschreibung                                                                                     |
|----------------|--------------------------------------------------------------------------------------------------|
| /eval          | Führt einen JavaScript-Codeausschnitt aus. Dieser kann nur vom Bot-Besitzer verwendet werden.    |
| /logout        | Meldet den Bot ab. Dies kann nur vom Bot-Besitzer verwendet werden.                              |
| /restart       | Startet den Bot neu. Dies kann nur vom Bot-Besitzer verwendet werden.                            |
| /set-status    | Setzt die Statusnachricht des Bots. Dies kann nur vom Bot-Besitzer verwendet werden.             |
| /shutdown      | Fährt den Bot herunter. Dies kann nur vom Bot-Besitzer verwendet werden.                         |

| Personal Befehle  | Beschreibung                          |
|-------------------|---------------------------------------|
| /avatar           | Zeigt den Avatar eines Benutzers an.  |
| /reminder         | Setze eine Erinnerung.                |

| Utility Befehle  | Beschreibung                                                                       |
|------------------|------------------------------------------------------------------------------------|
| /botinfo         | Zeigt Informationen über den Bot an. Dies kann nur vom Besitzer genutzt werden.    |
| /help            | Zeigt alle verfügbaren Befehle kategorisiert mit Seitenumblätterung.               |
| /pdf             | Konvertiert Text in eine gut formatierte PDF-Datei.                                |
| /ping            | Zeigt den Ping des Discord-Bots und des Servers an.                                |
| /qrcode          | Generiert einen QR-Code aus einer angegebenen URL.                                 |
| /serverinfo      | Zeigt Informationen über den Server an.                                            |
| /serverstats     | Zeigt die Echtzeit-Serverstatistiken an.                                           |
| /uptime          | Zeigt an, wie lange der Bot schon online ist.                                      |
| /userinfo        | Zeigt detaillierte Informationen über einen Benutzer an.                           |
| /version         | Zeigt die aktuelle Version des Bots an.                                            |

## Systeme

### Ban/Kick/Mute/Warn System

Ermöglicht es berechtigten ein Spieler zu bannen/kicken/muten/warnen und zu verwalten.

### Ticket System

Benutzer mit berechtigungen können das Ticket System konfigurieren und verwalten.

### Economy & XP-System

Ein virtuelles Wirtschaftssystem mit Erfahrungspunkten zur Förderung der Community-Interaktion.

### Activity Tracking System

Deine Aktivität mit Nachrichten und im Sprachkanal werden getrackt und Nutzer können in einem Leaderboard sehen wie hoch Sie sind.

## Datenbankstruktur

Der Bot verwendet MongoDB. Die wichtigsten Sammlungen:

- ```users```: Speichert Benutzerprofile und XP
- ```teams```: Enthält Team-Informationen
- ```matches```: Dokumentiert laufende und vergangene Matches

## Fehlersuche & Debugging

Nutze npm run lint für Code-Überprüfung.
Logs sind unter logs/ verfügbar.
Debugging mit DEBUG=true npm run dev aktivieren.

## Lizenz

EzClap Gaming Bot ist unter der [BSL-1.0-Lizenz](https://github.com/EzClap-Gaming/Discord-Bot/blob/development/LICENSE) veröffentlicht.
