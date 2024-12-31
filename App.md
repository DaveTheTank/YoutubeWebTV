# YouTube TV Web-App

In der folgenden Datei werden die wichtigsten Informationen zu der App gesammelt.

## App Name
Vorschläge:
- TubeTV
- StreamTV
- WebTV

## Konzept
Die App simuliert das klassische TV-Erlebnis mit YouTube-Content:
- Nutzer wählen einen "Sender" aus und steigen in den laufenden Stream ein
- Videos laufen kontinuierlich, wie bei einem normalen TV-Sender
- Einfaches Umschalten zwischen verschiedenen "Sendern"

## Features & Funktionalitäten

### Kern-Features
1. TV-ähnliche Wiedergabe
   - Kontinuierlicher Stream ohne Unterbrechungen
   - Direkter Einstieg in laufende Videos
   - Automatischer Übergang zum nächsten Video
   - "TV-Guide" mit aktuell laufenden und kommenden Videos

2. Sender-System
   - Vordefinierte Sender basierend auf YouTube-Channels oder Playlists
   - Thematische Kategorisierung (Gaming, Musik, Sport, etc.)
   - Anzeige des aktuell laufenden Videos und der nächsten Videos
   - Sender-Übersicht wie bei klassischem TV-Guide

3. TV-Steuerung
   - Einfache Kanalwechsel (hoch/runter)
   - Basis-Funktionen (Lautstärke, Stummschalten)
   - Favoriten-Sender
   - Zuletzt gesehene Sender

4. Sender-Verwaltung (Admin)
   - Erstellen neuer Sender aus YouTube-Channels/Playlists
   - Zeitliche Planung der Videos
   - Verwaltung der Sender-Kategorien
   - Überwachung der Sender-Aktivität

## Technische Anforderungen
- YouTube Data API v3 Integration
- Synchronisierte Wiedergabe für alle Nutzer
- Caching-System für unterbrechungsfreie Wiedergabe
- Echtzeit-Updates der Sender-Status
- Responsive Design für TV, Desktop und Mobile

## Benutzeroberfläche
- Minimalistisches, TV-ähnliches Interface
- Großer Videoplayer im Zentrum
- Kompakte Sender-Liste zum schnellen Umschalten
- Optional einblendbarer TV-Guide
- Keine unnötigen Bedienelemente, die vom TV-Erlebnis ablenken
