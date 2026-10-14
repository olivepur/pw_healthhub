# Playwright Lernplan

Persönlicher Lernplan für den Umstieg von Cypress auf Playwright. Die Themen bauen aufeinander auf, von den Grundlagen bis zu CI. Jedes Kapitel hat den Cypress-Vergleich, die wichtigsten Punkte zum Abhaken und eine kleine Übung.

**Übungsziele in diesem Projekt**

- `tests/` mit `playwright.config.ts` und `baseURL: https://playwright.dev`
- `healthhub/` mit eigener Config (`npm run test:healthhub`), Login über `env.local.json`
- Für freie Übungen: https://demo.playwright.dev/todomvc

**Nützliche Befehle**

```powershell
npx playwright test                                   # alle Tests (Root-Config)
npx playwright test --ui                              # UI Mode
npx playwright test --headed --project=chromium       # sichtbarer Browser, nur Chromium
npx playwright test -g "get started"                  # Test per Name filtern
npx playwright codegen https://demo.playwright.dev/todomvc
npx playwright show-report
npx playwright show-trace test-results/<ordner>/trace.zip
```

---

## Fortschritt

- [ ] 1. Setup und Projektstruktur
- [ ] 2. Locators
- [ ] 3. Actions
- [ ] 4. Assertions
- [ ] 5. Auto-Waiting
- [ ] 6. Test-Organisation (describe, hooks, tags, annotations)
- [ ] 7. Fixtures
- [ ] 8. Page Objects
- [ ] 9. Network Mocking
- [ ] 10. API-Testing
- [ ] 11. Authentifizierung mit storageState
- [ ] 12. Multi-Tab und mehrere Contexts
- [ ] 13. Projects und Parallelisierung
- [ ] 14. Debugging und Trace Viewer
- [ ] 15. Reporter und CI (GitHub Actions)
- [ ] 16. Bonus-Themen
- [ ] 17. Interview-Vorbereitung
- [ ] 18. BDD mit Gherkin (Schwerpunkt)

---

## 1. Setup und Projektstruktur

**Cypress-Vergleich:** `cypress.config.js` + `cypress/e2e` wird zu `playwright.config.ts` + `testDir`. Statt Cypress-Runner gibt es den Test-Runner `@playwright/test`, der in Node läuft. Jeder Test ist eine `async`-Funktion.

- [X] `npm init playwright@latest` verstanden (was wurde angelegt?)
- [x] `playwright.config.ts` Zeile für Zeile gelesen: `testDir`, `fullyParallel`, `retries`, `workers`, `reporter`, `use`, `projects`
- [x] Unterschied `Browser` → `BrowserContext` → `Page` erklären können
- [ ] Tests mit `--ui`, `--headed`, `--project`, `-g` gestartet
- [x] `npx playwright install` vs. `npx playwright install chromium` verstanden
- [x] Zweite Config verstanden: `--config=healthhub/playwright.config.ts`

**Übung:** Starte `tests/example.spec.ts` nur in Firefox und dann im UI Mode. Ändere danach in der Root-Config `reporter` auf `[['list'], ['html', { open: 'never' }]]` und vergleiche die Ausgabe.

---

## 2. Locators

**Cypress-Vergleich:** `cy.get()` / `cy.contains()` wird zu `page.locator()` / `page.getByText()`. Locators sind **lazy**: Sie suchen erst, wenn eine Aktion oder Assertion kommt, und bei jedem Versuch neu. Empfohlen sind nutzerorientierte Locators (`getByRole`), nicht CSS.

- [x] `getByRole('button', { name: '...' })` (erste Wahl)
- [ ] `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`
- [ ] `getByTestId` und `testIdAttribute` in der Config (z. B. auf `data-cy` umstellen)
- [ ] `page.locator('css')` und `locator('xpath=...')` als Notlösung
- [x] Verketten statt `.within()`: `page.getByRole('dialog').getByLabel('Titel')`
- [ ] Filtern: `.filter({ hasText })`, `.filter({ has: ... })`, `.nth()`, `.first()`, `.last()`
- [ ] Kombinieren: `.and()`, `.or()`
- [ ] Strict Mode verstanden: Fehler, wenn ein Locator mehrere Elemente findet
- [ ] Locator-Picker im UI Mode und in `codegen` benutzt

