import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://loatchducruffeihdmmh.supabase.co";
const supabasePublishableKey = "sb_publishable_4PM2KSshGKSnNOEe9OXsUQ_fLvR4awI";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
