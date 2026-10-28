import { describe, expect, it } from 'vitest'
import {
  customerWhatsAppNumber,
  WHATSAPP_PHOTO_MESSAGE,
  whatsappPhotoUrl,
  WHITFIELD_BUSINESS_WHATSAPP,
} from './triageWhatsapp'

describe('WhatsApp triage photo request', () => {
  it('builds a WhatsApp draft addressed to the caller with the approved wording', () => {
    const url = new URL(whatsappPhotoUrl('07123 456789')!)
    expect(url.origin).toBe('https://wa.me')
    expect(url.pathname).toBe('/447123456789')
    expect(url.searchParams.get('text')).toBe(WHATSAPP_PHOTO_MESSAGE)
    expect(WHATSAPP_PHOTO_MESSAGE).toContain(
      'Thank you, Josh, Whitfield Plumbing, Heating & Cooling, www.WhitfieldPlumbing.co.uk',
    )
  })
  it('accepts UK and international formats without touching the sending business account', () => {
    expect(customerWhatsAppNumber('+44 7123 456789')).toBe('447123456789')
    expect(customerWhatsAppNumber('00447123456789')).toBe('447123456789')
    expect(customerWhatsAppNumber('07123456789')).toBe('447123456789')
    expect(WHITFIELD_BUSINESS_WHATSAPP).toBe('441743624123')
  })
  it('does not create links without a valid customer number or to the business number itself', () => {
    expect(whatsappPhotoUrl('')).toBeNull()
    expect(whatsappPhotoUrl('unknown')).toBeNull()
    expect(whatsappPhotoUrl('441743624123')).toBeNull()
  })
})
