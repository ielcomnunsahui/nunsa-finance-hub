import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(payload: ResendEmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
}



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MonthlyReportRequest {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: "RESEND_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { month, year, totalIncome, totalExpenses, netBalance, incomeCount, expenseCount, recipientEmail }: MonthlyReportRequest = await req.json();

    if (!month || !year || !recipientEmail) {
      throw new Error("Missing required fields");
    }

    const formattedIncome = totalIncome.toLocaleString("en-NG", { minimumFractionDigits: 2 });
    const formattedExpenses = totalExpenses.toLocaleString("en-NG", { minimumFractionDigits: 2 });
    const formattedBalance = Math.abs(netBalance).toLocaleString("en-NG", { minimumFractionDigits: 2 });
    const balanceStatus = netBalance >= 0 ? "Profit" : "Loss";
    const balanceColor = netBalance >= 0 ? "#16a34a" : "#dc2626";

    const emailResponse = await sendEmail({
      from: "NUNSA HUI Café <reports@nunsahui.xyz>",
      to: [recipientEmail],
      subject: `Monthly Financial Report - ${month} ${year}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #065f46 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">NUNSA HUI Café</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Monthly Financial Report</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0f766e; margin-top: 0;">${month} ${year} Summary</h2>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
              <div style="flex: 1; background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #166534; font-size: 12px; text-transform: uppercase;">Total Income</p>
                <p style="margin: 5px 0 0; color: #16a34a; font-size: 20px; font-weight: bold;">₦${formattedIncome}</p>
                <p style="margin: 5px 0 0; color: #166534; font-size: 12px;">${incomeCount} transactions</p>
              </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
              <div style="flex: 1; background: #fee2e2; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #991b1b; font-size: 12px; text-transform: uppercase;">Total Expenses</p>
                <p style="margin: 5px 0 0; color: #dc2626; font-size: 20px; font-weight: bold;">₦${formattedExpenses}</p>
                <p style="margin: 5px 0 0; color: #991b1b; font-size: 12px;">${expenseCount} transactions</p>
              </div>
            </div>
            
            <div style="background: ${netBalance >= 0 ? '#dcfce7' : '#fee2e2'}; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <p style="margin: 0; color: ${netBalance >= 0 ? '#166534' : '#991b1b'}; font-size: 14px; text-transform: uppercase;">Net ${balanceStatus}</p>
              <p style="margin: 10px 0 0; color: ${balanceColor}; font-size: 28px; font-weight: bold;">₦${formattedBalance}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
              This is an automated report from NUNSA HUI Café Finance System.<br>
              Al-Hikmah University, Ilorin | nunsahui@gmail.com
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Monthly report email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-monthly-report function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
