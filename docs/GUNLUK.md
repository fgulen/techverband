# WeiterWert – çalışma günlüğü

## 2026-10-22

**Planlama**
- `MASTER_PROMPT.md` ve `KURZANLEITUNG.md` tasarım belgesine aktarıldı (`docs/superpowers/specs/2026-10-22-weiterwert-plattform-design.md`, ek A), sonra silindi.
- Fatih'in kararları:
  - Proje adı: „WeiterWert – n.e.V. Gründungs- und Betriebsbereitschaft“; başvuru 2027'de.
  - Hesap zorunlu değil; status bildirimi ve newsletter ayrı ayrı sorulur, işaretsiz gelir.
  - Teslim: sadece „Übergabe nach Absprache“ aktif, diğerleri „demnächst“.
  - Admin-MVP Faz 3'te.
  - Bağış akışı ve hukuk metinleri sadece Almanca.
  - Yedekleme şimdilik yok; Faz 8 öncesi tekrar konuşulacak.
  - Motto: „Technik weitergeben. Chancen eröffnen.“
  - Bağış sitesinde „test“ adı ya da bandı olmayacak.
- Uygulama planı: `docs/superpowers/plans/2026-10-22-faz0-faz1-hukuk-ve-iskelet.md`. Kısaltılarak uygulandı; Task 7 (i18n) ve 10. adımın bir kısmı kaldı.

**Canlı site (weiterwert.de, `index.html`)**
- Yeni motto başlıkta. Spendenbeleg metni: „Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt“.
- Kaldırılan vaatler: taşıma, „unwiederbringlich löschen + dokumentieren“, LOGO yer tutucuları.
- Inter fontu artık kendi sunucumuzdan geliyor (latin + latin-ext); Google Fonts'a bağlantı yok.
- `impressum.html` ve `datenschutz.html` hazır ama ⟦FEHLT⟧ alanları var. Bu yüzden ne linkleniyor ne yayınlanıyor; bunu test zorunlu kılıyor.
- `.vercelignore` sadece `index.html` ve `assets/` dosyalarını yayınlıyor.
- Üç bağış butonu → https://spenden.weiterwert.de/spenden

**Bağış uygulaması (`platform/`, Next.js 16)**
- https://spenden.weiterwert.de: Vercel projesi `weiterwert-platform`, fra1 bölgesi, `NEXT_PUBLIC_APP_ENV=production`, şifresiz. Git'e bağlı değil; CLI ile `vercel deploy --prod`.
- Supabase projesi `weiterwert` (eu-central-1). `/api/health` → `db: up`.
- `/spenden`: cihaz ön kontrolü (kurallar `src/lib/vorpruefung/pruefe.ts`, Annahmekriterien v0.1). 🔴 sadece şişmiş batarya ve leasing durumunda verilir; diğer şüpheli durumlar 🟡. Hiçbir veri kaydedilmiyor.
- Basic Auth sadece Vercel önizlemelerinde ve kimlik bilgisi ayarlı ortamlarda.

**Testler:** kök `npm run test:static` (18), `platform/` içinde `npx vitest run` (29) ve `npx playwright test` (20).

**Review:**
- Faz 0/1 dalı bağımsız incelendi (opus). 2 önemli bulgu düzeltildi.
- Sonraki 7 commit `/code-review` ile incelendi (aşağıda).

**Açık işler (Fatih)**
1. Impressum bilgileri: ad, adres, telefon.
2. Vercel AVV: Hobby planında DPA yok gibi görünüyor. Seçenekler: Pro'ya geçmek ya da Alman bir hosting firması.
3. Ana sitede „Computer, Tablet oder Telefon“ metni bağış sayfasıyla çelişiyor (telefon kabul edilmiyor). Karar bekliyor.
4. Supabase AVV'si dashboard'dan imzalanacak; kayıt ve veri saklama başlamadan önce gerekli.

**Sıradaki:** iletişim + gönderme adımı (Faz 2 devamı). Ön koşul: Impressum/Datenschutz tamam ve AVV'ler imzalı.

**Kapanış review'ı (`/code-review 4c7d1a7..HEAD`, medium):** 10 aday bulgu.
- Düzeltilenler:
  - Bilinmeyen batarya, ekran ve kilit durumu artık „uygun“ sayılmıyor.
  - 🔴 cihaz listeye eklenemiyor.
  - Yaş kuralları cihaz türüne göre ayrıldı: Windows 11 sadece laptoplarda, Chromebook'ta AUE kontrolü 4 yıldan itibaren.
  - Boş hukuk sayfaları üretimde 404.
  - `.btn` sıfırlaması sadece `button`'a uygulanıyor.
