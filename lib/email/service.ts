import { Resend } from "resend";

import { appEnv, isEmailEnabled } from "@/lib/supabase/config";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isEmailEnabled) {
    return {
      skipped: true,
    };
  }

  const resend = new Resend(appEnv.resendApiKey);

  await resend.emails.send({
    from: appEnv.emailFrom,
    to,
    subject,
    html,
  });

  return {
    skipped: false,
  };
}

export async function sendInviteEmail({
  clientName,
  coachName,
  to,
  inviteLink,
}: {
  clientName: string;
  coachName: string;
  to: string;
  inviteLink: string;
}) {
  return sendEmail({
    to,
    subject: "Your Pure Physique coaching access link",
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d2e2d; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Your check-in app is ready</h2>
        <p>Hi ${clientName},</p>
        <p>${coachName} has set up your private Pure Physique check-in app.</p>
        <p>
          Open your private access link below to jump straight into your check-in app.
        </p>
        <p style="margin: 24px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #e8c061; color: #2d2e2d; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700;">
            Open my check-in app
          </a>
        </p>
        <p>This link is private to you. If you lose it, your coach can send a fresh access link.</p>
      </div>
    `,
  });
}

export async function sendDailyReminderEmail({
  clientName,
  to,
  checkInLink,
}: {
  clientName: string;
  to: string;
  checkInLink: string;
}) {
  return sendEmail({
    to,
    subject: "Your daily Pure Physique check-in",
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d2e2d; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Quick check-in reminder</h2>
        <p>Hi ${clientName},</p>
        <p>Your coach is ready for today’s update. Keep it under a minute and keep the streak alive.</p>
        <p style="margin: 24px 0;">
          <a href="${checkInLink}" style="display: inline-block; background: #e8c061; color: #2d2e2d; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700;">
            Complete today&apos;s check-in
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendMissedDayNudgeEmail({
  clientName,
  to,
  checkInLink,
}: {
  clientName: string;
  to: string;
  checkInLink: string;
}) {
  return sendEmail({
    to,
    subject: "Reset today with one quick check-in",
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d2e2d; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">No catch-up needed</h2>
        <p>Hi ${clientName},</p>
        <p>If yesterday slipped, ignore it and reset with one fast check-in today.</p>
        <p style="margin: 24px 0;">
          <a href="${checkInLink}" style="display: inline-block; background: #e8c061; color: #2d2e2d; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700;">
            Reset with today&apos;s check-in
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendWeeklySummaryEmail({
  clientName,
  to,
  summaryText,
}: {
  clientName: string;
  to: string;
  summaryText: string;
}) {
  return sendEmail({
    to,
    subject: "Your weekly Pure Physique summary",
    html: `
      <div style="font-family: Arial, sans-serif; color: #2d2e2d; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Weekly summary</h2>
        <p>Hi ${clientName},</p>
        <p>${summaryText}</p>
        <p>Keep next week simple: hit protein, log steps, and keep the daily habit moving.</p>
      </div>
    `,
  });
}
