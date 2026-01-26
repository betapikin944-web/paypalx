 import emailjs from '@emailjs/browser';
 
 // EmailJS Configuration
 const SERVICE_ID = 'service_ui7l2yi';
 const TEMPLATE_ID = 'template_hgpytes';
 const PUBLIC_KEY = 'Q6TtfEi7SAeVYuJFN';
 
 // Initialize EmailJS
 emailjs.init(PUBLIC_KEY);
 
 interface TransactionEmailParams {
   to_email: string; // Required by EmailJS to know recipient
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
  console.log('🔍 EmailJS Debug - Sending email with params:');
  console.log('  → TO EMAIL:', params.to_email);
  console.log('  → Amount:', params.amount);
  console.log('  → Sender:', params.sender_name, '<' + params.sender_email + '>');
  console.log('  → Receiver:', params.receiver_name, '<' + params.receiver_email + '>');
   
   try {
     const templateParams = {
       to_email: params.to_email, // EmailJS uses this to determine recipient
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
 
     console.log('📧 Sending to EmailJS service:', SERVICE_ID);
     console.log('📧 Using template:', TEMPLATE_ID);
    console.log('📧 Recipient (to_email field):', params.to_email);
    console.log('📧 Full template params:', JSON.stringify(templateParams, null, 2));
     
     const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('✅ Email sent successfully to:', params.to_email);
    console.log('   Response:', response);
     return true;
   } catch (error) {
    console.error('❌ Failed to send email to:', params.to_email);
    console.error('   Error details:', error);
     return false;
   }
 }
 
 // Test function to send a simple alert
 export async function sendTestAlert(recipientEmail: string): Promise<boolean> {
   console.log('🧪 Sending test email to:', recipientEmail);
   
   const testParams = {
     to_email: recipientEmail,
     amount: '10.00',
     sender_name: 'Test Sender',
     sender_email: 'test.sender@example.com',
     receiver_name: 'Test Receiver',
     receiver_email: 'test.receiver@example.com',
     transaction_id: 'TEST-' + Date.now(),
     date_time: new Date().toLocaleString(),
     receipt_url: window.location.origin + '/activity',
   };
   
   return sendTransactionAlert(testParams);
 }
