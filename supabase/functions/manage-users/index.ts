import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Get allowed origin from environment variable, fallback to wildcard for dev
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  action: "create";
  email: string;
  password: string;
  role?: "admin" | "user";
}

interface DeleteUserRequest {
  action: "delete";
  userId: string;
}

type RequestBody = CreateUserRequest | DeleteUserRequest;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;
    
    // Client with user's JWT token (verified automatically by Supabase)
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get current user (JWT already validated by Supabase)
    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !currentUser) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using service role client
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: currentUser.id,
      _role: "admin",
    });

    if (!isAdmin) {
      console.error("User is not admin:", currentUser.id);
      return new Response(
        JSON.stringify({ error: "صلاحيات غير كافية" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    console.log("Request action:", body.action);

    if (body.action === "create") {
      const { email, password, role } = body as CreateUserRequest;

      // Validate required fields
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 320) {
        return new Response(
          JSON.stringify({ error: "صيغة البريد الإلكتروني غير صحيحة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate password strength
      if (password.length < 6 || password.length > 128) {
        return new Response(
          JSON.stringify({ error: "كلمة المرور يجب أن تكون بين 6 و 128 حرفاً" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate role if provided
      if (role && !["admin", "user"].includes(role)) {
        return new Response(
          JSON.stringify({ error: "دور المستخدم غير صالح" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user with admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating user:", createError);
        let errorMessage = "فشل في إنشاء المستخدم";
        if (createError.message.includes("already been registered")) {
          errorMessage = "البريد الإلكتروني مسجل مسبقاً";
        }
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User created:", newUser.user?.id);

      // Assign role if specified
      if (role && newUser.user) {
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        } else {
          console.log("Role assigned:", role);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { 
            id: newUser.user?.id, 
            email: newUser.user?.email,
            role: role || null,
          } 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "delete") {
      const { userId } = body as DeleteUserRequest;

      // Validate userId format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!userId || !uuidRegex.test(userId)) {
        return new Response(
          JSON.stringify({ error: "معرف المستخدم غير صالح" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent self-deletion
      if (userId === currentUser.id) {
        return new Response(
          JSON.stringify({ error: "لا يمكنك حذف حسابك الخاص" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete user role first
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      console.log("Deleted user roles for:", userId);

      // Delete user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: "فشل في حذف المستخدم" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User deleted:", userId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "إجراء غير صالح" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in manage-users function:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
