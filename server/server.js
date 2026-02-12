const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

const verificationCodes = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
    }
  }
}

setInterval(cleanupExpiredCodes, 60000);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'LostRP Email Server is running' });
});

app.post('/api/send-code', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Email и имя обязательны' });
    }

    const code = generateCode();
    const time = new Date().toLocaleString('ru-RU', { 
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    verificationCodes.set(email, {
      code,
      name,
      timestamp: Date.now()
    });

    const htmlContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #000000, #1a1a1a); padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <div style="display: inline-block; background: #ffffff; padding: 12px 16px; border-radius: 10px; margin-bottom: 15px;">
            <span style="font-size: 24px; font-weight: bold; color: #000000;">LostRP</span>
          </div>
          <h1 style="margin: 0; font-size: 22px; color: #ffffff;">Подтверждение регистрации</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 20px 0;">
            Здравствуйте, <strong style="color: #ffffff;">${name}</strong>!
          </p>
          
          <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 25px 0;">
            Вы получили это письмо, потому что зарегистрировались на форуме LostRP. Для завершения регистрации введите код подтверждения:
          </p>
          
          <div style="background: #000000; border: 1px solid #333; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 25px;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Ваш код подтверждения</p>
            <div style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; font-size: 12px; margin: 0 0 15px 0;">
            Код действителен в течение 10 минут. Если вы не регистрировались на нашем форуме, проигнорируйте это письмо.
          </p>
          
          <div style="border-top: 1px solid #222; padding-top: 20px; margin-top: 20px;">
            <table role="presentation" style="width: 100%;">
              <tr>
                <td style="vertical-align: middle;">
                  <div style="display: inline-block; padding: 8px 12px; background: #1a1a1a; border-radius: 8px; font-size: 20px;">
                    👤
                  </div>
                </td>
                <td style="vertical-align: middle; padding-left: 12px;">
                  <div style="color: #ffffff; font-size: 14px; font-weight: 600;">${name}</div>
                  <div style="color: #666; font-size: 12px;">${time}</div>
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="background: #000000; padding: 20px; text-align: center; border-top: 1px solid #222;">
          <p style="color: #444; font-size: 11px; margin: 0;">
            © 2025 LostRP Forum. Все права защищены.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"LostRP Forum" <${process.env.EMAIL_USER || 'noreply@lostrp.com'}>`,
      to: email,
      subject: 'Код подтверждения для LostRP Forum',
      html: htmlContent
    });

    console.log(`Code sent to ${email}: ${code}`);
    res.json({ success: true, message: 'Код отправлен' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Ошибка отправки письма' });
  }
});

app.post('/api/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email и код обязательны' });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({ success: false, error: 'Код не найден или истёк' });
    }

    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({ success: false, error: 'Код истёк' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ success: false, error: 'Неверный код' });
    }

    verificationCodes.delete(email);
    res.json({ success: true, message: 'Email подтверждён' });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ success: false, error: 'Ошибка проверки кода' });
  }
});

app.listen(PORT, () => {
  console.log(`LostRP Email Server running on port ${PORT}`);
});
