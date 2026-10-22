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
