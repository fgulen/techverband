// Annahmekriterien v0.1 (Entwurf) — spec §6. Targets, not hard rejections; to be confirmed by the technical team.
// Kept as data so the Faz 2 rule engine can read the same source the public page shows.

export const KRITERIEN_VERSION = 'v0.1';

export type KriterienZeile = { kriterium: string; geeignet: string; pruefung: string; nichtGeeignet?: string };
export type KriterienTabelle = { geraet: string; zeilen: KriterienZeile[] };

export const KRITERIEN: KriterienTabelle[] = [
  {
    geraet: 'Laptop (Windows/Linux)',
    zeilen: [
      { kriterium: 'Prozessor', geeignet: 'Für Windows 11 freigegeben (etwa Intel Core ab 8. Generation, AMD Ryzen ab 2000)', pruefung: 'Ältere oder leistungsschwache Prozessoren (Celeron, Pentium N, Atom)' },
      { kriterium: 'Arbeitsspeicher', geeignet: 'mindestens 8 GB', pruefung: '4 GB, wenn aufrüstbar', nichtGeeignet: '4 GB fest verlötet (nach Modellprüfung)' },
      { kriterium: 'Speicher', geeignet: 'mindestens 256 GB SSD', pruefung: '128 GB SSD oder Festplatte ausgebaut', nichtGeeignet: 'eMMC mit 64 GB oder weniger' },
      { kriterium: 'Betriebssystem', geeignet: 'Unterstütztes, sicheres System (Windows 11 kompatibel)', pruefung: 'Upgrade oder anderes System nötig' },
      { kriterium: 'Display', geeignet: 'ab 13 Zoll, funktionsfähig', pruefung: 'kleiner Riss, reparierbar' },
      { kriterium: 'Akku', geeignet: 'hält Ladung, nicht gebläht (Ziel: mind. 70 % Kapazität)', pruefung: 'geringe Kapazität', nichtGeeignet: 'gebläht, beschädigt oder überhitzt' },
      { kriterium: 'Anschlüsse, Kamera, Mikrofon', geeignet: 'WLAN, USB, Laden, Kamera und Mikrofon funktionieren', pruefung: 'reparierbarer Defekt' },
    ],
  },
  {
    geraet: 'Chromebook',
    zeilen: [
      { kriterium: 'Update-Ende (AUE)', geeignet: 'mindestens 2 Jahre in der Zukunft', pruefung: 'weniger als 2 Jahre', nichtGeeignet: 'bereits abgelaufen' },
      { kriterium: 'Verwaltung', geeignet: 'nicht in einer Organisation registriert', pruefung: 'Registrierung noch nicht entfernt' },
    ],
  },
  {
    geraet: 'MacBook',
    zeilen: [
      { kriterium: 'macOS', geeignet: 'Modell erhält aktuelles macOS', pruefung: 'nur noch ältere Sicherheitsupdates' },
      { kriterium: 'Sperren', geeignet: 'Aktivierungssperre entfernbar', pruefung: 'Firmware-Passwort unklar', nichtGeeignet: 'Aktivierungssperre nicht entfernbar' },
    ],
  },
  {
    geraet: 'Android-Tablet',
    zeilen: [
      { kriterium: 'Arbeitsspeicher / Speicher', geeignet: 'mindestens 4 GB / 64 GB', pruefung: '3 GB / 32 GB' },
      { kriterium: 'Updates', geeignet: 'erhält Sicherheitsupdates, 64-Bit', pruefung: 'Support endet bald' },
      { kriterium: 'Display', geeignet: 'ab 9 Zoll', pruefung: 'kleiner, aber funktionsfähig' },
      { kriterium: 'Sperren', geeignet: 'Google-Konto entfernt', pruefung: 'SIM- oder Netzsperre', nichtGeeignet: 'Google-Kontosperre (FRP) oder Geräteverwaltung nicht entfernbar' },
    ],
  },
  {
    geraet: 'iPad',
    zeilen: [
      { kriterium: 'iPadOS', geeignet: 'Modell erhält aktuelles iPadOS (wird bei Annahme erneut geprüft)', pruefung: 'nur noch ältere Sicherheitsversion' },
      { kriterium: 'Speicher', geeignet: 'mindestens 64 GB', pruefung: '32 GB' },
      { kriterium: 'Sperren', geeignet: 'Aktivierungssperre entfernbar', pruefung: 'Status unklar', nichtGeeignet: 'Aktivierungssperre nicht entfernbar' },
    ],
  },
];

export const FUER_ALLE_GERAETE = [
  'Geblähte, beschädigte oder überhitzende Akkus: bitte nicht versenden und nicht bringen.',
  'Konten, Firmen-Verwaltung (zum Beispiel Autopilot, Intune, Apple Business Manager) und BIOS-Passwörter müssen vor der Übergabe entfernt werden.',
  'Geleaste Geräte können wir nicht annehmen. Das Gerät muss Ihnen gehören.',
  'Fehlt das Ladegerät, nehmen wir das Gerät trotzdem gern an.',
  'Wenn Sie etwas nicht wissen, prüfen wir es für Sie. Fehlende Angaben führen nie zu einer Ablehnung.',
];
