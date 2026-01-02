import { Resend } from "resend";

type VerificationEmailPayload = {
  user: {
    email: string;
    name?: string | null;
  };
  url: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

export const sendVerificationEmail = async ({ user, url }: VerificationEmailPayload) => {
  if (!resendApiKey || !resendFrom) {
    console.info(`[auth] Verify ${user.email}: ${url}`);
    return;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: resendFrom,
    to: user.email,
    subject: "Verify your email",
    text: `Click the link to verify your email: ${url}`,
  });
};
