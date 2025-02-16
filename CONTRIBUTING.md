# Contributing to EzClap Gaming Bot

Danke, dass du zur Entwicklung des EzClap Gaming Bots beitragen möchtest! Wir freuen uns über jede Art von Beitrag, sei es Code, Dokumentation oder Feedback.

## Voraussetzungen

Bevor du beginnst, stelle sicher, dass du folgende Voraussetzungen erfüllst:

- Node.js (empfohlen: neueste LTS-Version)
- TypeScript installiert
- MongoDB-Datenbank (lokal oder gehostet)
- Git und ein GitHub/GitLab-Konto

## Einrichtung des Projekts

1. Forke das Repository und klone es auf deinen Rechner:

    ```bash
    git clone https://github.com/EzClapGaming/ezclap-bot.git
    cd ezclap-bot
    ```

2. Installiere die Abhängigkeiten:

    ```bash
    npm install
    ```

3. Erstelle eine ```.env```-Datei und füge die notwendigen Umgebungsvariablen hinzu (siehe ```.env.example```).

4. Starte den Bot im Entwicklungsmodus:

    ```bash
    npm run dev
    ```

## Beitragsrichtlinien

1. Issues & Feature Requests

- Falls du einen Fehler gefunden hast oder eine Verbesserung vorschlagen möchtest, erstelle ein Issue.
- Beschreibe das Problem oder den Vorschlag so detailliert wie möglich.
- Falls du selbst eine Lösung hast, kannst du gerne einen PR erstellen.

2. Code Style & Best Practices

- Halte dich an den existierenden Code-Stil (ESLint & Prettier werden verwendet).
- Nutze TypeScript und typisiere alle Parameter und Rückgabewerte.
- Schreibe lesbaren und gut strukturierten Code.
- Dokumentiere wichtige Funktionen und Klassen mit JSDoc.

3. Branching & Pull Requests

- Entwickle neue Features auf einem separaten Branch: ```feature/<beschreibung>```.
- Bugfixes sollten im Branch ```fix/<beschreibung>``` entwickelt werden.
- Erstelle einen Pull Request gegen den ```development```-Branch.
- Stelle sicher, dass Tests erfolgreich laufen, bevor du einen PR erstellst.
- Nutze eine klare Commit-Historie mit aussagekräftigen Nachrichten.

4. Tests

- Falls du neue Features hinzufügst, erstelle passende Tests dafür.
- Wir verwenden Jest für Unit-Tests.
- Führe Tests mit folgendem Befehl aus:

    ```bash
    npm run test
    ```

## Kommunikation

Falls du Fragen oder Anregungen hast, kannst du uns auf Discord oder über Issues kontaktieren.

Danke für deine Unterstützung! 🚀
