'use server';

import { createHash } from 'node:crypto';
import { ERKLAERUNGEN, leseAnfrage } from '@/lib/absenden/anfrage';
import { mailKonfiguriert, mailText, sendeMail } from '@/lib/absenden/mail';
import { waehleSpeicher } from '@/lib/absenden/speicher';
import { pruefe } from '@/lib/vorpruefung/pruefe';

export type Antwort = { ok: true; vorgangsnummer: string } | { ok: false; fehler: string };

const ERKLAERUNG_HASH = createHash('sha256').update(`${ERKLAERUNGEN.eigentum}\n${ERKLAERUNGEN.daten}`).digest('hex');
const TECHNIK = 'Ihre Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut oder schreiben Sie uns an weiterwert@gmail.com.';

/** Public endpoint: everything from the browser is re-checked here. */
export async function sendeAnfrage(eingabe: unknown): Promise<Antwort> {
  const speicher = waehleSpeicher();
  if (!speicher) return { ok: false, fehler: TECHNIK };

  const gelesen = leseAnfrage(eingabe);
  if (!gelesen.ok) return gelesen;
  const a = gelesen.anfrage;
  if (a.website) return { ok: false, fehler: TECHNIK };

  // Same rules as in the browser; a device rated not suitable is never accepted.
  const geraete = a.geraete.map((g) => ({ eingabe: g, r: pruefe(g) }));
  if (geraete.some((g) => g.r.ergebnis === 'nichtGeeignet')) {
    return { ok: false, fehler: 'Mindestens ein Gerät ist nach unseren Kriterien nicht geeignet. Bitte entfernen Sie es aus der Liste.' };
  }

  try {
    const gespeichert = await speicher.speichere({
      idempotency_key: a.idempotencyKey,
      kontakt: a.kontakt,
      regel_version: geraete[0].r.regelVersion,
      erklaerung_version: ERKLAERUNGEN.version,
      erklaerung_hash: ERKLAERUNG_HASH,
      mail_to: process.env.MAIL_TO ?? null,
      geraete: geraete.map(({ eingabe, r }) => ({
        typ: eingabe.typ, marke: eingabe.marke, modell: eingabe.modell, angaben: eingabe, ergebnis: r.ergebnis, gruende: r.gruende,
      })),
    });

    // The request is saved; a failed notice is recorded in the outbox and must not fail the request.
    if (gespeichert.neu && gespeichert.outboxId && mailKonfiguriert()) {
      let gesendet = false;
      try {
        await sendeMail(`Neue Spendenanfrage ${gespeichert.vorgangsnummer}`, mailText(gespeichert.vorgangsnummer, a.kontakt, geraete));
        gesendet = true;
      } catch (e) {
        console.error('Benachrichtigung fehlgeschlagen', gespeichert.vorgangsnummer, e);
        await speicher.markiere(gespeichert.outboxId, false, String(e).slice(0, 500)).catch(() => {});
      }
      // Kept apart so a failed status update never marks a delivered mail as failed.
      if (gesendet) await speicher.markiere(gespeichert.outboxId, true, null).catch((e) => console.error('Outbox-Status', e));
    }
    return { ok: true, vorgangsnummer: gespeichert.vorgangsnummer };
  } catch (e) {
    console.error('Speichern fehlgeschlagen', e);
    return { ok: false, fehler: TECHNIK };
  }
}