- Bilerek bırakılanlar:
  - İki sitede de Impressum/Datenschutz yok (Fatih'in bilgileri bekleniyor).
  - Gönderme adımı yok; sayfada e-posta yolu var.
  - Test ortamı taslakları açıkta (test alan adı kaldırıldı).
  - `requiresAuth` sadece kullanıcı adına bakıyor.
  - Health endpoint'te cache yok ve URL sonundaki `/` sorun çıkarabilir.
  - `mailSpendSubject` ve footer `.nav` kullanılmayan kod olarak duruyor.

## 2026-10-23 / 24

**Hukuk sayfaları (weiterwert.de)**
- Fatih'in kararı: hukuk sayfaları eksik alanlarla yayına alınacak. Eksik alanlar mavi „… – wird ausgefüllt“ (`<span class="tbd">`) ile gösteriliyor.
- `impressum.html`, `datenschutz.html` ve yeni `barrierefreiheit.html` yayında. Footer'da „Rechtliches“ sütunu var; spenden.weiterwert.de footer'ı da bu sayfalara link veriyor.
- Cookie-Einstellungen ve KI sayfası **yok**: sitelerde cookie de KI de yok. Datenschutz bunu açıkça söylüyor.
- `npm run test:deploy-gate` açık alanları listeler (bilerek kırmızı).
- Supabase DPA kullanım koşullarına dahil, ayrıca imza gerekmiyor; SCC 2021/914 içeriyor. Bu Datenschutz'a yazıldı.
- opencode'un `…Compliance_Paket_V1.docx.md` dosyasında yaptığı düzenlemeler Haiku ile kontrol edildi. Fatih dokümanın düzeltilmesini istemedi; dosya git dışında.

**Ana sayfa:** „Computer, Tablets und Telefone“ → „Laptops und Tablets“ (DE+TR, meta açıklama dahil). Hero butonu „Laptop oder Tablet spenden“ (tek buton, Fatih'in kararı).

**Bağış sihirbazı (`/spenden`)**
- En üstte Laptop | Tablet toggle'ı var; seçili olan lacivert. Tablet seçilince sadece iPad/Android gösteriliyor ve RAM sorusu gizleniyor. Toggle değişince uyumsuz cevaplar sıfırlanıyor.
- Adımlar „Schritt X von 6“ ilerleme çubuğuyla gösteriliyor: Gerät · Zustand · Konten und Eigentum · Ergebnis · Kontakt · Absenden. Sonra Danke ekranında Vorgangsnummer `WW-YYYY-NNNNNN`.
- Gönderme yalnızca sunucuda `SUPABASE_SECRET_KEY` varsa açık. Yoksa üretim 4 adımda kalıyor ve e-posta yolunu gösteriyor. Test ortamı her zaman bellek içi deposu kullanıyor, gerçek veritabanına yazmıyor.
- Sunucu tarafında yapılanlar:
  - Tüm alanlar tekrar doğrulanıyor ve `pruefe` yeniden çalışıyor (🔴 reddediliyor).
  - En fazla 10 cihaz kabul ediliyor.
  - Honeypot alanı var.
  - Idempotency anahtarı kullanılıyor; içerik değişirse yeni anahtar üretiliyor.
  - Kayıt `submit_donation` security-definer fonksiyonu ile yapılıyor. RLS açık; anon ve authenticated için erişim kapalı (401 ile doğrulandı).
- SQL dosyası: `platform/supabase/migrations/20261024_spendenanfrage.sql`. 2026-10-24'te Chrome üzerinden çalıştırıldı.
- Supabase'de `spenden_vercel` adlı secret key oluşturuldu ve Vercel'e sadece Production için eklendi. Değer panodan aktarıldı, sohbete yazılmadı.
- Canlı test: WW-2026-404642 kaydedildi, doğrulandı, silindi.
- E-posta: Gmail SMTP (`MAIL_*`) kodda hazır ama ayarlanmadı. Outbox satırları `pending` kalıyor. **Not (Fatih):** mail bağlantısı için **Resend** düşünülecek (Vercel Marketplace). Değişen tek dosya `platform/src/lib/absenden/mail.ts` olur; Datenschutz'a da eklenmesi gerekir.

**Testler:** kök `npm run test:static` (20), `platform/`: vitest 42, playwright 35. Mobil kontrol 320 px, iPhone 13 ve Pixel 7'de her adım için yapıldı; hata, özet, Danke ve 10-cihaz ekranları dahil.

**Kapanış review'ı (`/code-review 47a457a..HEAD`, medium):** 10 bulgu.
- Düzeltilenler:
  - Kayıp yanıttan sonra düzeltilip tekrar gönderilen istek eski numarayı alıyor ve düzeltme kayboluyordu. Artık anahtar içeriğe bağlı.
  - Eski iPad'lerde `crypto.randomUUID` yok; yedek UUID üretimi eklendi.
  - 10 cihaz sınırı artık sayfada görünüyor ve buton pasif oluyor.
  - Gönderilmiş mail, outbox güncellemesi hata verirse „failed“ işaretlenmiyor.
  - UUID kalıbı sıkılaştırıldı.
  - Eski JWT anahtarı için Bearer başlığı ekleniyor.
  - Kullanılmayan `.dot` CSS'i silindi.
- Bilerek bırakılanlar:
  - **Hız sınırı yok.** Form duyurulmadan önce Vercel Firewall'da `/spenden` POST için sınır konmalı.
  - Vorgangsnummer çakışması (1/1.000.000, aynı anda) teknik hata verir; SQL tekrar çalıştırılmadan düzeltilmedi.
  - Gönderme modu build anında sabitleniyor: anahtar değişince redeploy gerekir.
  - Outbox'ı tekrar deneyen bir iş yok.
  - `WERTE` listesi types/FRAGEN ile ikinci kez tanımlı.

**Açık işler (Fatih)**
1. Impressum: adres, temsilci adı, telefon (sayfada mavi).
2. E-posta bildirimi: Gmail uygulama şifresi ya da Resend. O zamana kadar yeni bağışlar sadece Supabase → `donation_request` tablosunda görünüyor.
3. Vercel AVV (Hobby planı) hâlâ açık.
4. test.weiterwert.de proje domain listesinden silinmeli (`vercel api -X DELETE … --dangerously-skip-permissions`).
5. Duyurmadan önce Vercel Firewall'da hız sınırı.

**Sıradaki:** e-posta bağlantısı (Resend), ardından Faz 3 Admin-MVP (gelen bağışların listesi).
