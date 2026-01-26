import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { sendTestTransactionEmail } from "./lib/emailjs";

// Expose test email function globally for debugging
(window as any).testEmail = (email: string) => {
  console.log('🧪 Testing email via EmailJS to:', email);
  sendTestTransactionEmail(email).then(success => {
    if (success) {
      console.log('✅ Test email sent! Check your inbox at:', email);
    } else {
      console.log('❌ Test email failed. Check console for errors.');
    }
  });
};

console.log('💡 Debug Tip: Test email alerts by typing in console: testEmail("your@email.com")');

createRoot(document.getElementById("root")!).render(<App />);
