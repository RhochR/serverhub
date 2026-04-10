# ServerHub – MD3 Expressive Dashboard

Ein schlankes, selbst gehostetes Dashboard für deine Server, VPS und Homelab-Dienste.
Designed nach **Material Design 3 Expressive**.

## Features

- 🎨 **MD3 Expressive** – echte Material You Tokens, Dark/Light Mode
- 📁 **Kategorien** – VPS, Homelab, Monitoring, Services – beliebig erweiterbar
- 🔗 **Schnellzugriff** – Ein Klick öffnet den Server in einem neuen Tab
- 🔍 **Suche** – Filtert Live über Name, URL und Beschreibung
- 🎨 **Farben** – Jeder Server bekommt seinen eigenen Akzent-Farbton
- 💾 **Persistenz** – Daten werden in `/data/servers.json` gespeichert (Docker Volume)

## Starten

### Mit Docker Compose (empfohlen)
```bash
docker compose up -d
```

### Manuell bauen & starten
```bash
docker build -t serverhub .
docker run -d \
  -p 5000:5000 \
  -v serverhub_data:/data \
  --name serverhub \
  --restart unless-stopped \
  serverhub
```

Dashboard erreichbar unter: **http://localhost:5000**

## Daten sichern
```bash
docker cp serverhub:/data/servers.json ./servers_backup.json
```

## Daten wiederherstellen
```bash
docker cp ./servers_backup.json serverhub:/data/servers.json
docker restart serverhub
```