**Übung:** Öffne `healthhub/library/*.spec.ts` und prüfe, welche Locator-Strategie die Fassade nutzt. Schreibe für die TodoMVC-Demo einen Locator, der genau die zweite Todo-Zeile mit dem Text „Milch“ findet, ohne CSS-Klassen.

---

## 3. Actions

**Cypress-Vergleich:** `.type()` wird zu `.fill()` (ersetzt den Inhalt) oder `.pressSequentially()` (tippt Zeichen für Zeichen). `.select()` heißt `.selectOption()`. Alles braucht `await`.

- [x] `click`, `dblclick`, `fill`, `clear`, `press('Enter')`, `pressSequentially`
- [x] `check` / `uncheck`, `selectOption`, `hover`, `focus`
- [ ] `setInputFiles` (Datei-Upload)
- [ ] `dragTo`
- [ ] `page.keyboard` und `page.mouse` für Sonderfälle
- [ ] `{ force: true }` kennen und bewusst vermeiden

**Übung:** Lege in TodoMVC drei Todos an, hake eins ab, filtere auf „Completed“ und lösche es wieder.

---

## 4. Assertions

**Cypress-Vergleich:** `.should('be.visible')` wird zu `await expect(locator).toBeVisible()`. Nur die **Web-First-Assertions** auf Locators wiederholen automatisch. `expect(wert).toBe()` auf einem normalen Wert wiederholt nicht.

