import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK'
  }).format(amount);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing order confirmation email...');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get test email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, content')
      .eq('template_type', 'test_email')
      .eq('is_active', true)
      .limit(1)
      .single();

    let emailSubject = 'TEST - Orderbekräftelse från Peter Svärdsmyr';
    let emailContent = '<h1>Test av e-postfunktion</h1><p>Detta är ett testmeddelande för att kontrollera att e-postfunktionen fungerar korrekt.</p>';

    if (template && !templateError) {
      emailSubject = `TEST - ${template.subject}`;
      emailContent = template.content;
    }

    // Mock test data
    const orderNumber = 'TEST1234';
    const customer_email = 'test@example.com'; // Change to your email for testing
    const totalAmount = 29900; // 299 SEK
    
    const testOrderItems = [
      { title: 'Allt det vi delar', quantity: 1, price: 249 },
      { title: 'Det ordnar sig', quantity: 1, price: 249 }
    ];
    
    const testShipping = {
      name: 'Standardfrakt Sverige',
      region: 'sweden',
      price_ex_vat: 49,
      vat_rate: 0.25
    };

    const testShippingDetails = {
      name: 'Test Person',
      address: {
        line1: 'Testgatan 1',
        line2: '',
        postal_code: '12345',
        city: 'Stockholm',
        country: 'Sweden'
      }
    };

    // Generate test customer email HTML
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #2c3e50; margin: 0;">TEST E-POST</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          ${emailContent}
          
          <div style="background-color: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">DETTA ÄR ETT TEST-EMAIL</p>
            <p style="margin: 5px 0 0 0; color: #2c3e50;">Test-ordernummer: <strong>${orderNumber}</strong></p>
          </div>

          <h2 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">Test-orderdetaljer</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Produkt</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Antal</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Pris</th>
              </tr>
            </thead>
            <tbody>
              ${testOrderItems.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${testShipping.name}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">1</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(testShipping.price_ex_vat * (1 + testShipping.vat_rate))}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 18px; color: #2c3e50;">Test-totalt:</strong>
              <strong style="font-size: 18px; color: #27ae60;">${formatCurrency(totalAmount / 100)}</strong>
            </div>
          </div>

          <h3 style="color: #2c3e50;">Test-leveransadress</h3>
          <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; line-height: 1.6;">
              ${testShippingDetails.name}<br>
              ${testShippingDetails.address.line1}<br>
              ${testShippingDetails.address.postal_code} ${testShippingDetails.address.city}<br>
              ${testShippingDetails.address.country}
            </p>
          </div>

          <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">Om detta vore en riktig beställning:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #424242;">
              <li>Din beställning skulle bearbetas inom 1-2 arbetsdagar</li>
              <li>Du skulle få en försändelseavis när paketet skickas</li>
              <li>Leveranstid: 2-3 arbetsdagar</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; margin-top: 30px;">
            Detta var ett test av e-postfunktionen. Kontakta mig på 
            <a href="mailto:hej@petersvardsmyr.se" style="color: #3498db;">hej@petersvardsmyr.se</a>
          </p>

          <p style="color: #7f8c8d;">
            Med vänliga hälsningar,<br>
            <strong>Peter Svärdsmyr</strong>
          </p>
        </div>
      </div>
    `;

    // Send test email
    const emailResult = await resend.emails.send({
      from: "Testmeddelande <onboarding@resend.dev>",
      to: [customer_email],
      subject: emailSubject,
      html: customerEmailHtml,
    });

    console.log("Test email sent:", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test order confirmation email sent successfully!',
      details: emailResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending test order email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});