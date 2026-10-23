import nodemailer from 'nodemailer';
import { ERGEBNIS_TEXT, type Pruefergebnis, type GeraetEingabe } from '@/lib/vorpruefung/types';
import type { Kontakt } from './anfrage';

/** Internal notice to WeiterWert via Gmail SMTP (app password). Off until MAIL_USER, MAIL_PASSWORD and MAIL_TO are set. */
export function mailKonfiguriert(): boolean {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_PASSWORD && process.env.MAIL_TO);
}

export function mailText(nr: string, kontakt: Kontakt, geraete: { eingabe: GeraetEingabe; r: Pruefergebnis }[]): string {
  const zeilen = [
    `Neue Spendenanfrage ${nr}`,
    '',
    `Name: ${kontakt.name}`,
    `E-Mail: ${kontakt.email}`,
    `PLZ: ${kontakt.plz}`,
    kontakt.telefon ? `Telefon: ${kontakt.telefon}` : null,
    kontakt.organisation ? `Organisation: ${kontakt.organisation}` : null,
    '',
    ...geraete.flatMap(({ eingabe, r }, i) => [
      `Gerät ${i + 1}: ${[eingabe.typ, eingabe.marke, eingabe.modell].filter(Boolean).join(' / ')}`,
      `  Vorprüfung: ${ERGEBNIS_TEXT[r.ergebnis]}`,
      ...r.gruende.map((g) => `  - ${g}`),
    ]),
  ];
  return zeilen.filter((z) => z !== null).join('\n');
}

export async function sendeMail(betreff: string, text: string): Promise<void> {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
  });
  await transport.sendMail({ from: process.env.MAIL_USER, to: process.env.MAIL_TO, subject: betreff, text });
}
