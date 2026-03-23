import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwjvgcgzhbkiebvokfqo.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anZnY2d6aGJraWVidm9rZnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzUxNzEsImV4cCI6MjA4OTgxMTE3MX0.sGUbyLRMTXsgkzKZy3CAyVc-Y-rV0KEdG1FXb1TFvsQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
