import nodemailer from "nodemailer";

import { DEFAULT_FROM_EMAIL } from "@/lib/constants";

export async function sendEmail(opts: { to?: string | null; subject: string; html: string }) {
  if (!opts.to) return;
  const host = process.env.HOSTINGER_SMTP_HOST;
  const port = Number(process.env.HOSTINGER_SMTP_PORT ?? "587");
  const user = process.env.HOSTINGER_SMTP_USER;
  const pass = process.env.HOSTINGER_SMTP_PASS;
  if (!host || !user || !pass) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const from = process.env.HOSTINGER_SMTP_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
}
