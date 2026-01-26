import emailjs from '@emailjs/browser';

// EmailJS Configuration
const SERVICE_ID = 'service_ui7l2yi';
const TEMPLATE_ID = 'template_hgpytes';
const PUBLIC_KEY = 'Q6TtfEi7SAeVYuJFN';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

interface TransactionEmailParams {
  to_email: string;
  to_name: string;
  amount: string;
  transaction_type: 'sent' | 'received';
  other_party_name: string;
  transaction_id: string;
  date: string;
}

export async function sendTransactionAlert(params: TransactionEmailParams): Promise<boolean> {
  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name,
      amount: params.amount,
      transaction_type: params.transaction_type === 'sent' ? 'sent to' : 'received from',
      other_party_name: params.other_party_name,
      transaction_id: params.transaction_id,
      date: params.date,
      subject: params.transaction_type === 'sent' 
        ? `You sent $${params.amount} to ${params.other_party_name}`
        : `You received $${params.amount} from ${params.other_party_name}`,
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
