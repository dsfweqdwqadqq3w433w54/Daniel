import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Web3Forms configuration (alternative email service)
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'your_web3forms_key';

// Demo mode for testing
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || false;

// Initialize EmailJS
export const initEmailJS = () => {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
};

// Send email via Web3Forms (reliable alternative)
export const sendViaWeb3Forms = async (replyData) => {
  try {
    console.log('Web3Forms Access Key:', WEB3FORMS_ACCESS_KEY ? 'Configured' : 'Missing');

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'your_web3forms_key') {
      throw new Error('Web3Forms access key not configured');
    }

    // Prepare form data for Web3Forms
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', replyData.subject);
    formData.append('email', replyData.to); // Recipient email
    formData.append('name', replyData.toName || 'User');
    formData.append('message', replyData.message);
    formData.append('from_name', replyData.fromName);
    formData.append('reply_to', replyData.fromEmail);

    // Add additional fields for better email delivery
    formData.append('from_email', replyData.fromEmail);
    formData.append('to_email', replyData.to);

    console.log('Sending email to Web3Forms API...');
    console.log('Recipient:', replyData.to);
    console.log('Subject:', replyData.subject);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Web3Forms response:', result);

    if (result.success) {
      console.log('✅ Email sent successfully via Web3Forms');
      return { success: true, response: result };
    } else {
      throw new Error(result.message || 'Web3Forms submission failed');
    }

  } catch (error) {
    console.error('❌ Failed to send email via Web3Forms:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

// Send reply email via EmailJS
export const sendReplyEmail = async (replyData) => {
  try {
    // Initialize EmailJS if not already done
    initEmailJS();

    // Prepare email template parameters
    const templateParams = {
      to_email: replyData.to,
      to_name: replyData.toName || 'User',
      from_name: replyData.fromName || 'Admin',
      from_email: replyData.fromEmail || 'admin@yoursite.com',
      subject: replyData.subject,
      message: replyData.message,
      reply_to: replyData.fromEmail || 'admin@yoursite.com'
    };

    console.log('Sending email with params:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };

  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

// Fallback: Open email client with pre-filled content
export const openEmailClient = (replyData) => {
  try {
    const mailtoLink = `mailto:${replyData.to}?subject=${encodeURIComponent(replyData.subject)}&body=${encodeURIComponent(replyData.message)}`;
    window.open(mailtoLink);
    return { success: true };
  } catch (error) {
    console.error('Failed to open email client:', error);
    return { success: false, error: error.message };
  }
};

// Demo email sending (for testing without setup)
export const sendDemoEmail = async (replyData) => {
  console.log('Demo mode: Simulating email send...');
  console.log('Email data:', replyData);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Log the email content for demo purposes
  console.log(`
📧 DEMO EMAIL SENT:
To: ${replyData.to}
From: ${replyData.fromEmail}
Subject: ${replyData.subject}

Message:
${replyData.message}

Note: This is a demo. To send real emails, set up Web3Forms or EmailJS.
  `);

  return {
    success: true,
    method: 'demo',
    message: 'Demo email sent successfully! Check console for details.'
  };
};

// Send email with multiple fallback options
export const sendEmailWithFallback = async (replyData) => {
  console.log('🚀 Starting email send process...');
  console.log('Environment check:');
  console.log('- Demo Mode:', DEMO_MODE);
  console.log('- Web3Forms Key:', WEB3FORMS_ACCESS_KEY ? 'Present' : 'Missing');
  console.log('- Email Data:', {
    to: replyData.to,
    from: replyData.fromEmail,
    subject: replyData.subject
  });

  // Demo mode for testing
  if (DEMO_MODE) {
    console.log('📧 Running in demo mode');
    return await sendDemoEmail(replyData);
  }

  // Option 1: Try Web3Forms first (most reliable)
  if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'your_web3forms_key') {
    console.log('🌐 Attempting Web3Forms...');
    const web3Result = await sendViaWeb3Forms(replyData);
    if (web3Result.success) {
      console.log('✅ Web3Forms succeeded!');
      return { success: true, method: 'web3forms', response: web3Result.response };
    }
    console.log('❌ Web3Forms failed:', web3Result.error);
  } else {
    console.log('⚠️ Web3Forms not configured');
  }

  // Option 2: Try EmailJS
  const emailConfig = validateEmailConfig();
  if (emailConfig.isConfigured) {
    console.log('📨 Attempting EmailJS...');
    const emailResult = await sendReplyEmail(replyData);
    if (emailResult.success) {
      console.log('✅ EmailJS succeeded!');
      return { success: true, method: 'emailjs', response: emailResult.response };
    }
    console.log('❌ EmailJS failed:', emailResult.error);
  } else {
    console.log('⚠️ EmailJS not configured');
  }

  // Option 3: Fallback to email client
  console.log('📬 Falling back to email client...');
  const clientResult = openEmailClient(replyData);

  if (clientResult.success) {
    console.log('✅ Email client opened');
    return { success: true, method: 'client', message: 'Email client opened with pre-filled content' };
  }

  console.log('❌ All email methods failed');
  return { success: false, error: 'All email sending methods failed. Please check your email configuration.' };
};

// Test Web3Forms configuration
export const testWeb3FormsConfig = async () => {
  try {
    console.log('🧪 Testing Web3Forms configuration...');

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'your_web3forms_key') {
      return { success: false, error: 'Web3Forms access key not configured' };
    }

    // Test with a simple ping
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', 'Test Configuration');
    formData.append('email', 'test@example.com');
    formData.append('message', 'This is a configuration test');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json();

    return {
      success: response.ok,
      result,
      message: response.ok ? 'Web3Forms is properly configured' : 'Web3Forms configuration error'
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validate email configuration
export const validateEmailConfig = () => {
  const config = {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY
  };

  const isConfigured = EMAILJS_SERVICE_ID !== 'your_service_id' &&
                      EMAILJS_TEMPLATE_ID !== 'your_template_id' &&
                      EMAILJS_PUBLIC_KEY !== 'your_public_key';

  return {
    isConfigured,
    config: isConfigured ? config : null,
    message: isConfigured ? 'EmailJS is properly configured' : 'EmailJS configuration needed'
  };
};
