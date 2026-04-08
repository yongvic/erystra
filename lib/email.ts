import nodemailer from "nodemailer";
import path from "path";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendReportEmail({
  to,
  subject,
  text,
  attachmentPath,
  attachmentName
}: {
  to: string;
  subject: string;
  text: string;
  attachmentPath?: string;
  attachmentName?: string;
}) {
  const transporter = getTransporter();
  const logoCid = "erystra-logo";
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7f9fc; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(14,42,71,0.12); border-radius: 20px; overflow: hidden;">
        <div style="padding: 24px 28px; background: linear-gradient(180deg, #0e2a47, #14395f); color: #ffffff;">
          <img src="cid:${logoCid}" alt="Logo Erystra Group" style="display:block; width: 160px; height: auto; margin-bottom: 18px;" />
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #dfb546; margin-bottom: 10px;">Erystra Group</div>
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Rapport premium social media</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.82);">Pilotage, synthese et recommandations pour l'equipe marketing.</div>
        </div>
        <div style="padding: 24px 28px; color: #11263e; line-height: 1.7; white-space: pre-line;">${text}</div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@erystra-group.com",
    to,
    subject,
    text,
    html,
    attachments: attachmentPath
      ? [
          {
            filename: "logo.png",
            path: path.join(process.cwd(), "public", "logo.png"),
            cid: logoCid
          },
          {
            filename: attachmentName || "report.pdf",
            path: attachmentPath
          }
        ]
      : [
          {
            filename: "logo.png",
            path: path.join(process.cwd(), "public", "logo.png"),
            cid: logoCid
          }
        ]
  });
}
