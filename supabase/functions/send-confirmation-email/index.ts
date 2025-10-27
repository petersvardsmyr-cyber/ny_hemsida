import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  email: string;
  confirmationToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    const { email, confirmationToken }: ConfirmationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const confirmUrl = confirmationToken 
      ? `https://petersvardsmyr.se/nyhetsbrev/bekrafta?token=${confirmationToken}`
      : null;

    const emailResponse = await resend.emails.send({
      from: "Peter Svärdsmyr <hej@petersvardsmyr.se>",
      to: [email],
      subject: confirmationToken ? "Bekräfta din prenumeration" : "Välkommen till mitt nyhetsbrev!",
      html: confirmationToken ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Bekräfta din prenumeration</h1>
          <p>Tack för att du vill prenumerera på mitt nyhetsbrev!</p>
          <p>För att slutföra din prenumeration behöver du bekräfta din e-postadress genom att klicka på knappen nedan:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Bekräfta prenumeration
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:<br>
            <a href="${confirmUrl}" style="color: #2563eb; word-break: break-all;">${confirmUrl}</a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Om du inte prenumererat på detta nyhetsbrev kan du ignorera detta meddelande.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <footer style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 15px;">
              <a href="https://petersvardsmyr.se" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                petersvardsmyr.se
              </a>
            </div>
            <div style="text-align: center;">
              <a href="mailto:hej@petersvardsmyr.se" style="color: #666; text-decoration: none;">
                hej@petersvardsmyr.se
              </a>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center; margin: 10px 0;">
              Med vänliga hälsningar,<br>
              Peter Svärdsmyr
            </p>
          </footer>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Välkommen!</h1>
          <p>Tack för att du prenumererar på mitt nyhetsbrev!</p>
          <p>Du kommer nu att få mina uppdateringar, texter och uppmuntran direkt i din inkorg.</p>
          <p>Vill du inte längre prenumerera kan du när som helst avregistrera dig via länken längst ner i varje nyhetsbrev.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <footer style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <div style="text-align: center; margin-bottom: 15px;">
              <a href="https://petersvardsmyr.se" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                petersvardsmyr.se
              </a>
            </div>
            <div style="text-align: center; margin-bottom: 15px;">
              <a href="mailto:hej@petersvardsmyr.se" style="color: #666; text-decoration: none;">
                hej@petersvardsmyr.se
              </a>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center; margin: 10px 0;">
              Med vänliga hälsningar,<br>
              Peter Svärdsmyr
            </p>
          </footer>
        </div>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ message: "Confirmation email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
