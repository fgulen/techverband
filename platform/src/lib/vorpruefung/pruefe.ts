import { KRITERIEN_VERSION } from '@/lib/annahmekriterien';
import type { Ergebnis, GeraetEingabe, Pruefergebnis } from './types';

// Deterministic pre-check after Annahmekriterien v0.1 (spec §6). Only certain findings reject;
// anything uncertain goes to a person. The final decision is always made after the physical check.
const RANG: Record<Ergebnis, number> = { geeignet: 0, angaben: 1, manuell: 2, nichtGeeignet: 3 };

export function pruefe(e: GeraetEingabe): Pruefergebnis {
  const befunde: { stufe: Ergebnis; grund: string }[] = [];
  const add = (stufe: Ergebnis, grund: string) => befunde.push({ stufe, grund });

  if (e.akku === 'gebläht') add('nichtGeeignet', 'Geblähter oder beschädigter Akku: Brandgefahr. Bitte das Gerät nicht versenden und nicht bringen, sondern beim Wertstoffhof abgeben.');
  if (e.eigentum === 'leasing') add('nichtGeeignet', 'Geleaste Geräte gehören dem Leasinggeber und können wir nicht annehmen.');

  if (e.startet === 'nein') add('manuell', 'Das Gerät startet nicht. Wir prüfen, ob sich eine Reparatur lohnt.');
  if (e.alter === '7-9') add('manuell', e.typ === 'chromebook'
    ? 'Bei älteren Chromebooks prüfen wir das Update-Ende (AUE) des Modells.'
    : 'Ältere Geräte prüfen wir einzeln, zum Beispiel ob Windows 11 oder ein aktuelles System unterstützt wird.');
  if (e.alter === '10+') add('manuell', 'Geräte ab etwa 10 Jahren erfüllen die Kriterien oft nicht mehr. Wir prüfen das Modell einzeln.');
  if (e.display === 'schaden') add('manuell', 'Display-Schaden: Wir prüfen, ob eine Reparatur wirtschaftlich ist.');
  if (e.akku === 'schwach') add('manuell', 'Schwacher Akku: Wir prüfen, ob ein Austausch nötig ist.');
  if (e.sperren === 'konto') add('manuell', 'Bitte melden Sie alle Konten ab (z. B. Microsoft, Apple-ID, Google) und entfernen Sie Passwörter vor der Übergabe.');
  if (e.sperren === 'firma') add('manuell', 'Firmen-Verwaltung (z. B. Autopilot, Intune, MDM) muss vor der Übergabe durch Ihre IT entfernt werden.');
  if (e.ram === '4') add('manuell', '4 GB Arbeitsspeicher: Wir prüfen, ob sich der Speicher aufrüsten lässt.');

  if (e.typ === 'unbekannt') add('angaben', 'Gerätetyp unbekannt. Das ist kein Problem, wir schauen es uns an.');
  if (e.alter === 'unbekannt') add('angaben', 'Alter unbekannt. Eine grobe Schätzung hilft uns weiter.');
  if (e.startet === 'unbekannt') add('angaben', 'Unbekannt, ob das Gerät startet. Wir testen es.');
  if (e.eigentum === 'unbekannt') add('angaben', 'Bitte klären Sie vor der Übergabe, ob das Gerät Ihnen gehört (nicht geleast).');

  const ergebnis = befunde.reduce<Ergebnis>((max, b) => (RANG[b.stufe] > RANG[max] ? b.stufe : max), 'geeignet');
  // Show only the reasons that decided the result, strongest level first.
  const gruende = befunde.filter((b) => b.stufe === ergebnis).map((b) => b.grund);
  return { ergebnis, gruende, regelVersion: KRITERIEN_VERSION };
}
