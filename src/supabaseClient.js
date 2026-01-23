import { createClient } from "@supabase/supabase-js";

// Reemplaza estos valores con tus credenciales de Supabase
const supabaseUrl = "https://eiwrztmtizqufarpipha.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpd3J6dG10aXpxdWZhcnBpcGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzU1NzIsImV4cCI6MjA4NDcxMTU3Mn0.TO9WI3jTFIMUbaTRCJRyEW5rvuniR_CuJscjIUrhvxQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
