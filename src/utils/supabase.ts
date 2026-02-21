import { createClient } from '@supabase/supabase-js'

// ! 표시를 붙여서 이 값들이 반드시 존재함을 알립니다.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)