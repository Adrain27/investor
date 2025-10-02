const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  paymentMethod: string;
  paymentDetailsConfirmed?: string;
  investmentReturnMethod?: string;
  agreedToTerms: boolean;
  investorId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: FormData = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('Missing Telegram configuration');
      throw new Error('Missing Telegram configuration');
    }

    const message = `
🆕 New Form Submission

👤 Name: ${formData.name}
📧 Email: ${formData.email}
📱 Phone Number: ${formData.phoneNumber}
🌍 Country: ${formData.country}
💳 Payment Method: ${formData.paymentMethod}
${formData.paymentDetailsConfirmed ? `✔️ Payment Details Ready: ${formData.paymentDetailsConfirmed === 'yes' ? 'Yes, details ready' : 'Will provide later'}` : ''}
💰 Investment Return Method: ${formData.investmentReturnMethod || 'Not specified'}
✅ Terms Accepted: ${formData.agreedToTerms ? 'Yes' : 'No'}
🆔 Investor ID: ${formData.investorId}

Submitted at: ${new Date().toLocaleString()}
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      throw new Error('Failed to send message to Telegram');
    }

    console.log('Successfully sent message to Telegram');

    return new Response(
      JSON.stringify({ success: true, message: 'Form submitted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-to-telegram function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
