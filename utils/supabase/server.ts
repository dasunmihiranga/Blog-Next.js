import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This function is now server-side only
export const createClient = async () => {
  // This logic is executed on the server side
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignore if `set` is called from Server Components or Middleware
            console.error("Error setting cookies:", error);
          }
        },
      },
    },
  );
};
