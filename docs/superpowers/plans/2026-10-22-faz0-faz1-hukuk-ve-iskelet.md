# Faz 0 + Faz 1: Canlı site hukuk düzeltmeleri ve platform iskeleti – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Canlı weiterwert.de'deki P0 hukuk risklerini kapatmak ve `platform/` altında şifreli, `noindex`, feature-flag'li, tüm sayfaları iskelet olarak gösteren Next.js test ortamını kurmak.

**Architecture:** Faz 0 mevcut statik `index.html`'e dokunur ve yanına iki statik hukuk sayfası ekler. Faz 1 aynı repoda `platform/` klasöründe ayrı bir Next.js (App Router, TypeScript) uygulaması kurar. Bu uygulama ayrı bir Vercel projesine (Root Directory `platform`, bölge `fra1`) bağlanır ve Supabase test projesine (eu-central-1) bağlantı hazırlar. Canlı site ile platform birbirinden bağımsızdır.

**Tech Stack:** Statik HTML/CSS/JS (Faz 0) · Next.js 16 App Router, TypeScript, Node 24, Vitest, Playwright, `@supabase/supabase-js` + `@supabase/ssr` (Faz 1).

**Spec:** `docs/superpowers/specs/2026-10-22-weiterwert-plattform-design.md`

## Global Constraints

