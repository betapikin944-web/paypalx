import { supabase } from '@/integrations/supabase/client';

interface TransactionEmailParams {
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

export async function sendTransactionEmail(params: TransactionEmailParams): Promise<boolean> {
  console.log('📧 Sending transaction email via Resend...');
  console.log('  → TO:', params.to_email);
  console.log('  → Type:', params.is_sender ? 'Sender receipt' : 'Receiver notification');
  console.log('  → Amount: $' + params.amount);

  try {
    const { data, error } = await supabase.functions.invoke('send-transaction-email', {
      body: params,
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ Email sent successfully to:', params.to_email);
      return true;
    } else {
      console.error('❌ Email failed:', data?.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Test function for debugging
export async function sendTestTransactionEmail(recipientEmail: string): Promise<boolean> {
  console.log('🧪 Sending test email to:', recipientEmail);
  
  return sendTransactionEmail({
    to_email: recipientEmail,
    amount: '10.00',
    sender_name: 'Test Sender',
    sender_email: 'sender@test.com',
    receiver_name: 'Test Receiver',
    receiver_email: recipientEmail,
    transaction_id: 'TEST-' + Date.now(),
    date_time: new Date().toLocaleString(),
    receipt_url: window.location.origin + '/activity',
    is_sender: false,
  });
}
