import emailjs from '@emailjs/browser'

const SERVICE_ID = 'service_rgix1v6'
const TEMPLATE_ID = 'template_gp0qtev'
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'

emailjs.init(PUBLIC_KEY)

export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendVerificationCode = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  try {
    const now = new Date()
    const time = now.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: email,
      name: name,
      message: `Ваш код подтверждения для регистрации на форуме LostRP: ${code}`,
      time: time,
      code: code
    })

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
