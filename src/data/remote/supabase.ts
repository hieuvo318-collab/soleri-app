import { createClient } from '@supabase/supabase-js';

// Khuyến nghị: Trong dự án thực tế nên lấy qua biến môi trường (process.env.EXPO_PUBLIC_SUPABASE_URL)

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ntoxwwwpbtltthmzisjk.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b3h3d3dwYnRsdHRobXppc2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjE5NDcsImV4cCI6MjA4ODMzNzk0N30.h6YnzE2eCY9X0uSZQVSl1dO5_DoZxdhMBGvi5UIaKyY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
