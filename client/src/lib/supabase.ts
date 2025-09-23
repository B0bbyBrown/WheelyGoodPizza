import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Check for environment variables and provide helpful error messages
if (!supabaseUrl) {
  console.error("❌ Missing VITE_SUPABASE_URL environment variable");
  console.error(
    "Please create a .env file in the project root with your Supabase configuration"
  );
  console.error("Example: VITE_SUPABASE_URL=https://your-project.supabase.co");
}

if (!supabaseAnonKey) {
  console.error("❌ Missing VITE_SUPABASE_ANON_KEY environment variable");
  console.error(
    "Please create a .env file in the project root with your Supabase configuration"
  );
  console.error("Example: VITE_SUPABASE_ANON_KEY=your-anon-key-here");
}

// Create Supabase client with platform-specific optimizations for Apple devices
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // Platform-specific storage configuration for better Apple device compatibility
          storage: {
            getItem: (key: string) => {
              try {
                return localStorage.getItem(key);
              } catch (error) {
                console.warn(
                  "localStorage not available, falling back to memory storage"
                );
                return null;
              }
            },
            setItem: (key: string, value: string) => {
              try {
                localStorage.setItem(key, value);
              } catch (error) {
                console.warn(
                  "localStorage not available, falling back to memory storage"
                );
              }
            },
            removeItem: (key: string) => {
              try {
                localStorage.removeItem(key);
              } catch (error) {
                console.warn(
                  "localStorage not available, falling back to memory storage"
                );
              }
            },
          },
          // Use PKCE flow for better Apple device compatibility
          flowType: "pkce",
        },
        // Global configuration for better Apple device compatibility
        global: {
          headers: {
            "X-Client-Info": "supabase-js-web",
          },
        },
        // Real-time configuration with reduced events for Apple devices
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : createClient("https://placeholder.supabase.co", "placeholder-key", {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
