import nodemailer from 'nodemailer'
import { config } from '../config.js'

async function main() {
  const user = config.otp.email.user
  const rawPass = config.otp.email.pass
  const pass = rawPass?.replace(/\s+/g, '').replace(/["']/g, '')

  console.log('====================================================')
  console.log('🔍 Nodemailer SMTP Diagnostic & Verification Tool')
  console.log('====================================================')
  console.log(`Email User : ${user || '❌ (NOT CONFIGURED)'}`)
  console.log(`Password   : ${pass ? `[Set: ${pass.length} chars, masked: ${pass.slice(0, 3)}***${pass.slice(-3)}]` : '❌ (NOT CONFIGURED)'}`)
  console.log('----------------------------------------------------')

  if (!user || !pass) {
    console.error('❌ Missing credentials! Please set EMAIL_USER and NODEPASS in your server/.env file.')
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })

  console.log('⏳ Testing SMTP connection to Google Mail servers...')

  try {
    await transporter.verify()
    console.log('✅ SUCCESS! Nodemailer successfully connected and authenticated with Gmail.')
    console.log('Your EMAIL_USER and NODEPASS are 100% valid.')

    const targetEmail = process.argv[2] || user
    console.log(`\n📨 Attempting to send a test verification email to: ${targetEmail}...`)

    const info = await transporter.sendMail({
      from: `"Indore House Makers Test" <${user}>`,
      to: targetEmail,
      subject: '✅ Nodemailer Test Email - Indore House Makers',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #E76F2E;">Nodemailer Working Successfully!</h2>
          <p>This is a test email sent from your <strong>Indore House Makers</strong> server.</p>
          <p><strong>Configured User:</strong> ${user}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">OTP authentication & lead emails will now be delivered smoothly.</p>
        </div>
      `,
    })

    console.log(`🎉 Test email sent successfully! Message ID: ${info.messageId}`)
    console.log(`Please check your inbox at: ${targetEmail}`)
  } catch (err: any) {
    console.error('\n❌ SMTP Connection Failed!')
    console.error('Error Code    :', err.code || 'UNKNOWN')
    console.error('Error Message :', err.message)

    if (err.code === 'EAUTH' || err.message?.includes('535') || err.message?.includes('BadCredentials')) {
      console.log('\n----------------------------------------------------')
      console.log('💡 REASON: 535 5.7.8 BadCredentials / Authentication Error')
      console.log('Gmail rejected your username or app password.')
      console.log('Common reasons:')
      console.log('  1. You used your normal Gmail login password instead of a 16-character App Password.')
      console.log('  2. The Google App Password expired or was revoked (e.g. after changing account password).')
      console.log('  3. 2-Step Verification was turned off or reset on this Google account.')
      console.log('\n📌 HOW TO FIX THIS:')
      console.log('  1. Open your browser and go to: https://myaccount.google.com/apppasswords')
      console.log('     (Make sure 2-Step Verification is turned ON at https://myaccount.google.com/security)')
      console.log('  2. Under "App name", enter "Indore House Makers" and click "Create".')
      console.log('  3. Copy the 16-character password (e.g., "abcd efgh ijkl mnop").')
      console.log('  4. Update your server/.env file:')
      console.log('       EMAIL_USER=dilshad2307j@gmail.com')
      console.log('       NODEPASS=abcdefghijklmnop   (without spaces)')
      console.log('  5. Re-run this test script: npm run email:test')
      console.log('----------------------------------------------------')
    } else if (err.code === 'EDNS' || err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
      console.log('\n💡 REASON: Network or DNS timeout reaching smtp.gmail.com. Check your internet connection or firewall.')
    }
    process.exit(1)
  }
}

main()
