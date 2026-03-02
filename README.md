# MarcTracker PWA

MarcTracker ist eine mobile-first Progressive Web App zum Tracken von:
- Gewicht
- BMI
- Viszeralfett
- Muskelanteil
- Fettanteil
- Wasseranteil

Die Daten werden lokal im Browser (`IndexedDB`) gespeichert. Kein Login, kein Backend.

## Features
- Tägliche Erfassung mit genau einem Eintrag pro Datum (Upsert)
- Schnelle Eingabe mit mobilem Number-Pad und +/- Steppern
- Vorbefüllung neuer Einträge mit den letzten Messwerten
- Dashboard mit Gewichtstrend und KPI-Änderungen (7/30 Tage)
- Verlauf mit Bearbeiten/Löschen
- CSV/JSON Export
- CSV/JSON Import
- Offline-fähig als PWA

## Development
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run lint
npm run test:run
npm run build
```

## Deploy auf GitHub Pages
Das Projekt ist bereits für GitHub Pages vorbereitet.

1. Repository zu GitHub pushen (Branch `main`).
2. In GitHub: `Settings -> Pages -> Build and deployment -> Source = GitHub Actions`.
3. Workflow liegt unter:
   - `.github/workflows/deploy-pages.yml`
4. Nach Push auf `main` wird automatisch deployed.

### URL-Format
- Project Pages: `https://<user>.github.io/<repo>/`
- User/Org Pages (`<user>.github.io` repo): `https://<user>.github.io/`

Die `base`-Pfadlogik wird im Build automatisch über GitHub-Umgebungsvariablen gesetzt.

## Storage / Backups
- Daten liegen lokal auf dem Gerät im Browser.
- Kein automatischer Sync zwischen Geräten.
- In der App unter `Datenverwaltung` siehst du:
  - geschätzte belegte Speichergröße
  - geschätztes Speicherlimit
  - Datensatzanzahl
- Empfehlung: regelmäßig CSV oder JSON exportieren (Backup).

