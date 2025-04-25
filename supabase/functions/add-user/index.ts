// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // PUBLIC: Do not check for Authorization header

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const { email, password, name, jobTitle, department, role, supervisor } = body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // LOGGING for debugging
    console.log("Attempting to create user:", email);

    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError) {
      console.error("User creation error:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    console.log("User created successfully:", userData);

    // Insert into users table
    const { error: dbError } = await supabase.from("users").insert([
      {
        auth_id: userData.user.id,
        name,
        email,
        job_title: jobTitle,
        department,
        role,
        supervisor_id: supervisor && supervisor.match(/^[0-9a-fA-F-]{36}$/) ? supervisor : null,
        status: "first_login",
      },
    ]);
    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    // Log the error for debugging in Supabase dashboard
    console.error("Add User Function Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"email":"user@example.com","password":"password","name":"John Doe","jobTitle":"Software Engineer","department":"Engineering","role":"admin","supervisor":"supervisor@example.com"}'

*/
