
const SUPABASE_URL = "https://vifuekzyrslapswoxpbg.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_YRqQ5FZz7gDY-UiKkCWhNA_3tGPZPI8";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
