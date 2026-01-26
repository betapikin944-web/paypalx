import emailjs from '@emailjs/browser';

// EmailJS Configuration
const SERVICE_ID = 'service_ui7l2yi';
const TEMPLATE_ID = 'template_hgpytes';
const PUBLIC_KEY = 'Q6TtfEi7SAeVYuJFN';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

interface TransactionEmailParams {
  amount: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  transaction_id: string;
  date_time: string;
  receipt_url: string;
}

export async function sendTransactionAlert(params: TransactionEmailParams): Promise<boolean> {
  try {
    const templateParams = {
      amount: params.amount,
      sender_name: params.sender_name,
      sender_email: params.sender_email,
      receiver_name: params.receiver_name,
      receiver_email: params.receiver_email,
      transaction_id: params.transaction_id,
      date_time: params.date_time,
      receipt_url: params.receipt_url,
      year: new Date().getFullYear().toString(),
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
