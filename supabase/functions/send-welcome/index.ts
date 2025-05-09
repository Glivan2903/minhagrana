
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { name, phone, email } = await req.json()
    
    // Send data to n8n webhook
    const response = await fetch("https://n8n.auto375bot.xyz/webhook/minhagrana", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        message: `Olá ${name}! Bem-vindo(a) ao Minha Grana! Estamos felizes em tê-lo(a) conosco.`
      }),
    })
    
    const result = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error("Error sending welcome message:", error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    )
  }
})