- Sitede görünen tüm metinler Almanca; tanıtım sayfalarında TR ikinci dil. Bağış akışı + hukuk metinleri **sadece Almanca**.
- Sahte bilgi yok: sertifika, partner, rakam, vergi avantajı, „zertifizierte Datenlöschung" yok.
- Spendenbeleg ifadesi: „Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt".
- Hukuki statü ifadesi: „nicht eingetragener Verein in Gründung".
- Veri yeri: Vercel fonksiyonları `fra1`, Supabase `eu-central-1`.
- Test ortamı: HTTP Basic Auth (fail closed), `noindex`, kalıcı bant „Testumgebung – keine echten Spenden".
- Analytics/marketing çerezi yok. Harici font yok (self-host).
- Gizli bilgiler sadece env'de. **Deploy, push ve ücretli servis Fatih'in onayı olmadan yapılmaz.**
- Önceden işaretli onay kutusu yok.
- Commit mesajları İngilizce, sonunda `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Basic Auth env eksikse:** `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD` tanımlı değilken test ortamı **açılmamalı** (401). → Task 6 testi `fails closed when credentials env missing`.
2. **Ortam belirsizse:** `NEXT_PUBLIC_APP_ENV` yoksa uygulama **prod gibi** davranmalı (`verborgen` gizli). Kazara açık kalan „Entwurf" içerik olmamalı. → Task 5 testi `defaults to production when env unknown`.
3. **TR seçiliyken Spenden sayfası:** Almanca form + „Das Spendenformular ist nur auf Deutsch verfügbar." notu görünmeli, sayfa kırılmamalı. → Task 8 Playwright testi.
4. **Canlı sitede TR çevirisi:** Değişen anahtarların TR karşılığı da güncellenmeli. Eski „Bağış Makbuzu… belge düzenliyoruz" vaadi TR'de kalmamalı. → Task 1 testi her iki dilde arar.
5. **Hukuk sayfalarına erişim:** Her sayfanın footer'ında Impressum + Datenschutz tek tıkla erişilebilir olmalı, statik sitede ve platformda. → Task 2 ve Task 7 testleri.

---

## FAZ 0 – Canlı site (`index.html`)

### Task 0: Canlı deploy'a sadece site dosyaları gitsin (`.vercelignore`)

**Neden:** `techverband` Vercel projesi repo kökünü statik olarak yayınlıyor. Bu görev olmadan bir sonraki push/deploy `docs/` (iç hukuk risk listesi + orijinal prompt), `tests/`, `package.json`, `platform/` ve olası `platform/.env.local` dosyasını weiterwert.de'de herkese açar. **Bu görev bitmeden push veya deploy yapılmaz.**

**Files:**
- Create: `.vercelignore`
- Create: `tests/static/deploy-scope.test.mjs`

- [ ] **Step 1: Failing test** – `.vercelignore` var ve şu desenleri içeriyor: `/*` (her şeyi hariç tut), `!/index.html`, `!/impressum.html`, `!/datenschutz.html`, `!/assets`. `docs`, `platform`, `tests`, `package.json` için ayrı bir `!` istisnası **yok**.
- [ ] **Step 2:** `node --test tests/static` → FAIL.
- [ ] **Step 3:** `.vercelignore` yaz (yukarıdaki 5 satır, başta açıklama yorumu).
- [ ] **Step 4:** PASS. Fatih onay verirse `vercel deploy` (preview) ile doğrula: `/docs/...` ve `/package.json` 404, `/` ve `/assets/logo-mark.svg` 200.
- [ ] **Step 5: Commit** – `"Restrict live site deploy to static site files"`

### Task 1: Spendenbeleg vaadi, „in Gründung" ifadesi, LOGO yer tutucuları

**Files:**
- Modify: `index.html` (DE HTML metinleri ~617, ~706, ~776-777, ~819-828, ~901-902; `translations.tr` ~973-980; `translations.de` ~1017-1077)
- Create: `tests/static/legal-copy.test.mjs`
- Create: `package.json` (kök; sadece `"type":"module"` ve `"scripts":{"test:static":"node --test tests/static","test:deploy-gate":"node --test tests/deploy-gate"}`, bağımlılık yok)

**Interfaces:**
- Produces: `npm run test:static` (Task 2 ve 3 de bu klasöre test ekler)

- [ ] **Step 1: Failing test yaz** – `index.html`'i okuyup şunları doğrular:
```js
test('no unconditional receipt promise (DE+TR)', () => {
  assert.doesNotMatch(html, /stellen wir auf Wunsch eine Bescheinigung aus/);
  assert.doesNotMatch(html, /talep üzerine belge düzenliyoruz/);
  assert.doesNotMatch(html, /Inventar und Spendenbeleg übernimmt/);
  assert.match(html, /Eintragung geplant 2027/);
  assert.match(html, /erst nach Anerkennung durch das Finanzamt/);
});
test('no transport or data-protection takeover promise (DE+TR)', () => {
  assert.doesNotMatch(html, /Transport[^"]*übernimmt WeiterWert/);
  assert.doesNotMatch(html, /du übergibst nur die Geräte|Sie übergeben nur die Geräte/);
  // TR karşılıkları: uygulayıcı önce translations.tr.path3Desc/corpDesc'in bugünkü metnini okur,
  // taşıma/veri koruma üstlenme vaadinin TR ifadesini buraya doesNotMatch olarak ekler.
});
test('legal status stated', () => assert.match(html, /nicht eingetragener Verein in Gründung/));
test('no LOGO placeholder slots', () => assert.doesNotMatch(html, /class="partner-slot"/));
```
- [ ] **Step 2:** `npm run test:static` → FAIL.
- [ ] **Step 3: Metinleri değiştir**
  - `receiptDesc` DE: „Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt." TR: „Tescil 2027'de planlanıyor. Bağış makbuzu ancak Finanzamt onayından sonra verilebilir." (Makbuz sadece Finanzamt onayına bağlanır; tescile bağlayan hukuki iddia yok.)
  - `path3Desc` / `corpDesc` (DE HTML + `de` + `tr`): Taşıma, Spendenbeleg ve veri korumayı „üstlenme" vaadi çıkarılır (Abholung „demnächst"; yedekleme ve MDM/Autopilot kaldırma bağışçıda). DE önerisi: „Auch größere Mengen nehmen wir gern entgegen. Wir stimmen die Übergabe mit Ihnen ab, prüfen jedes Gerät und löschen die Daten nach einem dokumentierten Verfahren." (`path3Desc` du-Form.) TR karşılığı aynı anlamda.
  - `footerCopyright` DE: „© WeiterWert – nicht eingetragener Verein in Gründung"; TR: „© WeiterWert – kuruluş aşamasında, tescilsiz dernek (n.e.V.)".
  - „Unsere Unterstützer" bloğundan `.partner-row` ve `partnerNote` çıkarılır. Başlık + `partnerP` kalır, metin: „Sobald uns Organisationen unterstützen, nennen wir sie hier – mit ihrer Zustimmung." (TR karşılığı ile.) Kullanılmayan `.partner-*` CSS'i silinir.
- [ ] **Step 4:** `npm run test:static` → PASS. Tarayıcıda DE ve TR görsel kontrol.
- [ ] **Step 5: Commit** – `git commit -m "Remove receipt promise and logo placeholders, state founding status"`

### Task 2: Fontu self-host et (Google Fonts kaldır)

**Files:**
- Create: `assets/fonts/inter-latin-{400,500,600,700,800}.woff2` (fontsource / google-webfonts-helper'dan indirilir, OFL lisansı)
- Modify: `index.html` `<head>` (fonts.googleapis link'i → yerel `@font-face`)
- Modify: `tests/static/legal-copy.test.mjs`

- [ ] **Step 1: Failing test** – `assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/)`; `assets/fonts/` içinde 5 woff2 var.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** `@font-face` blokları (`font-display: swap`) + preconnect satırlarını sil.
- [ ] **Step 4:** PASS + görsel kontrol (font aynı görünüyor, Network'te google isteği yok).
- [ ] **Step 5: Commit** – `"Self-host Inter font instead of Google Fonts"`

### Task 3: Impressum ve Datenschutzerklärung sayfaları

**Files:**
- Create: `impressum.html`, `datenschutz.html` (DE only; `index.html`'in `:root` token'ları ve header/footer'ı ile aynı görünüm; CSS kopyalanır)
- Modify: `index.html` footer (`footerLegalHint` yerine iki link: `impressum.html`, `datenschutz.html`; TR etiketleri „Künye", „Gizlilik")
- Modify: `tests/static/legal-copy.test.mjs`

**Ön koşul (BLOCKER):** Fatih'ten alınacak: sorumlu kişi(ler)in tam adı, posta adresi, ikinci iletişim kanalı (telefon). Bunlar gelmeden sayfa **commit edilebilir ama deploy edilmez**. Placeholder `⟦FEHLT: …⟧` biçiminde olur ve test bunu yakalar.

- [ ] **Step 1: Failing test**
```js
test('footer links to legal pages', () => { assert.match(html, /href="impressum.html"/); assert.match(html, /href="datenschutz.html"/); });
test('impressum complete', () => { const s = read('impressum.html'); assert.match(s, /nicht eingetragener Verein in Gründung/); assert.match(s, /Verantwortlich/); });
test('datenschutz names processors', () => { const s = read('datenschutz.html'); for (const n of ['Vercel','Google (Gmail)','Art. 6 Abs. 1','Beschwerde']) assert.ok(s.includes(n), n); });
```
Ayrı dosya `tests/deploy-gate/placeholders.test.mjs` (`npm run test:deploy-gate`; Fatih'in bilgileri gelene kadar bilerek kırmızı, `test:static` yeşil kalır):
```js
test('no unfilled placeholders', () => { for (const f of ['impressum.html','datenschutz.html']) assert.doesNotMatch(read(f), /⟦FEHLT/); });
```
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Impressum** – Başlıklar: „Angaben gemäß § 5 DDG", ad (n.e.V. in Gründung), „Vertreten durch" (Fatih'in verdiği kişiler), Anschrift, Kontakt (E-Mail `weiterwert@gmail.com` + Telefon), „Verantwortlich für den Inhalt", kısa „Haftung für Links". USt-ID/Register satırı **yok**.
- [ ] **Step 4: Datenschutzerklärung (kısa sürüm)** – Bölümler: Verantwortlicher; Hosting (Vercel Inc., Server-Logfiles, Art. 6 Abs. 1 lit. f, Drittlandübermittlung/DPF); Kontakt per E-Mail (Google (Gmail), Art. 6 Abs. 1 lit. b/f); keine Cookies/kein Tracking; lokal gespeicherte Sprachauswahl (localStorage, § 25 Abs. 2 TDDDG); Speicherdauer; Betroffenenrechte (Art. 15–21) + Beschwerderecht bei Aufsichtsbehörde; Stand-Datum. Repo'daki dosyanın başına HTML yorum: `<!-- Entwurf – vor Produktivbetrieb rechtlich prüfen lassen -->`.
- [ ] **Step 5:** `npm run test:static` PASS. `npm run test:deploy-gate` Fatih'in bilgileri gelene kadar FAIL.
- [ ] **Step 6: Commit** – `"Add Impressum and privacy policy pages"`
- [ ] **Step 7: Deploy (sadece Fatih onayıyla)** – `test:static` ve `test:deploy-gate` PASS olduktan sonra Fatih'e sorulur. Mevcut Vercel projesi `techverband`.

---

## FAZ 1 – Platform iskeleti (`platform/`)

### Task 4: Next.js projesi, tasarım token'ları, test araçları

**Files:**
- Create: `platform/` (`npx create-next-app@latest platform --ts --app --eslint --no-tailwind --src-dir --import-alias "@/*"`)
- Create: `platform/src/app/globals.css` (`index.html`'deki `:root` token'ları + `@font-face`; fontlar `platform/public/fonts/`'a kopyalanır)
- Create: `platform/vitest.config.ts`, `platform/playwright.config.ts`, `platform/.env.example`
- Modify: `.gitignore` (`platform/.env*.local`, `platform/.next`, `platform/node_modules`)

**Interfaces:**
- Produces: `npm test` (Vitest), `npm run e2e` (Playwright). `NEXT_PUBLIC_*` build anında gömüldüğü için Playwright'ta **iki proje + iki `webServer`**: `test-env` (port 3100, `NEXT_PUBLIC_APP_ENV=test`, test Basic Auth bilgileri) ve `prod-env` (port 3200, `NEXT_PUBLIC_APP_ENV=production`). Her biri `next build && next start -p <port>` ile, ayrı `distDir` kullanarak çalışır. CSS değişkenleri `--brand-navy`, `--ink`, `--surface` vb. (`index.html` ile aynı isimler)

- [ ] **Step 1:** Scaffold + `npm i -D vitest @vitejs/plugin-react @playwright/test` + `npx playwright install chromium`.
- [ ] **Step 2: Smoke test** `platform/e2e/smoke.spec.ts`: `/` 200 döner, `<html lang="de">`.
- [ ] **Step 3:** `npm run build && npm run e2e` → PASS.
- [ ] **Step 4: Commit** – `"Scaffold Next.js platform app with brand tokens and test tooling"`

### Task 5: Ortam ve feature flags

**Files:**
- Create: `platform/src/lib/env.ts`, `platform/src/lib/features.ts`, `platform/src/components/FeatureGate.tsx`, `platform/src/components/StatusBadge.tsx`
- Test: `platform/src/lib/features.test.ts`, `platform/src/lib/env.test.ts`

**Interfaces:**
- Produces:
  - `type AppEnv = 'test' | 'production'`; `getAppEnv(): AppEnv` (`NEXT_PUBLIC_APP_ENV === 'test'` ise `'test'`, aksi her durumda `'production'`)
  - `type FeatureStatus = 'aktiv' | 'demnaechst' | 'verborgen'`
  - `type FeatureKey = 'spenden' | 'ocr' | 'uebergabeAbsprache' | 'abholung' | 'paketversand' | 'sammelstelle' | 'kiVorpruefung' | 'konto' | 'statusUpdates' | 'newsletter' | 'geraetepartnerschaft' | 'geraetBeantragen' | 'freiwilligTransport' | 'spendenbeleg' | 'admin'`
  - `FEATURES: Record<FeatureKey, { status: FeatureStatus; label: string }>` (label Almanca)
  - `type Visibility = 'show' | 'show-disabled' | 'show-draft' | 'hide'`
  - `resolveVisibility(status: FeatureStatus, env: AppEnv): Visibility`
  - `<FeatureGate feature={key}>` → `show`: children; `show-disabled`: children `aria-disabled` + `<StatusBadge>„demnächst"`; `show-draft`: children + `<StatusBadge>„Entwurf – nur Testumgebung"`; `hide`: null

- [ ] **Step 1: Failing tests**
```ts
expect(resolveVisibility('aktiv','production')).toBe('show');
expect(resolveVisibility('demnaechst','production')).toBe('show-disabled');
expect(resolveVisibility('verborgen','production')).toBe('hide');
expect(resolveVisibility('verborgen','test')).toBe('show-draft');
expect(resolveVisibility('demnaechst','test')).toBe('show-disabled');
// defaults to production when env unknown
vi.stubEnv('NEXT_PUBLIC_APP_ENV', ''); expect(getAppEnv()).toBe('production');
vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'staging'); expect(getAppEnv()).toBe('production');
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Uygula.** Faz 1 başlangıç değerleri: `kiVorpruefung`, `admin`, `spendenbeleg` → `verborgen`; geri kalan hepsi → `demnaechst` (henüz hiçbiri çalışmıyor; Faz 2+ `aktiv` yapar).
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** – `"Add environment detection and feature flags"`

### Task 6: Basic Auth, noindex ve test bandı

**Files:**
- Create: `platform/src/lib/basic-auth.ts`, `platform/src/proxy.ts` (Next.js 16'da middleware'in adı `proxy`), `platform/src/app/robots.ts`, `platform/src/components/TestBanner.tsx`
- Test: `platform/src/lib/basic-auth.test.ts`, `platform/e2e/protection.spec.ts`

**Interfaces:**
- Consumes: `getAppEnv()` (Task 5)
- Produces: `checkBasicAuth(header: string | null, user: string | undefined, pass: string | undefined): boolean` (sabit zamanlı karşılaştırma)

- [ ] **Step 1: Failing unit tests**
```ts
const ok = 'Basic ' + btoa('ww:geheim');
expect(checkBasicAuth(ok,'ww','geheim')).toBe(true);
expect(checkBasicAuth('Basic ' + btoa('ww:falsch'),'ww','geheim')).toBe(false);
expect(checkBasicAuth(null,'ww','geheim')).toBe(false);
// fails closed when credentials env missing
expect(checkBasicAuth(ok, undefined, undefined)).toBe(false);
expect(checkBasicAuth('Basic ' + btoa(':'), '', '')).toBe(false);
```
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Uygula.**
  - `proxy.ts`: `getAppEnv()==='test'` ise her istekte (`/_next/static` ve `/fonts` hariç) `checkBasicAuth` çalışır. Başarısızsa `401` + `WWW-Authenticate: Basic realm="WeiterWert Test"`. Her yanıta `X-Robots-Tag: noindex, nofollow` eklenir.
  - `robots.ts`: test ortamında `disallow: '/'`.
  - `TestBanner`: test ortamında layout'un en üstünde, kapatılamaz, `role="status"`, metin „Testumgebung – keine echten Spenden".
- [ ] **Step 4: E2E** (`test-env` projesi, `NEXT_PUBLIC_APP_ENV=test`, test şifreleri `.env.test`'ten): şifresiz `/` → 401; şifreli → 200, bant görünür, `X-Robots-Tag` başlığı var.
- [ ] **Step 5:** `npm test && npm run e2e` → PASS.
- [ ] **Step 6: Commit** – `"Protect test environment with basic auth and noindex"`

### Task 7: Layout, header/footer, DE/TR dil seçimi

**Files:**
- Create: `platform/src/app/layout.tsx`, `platform/src/components/SiteHeader.tsx`, `platform/src/components/SiteFooter.tsx`, `platform/src/i18n/{de,tr}.ts`, `platform/src/i18n/get-lang.ts`, `platform/src/components/LangSwitch.tsx`
- Copy: `assets/logo-mark.svg`, `favicon.png`, `apple-touch-icon.png` → `platform/public/`
- Test: `platform/e2e/layout.spec.ts`

**Interfaces:**
- Produces: `getLang(): Promise<'de' | 'tr'>` (cookie `lang`; yoksa `'de'`); `t(lang, key)` (DE'ye düşer, `index.html`'deki fallback mantığı); `de.ts` / `tr.ts`, `index.html`'in `translations` nesnesinden taşınır (Task 1 sonrası hali).
- Dil cookie'si zorunlu (işlevsel) çerezdir; Datenschutz metninde Task 3'teki localStorage notunun karşılığı yazılır.

- [ ] **Step 1: Failing e2e** – Her sayfada footer'da `Impressum` ve `Datenschutzerklärung` linki var; dil TR seçilince `<html lang="tr">` ve nav metni „Nasıl Çalışır"; Tab ile tüm nav linkleri sırayla odak alır ve odak görünür.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Uygula (görünüm `index.html` header/footer ile aynı).
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** – `"Add site layout with header, footer and DE/TR language switch"`

### Task 8: Tüm sayfaların iskeleti

**Files:**
- Create: `platform/src/app/<route>/page.tsx` her rota için; `platform/src/lib/sitemap.ts`
- Create: `platform/src/app/page.tsx` (Startseite: `index.html` bölümleri bileşenlere taşınır, içerik aynı)
- Test: `platform/src/lib/sitemap.test.ts`, `platform/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `FeatureGate`, `FEATURES` (Task 5), `getLang`, `t` (Task 7)
- Produces: `SITEMAP: { path: string; title: string; feature?: FeatureKey; germanOnly?: boolean }[]`

Rotalar (`title` Almanca):
| path | title | feature | germanOnly |
|---|---|---|---|
| `/` | Startseite | – | – |
| `/so-funktionierts` | So funktioniert die Gerätespende | – | – |
| `/spenden` | Laptop oder Tablet spenden | `spenden` | ✓ |
| `/unternehmen` | Für Unternehmen und Organisationen | – | – |
| `/geraetepartnerschaft` | Gerätepartnerschaft | `geraetepartnerschaft` | – |
| `/geraet-beantragen` | Gerät beantragen | `geraetBeantragen` | – |
| `/freiwillig-transportieren` | Freiwillig transportieren | `freiwilligTransport` | – |
| `/datensicherheit` | Datenschutz und Datensicherheit | – | – |
| `/annahmekriterien` | Annahmekriterien | – | ✓ |
| `/faq` | Häufige Fragen | – | – |
| `/ueber-uns` | Über WeiterWert | – | – |
| `/kontakt` | Kontakt | – | – |
| `/impressum` | Impressum | – | ✓ |
| `/datenschutz` | Datenschutzerklärung | – | ✓ |
| `/barrierefreiheit` | Erklärung zur Barrierefreiheit | – | ✓ |
| `/konto` | Mein Konto | `konto` | ✓ |
| `/admin` | Verwaltung | `admin` | ✓ |

İskelet sayfa = başlık + bir paragraf amaç + „Inhalt folgt" + varsa `FeatureGate`. `/spenden` iskeletinde spec §5'teki 8 adım liste olarak durur, teslim seçenekleri dört radyo ile gösterilir (hepsi Faz 1'de `demnaechst`). `/annahmekriterien` spec §6 tablolarını „Entwurf v0.1" etiketiyle gösterir. `/impressum` ve `/datenschutz` Task 3'teki statik sayfaların içeriğini kullanır.

- [ ] **Step 1: Failing tests**
  - unit: `SITEMAP` 17 rota içeriyor, path'ler benzersiz.
  - e2e (`test-env` projesi): her `SITEMAP` path'i 200 döner ve `<h1>` = `title`; `/admin` „Entwurf – nur Testumgebung" rozeti gösterir; `/geraetepartnerschaft` „demnächst" rozeti gösterir.
  - e2e (`prod-env` projesi): `/admin` 404.
  - e2e: cookie `lang=tr` ile `/spenden` → „Das Spendenformular ist nur auf Deutsch verfügbar." görünür, içerik Almanca.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Uygula. `germanOnly` sayfalar TR'de üstte notla Almanca render edilir; `hide` görünürlüğü olan feature sayfaları `notFound()` çağırır.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** – `"Add skeleton pages for full sitemap"`

### Task 9: Supabase test projesi bağlantısı

**Files:**
- Create: `platform/src/lib/supabase/server.ts`, `platform/src/lib/supabase/browser.ts`, `platform/src/app/api/health/route.ts`
- Modify: `platform/.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_ENV`, `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`)
- Test: `platform/src/app/api/health/route.test.ts`

**Ön koşul (Fatih):** supabase.com'da ücretsiz proje `weiterwert-test`, bölge **Central EU (Frankfurt) eu-central-1**. Anahtarlar `platform/.env.local`'e konur (commit edilmez). DPA kabulü Supabase dashboard'da yapılır.

**Interfaces:**
- Produces: `createServerSupabase(): SupabaseClient` (cookie'li, `@supabase/ssr`); `createBrowserSupabase(): SupabaseClient`; `GET /api/health` → `{ ok: boolean, db: 'up' | 'down' | 'unconfigured' }`
- Service-role anahtarı sadece sunucu kodunda (`import 'server-only'`).

- [ ] **Step 1: Failing test** – env yokken health `{ ok:false, db:'unconfigured' }`, HTTP 503; Supabase istemcisi mock'lanıp hata verdiğinde `db:'down'`, 503; başarılıysa `{ok:true, db:'up'}`, 200. Yanıtta hiçbir env değeri yok.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Uygula (DB kontrolü: `auth.getSession()` veya basit bir RPC değil, `fetch(SUPABASE_URL + '/rest/v1/', {headers:{apikey}})` durum kodu).
- [ ] **Step 4:** PASS; gerçek anahtarlarla `npm run dev` → `/api/health` `db:'up'`.
- [ ] **Step 5: Commit** – `"Add Supabase clients and health endpoint"`

### Task 10: Vercel projesi (fra1) ve README

**Files:**
- Create: `platform/vercel.json` (`{ "regions": ["fra1"] }`)
- Create: `platform/README.md` (Türkçe: başlatma, test komutları, env listesi, ortamlar, açık bağımlılıklar: Impressum bilgileri, yedekleme kararı, AVV'ler)

**Ön koşul:** Vercel CLI (`npm i -g vercel`) ve Fatih'in onayı.

- [ ] **Step 1:** `cd platform && vercel link` → yeni proje `weiterwert-platform` (mevcut `techverband` projesine **bağlanmaz**). Root Directory `platform`.
- [ ] **Step 2:** Env'leri Preview + Production için ekle: `NEXT_PUBLIC_APP_ENV=test`, Basic Auth bilgileri, Supabase anahtarları. (Faz 8'e kadar bu projenin „production"ı da test ortamıdır.)
- [ ] **Step 3: (Fatih onayıyla)** `vercel deploy` → URL'de şifre sorulur, bant görünür, `/api/health` `db:'up'`, yanıt başlığında `x-vercel-id` içinde `fra1`.
- [ ] **Step 4: Commit** – `"Configure Vercel project for Frankfurt and document setup"`

---

## Kapsam dışı (sonraki planlar)
Faz 2 bağış akışı (kural motoru, OCR, gönderim, outbox) · Faz 3 Admin-MVP · Faz 4 hesap/onaylar · Faz 5 içerik. Her biri ayrı plan.
