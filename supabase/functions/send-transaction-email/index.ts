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

    const plainTextContent = `
PayPro Transaction Receipt

You ${actionText} $${amount}

${is_sender ? 'To' : 'From'}: ${otherParty} (${otherEmail})
Date: ${date_time}
Transaction ID: ${transaction_id}

View your transaction history: ${receipt_url}

This is an automated notification from PayPro.
© ${new Date().getFullYear()} PayPro. All rights reserved.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayPro Transaction Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'PayPal Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 520px; border-collapse: collapse;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #003087 0%, #0070BA 100%); width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle; box-shadow: 0 4px 12px rgba(0, 48, 135, 0.25);">
                    <span style="color: #ffffff; font-size: 28px; font-weight: 800; font-family: 'PayPal Sans', -apple-system, BlinkMacSystemFont, sans-serif;">P</span>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="color: #003087; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; font-family: 'PayPal Sans', -apple-system, BlinkMacSystemFont, sans-serif;">Pay</span><span style="color: #0070BA; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; font-family: 'PayPal Sans', -apple-system, BlinkMacSystemFont, sans-serif;">Pro</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 48, 135, 0.08);">
                
                <!-- Status Banner -->
                <tr>
                  <td style="padding: 28px 32px 20px; text-align: center; border-bottom: 1px solid #e8ecf0;">
                    <div style="display: inline-block; background: ${is_sender ? '#fef2f2' : '#ecfdf5'}; padding: 8px 20px; border-radius: 24px; margin-bottom: 16px;">
                      <span style="color: ${is_sender ? '#dc2626' : '#059669'}; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment ${actionText}</span>
                    </div>
                    <p style="margin: 0; color: #1a1a2e; font-size: 48px; font-weight: 700; letter-spacing: -1px;">
                      <span style="color: ${is_sender ? '#dc2626' : '#059669'};">${is_sender ? '-' : '+'}$${amount}</span>
                    </p>
                    <p style="margin: 12px 0 0; color: #64748b; font-size: 15px;">${is_sender ? 'Sent to' : 'Received from'} ${otherParty}</p>
                  </td>
                </tr>
                
                <!-- Transaction Details -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 13px; font-weight: 500;">Recipient</span>
                        </td>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 600;">${otherParty}</span><br>
                          <span style="color: #64748b; font-size: 13px;">${otherEmail}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="color: #64748b; font-size: 13px; font-weight: 500;">Date & Time</span>
                        </td>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500;">${date_time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0;">
                          <span style="color: #64748b; font-size: 13px; font-weight: 500;">Transaction ID</span>
                        </td>
                        <td style="padding: 14px 0; text-align: right;">
                          <span style="color: #1a1a2e; font-size: 13px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; background: #f8fafc; padding: 4px 10px; border-radius: 6px;">${transaction_id.slice(0, 12)}...</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 8px 32px 32px; text-align: center;">
                    <a href="${receipt_url}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #003087 0%, #0070BA 100%); color: #ffffff; text-decoration: none; border-radius: 28px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 16px rgba(0, 48, 135, 0.24);">View Full Receipt</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 20px; text-align: center;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">
                This is an automated notification from PayPro.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} PayPro. All rights reserved.
              </p>
              <p style="margin: 16px 0 0; color: #cbd5e1; font-size: 11px;">
                Questions? Contact support@paypro1.site
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
      text: plainTextContent,
      html: htmlContent,
      tags: [
        {
          name: 'category',
          value: 'transaction_receipt'
        }
      ],
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
