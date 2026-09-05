import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Barba&Cia <onboarding@resend.dev>";

/**
 * Sem RESEND_API_KEY (comum em dev local) a gente só loga no console em vez
 * de derrubar o fluxo principal — cadastro/aprovação/lead nunca podem falhar
 * por causa do e-mail.
 */
async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email] (RESEND_API_KEY ausente, só logando) para=${to} assunto="${subject}"`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] falha ao enviar", err);
  }
}

export async function sendSignupConfirmationEmail(to: string, businessName: string) {
  await send(
    to,
    "Recebemos seu cadastro — Barba&Cia",
    `<p>Olá!</p>
     <p>Recebemos o cadastro de <strong>${businessName}</strong> e ele já está em análise
     de verificação. Assim que for aprovado, seu perfil aparece publicamente no diretório.</p>`
  );
}

export async function sendVerificationStatusEmail(
  to: string,
  businessName: string,
  status: "verificado" | "rejeitado"
) {
  const isApproved = status === "verificado";
  await send(
    to,
    isApproved ? "Seu cadastro foi aprovado — Barba&Cia" : "Seu cadastro não foi aprovado — Barba&Cia",
    isApproved
      ? `<p>Boas notícias! O cadastro de <strong>${businessName}</strong> foi verificado e já
         está visível publicamente no diretório.</p>`
      : `<p>O cadastro de <strong>${businessName}</strong> não foi aprovado na verificação.
         Se quiser entender o motivo ou reenviar, responda este e-mail.</p>`
  );
}

export async function sendNewLeadEmail(
  to: string,
  businessName: string,
  clientName: string,
  clientPhone: string
) {
  await send(
    to,
    `Novo lead para ${businessName} — Barba&Cia`,
    `<p>Você recebeu uma nova solicitação de contato em <strong>${businessName}</strong>:</p>
     <p>${clientName} — ${clientPhone}</p>
     <p>Acesse o painel de leads para ver os detalhes e responder.</p>`
  );
}
