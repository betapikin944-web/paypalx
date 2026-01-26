import emailjs from '@emailjs/browser';

// EmailJS Configuration
const SERVICE_ID = 'service_paypro';
const TEMPLATE_ID = 'template_transaction';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

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
  console.log('📧 Sending transaction email via EmailJS...');
  console.log('  → TO:', params.to_email);
  console.log('  → Type:', params.is_sender ? 'Sender receipt' : 'Receiver notification');
  console.log('  → Amount: $' + params.amount);

  try {
    const templateParams = {
      to_email: params.to_email,
      amount: params.amount,
      sender_name: params.sender_name,
      sender_email: params.sender_email,
      receiver_name: params.receiver_name,
      receiver_email: params.receiver_email,
      transaction_id: params.transaction_id,
      date_time: params.date_time,
      receipt_url: params.receipt_url,
      action_text: params.is_sender ? 'sent' : 'received',
      other_party: params.is_sender ? params.receiver_name : params.sender_name,
      other_email: params.is_sender ? params.receiver_email : params.sender_email,
      amount_color: params.is_sender ? '#ef4444' : '#22c55e',
      amount_prefix: params.is_sender ? '-' : '+',
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', response);
    return true;
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
