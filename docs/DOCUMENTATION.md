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
| /flip-coin   | Wirf eine Münze und erhalte ein Ergebnis.                      |
| /joke        | Erzähle einen zufälligen Witz.                                 |
| /roll-dice   | Würfle einen Würfel und erhalte eine Zahl zwischen 1 und 6.    |

| General Befehle           | Beschreibung                                                                      |
|---------------------------|-----------------------------------------------------------------------------------|
| /activity leaderboard     | Zeigt die Rangliste für Nachrichten und Sprachaktivität.                          |
| /economy add-coins        | Fügen Sie einem Benutzer Münzen hinzu.                                            |
| /economy balance          | Prüfen Sie Ihren aktuellen Kontostand.                                            |
| /economy bank             | Sehen Sie sich Ihren Kontostand an.                                               |
| /economy bet              | Setzen Sie Geld, um zu gewinnen oder zu verlieren!                                |
| /economy daily            | Fordern Sie Ihre tägliche Belohnung an. (Erster Command um Konto zu erstellen.)   |
| /economy deposit          | Zahlen Sie Münzen auf Ihr Bankkonto ein.                                          |
| /economy leaderboard      | Zeigt die Top-Benutzer nach Guthaben an.                                          |
| /economy pay              | Senden Sie Münzen an einen anderen Benutzer.                                      |
| /economy rob              | Versuch, einen anderen Benutzer auszurauben!                                      |
| /economy shop             | Durchsuchen und kaufen Sie Artikel im Shop.                                       |
| /economy work             | Arbeiten und verdienen Geld                                                       |
| /economy withdraw         | Geld abheben                                                                      |
| /invite                   | Erhalte einen Einladungslink für den Server.                                      |
| /level current            | Überprüfe dein aktuelles Level und XP.                                            |
| /level progress           | Überprüfe deinen Fortschritt zum nächsten Level.                                  |
| /level leaderboard        | Zeige die Rangliste der höchsten Level-Nutzer im Server.                          |
| /level statistics         | Überprüfe deine Level-Statistiken der letzten 30 Tage.                            |
| /poll                     | Erstellt eine Umfrage mit Ja/Nein-Antworten.                                      |
| /release set-channel      | Setzt den Kanal für Release-Ankündigungen                                         |
| /release list             | Zeigt die letzten Releases an                                                     |

| Moderation Befehle                    | Beschreibung                                                                                            |
|---------------------------------------|---------------------------------------------------------------------------------------|
| /antilink enable                      | Aktivieren Sie den Anti-Link-Schutz.                                                  |
| /antilink disable                     | Deaktivieren Sie den Anti-Link-Schutz.                                                |
| /antilink allowed-channels-add        | Fügen Sie zum Schutz vor Links einen Kanal zu den zulässigen Kanälen hinzu.           |
| /antilink allowed-channels-remove     | Entfernen Sie zum Schutz vor Links einen Kanal aus den zulässigen Kanälen.            |
| /antilink allowed-channels-view       | Zeigen Sie alle zulässigen Kanäle zum Anti-Link-Schutz an.                            |
| /ban add                              | Ein Mitglied vom Server verbannen.                                                    |
| /ban remove                           | Heben Sie die Sperre eines Mitglieds auf.                                             |
| /ban list                             | Liste aller gesperrten Mitglieder.                                                    |
| /clear commands                       | Löscht alle Bot-Befehle.                                                              |
| /clear messages                       | Löscht eine angegebene Anzahl von Nachrichten im aktuellen Kanal.                     |
| /giveaway create                      | Erstellt ein neues Giveaway.                                                          |
| /giveaway end                         | Beendet ein aktives Giveaway.                                                         |
| /giveaway list                        | Zeigt alle aktiven Giveaways an.                                                      |
| /giveaway reroll                      | Ermittelt neue Gewinner für ein beendetes Giveaway.                                   |
| /kick                                 | Einen Benutzer vom Server werfen.                                                     |
| /lockdown add                         | Sperrt den aktuellen Textkanal, um Nachrichten zu verhindern.                         |
| /lockdown remove                      | Schaltet den aktuellen Textkanal frei.                                                |
| /mute add                             | Schaltet ein Mitglied auf dem Server stumm.                                           |
| /mute remove                          | Hebt die Stummschaltung eines Mitglieds auf dem Server auf.                           |
| /mute list                            | Listet alle Stummschaltungen für ein Mitglied auf.                                    |
| /mute tempmute                        | Schaltet ein Mitglied auf dem Server vorübergehend für eine angegebene Zeit stumm.    |
| /mute remove-all                      | Entfernt alle Stummschaltungen für ein Mitglied vom Server und aus der Datenbank.     |
| /nickname                             | Ändert den Spitznamen eines Mitglieds. Kann nur von Moderatoren verwendet werden.     |
| /reaction-role create                 | Erstellen Sie eine neue Reaktionsrollennachricht.                                     |
| /reaction-role list                   | Listet alle Reaktionsrollennachrichten auf diesem Server auf.                         |
| /reaction-role delete                 | Löschen Sie eine bestimmte Reaktionsrollennachricht.                                  |
| /report create                        | Erstelle einen neuen Report                                                           |
| /report view                          | Zeige die Details eines Reports an                                                    |
| /report update                        | Aktualisiere den Status eines Reports                                                 |
| /report close                         | Schließe einen Report                                                                 |
| /report list                          | Liste alle offenen Reports auf                                                        |
| /report archived                      | Liste alle archivierten Reports auf                                                   |
| /report closed                        | Liste alle geschlossenen Reports auf                                                  |
| /role give                            | Weisen Sie einem Mitglied eine Rolle zu.                                              |
| /role remove                          | Entfernen Sie eine Rolle von einem Mitglied.                                          |
| /slowmode add                         | Legt den Slowmode für den angegebenen Kanal fest.                                     |
| /slowmode remove                      | Entfernt den Slowmode für den angegebenen Kanal.                                      |
| /steal-emoji                          | Stehlen Sie ein Emoji von einem anderen Server.                                       |
| /ticket setup                         | Richten Sie das Ticketsystem für diesen Server ein.                                   |
| /ticket panel                         | Senden Sie ein benutzerdefiniertes Ticketfeld.                                        |
| /ticket list                          | Listet alle offenen Ticketkanäle auf.                                                 |
| /ticket delete                        | Löscht ein Ticket Panel.                                                              |
| /warn add                             | Warnt ein Mitglied.                                                                   |
| /warn remove                          | Entfernt eine bestimmte Warnung von einem Mitglied.                                   |
| /warn list                            | Listet alle Warnungen für ein Mitglied auf.                                           |

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
