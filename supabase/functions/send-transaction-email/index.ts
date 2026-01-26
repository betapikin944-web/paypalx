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
  <title>PayPal Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c2e2f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- PayPal Header -->
          <tr>
            <td style="background-color: #003087; padding: 24px 40px;">
              <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" style="height: 32px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px; background-color: #ffffff;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px; font-size: 16px; color: #2c2e2f;">
                Hello ${is_sender ? sender_name : receiver_name},
              </p>
              
              <!-- Main Message -->
              <p style="margin: 0 0 32px; font-size: 16px; color: #2c2e2f; line-height: 1.5;">
                ${is_sender 
                  ? `You sent a payment of <strong>$${amount} USD</strong> to ${receiver_name}.`
                  : `${sender_name} sent you <strong>$${amount} USD</strong>.`
                }
              </p>
              
              <!-- Transaction Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; border-radius: 4px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #687173;">Transaction ID</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #2c2e2f; text-align: right; font-family: Monaco, 'Courier New', monospace;">${transaction_id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #687173;">Date</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #2c2e2f; text-align: right;">${date_time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #687173;">${is_sender ? 'Sent to' : 'Received from'}</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #2c2e2f; text-align: right;">${otherParty}<br><span style="color: #687173; font-size: 13px;">${otherEmail}</span></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 16px 0 8px; border-top: 1px solid #cbd2d6;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #2c2e2f;">Amount</td>
                        <td style="padding: 8px 0; font-size: 20px; font-weight: 600; color: ${is_sender ? '#c91c1c' : '#018a51'}; text-align: right;">${is_sender ? '-' : '+'}$${amount} USD</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="${receipt_url}" style="display: inline-block; padding: 14px 32px; background-color: #0070ba; color: #ffffff; text-decoration: none; border-radius: 24px; font-size: 16px; font-weight: 500;">View in PayPal</a>
                  </td>
                </tr>
              </table>
              
              <!-- Help Section -->
              <p style="margin: 0; font-size: 14px; color: #687173; line-height: 1.5;">
                If you have any questions about this transaction, please contact us through the <a href="${receipt_url}" style="color: #0070ba; text-decoration: none;">Resolution Center</a>.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f5f7fa; border-top: 1px solid #cbd2d6;">
              <p style="margin: 0 0 16px; font-size: 12px; color: #687173; line-height: 1.6;">
                Please don't reply to this email. It'll just confuse the computer that sent it and you won't get a response.
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #687173; line-height: 1.6;">
                Copyright © ${new Date().getFullYear()} PayPal, Inc. All rights reserved. PayPal is located at 2211 N. First St., San Jose, CA 95131.
              </p>
              <p style="margin: 0; font-size: 12px; color: #687173;">
                PayPal PPX000000:000000000000000
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
