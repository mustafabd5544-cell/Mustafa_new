import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://gftzajehediezwoqaeel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdHphamVoZWRpZXp3b3FhZWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTMwMDcsImV4cCI6MjA5ODY2OTAwN30.7teVavI-kRJQhBiatBHY97vQARp2Yp11M_oYj69BetI'
)