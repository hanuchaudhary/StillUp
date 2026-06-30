import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "StillUp Alert Support <alert@system.kushchaudhary.com>";

interface DownAlertData {
  monitorName: string;
  monitorUrl: string;
  downRegions: string[];
  timestamp: Date;
}

interface RecoveryAlertData {
  monitorName: string;
  monitorUrl: string;
  timestamp: Date;
}

function getDownEmailHtml(data: DownAlertData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #fff7f7; font-family: 'Segoe UI', Tahoma, sans-serif; color: #171717; }
    .wrapper { background: #fff7f7; padding: 30px 16px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #fecaca; }
    .header { background: #ffffff; padding: 22px 24px 20px; border-top: 3px solid #dc2626; border-bottom: 1px solid #fecdd3; }
    .kicker { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #dc2626; }
    .title { margin: 8px 0 6px; font-size: 28px; line-height: 1.12; letter-spacing: -0.03em; color: #171717; }
    .subtitle { margin: 0; font-size: 14px; line-height: 1.55; color: #525252; }
    .content { padding: 22px 24px 24px; }
    .monitor-name { margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #404040; }
    .info-card { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 12px 14px; margin-bottom: 18px; }
    .info-row { display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid #fecdd3; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #b91c1c; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .info-value { color: #171717; font-size: 13px; font-weight: 500; text-align: right; }
    .regions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
    .region-tag { background: #fee2e2; color: #b91c1c; border: 1px solid #fecdd3; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .message { color: #737373; font-size: 13px; line-height: 1.6; margin: 14px 0 0; }
    .cta-button { display: inline-block; margin-top: 4px; background: #c46849; color: #ffffff !important; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 14px 24px 20px; border-top: 1px solid #fecdd3; }
    .footer-text { color: #737373; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <p class="kicker">StillUp Notification</p>
        <h1 class="title">Service Down</h1>
        <p class="subtitle">Immediate attention required</p>
      </div>
      <div class="content">
        <p class="monitor-name"><strong>${data.monitorName}</strong> is failing health checks and needs your attention.</p>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">URL</span>
            <span class="info-value">${data.monitorUrl}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Failed Regions</span>
            <div class="regions">
              ${data.downRegions.map((r) => `<span class="region-tag">${r}</span>`).join("")}
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">Detected At</span>
            <span class="info-value">${data.timestamp.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        </div>
        <a href="https://stillup.sh/dashboard" class="cta-button">Open Incident Dashboard</a>
        <p class="message">Your monitor has been failing in <strong>${data.downRegions.length} region(s)</strong> for 2 consecutive checks. Please investigate immediately to minimize downtime.</p>
      </div>
      <div class="footer">
        <p class="footer-text">Reliable uptime monitoring for your services</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getRecoveryEmailHtml(data: RecoveryAlertData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #fafafa; font-family: 'Segoe UI', Tahoma, sans-serif; color: #171717; }
    .wrapper { background: #fafafa; padding: 30px 16px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e5e5; }
    .header { background: #ffffff; padding: 22px 24px 20px; border-top: 3px solid #c46849; border-bottom: 1px solid #e5e5e5; }
    .kicker { margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #c46849; }
    .title { margin: 8px 0 6px; font-size: 28px; line-height: 1.12; letter-spacing: -0.03em; color: #171717; }
    .subtitle { margin: 0; font-size: 14px; line-height: 1.55; color: #525252; }
    .content { padding: 22px 24px 24px; }
    .monitor-name { margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #404040; }
    .info-card { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 12px 14px; margin-bottom: 18px; }
    .info-row { display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #737373; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .info-value { color: #171717; font-size: 13px; font-weight: 500; text-align: right; }
    .status-badge { background: #f5f5f5; color: #404040; border: 1px solid #e5e5e5; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; display: inline-block; }
    .message { color: #737373; font-size: 13px; line-height: 1.6; margin: 14px 0 0; }
    .cta-button { display: inline-block; margin-top: 4px; background: #c46849; color: #ffffff !important; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 14px 24px 20px; border-top: 1px solid #e5e5e5; }
    .footer-text { color: #737373; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <p class="kicker">StillUp Notification</p>
        <h1 class="title">Service Recovered</h1>
        <p class="subtitle">Everything is back to normal</p>
      </div>
      <div class="content">
        <p class="monitor-name"><strong>${data.monitorName}</strong> is healthy again across your configured regions.</p>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">URL</span>
            <span class="info-value">${data.monitorUrl}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="status-badge">Operational</span>
          </div>
          <div class="info-row">
            <span class="info-label">Recovered At</span>
            <span class="info-value">${data.timestamp.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        </div>
        <a href="https://stillup.sh/dashboard" class="cta-button">View Live Metrics</a>
        <p class="message">Great news! Your monitor is responding normally across all regions. No further action is required.</p>
      </div>
      <div class="footer">
        <p class="footer-text">Reliable uptime monitoring for your services</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendDownAlert(
  to: string,
  data: DownAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🚨 ${data.monitorName} is DOWN`,
      html: getDownEmailHtml(data),
    });
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to send down alert:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendRecoveryAlert(
  to: string,
  data: RecoveryAlertData
): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✅ ${data.monitorName} is back UP`,
      html: getRecoveryEmailHtml(data),
    });
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to send recovery alert:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
