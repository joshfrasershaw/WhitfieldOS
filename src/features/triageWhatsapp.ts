/** WhatsApp click-to-chat creates a draft TO the customer.
 * The sending account is the WhatsApp account logged in on the user's device.
 * This link does not send the message or select the sender account.
 */
export const WHITFIELD_BUSINESS_WHATSAPP = '441743624123'

export const WHATSAPP_PHOTO_MESSAGE = [
  'Thank you for your call.',
  'Would you please send us a close-up photograph of the problem and a wider photograph showing the surrounding working area on WhatsApp?',
  '',
  'Please include a description of the issue and confirm your postcode so that whoever picks this up has the full context.',
  '',
  'Thank you, Josh, Whitfield Plumbing, Heating & Cooling, www.WhitfieldPlumbing.co.uk',
].join('\n')

export function customerWhatsAppNumber(input: string): string | null {
  let digits = input.trim().replace(/[\s()\-.]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = '44' + digits.slice(1)
  if (!/^\d{10,15}$/.test(digits) || digits === WHITFIELD_BUSINESS_WHATSAPP) return null
  return digits
}

export function whatsappPhotoUrl(customerPhone: string): string | null {
  const number = customerWhatsAppNumber(customerPhone)
  if (!number) return null
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(WHATSAPP_PHOTO_MESSAGE)
}