- [x] Web-First: `toBeVisible`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveCount`, `toBeChecked`, `toBeEnabled`, `toHaveAttribute`
- [x] Seite: `expect(page).toHaveURL()`, `toHaveTitle()`
- [ ] Negation mit `.not`
- [ ] Generische Assertions (`toBe`, `toEqual`, `toMatchObject`) für Daten und API-Antworten
- [ ] `expect.soft()` (Test läuft nach Fehler weiter)
- [ ] `expect.poll()` und `expect(...).toPass()` für eigene Wiederholungslogik
- [ ] Eigenes Timeout: `{ timeout: 10_000 }` und `expect.timeout` in der Config
- [ ] Bonus: `toHaveScreenshot()` (visueller Vergleich) und `toMatchAriaSnapshot()`

**Übung:** Schreibe einen Test, der absichtlich `expect(await loc.textContent()).toBe(...)` nutzt, und einen mit `await expect(loc).toHaveText(...)`. Erkläre in einem Satz, warum der zweite stabiler ist.

---

## 5. Auto-Waiting

**Cypress-Vergleich:** Cypress hat Retry-Ability für Queries und Assertions. Playwright macht vor jeder Aktion **Actionability-Checks** (sichtbar, stabil, aktiviert, empfängt Events, editierbar) und wartet bis zum Timeout. `cy.wait(1000)` ist hier `page.waitForTimeout()`, genauso verpönt.

- [ ] Actionability-Checks aufzählen können
- [ ] Timeouts unterscheiden: Test-Timeout, `expect`-Timeout, `actionTimeout`, `navigationTimeout`
- [ ] Gezielt warten: `waitForResponse`, `waitForURL`, `waitForLoadState`
- [ ] Wann `waitForLoadState('networkidle')` sinnvoll ist und wann nicht
- [ ] Häufigster Fehler: fehlendes `await` (ESLint-Regel `@typescript-eslint/no-floating-promises`)

**Übung:** Entferne in einem HealthHub-Test absichtlich ein `await` und beobachte das Fehlerbild. Ersetze danach jedes eventuell vorhandene `waitForTimeout` durch ein sinnvolles `expect` oder `waitForResponse`.

---

## 6. Test-Organisation

**Cypress-Vergleich:** `describe`, `beforeEach` usw. gibt es auch, aber als `test.describe`, `test.beforeEach`. Statt `it.only` / `it.skip` gibt es `test.only`, `test.skip`, `test.fixme`, `test.fail`, `test.slow`.

- [ ] `test.describe`, `test.beforeEach`, `test.afterEach`, `test.beforeAll`, `test.afterAll`
- [ ] `test.describe.configure({ mode: 'serial' })` und warum man es selten braucht
- [ ] `test.step()` für lesbare Reports
- [ ] Tags (`{ tag: '@smoke' }`) und `--grep @smoke`
- [ ] Annotations: `test.skip(bedingung)`, `test.fixme`, `test.info().annotations`
- [ ] Parametrisierte Tests mit einer Schleife über Testdaten
- [ ] Testdaten per `import` aus JSON statt `cy.fixture()`

**Übung:** Gib den HealthHub-Tests ein `test.describe` mit Tag `@healthhub`, packe jeden Ablauf in `test.step()` und schau dir den HTML-Report an.

---

## 7. Fixtures

**Cypress-Vergleich:** Ersatz für `beforeEach` + Custom Commands. Fixtures sind Dependency Injection: Ein Test bekommt per Parameter (`{ page, request }`), was er braucht, mit Setup vor und Teardown nach `use()`.

- [ ] Eingebaute Fixtures: `page`, `context`, `browser`, `request`, `browserName`
- [ ] Eigene Fixture mit `test.extend<{...}>()`
- [ ] Setup und Teardown rund um `await use(...)`
- [ ] Scope: `test` vs. `worker` (`{ scope: 'worker' }`)
- [ ] Automatische Fixtures (`{ auto: true }`)
- [ ] Option-Fixtures, die per Config oder Project gesetzt werden
- [ ] Mehrere Fixture-Dateien mit `mergeTests()` zusammenführen

**Übung:** Erstelle `healthhub/fixtures.ts` mit einer Fixture `loggedInPage`, die die bestehende `signIn()`-Logik nutzt. Stelle einen HealthHub-Test auf `test('...', async ({ loggedInPage }) => ...)` um.

---

## 8. Page Objects

**Cypress-Vergleich:** Das Muster ist gleich. Unterschied: Methoden sind `async`, Locators werden im Konstruktor als Felder angelegt, und das Page Object wird am besten per Fixture bereitgestellt.

- [ ] Page-Object-Klasse mit `readonly`-Locators im Konstruktor
- [ ] Aktionen als `async`-Methoden, Assertions eher im Test
- [ ] Komponenten-Objekte (z. B. Dialog, Tabelle) statt riesiger Seitenklassen
- [ ] Page Objects über Fixtures injizieren
- [ ] Vergleich mit der Funktions-Fassade in `healthhub/library` (Vor- und Nachteile)
- [ ] Hinweis: Hilfsdateien nicht `*.spec.ts` nennen, sonst können sie als Tests eingesammelt werden

**Übung:** Baue `LoginPage` und `AppointmentsPage` für HealthHub und liefere sie über die Fixture aus Kapitel 7.

---

## 9. Network Mocking

**Cypress-Vergleich:** `cy.intercept()` wird zu `page.route()`. `cy.wait('@alias')` wird zu `page.waitForResponse()`. Anfragen kann man komplett ersetzen, verändern oder abbrechen.

- [ ] `page.route('**/api/x', route => route.fulfill({ json }))`
- [ ] Echte Antwort holen und verändern: `route.fetch()` + `route.fulfill({ response, json })`
- [ ] `route.continue()` mit geänderten Headern, `route.abort()`
- [ ] Fehlerfälle simulieren (Status 500, leere Liste, langsame Antwort)
- [ ] `page.waitForResponse()` / `page.waitForRequest()` und Request-Body prüfen
- [ ] `context.route()` für alle Seiten eines Contexts
- [ ] HAR aufnehmen und abspielen: `page.routeFromHAR()`
- [ ] Bonus: `page.clock` statt `cy.clock()`

**Übung:** Finde im Trace eines HealthHub-Tests den API-Aufruf für die Termine. Mocke ihn mit einer leeren Liste und prüfe die Leer-Ansicht, danach mit Status 500 und prüfe die Fehlermeldung.

---

## 10. API-Testing

**Cypress-Vergleich:** `cy.request()` wird zur `request`-Fixture (`APIRequestContext`). Sie teilt Cookies mit dem Browser-Context, wenn man `page.request` nutzt.

- [ ] `request.get/post/put/delete` mit `data`, `params`, `headers`
- [ ] `expect(response).toBeOK()`, Status und `await response.json()` prüfen
- [ ] `baseURL` und `extraHTTPHeaders` in der Config
- [ ] `request` vs. `page.request` (gemeinsame Cookies)
- [ ] Testdaten per API anlegen und im UI prüfen (schneller als Klicken)
- [ ] Aufräumen per API in einer Fixture nach `use()`

**Übung:** Lege einen HealthHub-Termin per API an (Request im Trace abschauen), prüfe ihn in der UI und lösche ihn im Teardown wieder.

---

## 11. Authentifizierung mit storageState

**Cypress-Vergleich:** Ersatz für `cy.session()`. Man loggt sich **einmal** in einem Setup-Projekt ein, speichert Cookies und LocalStorage in einer Datei und alle Tests starten bereits eingeloggt.

- [ ] `context.storageState({ path })` zum Speichern
- [ ] Setup-Projekt `auth.setup.ts` mit `dependencies: ['setup']`
- [ ] `use: { storageState: 'playwright/.auth/user.json' }` (Ordner ist schon in `.gitignore`)
- [ ] Mehrere Rollen (z. B. Admin und Patient) mit eigenen Dateien
- [ ] Login per API statt UI für mehr Tempo
- [ ] Einzelne Tests ohne Login: `test.use({ storageState: { cookies: [], origins: [] } })`

**Übung:** Aktuell ruft jeder HealthHub-Test `signIn()` auf. Baue ein Setup-Projekt, das einmal einloggt, und entferne `signIn()` aus den Tests. Vergleiche die Laufzeit vorher und nachher.

---

## 12. Multi-Tab und mehrere Contexts

**Cypress-Vergleich:** Hier ist Playwright klar stärker. Neue Tabs, Popups, mehrere Origins und mehrere gleichzeitig eingeloggte Nutzer gehen ohne Workarounds und ohne `cy.origin()`.

- [ ] Neuen Tab abfangen: `const popupPromise = page.waitForEvent('popup')` vor dem Klick
- [ ] `context.waitForEvent('page')` und `context.pages()`
- [ ] Zwei `BrowserContext`s in einem Test (`browser.newContext()`) für zwei Nutzer
- [ ] Dialoge (`alert`, `confirm`): `page.on('dialog', d => d.accept())`
- [ ] Downloads: `page.waitForEvent('download')`
- [ ] iFrames: `page.frameLocator()` bzw. `locator.contentFrame()`

**Übung:** Öffne auf playwright.dev einen Link, der in einem neuen Tab aufgeht (z. B. GitHub), und prüfe den Titel des neuen Tabs. Bonus: zwei Contexts in einem Test, der eine eingeloggt, der andere nicht.

---

## 13. Projects und Parallelisierung

**Cypress-Vergleich:** Parallelisierung ist eingebaut und kostenlos. `workers` laufen lokal parallel, `--shard` verteilt auf mehrere CI-Maschinen, ohne Cypress Cloud. Jeder Test bekommt einen frischen, isolierten Context.

- [ ] `projects` für Browser und Geräte (`devices['Pixel 5']`, `devices['iPhone 12']`)
- [ ] Projekt-Abhängigkeiten (`dependencies`, siehe Kapitel 11)
- [ ] `workers`, `fullyParallel` und `test.describe.configure({ mode: 'parallel' })`
- [x] Warum Tests unabhängig voneinander sein müssen (eindeutige Testdaten wie in HealthHub)
- [ ] `--shard=1/4` und Blob-Reports mit `npx playwright merge-reports`
- [ ] `retries` und wie Playwright flaky Tests im Report markiert
- [ ] `webServer` in der Config, um die App vor den Tests zu starten

**Übung:** Aktiviere in der Root-Config das Projekt „Mobile Safari“, lass `example.spec.ts` mit `--workers=4` laufen und danach mit `--shard=1/2` und `--shard=2/2`.

---

## 14. Debugging und Trace Viewer

**Cypress-Vergleich:** Statt Time-Travel im Runner gibt es den **Trace Viewer**: DOM-Snapshots vor und nach jeder Aktion, Netzwerk, Konsole und Quellcode, auch für Fehler, die nur in CI auftreten.

- [ ] UI Mode mit Watch-Mode und Locator-Picker
- [ ] `--debug` und Playwright Inspector, `await page.pause()`
- [x] `trace: 'on-first-retry'` vs. `'retain-on-failure'` vs. `'on'`
- [ ] Trace öffnen: `npx playwright show-trace` oder https://trace.playwright.dev
- [ ] Im Trace: Actions, Before/After, Network, Console, Errors, Source
- [ ] `screenshot: 'only-on-failure'` und `video: 'retain-on-failure'`
- [ ] VS Code Extension „Playwright Test for VSCode“ (Tests starten, Breakpoints, Pick Locator)
- [ ] `error-context.md` in `test-results/` lesen

**Übung:** Öffne `healthhub/test-results/healthhub-1---create-a-new-appointment/trace.zip` im Trace Viewer und finde heraus, an welchem Schritt und warum der Test gescheitert ist. Behebe den Fehler.

---

## 15. Reporter und CI (GitHub Actions)

**Cypress-Vergleich:** Statt Cypress Cloud gibt es HTML-Report, Traces und Sharding kostenlos. Der Workflow in `.github/workflows/playwright.yml` ist schon angelegt.

- [x] Reporter: `list`, `line`, `dot`, `html`, `junit`, `json`, `blob`, mehrere gleichzeitig
- [ ] `.github/workflows/playwright.yml` Schritt für Schritt verstanden
- [ ] `forbidOnly: !!process.env.CI` und `retries` in CI
- [ ] Report und Traces als Artifact hochladen
- [ ] Sharding in einer Matrix (`shard: [1/4, 2/4, 3/4, 4/4]`) mit anschließendem `merge-reports`
- [ ] Secrets für Zugangsdaten (`HEALTHHUB_EMAIL`, `HEALTHHUB_PASSWORD`) in GitHub hinterlegen
- [ ] Nur betroffene Browser installieren (`npx playwright install --with-deps chromium`)

**Übung:** Erweitere den Workflow so, dass auch `npm run test:healthhub` läuft, mit Zugangsdaten aus GitHub Secrets und einer Shard-Matrix mit 2 Shards.

---

## 16. Bonus-Themen

- [ ] `codegen` mit `--save-storage` und `--load-storage`
- [ ] Visuelle Tests mit `toHaveScreenshot()` und `--update-snapshots`
- [ ] Barrierefreiheit mit `@axe-core/playwright`
- [ ] Umgebungen über `.env` und `dotenv` (Kommentar in der Root-Config)
- [ ] Mobile Emulation: Geolocation, Berechtigungen, Locale, Zeitzone, `colorScheme`
- [ ] Component Testing (`@playwright/experimental-ct-react`) als Vergleich zu Cypress CT
- [x] TypeScript-Pfad-Aliase (wie `@library/...` in HealthHub über `tsconfig.json`)
- [ ] ESLint mit `eslint-plugin-playwright`

---

## 17. Interview-Vorbereitung

Grundlage: der Leitfaden „Playwright für Cypress-Experten“ in den Projektdateien.

- [ ] Unterschied `Browser`, `BrowserContext` und `Page` erklären
- [ ] Auto-Waiting und Actionability-Checks erklären
- [ ] Erklären, wie man Login pro Test vermeidet (`storageState` + Setup-Projekt)
- [ ] Parallelisierung in CI erklären (`workers`, `fullyParallel`, `--shard`)
- [ ] Erklären, wie man einen Fehler debuggt, der nur in CI auftritt (Trace Viewer)
- [ ] Ehrlich sagen können, wann Cypress die bessere Wahl ist
- [ ] Einen Cypress-Test live nach Playwright übersetzen
- [ ] Dieses Repo auf GitHub mit Page Objects, Fixtures, API-Test, Mocking und CI als Referenzprojekt zeigen

---

## 18. BDD mit Gherkin (Schwerpunkt)

**Cypress-Vergleich:** In Cypress läuft BDD meist über `@badeball/cypress-cucumber-preprocessor`. In Playwright gibt es zwei Wege: **playwright-bdd** übersetzt `.feature`-Dateien in echte Playwright-Tests (Fixtures, UI Mode, Trace Viewer und Parallelisierung bleiben erhalten). **Cucumber.js** ist der klassische Runner, dort steuerst du Browser, World und Hooks selbst. In Projekten wirst du beides antreffen.

### 18.1 Gherkin-Grundlagen

- [x] `Feature`, `Scenario`, `Given` / `When` / `Then` / `And`
- [x] User-Story-Kopf im Feature (`As a ... I want ... So that ...`)
- [x] `Background` für gemeinsame Vorbedingungen
- [x] Parameter mit Cucumber Expressions (`{string}`)
- [ ] Weitere Parametertypen: `{int}`, `{float}`, `{word}`, eigene Typen mit `defineParameterType`
- [ ] `Scenario Outline` mit `Examples`
- [ ] Data Tables (`| Feld | Wert |`) mit `dataTable.hashes()` / `rowsHash()`
- [ ] Doc Strings (`"""` mehrzeiliger Text, z. B. JSON-Body)
- [ ] Tags (`@smoke`, `@regression`) und Filtern danach
- [ ] `Rule` zum Gruppieren von Szenarien
- [ ] Deutsche Schlüsselwörter mit `# language: de`

### 18.2 Gute Szenarien schreiben

- [x] Deklarative Steps (Was, nicht Wie): „I create a general appointment for tomorrow“ statt Klick-für-Klick
- [ ] Ein Verhalten pro Szenario, `Given` → `When` → `Then` ohne neues `When` nach dem `Then`
- [ ] Steps wiederverwendbar formulieren (Parameter statt fest verdrahteter Werte)
- [ ] Doppelte, mehrdeutige und fehlende Steps erkennen und auflösen
- [ ] Szenarien gemeinsam mit Fachseite schreiben (Three Amigos, Example Mapping)

### 18.3 playwright-bdd

- [x] Installation und `defineBddConfig({ features, steps, outputDir })`
- [x] `createBdd()` und Step-Definitionen mit `{ page }`
- [x] `bddgen` vor dem Testlauf (im npm-Skript)
- [x] BDD-Szenarien und normale `*.spec.ts` in einer Config über zwei `projects`
- [x] Szenarien im UI Mode starten
- [x] Zustand zwischen Steps eines Szenarios teilen
- [ ] Eigene Fixtures mit `createBdd(test)` (sauberer als eine `WeakMap` auf `page`)
- [ ] Page Objects als Fixtures in Steps nutzen
- [ ] Tags mit `--grep @tag` und `test.skip`/`@skip`, `@only`, `@fixme`
- [ ] Hooks: `Before`, `After`, `BeforeAll` aus `createBdd`
- [ ] `missingSteps`-Option und Meldung „Missing step definition“ verstanden
- [ ] Cucumber-Reports (`cucumberReporter('html')`, `json`, `junit`)
- [ ] Decorator-Steps in Page-Object-Klassen (`@Given` usw.)

### 18.4 Cucumber.js

- [x] Konfiguration in `cucumber.cjs` (`paths`, `require`, `requireModule`, `format`)
- [x] TypeScript mit `tsx` und Pfad-Aliasen über `tsconfig-paths`
- [x] Eigene World-Klasse mit `setWorldConstructor`
- [x] `Before` / `After`-Hooks: Browser, Context und Page pro Szenario starten und schließen
- [x] Zustand im World-Objekt (`this.medicationName`)
- [x] `--dry-run` zum Prüfen, ob alle Steps gefunden werden
- [x] Headed-Modus per Umgebungsvariable (`cross-env HEALTHHUB_HEADLESS=false`)
- [ ] `BeforeAll` / `AfterAll` (z. B. Browser einmal pro Lauf starten)
- [ ] Getaggte Hooks (`Before({ tags: '@login' }, ...)`)
- [ ] Screenshot oder Trace bei Fehler im `After`-Hook anhängen (`this.attach`)
- [ ] Reports: `html:`, `json:`, `junit:` in `format`
- [ ] Parallel laufen lassen (`parallel: 2`) und Timeouts (`setDefaultTimeout`)
- [ ] `baseURL` aus der Config statt fest verdrahteter URLs in den Steps

### 18.5 Architektur und Werkzeuge

- [x] Dieselbe Komponenten-Fassade in beiden BDD-Varianten wiederverwenden
- [x] VS Code: Gherkin-Autovervollständigung (`cucumberautocomplete` in `.vscode/settings.json`)
- [ ] Doppelten Code zwischen `playwright-steps` und `step-definitions` zusammenführen
- [ ] Login einmal per `storageState` statt in jedem `Background`
- [ ] BDD-Lauf in GitHub Actions mit Report als Artifact
- [ ] Entscheiden und begründen können: playwright-bdd oder Cucumber.js?

**Übung:** Schreibe das Medikamente-Feature als `Scenario Outline` mit drei `Examples`-Zeilen und einer Data Table für die Formularfelder um. Ersetze dabei die `WeakMap` durch eine Fixture `ctx` mit `createBdd(test)`.

---

Offizielle Doku: https://playwright.dev/docs/intro
