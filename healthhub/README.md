# HealthHub Playwright Tests

Isolierter Playwright-Bereich für die HealthHub-Trainingsanwendung. Die Tests melden sich an, erstellen einen eindeutig benannten Beispieltermin, prüfen die Health Records und erstellen einen eindeutigen Test-Medikamenteneintrag. Die Anwendung weist darauf hin, dass sie nur für Training gedacht ist; keine echten Gesundheitsdaten eingeben.

## Zugangsdaten

Die lokalen Zugangsdaten stehen in `env.local.json`. Diese Datei ist in `.gitignore` eingetragen und wird nicht zu Git hinzugefügt. Für andere Zugangsdaten können die Umgebungsvariablen `HEALTHHUB_EMAIL` und `HEALTHHUB_PASSWORD` im selben Terminal gesetzt werden; gesetzte Variablen haben Vorrang.

```powershell
$env:HEALTHHUB_EMAIL = "patient@healthhub.test"
$env:HEALTHHUB_PASSWORD = "<dein Testpasswort>"
```

## Tests ausführen

Im Projektstamm:

```powershell
npm run test:healthhub
```

Mit sichtbarem Browser:

```powershell
npm run test:healthhub:headed
```

Die Playwright-Test-UI mit den Gherkin-Szenarien öffnen:

```powershell
npm run test:healthhub -- --ui
```

Das Script generiert vor dem Start automatisch Playwright-Tests aus den Features. In der UI erscheinen dann sowohl die Gherkin-Szenarien als auch die normalen `*.spec.ts`-Tests.

## Gherkin / BDD (playwright-bdd)

Die Gherkin-Szenarien liegen in `features/`. `playwright-bdd` übersetzt sie in native Playwright-Tests (`tests/bdd-generated/`), die Step-Definitionen liegen in `features/playwright-steps/` und verwenden die Komponenten-Fassade `@library/components.fassade.spec`. Gestartet werden sie mit `npm run test:healthhub` (siehe oben).

Die BDD-Szenarien verwenden `env.local.json` und erzeugen im Trainingskonto einen Testtermin bzw. einen Test-Medikamenteneintrag. Zum sicheren Prüfen, ob alle Features und Steps zusammenpassen, ohne den Browser zu starten:

```powershell
npx bddgen --config healthhub/playwright.config.ts
```

Den HealthHub-Testreport öffnen (nach einem Testlauf):

```powershell
npm run report:healthhub
```

Nur Chromium installieren, falls der Browser noch fehlt:

```powershell
npx playwright install chromium
```

Die Tests zum Anlegen von Terminen und Medikamenten speichern Testdaten im Trainingskonto. Jeder Eintrag erhält einen eindeutigen Namen mit Zeitstempel.