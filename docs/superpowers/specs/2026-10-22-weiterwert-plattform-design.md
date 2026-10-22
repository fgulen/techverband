# WeiterWert – n.e.V. Gründungs- und Betriebsbereitschaft
## Platform tasarımı (Spendenplattform v0)

Tarih: 2026-10-22 · Durum: Taslak, onay bekliyor
Kaynak: `MASTER_PROMPT.md` + `KURZANLEITUNG.md` (bu belgeye aktarıldı, ek A) ve Fatih ile beyin fırtınası.

> Dil kuralı: Strateji ve teknik belgeler Türkçe. Sitede görünen tüm metinler (form, buton, e-posta, hata) Almanca; Türkçe ikinci dil olarak mevcut i18n yapısıyla devam eder.

---

## 1. Amaç ve neden

WeiterWert şu an kayıtsız bir girişim (n.e.V.). 2027'de Vereinsregister + Finanzamt (Gemeinnützigkeit) başvurusu yapılacak. O tarihe kadar:

1. **Canlı site (weiterwert.de)** hukuken temiz olmalı (Impressum, Datenschutz, yanlış vaat yok).
2. **Ayrı bir test ortamında** bağış platformunun iskeleti kurulmalı. Kullanıcı "görmeden aklımıza gelmeyebilir" dedi. Bu yüzden her özellik, kapalı olanlar dahil, test ortamında **görünür** olmalı. Böylece eksikler kullanarak bulunur.
3. Bağış yapmak Hey Alter ([heyalter.com/spenden](https://heyalter.com/spenden/)) formundan **daha kolay ve daha şeffaf** olmalı. Bağışçı, cihazının uygun olup olmadığını göndermeden önce öğrenmeli. Uygun olmayan cihaz boşuna kargolanmamalı.

**Başarı:** 2027 başvurusu sırasında çalışan, test edilmiş, hukuk kontrolünden geçmiş bir bağış akışı ve "Betriebsbereitschaft"ı gösteren belgeler (Satzung taslağı, Datenschutzkonzept, kabul kuralları, süreçler).

## 2. Hedefler / Hedef olmayanlar / Anti-hedefler

**Hedefler**
- Misafir olarak (hesapsız) laptop veya tablet bağışı; bir başvuruda birden fazla cihaz.
- Göndermeden önce ön kontrol: sürümlü, yazılı kurallar + tarayıcı içi OCR.
- Veri minimizasyonu: sadece gerekli alanlar zorunlu.
- Bağıştan sonra iki ayrı, işaretsiz ve isteğe bağlı soru: (a) cihazın durumu ve nereye ulaştığı hakkında bilgi, (b) WeiterWert haberleri. Sonradan isteğe bağlı hesap açma.
- Özellik bayrakları (feature flags): her özellik `aktiv` / `sichtbar, deaktiviert („demnächst")` / `verborgen` durumundan birinde.
- Roadmap ve hukuk kontrol listesi.

**Hedef olmayanlar (bu planda yok)**
- Tam admin paneli. Bu planda sadece **Admin-MVP** var (§8b). Kalanı „Sonra" fazında.
- Para bağışı, ödeme verisi.
- Abholung, Paketversand, Sammelstelle (sadece kapalı seçenek olarak görünür).
- Yapay zekâ ile ön kontrol (iskelet + adapter var, kapalı).
- Zuwendungsbestätigung (Finanzamt onayından sonra).

**Anti-hedefler (çalışsa bile başarısızlık sayılır)**
- Sahte veya doğrulanmamış bilgi: kabul edilmeyen sertifika, partner, rakam, vergi avantajı, "zertifizierte Datenlöschung".
- Gerçekte çalışmayan bir özelliği çalışıyor gibi göstermek (mock e-posta, mock KI).
- Önceden işaretli onay kutusu; Datenschutzerklärung için "Einwilligung" istemek.
- Ön kontrolün kesin karar gibi sunulması. Kesin karar her zaman fiziksel kontrolden sonra insanda.
- Uygun olmayan cihazı teslim almak (ElektroG riski, bkz. §7).

## 3. Kısıtlar

- **Hosting:** Vercel, fonksiyonlar `fra1` (Frankfurt) bölgesine sabit.
- **Veritabanı + Auth:** Supabase, proje bölgesi **eu-central-1 (Frankfurt)**. Supabase Inc. ve Vercel Inc. ABD şirketleri. AVV/DPA imzalanacak, SCC/DPF Datenschutzerklärung'da belirtilecek. ([Supabase GDPR](https://supabase.com/docs/guides/security/gdpr-compliance))
- **Ortamlar:** İki ayrı Supabase projesi (test / prod) ve iki Vercel ortamı. Test ortamı **şifreli** (Fatih'in kararı). Ücretsiz çözüm: Next.js middleware ile HTTP Basic Auth, şifre Vercel env'de *(Claude'un kararı; Vercel'in kendi Password Protection özelliği ücretli eklenti)*. Ek olarak `noindex` ve kalıcı „Testumgebung – keine echten Spenden" bandı. Test verisi gerçek sayılmaz.
- **Dil:** Bağış akışı, beyanlar, e-postalar, admin ve tüm hukuk metinleri **sadece Almanca** (Fatih'in kararı). Tanıtım sayfalarında mevcut DE/TR dil seçimi devam eder; TR'de akışa girerken „Das Spendenformular ist nur auf Deutsch verfügbar" notu gösterilir *(Claude'un kararı)*.
- **Ücretli API yok.** OCR tarayıcıda çalışır (Tesseract.js). Ücretli bir API ancak Fatih'in onayıyla eklenir.
- **Erişilebilirlik:** WCAG 2.2 AA hedefi, mobile-first. Mevcut tasarım dili korunur: renkler, logo, `index.html` stilleri.
- **Gizli bilgiler** kodda bulunmaz; Vercel env'de tutulur.

## 4. Verilen kararlar (Fatih'in)

| Konu | Karar |
|---|---|
| Proje adı | „WeiterWert – n.e.V. Gründungs- und Betriebsbereitschaft"; 2027'de başvuru |
| Spendenbeleg | Metin „Spendenbeleg: Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt". Bugünkü "stellen wir aus" vaadi kaldırılır. |
| Veri yeri | Almanya (Frankfurt) |
| Admin | Admin-MVP Faz 3'te, bağış akışından hemen sonra (§8b). Tam panel sonra. |
| Test ortamı | Şifreli |
| Dil | Akış + hukuk metinleri sadece Almanca |
| Yedekleme | Şimdilik yok, Faz 8 öncesi tekrar |
| Hesap | Zorunlu değil. Bağıştan sonra isteğe bağlı. |
| Bilgilendirme | Status/varış bilgisi ve haber bülteni ayrı ayrı sorulur, işaretsiz gelir |
| Teslim | Sadece **„Übergabe nach Absprache"** aktif. Diğerleri görünür ama kapalı. |
| Kapsam stili | İskelet. Her şey implement edilmez, zamanı gelince açılır. |
| Test | Takvim yok. 2027'ye kadar test ortamı açık, her özellik görülebilir. |
| Kabul kriterleri | §6'daki politika (Fatih'in önerisi + eklemeler), **teknik ekip doğrulayana kadar Entwurf** |

## 5. Bağış akışı (Spendenstrecke)

Adımlar (geri dönülebilir, taslak tarayıcıda saklanır, sunucuya ancak gönderimde gider):

1. **Einstieg:** Kabul edilen cihazlar (laptop, tablet); süreç; „Daten sichern, Konten abmelden, Sperren entfernen" kontrol listesi; ön kontrolün kesin karar olmadığı.
2. **Geräte erfassen** (cihaz başına, birden fazla cihaz eklenebilir):
   - Tür: Laptop / Chromebook / MacBook / Android-Tablet / iPad / „weiß nicht".
   - Model bulma, 3 yol:
     a) **Modell eingeben:** Serbest metin + öneri listesi.
     b) **Typenschild fotografieren:** Tarayıcıda OCR, model/seri no önerir. Fotoğraf sunucuya **gönderilmez**.
     c) **Weiß ich nicht / Gerät startet nicht:** Marka + isteğe bağlı seri numarası. Sonuç „Wir prüfen das für Sie" (manuel).
   - Kolay sorular: yaklaşık alış yılı; açılıyor mu; ekran/kasa; batarya (şişme/ısınma var mı); şarj aleti var mı; bilinen kilitler (hesap, BIOS şifresi, şirket yönetimi/MDM, bilinmiyor).
   - Teknik alanlar (RAM, işlemci, depolama) **isteğe bağlı**; „weiß ich nicht" her zaman seçilebilir.
