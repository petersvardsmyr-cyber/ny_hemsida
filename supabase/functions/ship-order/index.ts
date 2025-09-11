import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShipOrderRequest {
  order_id: string;
  tracking_number?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
  }).format(amount / 100);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, tracking_number }: ShipOrderRequest = await req.json();

    if (!order_id) {
      throw new Error('Order ID is required');
    }

    // Initialize Supabase client with service role for database updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching order:', order_id);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('Order found:', order.id, 'Email:', order.email);

    // Update order status to shipped
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        shipping_tracking_number: tracking_number || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log('Order updated successfully');

    // Get order_shipped email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'order_shipped')
      .eq('is_active', true)
      .single();

    let emailSubject = 'Din beställning har skickats!';
    let emailContent = `
      <h2>Din beställning är på väg!</h2>
      <p>Hej!</p>
      <p>Vi vill bara meddela dig att din beställning #{order_number} har skickats och är nu på väg till dig.</p>
      {tracking_info}
      <p>Tack för din beställning!</p>
    `;

    if (template && !templateError) {
      emailSubject = template.subject;
      emailContent = template.content;
      console.log('Using custom template for order_shipped');
    } else {
      console.log('Using default template for order_shipped');
    }

    // Parse order items
    const items = Array.isArray(order.items) ? order.items : [];
    
    // Build items HTML
    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${item.title}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(item.price * 100)}</td>
      </tr>
    `).join('');

    // Build tracking info section
    let trackingInfo = '';
    if (tracking_number) {
      trackingInfo = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Spårningsinformation</h3>
          <p style="margin: 0;"><strong>Spårningsnummer:</strong> ${tracking_number}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
            Du kan använda detta nummer för att spåra din leverans hos transportören.
          </p>
        </div>
      `;
    }

    // Replace placeholders in email content
    const customerEmailHtml = emailContent
      .replace('{order_number}', order.id.slice(0, 8))
      .replace('{customer_email}', order.email)
      .replace('{total_amount}', formatCurrency(order.total_amount))
      .replace('{tracking_info}', trackingInfo)
      .replace('{order_items}', `
        <div style="margin: 20px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Skickade produkter:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Produkt</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Antal</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Pris</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      `);

    console.log('Sending shipping confirmation email to:', order.email);

    // Send shipping confirmation email to customer
    const emailResult = await resend.emails.send({
      from: "Peter Svärdsmyr <hej@petersvardsmyr.se>",
      to: [order.email],
      subject: emailSubject,
      html: customerEmailHtml,
    });

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order marked as shipped and email sent successfully',
        order_id: order.id,
        tracking_number: tracking_number
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in ship-order function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        success: false
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);