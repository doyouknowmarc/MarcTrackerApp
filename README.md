# TrackerApp PWA

TrackerApp ist eine mobile-first Progressive Web App zum Tracken von:
- Gewicht (kg)
- Körperfett (%)
- Körperwasser (%)
- Muskelmasse (%)
- Viszeralfett (Index)
- Biologisches Alter

Die Daten werden lokal im Browser (`IndexedDB`) gespeichert. Kein Login, kein Backend.

## Features
- Tägliche Erfassung mit genau einem Eintrag pro Datum (Upsert)
- Schnelle Eingabe mit mobilem Number-Pad und +/- Steppern
- Vorbefüllung neuer Einträge mit den letzten Messwerten
- Dashboard mit Gewichtstrend und KPI-Änderungen (7/30 Tage)
- Verlauf mit Bearbeiten/Löschen
- CSV/JSON Export
- CSV/JSON Import (inkl. Legacy-Import alter `bmi`-Dateien)
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
Das Projekt ist für GitHub Pages vorbereitet.

1. Repository auf GitHub pushen (Branch `main`).
2. In GitHub: `Settings -> Pages -> Build and deployment -> Source = GitHub Actions`.
3. Workflow:
   - `.github/workflows/deploy-pages.yml`
4. Push auf `main` triggert Deployment automatisch.

### URL
- Project Pages: `https://<user>.github.io/<repo>/`
- User/Org Pages (`<user>.github.io` repo): `https://<user>.github.io/`

Die Build-Konfiguration setzt den Base-Pfad auf Basis des tatsächlichen Repo-Namens auf GitHub.

## Storage / Backups
- Daten liegen lokal auf dem Gerät im Browser.
- Kein automatischer Sync zwischen Geräten.
- In der App unter `Datenverwaltung` siehst du:
  - geschätzte belegte Speichergröße
  - geschätztes Speicherlimit
  - Datensatzanzahl
- Empfehlung: regelmäßig CSV oder JSON exportieren (Backup).