3. **Vorprüfung:** Kural motoru (§6) her cihaza bir sonuç verir:
   - 🟢 *Vorläufig geeignet*
   - 🟡 *Weitere Angaben erforderlich* / *Manuelle Prüfung erforderlich*
   - 🔴 *Nach den veröffentlichten Kriterien voraussichtlich nicht geeignet*: Gerekçe gösterilir, cihaz başvurudan çıkarılır, bilgi kutusunda Wertstoffhof/geri dönüşüm önerilir.
   - **Şişmiş batarya:** „Bitte nicht versenden und nicht bringen", güvenlik notu, yönlendirme.
   - Sonuçta kural sürümü görünür („Kriterien v0.1, Stand …").
4. **Kontakt & Übergabe:** Zorunlu alanlar ad, e-posta ve PLZ (sadece görüşme ayarlamak için). Telefon isteğe bağlı. Kurum ise kurum adı + rol. Teslim: „Übergabe nach Absprache" aktif. Abholung, Paketversand ve Sammelstelle `disabled` ve „demnächst" etiketli.
5. **Erklärungen:** Her biri sürümlü metin:
   - Eigentum: Cihaz bağışçının malı, **leasing/kiralık değil**, şirket cihazıysa yetki var.
   - Datensicherung: Kişisel verileri yedekleme sorumluluğu bağışçıda. WeiterWert dokümante bir yöntemle siler. Sertifika vaadi yok.
   - Datenschutzhinweis: Art. 13 bilgilendirmesi, **onay değil, bilgi** („zur Kenntnis genommen" ifadesi yok, sadece link + bilgi).
6. **Zusammenfassung:** Tüm bilgiler düzenlenebilir halde gösterilir.
7. **Absenden:** Sunucu tarafında yeniden doğrulama (aynı kural motoru), idempotency anahtarı (çift gönderim engeli), Vorgangsnummer (`WW-2026-XXXXXX`), UTC zaman damgası, kabul edilen metin sürümleri + SHA-256 hash.
8. **Danke-Seite:** Vorgangsnummer ve „Wir melden uns zur Terminabsprache". Altında iki **ayrı, işaretsiz** kutu:
   - ☐ „Informiert mich, wo mein Gerät angekommen ist" (Status-Updates)
   - ☐ „WeiterWert-Neuigkeiten per E-Mail" (Newsletter, Double-Opt-In)
   - İsteğe bağlı: „Konto anlegen" (Supabase Auth, şifresiz magic link). Hesapta bağış geçmişi ve onayları görülür, geri çekilebilir.
9. **Bestätigungs-E-Mail:** Outbox tablosu ile. Mail gitmese de başvuru kaybolmaz, tekrar denenir. Sağlayıcı adapter arkasında (§8).

Akışın 9-11 adımları (fiziksel teslim, teknik kontrol, silme kaydı, cihaz başına durum) MASTER_PROMPT'ta var. Arayüzleri **Admin-MVP**'dedir (§8b).

## 6. Kabul kriterleri – „Annahmekriterien v0.1 (Entwurf)"

Kurallar kodda değil, sürümlü bir veri dosyasındadır (`rules/annahme-v0.1.json` veya DB tablosu). Her sonuç, kural sürümüyle birlikte kaydedilir. **Bunlar WeiterWert'in önerilen başlangıç politikasıdır, teknik ekip onayına kadar Entwurf'tur.** Kesin ret değil, hedeflerdir. Bilgi eksikse sonuç her zaman 🟡 olur, asla 🔴 değil.

### 6.1 Laptop (Windows/Linux)
| Bileşen | 🟢 Doğrudan | 🟡 Manuel |
|---|---|---|
| İşlemci | Windows 11 destek listesinde (≈ Intel 8. nesil+, AMD Ryzen 2000+) | daha eski / Celeron, Pentium N, Atom |
| RAM | ≥ 8 GB | 4 GB ve yükseltilebilir. **Lehimli 4 GB → 🔴 yakın** |
| Depolama | ≥ 256 GB SSD | 128 GB SSD; disk yok/sökülmüş. **eMMC ≤ 64 GB → 🔴** |
| İşletim sistemi | Desteklenen güvenli OS (Windows 11 uyumlu) | Yükseltme/alternatif OS gerekiyor. Linux kurulabilmesi tek başına 🟢 değildir. |
| Ekran | ≥ 13", çalışır | küçük çatlak, onarılabilir |
| Batarya | şarj tutuyor, şişme yok, hedef ≥ %70 kapasite | düşük kapasite |
| Bağlantı / kamera | Wi-Fi, USB, şarj, **kamera + mikrofon** çalışıyor | onarılabilir port sorunu |

### 6.2 Chromebook
🟢: Auto-Update-Expiration (AUE) tarihi en az 2 yıl ileride. 🟡: 2 yıldan az kaldı. 🔴: AUE geçmiş. Kurumsal kayıt (enrollment) kaldırılmamışsa 🟡.

### 6.3 MacBook
🟢: Güncel macOS'u destekleyen model, Activation Lock kaldırılabilir. 🟡: sadece eski macOS güvenlik güncellemesi alan model, T2/firmware şifresi belirsiz. 🔴: Activation Lock kaldırılamıyor.

### 6.4 Android tablet
🟢 ≥ 4 GB RAM, ≥ 64 GB, 64-bit, güvenlik güncellemesi alıyor, ≥ 9". 🟡 3 GB / 32 GB, destek sonu yakın, operatör/SIM kilidi. 🔴 kaldırılamayan Google hesap kilidi (FRP) veya Knox/MDM kilidi.

### 6.5 iPad
🟢 Güncel iPadOS'u destekleyen model (örn. iPadOS 26: iPad 8. nesil+, Air 3+, belirli Pro/mini; kabul tarihinde tekrar kontrol), ≥ 64 GB. 🟡 sadece eski güvenlik sürümü, 32 GB. 🔴 Activation Lock kaldırılamıyor.

### 6.6 Tüm cihazlar
- Şişmiş, delinmiş veya aşırı ısınan batarya: 🔴 ve güvenlik prosedürü. **Gönderilmez, teslim alınmaz.**
- Hesap, firmware veya MDM kilidi: Cihaz yasal ve teknik olarak yeniden kurulabilir olmalı. Kurumsal kayıtlar (Autopilot/Intune, Apple Business Manager, Chrome Enterprise, Absolute) bağışçı tarafından kaldırılmalı, aksi halde 🟡.
- BitLocker/FileVault anahtarı yok: 🟡 (silinebilir ama kurulum kontrol edilir).
- Leasing veya mülkiyet belirsiz: başvuru gönderilemez (beyan zorunlu).
- Şarj aleti yok: 🟢 kalır, maliyet notu düşülür.
- Veri: Belgelenebilir, yetkili bir yöntemle silinebilmeli.

> Not: Windows 10 tüketici ESU bitiş tarihi kaynaklarda çelişkili (13.10.2026 veya 12.10.2027'ye uzatıldı). Kural yine **Windows 11 uyumluluğu** üzerine kurulur. ESU, dağıtım için yeterli kabul edilmez.

## 7. Hukuk kontrol listesi („Anwalt / Steuerberater prüfen")

Hiçbiri hukuki tavsiye değildir. Her madde canlıya geçmeden önce Almanya'da yetkili bir danışmana doğrulatılacaktır. **P0** = canlı sitede şimdi yapılmalı.

| # | Konu | Ne yapılacak | Öncelik |
|---|---|---|---|
| 1 | **Impressum** (§ 5 DDG, eski TMG) | n.e.V. için uygulanabilirlik net değil. Güvenli yol: Sorumlu kişilerin adı, posta adresi, e-posta + ikinci iletişim kanalı. „Nicht eingetragener Verein in Gründung" ifadesi. | **P0** |
| 2 | **Datenschutzerklärung** (DSGVO Art. 13) | Vercel, Supabase, e-posta sağlayıcı, (varsa) font/CDN. Amaç, hukuki dayanak, saklama, haklar. | **P0** (canlı site için kısa sürüm) |
| 3 | **Spendenbeleg vaadi** | Metin değişikliği (§4). Zuwendungsbestätigung ancak § 60a AO Feststellung / Freistellungsbescheid sonrası. | **P0** |
| 4 | Placeholder'lar | „Unsere Unterstützer" LOGO alanları ve hikâyeler gerçek değilse yayında gösterilmemeli veya açıkça „Beispiel" olmalı. | **P0** |
| 5 | AVV/DPA | Vercel, Supabase, mail sağlayıcısı. Üçüncü ülke transferi (SCC/DPF). | P1 |
| 6 | TDDDG § 25 | Sadece zorunlu çerezler (Supabase oturum çerezi). Analytics/Marketing yok → banner gereksiz olabilir; kontrol edilecek. | P1 |
| 7 | Onaylar | Status-Updates ve Newsletter ayrı. Newsletter Double-Opt-In (UWG § 7). Geri çekme her mailde. ConsentRecord: sürüm, metin hash'i, UTC. | P1 |
| 8 | Mülkiyet devri | Schenkung (§ 516 BGB); Eigentums-/Leasing-Beyanı; teslimde Übergabeprotokoll. Şirket bağışlarında imza yetkisi. | P1 |
| 9 | Cihazdaki veriler | Bağışçının yedekleme sorumluluğu; WeiterWert'in silme yöntemi belgelenir (örn. NIST SP 800-88 / BSI önerileri), **sertifika iddiası yok**. Silmeden önce verilere erişim olursa WeiterWert'in rolü (controller/processor) netleştirilecek. | P1 |
| 10 | ElektroG / KrWG | Sadece yeniden kullanılabilir cihaz alınır; 🔴 cihazlar Wertstoffhof'a yönlendirilir. Atık toplama sayılmamak için sınır netleştirilecek. Sonradan çıkan hurdanın bertarafı nasıl? | P1 |
| 11 | Lityum batarya taşıma | Hasarlı batarya kargo ile gönderilmez (Gefahrgut). Paketversand açıldığında ayrıca kontrol edilecek. | P2 (Versand ile) |
| 12 | n.e.V. sorumluluğu | Üyeler kişisel olarak sorumlu olabilir (§ 54 BGB). Eintragung'a kadar sigorta (Vereinshaftpflicht) değerlendirilecek. | P1 |
| 13 | Gründung | Satzung (§§ 51–68 AO, Mustersatzung Anlage 1 AO), Gründungsversammlung, Vereinsregister (notar onaylı başvuru), Finanzamt § 60a AO. | Roadmap |
| 14 | Alıcıya teslim | Hediye olarak sorumluluk (§§ 521, 524 BGB), elektrik güvenliği kontrolü, yazılım lisansları (Windows OEM lisansı cihazla gider, Office gitmez). Reşit olmayan alıcılar: veli onayı, isteğe bağlı içerik filtresi. | P2 |
| 15 | „Gerät beantragen" | Alıcıların sosyal durumu hassas veridir → sıkı veri minimizasyonu, DSFA (Art. 35) gerekip gerekmediği. | P2 |
| 16 | Fotoğraf/hikâye | Teslim fotoğrafları için yazılı izin (KUG/DSGVO), özellikle reşit olmayanlarda. | P2 |
| 17 | Gönüllü taşıma | Ehrenamt kaza/sorumluluk sigortası. | P2 |
| 18 | KI açıldığında | AI Act Art. 50 şeffaflık, AVV, AB veri yeri. | Sonra |
| 19 | BFSG | Muhtemelen uygulanmaz (ticari tüketici hizmeti değil). Yine de WCAG 2.2 AA hedeflenir. | Kontrol |

## 8. Mimari (taslak)

**Kararım (değiştirilebilir):** Mevcut tek `index.html`'i **Next.js (App Router) + TypeScript** projesine taşımak. Gerekçe: çok sayfalı site (Impressum, Datenschutz, FAQ, Spenden…), çok adımlı form, sunucu tarafı doğrulama, Supabase Auth ve özellik bayrakları. Bunlar tek HTML dosyasında sürdürülemez. Görsel tasarım (renkler, tipografi, logo, hero illüstrasyonu) ve DE/TR metinleri aynen taşınır.

- **Sayfalar (sitemap):** Startseite · So funktioniert's · Spenden (Laptop/Tablet, tek akış) · Für Unternehmen · Gerätepartnerschaft *(demnächst)* · Gerät beantragen *(demnächst)* · Freiwillig transportieren *(demnächst)* · Datenschutz & Datensicherheit · Annahmekriterien · FAQ · Über uns (Gründungsstatus) · Kontakt · Impressum · Datenschutzerklärung · Barrierefreiheit · Mein Konto *(optional)*.
- **Feature flags:** Tek bir yapılandırma dosyası (`features.ts`): `aktiv | demnaechst | verborgen`. Test ortamında `verborgen` olanlar da „Entwurf" etiketiyle gösterilir.
- **Kural motoru:** Saf TypeScript fonksiyonu `pruefe(gerät, regeln) → {ergebnis, gründe[], regelVersion}`. Tarayıcı ve sunucu aynı kodu kullanır. Birim testleri.
- **OCR:** Tesseract.js, istemci tarafında, lazy-load. Sonuç sadece öneri; kullanıcı onaylar.
- **KI adapter (kapalı):** `KiPruefer` arayüzü; varsayılan `ManuellFallback`. Açılırsa sadece öneri verir, karar vermez.
- **Veri (Supabase Postgres, RLS açık):** Şema MASTER_PROMPT entitelerinden şimdilik gerekenleri içerir: `donation_request`, `donation_device`, `contact` (ayrı tablo, pseudonim referans), `consent_record`, `document_version`, `document_evidence`, `notification_outbox`, `audit_event` (append-only), `rule_set`. Daha sonra eklenecekler: `physical_asset`, `review`, `device_event`, `technical_check`, `erasure_event`, `partnership`, `retention_policy`, roller.
- **Durumlar:** `DRAFT → SUBMITTED → (NEEDS_INFORMATION | MANUAL_REVIEW) → INTAKE_PLANNING → …` (MASTER_PROMPT durum makinesi; ilk aşamada SUBMITTED'a kadar arayüz var).
- **E-posta:** `MailAdapter` arayüzü + outbox + yeniden deneme. Sağlayıcı seçimi builder'a bırakıldı; şart: AB veri yeri tercih edilir, AVV var. Sağlayıcı yokken test ortamında mailler bir „Mail-Vorschau" sayfasında görünür ve açıkça „nicht versendet" yazar.
- **Güvenlik:** Sunucu doğrulaması (zod), rate limit, idempotency anahtarı, CSP, gizli bilgiler env'de, service-role anahtarı sadece sunucuda.

## 8b. Admin-MVP (`/admin`, aynı Next.js uygulaması)

**İlke:** Pilotta gerçek bağışları baştan sona işlemek için gereken en az şey. Her durum değişikliği `audit_event`'e yazılır (kim, ne, ne zaman UTC, önce→sonra). Kayıtlar silinmez, sadece yeni kayıt eklenir.

**Giriş ve roller:** Supabase Auth, e-posta + **TOTP-MFA zorunlu**. Bağışçı hesaplarından ayrı. İki rol var: `admin` (her şey + kullanıcı yönetimi) ve `mitarbeiter` (işlem yapar, ayarlara erişemez). RLS ile zorlanır. Admin hesapları elle davet edilir, açık kayıt yoktur.

| Bölüm | MVP'de VAR | Sonraya kalan |
|---|---|---|
| **1. Übersicht** | „Heute zu tun" kuyrukları ve sayıları: neu, manuelle Prüfung, wartet auf Angaben, Übergabe geplant/offen, Prüfung/Löschung offen, fehlgeschlagene E-Mails. 7 günden eski işler „überfällig" diye işaretlenir. | Grafikler, raporlar |
| **2. Anfragen** | Filtrelenebilir liste (durum, tarih, özel/kurum, cihaz türü). Detay: Vorgangsnummer, iletişim, cihazlar, ön kontrol sonucu + kural sürümü + gerekçeler, kabul edilen beyanlar. Cihaz başına karar: *annehmen / ablehnen / Angaben anfordern*, zorunlu kısa gerekçe, karar veren ve zaman otomatik. | KI-Bewertung (KI açılınca), fotoğraflar (şu an toplanmıyor) |
| **3. Inventar** | Teslimde her fiziksel cihaz için ayrı kayıt ve ayrı ID (`WW-G-000123`). 10 laptop 10 kayıt demektir. QR etiketi yazdırılır. Marka/model, gerekirse seri no, aksesuar, görülen durum. **Teknik kontrol** (kontrol listesi + sonuç). **Datenlöschung** (yöntem, araç, tarih, kişi, sonuç başarılı/başarısız). **Son karar:** Wiederverwendung / Reparatur / Ersatzteile / Recycling. Cihaz başına durum geçmişi. | Raf/konum takibi, alıcıya teslim (Gerät beantragen fazıyla) |
| **4. Dokumente** | Tarayıcıdan yazdırılabilir (Drucken → PDF) 3 belge: **Übergabeprotokoll**, **Löschprotokoll** (cihaz başına), **Geräteliste/Etiketten**. Her belgede sürüm, tarih, Vorgangs-/Geräte-Nr. ve hash bulunur. Oluşturma `document_evidence`'a kaydedilir. | Toplu PDF, Annahme-/Ablehnungsschreiben PDF, Abschlussbericht, „gedruckt/abgelegt" işaretleri |
| **5. E-Mail** | Outbox listesi: durum, hata, **erneut senden**. Sabit şablonlar (kodda, sürümlü): Eingangsbestätigung, Terminabsprache, Rückfrage, Absage (mit Wertstoffhof-Hinweis), Status-Update. Gönderilen her mail başvuruya bağlanır. | Şablon düzenleyici, gelen yazışmaları içeri alma |
| **6. Übergabe** | Randevu tarihi/saati, sorumlu kişi, beklenen sayı. „Übergabe abgeschlossen" denince gerçek sayı, sapmalar (eksik, farklı model, hasar) girilir; Inventar kayıtları ve Übergabeprotokoll oluşur. | Abholung rotası, Paketversand takip no |
| **7. Einstellungen** | Kullanıcı davet / devre dışı bırakma (sadece `admin`). Audit-Log görüntüleyici (sadece okuma, filtreli). Otomatik numaralandırma (sabit). Veri silme talebi işlemi (bağışçı verisini anonimleştir + audit). | Kriter düzenleme arayüzü (şimdilik sürümlü dosya + kod değişikliği), saklama kuralları arayüzü, yedekleme paneli |

**Ekip bildirimi:** Yeni başvuruda tek iletişim adresine dahili bir e-posta gider. **Kişisel veri içermez**, sadece „Neue Anfrage WW-2026-000123 – bitte im Admin öffnen" yazar. *(Claude'un kararı.)*

**Yedekleme:** Fatih'in kararı: şimdilik yok. Supabase ücretsiz planı otomatik yedek içermez. **Risk:** Faz 8'den (gerçek veri) önce tekrar karar verilecek. Seçenekler Supabase Pro (ücretli) veya günlük şifreli `pg_dump`.

**Builder'a bırakılanlar:** UI bileşen kütüphanesi, test araçları (Vitest/Playwright önerilir), mail sağlayıcısı, model öneri listesinin kaynağı, Vorgangsnummer biçiminin detayı.

## 9. Roadmap

| Faz | İçerik | Bitti sayılır |
|---|---|---|
| **0 – Sofort (canlı site)** | Spendenbeleg metni, Impressum, kısa Datenschutzerklärung, placeholder temizliği, „in Gründung" ifadesi | weiterwert.de'de P0 maddeleri tamam |
| **1 – Testumgebung & Gerüst** | Next.js taşıma (görünüm aynı), Vercel test ortamı + `noindex` + bant, Supabase test projesi (Frankfurt), feature flags, tüm sayfaların iskeleti | Test URL'sinde tüm sayfalar ve „demnächst" özellikler görünüyor |
| **2 – Spendenstrecke MVP** | Akış adım 1–8, kural motoru v0.1 + testler, OCR, Übergabe nach Absprache, Vorgangsnummer, idempotency, outbox + mail önizleme | Uçtan uca test: 🟢, 🟡, 🔴, şişmiş batarya, çift gönderim, mail hatası |
| **3 – Admin-MVP** | §8b: MFA girişi, roller, Übersicht, Anfragen + kararlar, Inventar + QR, teknik kontrol + Löschprotokoll, Übergabe, 3 belge, outbox, audit görüntüleyici, ekip bildirimi | Test ortamında bir bağış başvurudan „Recycling/Wiederverwendung" kararına kadar admin üzerinden işlenebiliyor; her adım audit'te görünüyor |
| **4 – Konto & Einwilligungen** | Status-Updates / Newsletter onayları, magic-link hesap, onay geri çekme, veri silme talebi | Onay kayıtları sürüm + hash ile; geri çekme çalışıyor |
| **5 – İçerik & Belgeler** | FAQ, Annahmekriterien sayfası, Datenschutz & Datensicherheit, Für Unternehmen (MDM/Leasing kontrol listesi), süreç belgeleri | İçerik Fatih onaylı |
| **6 – Hukuk kontrolü** | §7 listesi danışmanla; Datenschutzerklärung ve metinlerin final hali; AVV'ler | Danışman notları işlendi |
| **7 – Gründung 2027** | Satzung (gemeinnützig), Gründungsversammlung, Vereinsregister, Finanzamt § 60a | Eintragung + Feststellungsbescheid |
| **8 – Pilot & Produktiv** | Birkaç gerçek bağışla pilot, prod ortamına geçiş, Spendenbeleg özelliğini açma | Pilot geri bildirimi işlendi |
| **Sonra** | Tam admin (§8b „Sonraya kalan" sütunu), Abholung/Versand/Sammelstelle, KI-Vorprüfung, Gerätepartnerschaft, Gerät beantragen | ayrı tasarım |

## 9b. Builder kontrolünden sonra verdiğim kararlar (Claude'un kararı, itiraz edilebilir)

- **Repo / deploy:** Next.js projesi aynı repoda `platform/` klasörüne kurulur. Ayrı bir Vercel projesine bağlanır (Root Directory = `platform`). Canlı `index.html` ve weiterwert.de'ye dokunulmaz; Faz 8'de domain taşınır.
- **Sınırdaki cihazlar:** 🔴 sadece kesin bilinen durumlarda verilir: model listesinden doğrulanmış lehimli 4 GB, eMMC ≤ 64 GB, AUE geçmiş, şişmiş batarya, kaldırılamayan kilit. Bağışçının tahmini veya bilgi eksikliği her zaman 🟡 olur. „🔴 yakın" ifadesi bu anlama gelir.
- **Status-Updates kutusu:** Faz 4'te aktif olur, onay kaydedilir. Durum e-postası Admin-MVP'deki Status-Update şablonuyla ekip tarafından tetiklenir. Onay metni bunu dürüstçe söyler („Wir informieren Sie per E-Mail, sobald Ihr Gerät übergeben wurde").

## 10. Açık sorular (onaydan önce/sonra)
- Impressum için hangi kişilerin adı ve adresi yayınlanacak? (Faz 0 için gerekli.)
- weiterwert.de canlı sitesi Faz 1–5 boyunca mevcut tek sayfa olarak mı kalır? (Kararım: Evet, sadece P0 düzeltmeleri.)

---

## Ek A – Orijinal MASTER_PROMPT (özetin kaynağı)

Orijinal `MASTER_PROMPT.md` ve `KURZANLEITUNG.md` bu belgeye aktarıldıktan sonra silindi. Yukarıdaki tasarım şu maddelerini **bilinçli olarak sonraya bıraktı**: Adminbereich, Phase G'deki admin/Job-Queue kısmı, Übergabe/Technische Prüfung/Abschluss arayüzleri (adım 9-11), AfB süreç referans denetimi. Diğer tüm gereksinimler (DSGVO Art. 5/6/7/12/13/25/32, WCAG 2.2 AA, idempotency, outbox, sürümlü belgeler, hash + UTC, KI sadece öneri + manuel fallback, sahte bilgi yasağı, Mock'ları gerçek gibi göstermeme) yukarıya işlendi.

Orijinal metin (Almanca, kısaltılmadan):

```text
# Weiterwert – Claude Code Master Prompt (Kurzfassung)

## Rolle und Ziel
Arbeite als Senior UX/UI Designer, Product Manager, Softwarearchitekt und Datenschutz-/QA-Spezialist. Analysiere die bestehende Website und entwickle für Weiterwert eine moderne, barrierearme Website mit einer app-ähnlichen Plattform zur Spende gebrauchter Laptops und Tablets.

- Primärquelle: https://weiterwert.de/
- Prozess-/Branchenreferenz: https://www.afb-group.de/
- Weiterwert bestimmt Marke, Mission und tatsächliche Leistungen. AfB ist nur Prozessreferenz; Design und Texte nicht kopieren.
- Erfinde keine Fakten, Zertifizierungen, Partner, Kennzahlen, Rechtsgrundlagen, Abhol-/Versandangebote oder steuerlichen Vorteile.
- Wenn Websites oder Informationen nicht erreichbar sind: dokumentiere die Einschränkung und markiere offene Punkte.
- Strategie und technische Dokumentation auf Türkisch. Alle sichtbaren Website-Texte, Formulare, Buttons, E-Mails und Meldungen auf natürlichem, professionellem Deutsch.

## Arbeitsmodus
1. Prüfe zuerst das vorhandene Repository, Framework, Komponenten, Tests, Hosting-Hinweise und Projektkonventionen. Bestehende Architektur nicht ohne Grund ersetzen.
2. Audit von weiterwert.de und afb-group.de; trenne bestätigte Fakten, Annahmen und offene Fragen.
3. Erstelle kurze Umsetzungsplanung und Sitemap.
4. Implementiere danach einen funktionsfähigen, responsiven Prototyp im bestehenden Projekt. Keine reine statische Präsentation: Formzustände, Navigation, Validierung und Fehlerzustände müssen funktionieren.
5. Wenn Backend/Provider fehlen, baue klar markierte Adapter-/Mock-Schnittstellen, erfinde keine API-Endpunkte und behaupte nicht, dass echte E-Mails, KI oder Speicherung funktionieren.
6. Arbeite in kleinen Schritten, teste nach Änderungen und dokumentiere Start-/Testbefehle sowie verbleibende Risiken.

## Produktumfang

### Öffentliche Website
Sitemap: Startseite, So funktioniert die Gerätespende, Laptop spenden, Tablet spenden, Für Unternehmen/Organisationen, Gerätepartnerschaft, Wirkung, Datenschutz und Datensicherheit, FAQ, Über Weiterwert, Kontakt, Impressum, Datenschutzerklärung und ggf. Barrierefreiheitserklärung.

Primäre CTA: „Laptop oder Tablet spenden“
Sekundäre CTA: „Gerätepartnerschaft anfragen“

Behalte die bestehende Weiterwert-Markenidentität bei, soweit sie nachweisbar ist. Prüfe Logo, Farben, Typografie und Bildsprache. Falls nicht feststellbar, verwende ein zurückhaltendes, leicht austauschbares Designsystem und kennzeichne die Werte als vorläufig.

### Spendersegmente
A. Einmalige private Gerätespende
B. Einmalige Unternehmens-/Organisationsspende
C. Wiederkehrende Gerätepartnerschaft (keine automatische Annahmegarantie; jede Charge wird separat geprüft)
D. Freiwilliger Newsletter (optional, getrennte Einwilligung, nicht vorausgewählt)

Für einfache Spenden kein verpflichtendes Konto, sofern nicht nachweislich erforderlich. Keine Geldspenden oder Zahlungsdaten einbauen.

### Spendenworkflow
Baue einen mehrstufigen, persistenten und validierten Ablauf mit Zurück-Navigation, verständlichen Fehlermeldungen und Mehrgeräte-Unterstützung:

1. Einstieg: angenommene Gerätetypen, Ablauf, Erwartungen, Datensicherung und Gerätesperren erklären.
2. Geräte erfassen: nur Laptop oder Tablet; Hersteller, Modell optional, Stückzahl, Alter/Kaufjahr falls erforderlich, Funktionsstatus, Display-/Gehäusezustand, Akku/Ladegerät und Sperren soweit bekannt. Seriennummern, Fotos und Rechnungen nicht standardmäßig verlangen.
3. Vorprüfung: deterministische, versionierte Geschäftsregeln plus optionale KI-Unterstützung.
4. Kontakt/Logistik: nur notwendige Kontaktdaten und tatsächlich bestätigte Übergabeoptionen.
5. Dokumente: Datenschutzhinweise, nötige Vertrags-/Eigentumserklärungen und Datenlöschhinweise; Version und Gültigkeit anzeigen.
6. Zusammenfassung: editierbar, vor dem Absenden vollständig prüfen.
7. Absenden: serverseitige Validierung, eindeutige Vorgangsnummer, Idempotenz gegen doppelte Übermittlung und UTC-Zeitstempel.
8. Benachrichtigung: Spenderbestätigung und geschützte interne Benachrichtigung; fehlgeschlagene E-Mails dürfen die Anfrage nicht verlieren.
9. Übergabe: tatsächliche Stückzahl, Datum, Methode, Zustand, Abweichungen und verantwortliche Rolle dokumentieren.
10. Technische Prüfung: Sperren prüfen, sichere Verwahrung, autorisierte Datenlöschung, Ergebnis/Fehlschlag und Funktionstests dokumentieren.
11. Abschluss: je Gerät begründeter, zeitgestempelter Status und ggf. Abschlussnachricht.

Vorläufige Prüfergebnisse:
- „Vorläufig geeignet“
- „Weitere Angaben erforderlich“
- „Manuelle Prüfung erforderlich“
- „Nach den veröffentlichten Kriterien voraussichtlich nicht geeignet“

KI darf Angaben normalisieren, fehlende Daten erkennen und begründete Empfehlungen vorschlagen. Sie darf keine endgültige Annahme, rechtliche Eigentumsprüfung oder unkontrollierte Datenlöschung auslösen. Unklare Fälle gehen an Menschen. Bei KI-Ausfall funktioniert der manuelle Fallback.

### Dokumentation und Datenschutz
Berücksichtige DSGVO Art. 5, 6, 7, 12, 13, 25 und 32, soweit einschlägig. Keine pauschale Einwilligung für die Datenschutzerklärung verlangen. Newsletter-Einwilligung separat, freiwillig und widerrufbar.

- Datenminimierung, Zweckbindung, Rollenrechte, MFA für Admins, Verschlüsselung, Backups und Incident Response.
- Kontakt- und Gerätedaten möglichst trennen/pseudonymisieren.
- Dokumentversion, Aktion, Akteur/Rolle, UTC-Zeit, Vorgangsreferenz und Integritäts-Hash nachvollziehbar protokollieren.
- Hash/Zeitstempel sind allein keine Garantie für eine rechtlich ausreichende elektronische Signatur.
- Retention-Regeln je Datenkategorie vorsehen; konkrete Fristen erst nach rechtlicher/operativer Prüfung festlegen.
- Auftragsverarbeitung, Datenstandort, Drittlandübermittlungen und mögliche Datenschutz-Folgenabschätzung prüfen.
- Rechtstexte vor Produktivbetrieb durch qualifizierte Rechtsberatung in Deutschland prüfen lassen.
- Keine unbelegten Versprechen zertifizierter Datenlöschung, steuerlicher Vorteile oder rechtlicher Garantien.

### Interner Adminbereich
- Anfragen filtern nach Status, Datum, Segment und Gerätetyp
- Warteschlange für manuelle Prüfungen
- Geräteinventar mit interner ID
- Dokument-/Einwilligungsnachweise und Audit-Trail
- Übergabe, technische Prüfung und Datenlöschung
- E-Mail-Status, Wiederholungsversuche und Fehlerwarteschlange
- Freigegebene Annahmeregeln mit Versionierung
- Rollen/Rechte, kontrollierte Exporte und Retention-Verwaltung

Jede relevante Statusänderung muss nachvollziehbar sein; Audit-Protokolle dürfen nicht unbemerkt überschrieben werden.

## Datenmodell und Architektur
Prüfe zuerst den vorhandenen Stack. Falls keine Vorgaben bestehen, vergleiche pragmatische Optionen für Frontend/PWA, Backend, relationale Datenbank, sichere Dokumentablage, Authentifizierung, E-Mail, KI-Adapter, Job-Queue, Audit-Logging, Monitoring und Backups.

Mindestens folgende Entitäten berücksichtigen:
- DonationRequest
- DonationDevice
- PhysicalAsset
- Review
- DocumentVersion / DocumentEvidence
- ConsentRecord
- Notification
- DeviceEvent
- TechnicalCheck / ErasureEvent
- AuditEvent
- Partnership
- RetentionPolicy
- AdminUser / Role

Bevorzugt modularer Monolith plus relationale Datenbank und Hintergrund-Job-Queue, sofern der bestehende Stack nichts anderes nahelegt. Keine erfundenen API-Endpunkte oder Zugangsdaten. Provider-Integrationen über Adapter; Secrets nie im Quellcode.

Gerätestatus als kontrollierte Zustände abbilden, z. B.:
DRAFT → VALIDATING → NEEDS_INFORMATION / MANUAL_REVIEW → READY_TO_SUBMIT → SUBMITTED → INTAKE_PLANNING → PHYSICALLY_RECEIVED → TECHNICAL_REVIEW → COMPLETED / EXCEPTION.
Zusätzlich pro physischem Gerät eigene technische und abschließende Statushistorie.

## Design und Qualität
- Mobile-first, responsive, klare Hierarchie, konsistente Komponenten
- WCAG 2.2 AA als Entwicklungsziel: Tastatur, Screenreader, sichtbarer Fokus, Kontrast, zugängliche Fehler und reduzierte Bewegung
- Keine vorausgewählten optionalen Einwilligungen
- Sichere serverseitige Validierung, Rate-Limiting, CSRF/XSS/SQLi-Schutz und sichere Sitzungen
- Keine unnötigen Tracking-/Marketing-Cookies
- Keine erfundenen Wirkungszahlen oder Testimonials

## Akzeptanzkriterien
1. Gast kann eine Spende ohne verpflichtendes Konto beginnen.
2. Nur Laptop/Tablet und mehrere einzelne Geräte pro Anfrage.
3. Pflichtfelder und Validierung funktionieren verständlich.
4. KI-Ausfall führt zu sicherem manuellem Fallback.
5. Unsichere Fälle werden nicht automatisch endgültig entschieden.
6. Dokumentversionen und erforderliche Erklärungen sind nachvollziehbar.
7. Vorgangsnummer, UTC-Zeitstempel und Integritätsnachweise sind verknüpft.
8. Doppelte Übermittlung wird verhindert.
9. E-Mail-Ausfall verliert keine gespeicherte Anfrage.
10. Jedes physische Gerät erhält eine interne ID und Statushistorie.
11. Rollenrechte, Retention und Löschprozesse sind getestet.
12. Erfolgreicher Ablauf, manuelle Prüfung, Ablehnung/Ungeeignetheit, KI-Ausfall, Mail-Ausfall und technische Ausnahme sind per E2E getestet.
13. Mobile und Tastaturbedienung sind geprüft.

## Lieferreihenfolge
Phase A: Website-Audit und offene Fragen
Phase B: priorisierte Empfehlungen und Sitemap
Phase C: User Journeys und Workflow
Phase D: Datenschutz, Dokumente und Audit
Phase E: Datenmodell und Architektur
Phase F: interaktiver Responsive-Prototyp
Phase G: Backend, E-Mail, KI-Adapter und Admin
Phase H: Security, Accessibility und E2E-Tests
Phase I: Pilot, Rollout und Betrieb

## Ergebnisformat
Erstelle:
1. `README.md` mit Projektstatus, Start-/Testbefehlen und offenen Abhängigkeiten
2. `docs/PRODUCT_CONCEPT.md` – kurzes Produktkonzept und Sitemap
3. `docs/WORKFLOW.md` – Zustände, Regeln und Ausnahmen
4. `docs/PRIVACY_SECURITY.md` – Datenschutz- und Sicherheitskonzept, keine Rechtsberatung
5. `docs/ARCHITECTURE.md` – Datenmodell, Architektur und Integrationen
6. `docs/ROADMAP.md` – priorisierte MVP-Schritte, Risiken und Akzeptanzkriterien
7. Funktionsfähige UI/Prototyp-Implementierung im bestehenden Projekt

Beginne mit Repository- und Website-Audit. Nenne bestätigte Fakten, Annahmen, offene Fragen und P0-Risiken. Implementiere anschließend den kleinsten sicheren, funktionsfähigen MVP. Behaupte niemals, dass echte Backend-/E-Mail-/KI-Funktionen aktiv sind, wenn nur Mockups vorhanden sind.
```

KURZANLEITUNG:

```text
# Verwendung mit Claude Code

1. ZIP entpacken.
2. `MASTER_PROMPT.md` öffnen und den Inhalt als Aufgabe an Claude Code übergeben.
3. Claude Code im bestehenden Weiterwert-Repository starten, damit es zuerst den echten Stack und die Projektstruktur prüfen kann.
4. Änderungen schrittweise umsetzen lassen und nach jedem Schritt Tests ausführen.
5. Vor Produktivbetrieb Rechts-/Datenschutztexte, Annahmeregeln, Datenlöschung und Logistik durch Weiterwert bestätigen lassen.

**Wichtig:** Der Prompt verlangt ausdrücklich, echte Website-Fakten von Annahmen zu trennen und fehlende Integrationen nicht vorzutäuschen.
```
