import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'souq-eta3-iraq-7jo9wqnt',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_5sXJfgh2F1djMIJfKpR7OO46U-1c1dtb',
  authRequired: false,
  auth: { mode: 'managed' },
})
