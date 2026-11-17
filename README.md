# 🎰 GGamble

Eine Spielhalle im Browser – nur mit Spielgeld: Automaten mit Freispielen und Jackpots, Rubbellose zum echten Freirubbeln, Sportwetten, eine Börse mit Hebel und Stop Loss, Minispiele, eigene Geschäfte und Video-Räume mit deinen Freunden. Fang mit 500 € Spielgeld an und werd zum Milliardär!

## ▶️ Jetzt spielen

👉 **https://tillwassenhoven1-glitch.github.io/GGamble/?v=0.0.4**

Keine Installation, keine Werbung, keine Käufe, kein echtes Geld – läuft auf Handy, iPad und PC. 🎮
Version 0.0.4 · Open Beta

## 🔐 Konto

- 👤 Beim ersten Start legst du ein Konto mit **Name + Passwort** an (ohne Google, ohne E-Mail)
- 💾 Du bleibst eingeloggt – dein Spielstand wird im Browser gespeichert
- 👥 Mehrere Konten auf einem Gerät? Einfach abmelden und mit einem anderen Namen anmelden
- 📋 Spielstand-Code: In den Einstellungen kopieren und auf einem anderen Gerät laden

## So funktioniert's

- 🎁 Jeden Tag gibt's den **Tagesbonus** am Glücksrad (1× bis 5×) – je länger deine Serie, desto mehr
- 🎰 Spiel an den Automaten, rubbel Lose, tipp auf Spiele oder handel an der Börse
- 📈 Mit jedem Einsatz sammelst du XP – höhere Level schalten neue Automaten und Lose frei
- 💸 Pleite? Du darfst bis **−180 € ins Minus** (0,5 % Zinsen pro Stunde). Darunter wird dein Konto gesperrt
- 🔓 Raus aus den Schulden: Minispiele spielen, die Schulden ans **Inkasso Krause** verkaufen (Schuldschein über 130 % – bei jedem Spin gehen 10 % vom Einsatz und 40 % jedes Gewinns automatisch dorthin) oder **Privatinsolvenz** anmelden

## Bereiche

- 🍒 **Halle** – 26 realistische Automaten mit Hebel, Lauflichtern und Gewinnlinien-Anzeige – am Anfang ist nur einer frei, die anderen schaltest du mit höherem Level frei: Klassiker mit 5 Linien, Video-Slots mit 5 Walzen, 10 Linien, Wilds und Freispielen (Gewinne ×2) sowie Mini-, Major- und Grand-Jackpots
- 🎟️ **Lose** – 8 Rubbellose von 1 € bis 250.000 € (Hauptgewinn bis 2,5 Mrd. €) – mit dem Finger freirubbeln!
- 🏆 **Wetten** – GG Liga mit 18 Teams: alle 5 Minuten ein neuer Spieltag, Live-Ticker, Kombiwetten, Über/Unter und „Beide treffen“
- 📊 **Börse** – 5 erfundene Märkte (XRZ-Coin, Döner AG, Kiosk-Kette, Gold, GG/EUR) mit Kerzen-Chart, Long/Short, Hebel bis 1:100, Stop Loss, Take Profit, Limit- und Stop-Orders
- 🎲 **Spiele** – Hütchenspiel, Kassensturz, Pfandflaschen und Inventur (10 Energie, alle 10 Min. +1), Tages- und Wochenaufgaben, das **Glückslabor** und dein **Imperium** aus 8 Geschäften, die auch offline Geld bringen
- 🧪 **Glückstränke** – ×2, ×4 oder ×6: Jeder Dreh und jedes Los wird mehrmals gewürfelt, du bekommst das beste Ergebnis
- 🥇 **Rang** – Online-Bestenliste (Top 10 echter Spieler) – 🚧 in Arbeit
- 📹 **Treff** – Video-Räume mit Chat und Kamera-Filtern, die weiterlaufen, während du spielst

## Features

- 💥 Krasse Gewinn-Animationen: BIG WIN, MEGA WIN, EPIC WIN mit Münzregen, Konfetti, Blitz und Wackeln
- 🏆 30 Erfolge mit Belohnungen
- 👤 Profil mit Statistiken, eigener Farbe oder eigenem Profilbild
- 🔊 Sounds und Vibration (abschaltbar)
- 📲 Für Handy gemacht, läuft auch am PC

## 🌐 Online-Bestenliste einrichten (einmalig)

1. https://console.firebase.google.com → **Projekt hinzufügen** (kostenlos)
2. Im Projekt: **Web-App hinzufügen** (`</>`) → `apiKey` und `projectId` kopieren
3. **Build → Firestore Database → Datenbank erstellen** → bei **Regeln** das hier einfügen und veröffentlichen:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rang/{id} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(['name','disp','bal','level','color','ts'])
                   && request.resource.data.bal is number;
    }
  }
}
```

4. In der `index.html` die Zeile `const ONLINE = { apiKey: '', projectId: '' };` mit deinen Werten füllen

Solange da nichts steht, zeigt die Bestenliste nur die Konten auf dem eigenen Gerät.

## Hinweise zur Beta

- 📹 Treff-Räume laufen direkt zwischen den Geräten (über PeerJS). In manchen Schul- oder Firmen-WLANs kann die Verbindung blockiert sein – dann hilft meistens ein anderes WLAN oder mobile Daten
- 💶 Alles ist **nur Spielgeld** – nichts davon kann man kaufen oder auszahlen
- 🐞 Fehler gefunden? Erstelle gerne ein Issue!
