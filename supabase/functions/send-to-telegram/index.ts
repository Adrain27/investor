const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormData {
  name: string;
  email: string;
  paymentMethod: string;
  investmentReturnMethod: string;
  agreedToTerms: boolean;
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
      throw new Error('Missing Telegram configuration');
    }

    const message = `
🆕 New Form Submission

👤 Name: ${formData.name}
📧 Email: ${formData.email}
💳 Payment Method: ${formData.paymentMethod}
💰 Investment Return Method: ${formData.investmentReturnMethod}
✅ Terms Accepted: ${formData.agreedToTerms ? 'Yes' : 'No'}

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
