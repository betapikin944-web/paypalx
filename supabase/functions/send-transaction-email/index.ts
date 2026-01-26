import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionEmailRequest {
  to_email: string;
  amount: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  transaction_id: string;
  date_time: string;
  receipt_url: string;
  is_sender: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📧 Transaction email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TransactionEmailRequest = await req.json();
    console.log("📧 Email request received:", JSON.stringify(body, null, 2));

    const { to_email, amount, sender_name, sender_email, receiver_name, receiver_email, transaction_id, date_time, receipt_url, is_sender } = body;

    if (!to_email) {
      throw new Error("Missing recipient email address");
    }

    const subject = is_sender 
      ? `Payment Sent: $${amount} to ${receiver_name}`
      : `Payment Received: $${amount} from ${sender_name}`;

    const actionText = is_sender ? "sent" : "received";
    const otherParty = is_sender ? receiver_name : sender_name;
    const otherEmail = is_sender ? receiver_email : sender_email;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 500px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">PayPro</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Transaction Receipt</p>
            </td>
          </tr>
          
          <!-- Amount -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align: center;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">You ${actionText}</p>
              <p style="margin: 0; color: ${is_sender ? '#ef4444' : '#22c55e'}; font-size: 42px; font-weight: 700;">
                ${is_sender ? '-' : '+'}$${amount}
              </p>
            </td>
          </tr>
          
          <!-- Transaction Details -->
          <tr>
            <td style="padding: 16px 32px 32px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #71717a; font-size: 13px;">${is_sender ? 'To' : 'From'}</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          <span style="color: #18181b; font-size: 14px; font-weight: 500;">${otherParty}</span><br>
                          <span style="color: #71717a; font-size: 12px;">${otherEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #71717a; font-size: 13px;">Date</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          <span style="color: #18181b; font-size: 14px;">${date_time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #71717a; font-size: 13px;">Transaction ID</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <span style="color: #18181b; font-size: 12px; font-family: monospace;">${transaction_id.slice(0, 8)}...</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${receipt_url}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Transaction History</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                This is an automated notification from PayPro.<br>
                © ${new Date().getFullYear()} PayPro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    console.log(`📧 Sending email to: ${to_email}`);
    console.log(`📧 Subject: ${subject}`);

    const emailResponse = await resend.emails.send({
      from: "PayPro <service@paypro1.site>",
      to: [to_email],
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
