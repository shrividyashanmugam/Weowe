import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to, subject, html
  })
}

export const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to WeOwe! 🎉',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:32px">
        <h2 style="color:#1A6B6B;font-family:Poppins,sans-serif">Welcome, ${name}!</h2>
        <p>You've successfully joined WeOwe – the smart way to split expenses with friends.</p>
        <p style="color:#636E72">Start by creating a group or adding an expense.</p>
        <a href="${process.env.CLIENT_URL}/dashboard"
           style="background:#1A6B6B;color:#fff;padding:12px 24px;border-radius:12px;
                  text-decoration:none;display:inline-block;margin-top:16px">
          Go to Dashboard
        </a>
      </div>`
  }),
  friendRequest: (fromName, toName) => ({
    subject: `${fromName} wants to split expenses with you on WeOwe`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:32px">
        <h2 style="color:#1A6B6B;font-family:Poppins,sans-serif">Friend Request</h2>
        <p>Hi ${toName}, <strong>${fromName}</strong> sent you a friend request on WeOwe.</p>
        <a href="${process.env.CLIENT_URL}/friends"
           style="background:#1A6B6B;color:#fff;padding:12px 24px;border-radius:12px;
                  text-decoration:none;display:inline-block;margin-top:16px">
          View Request
        </a>
      </div>`
  }),
  settlementReminder: (fromName, toName, amount, currency) => ({
    subject: `Payment reminder from ${fromName} on WeOwe`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:32px">
        <h2 style="color:#1A6B6B;font-family:Poppins,sans-serif">Payment Reminder</h2>
        <p>Hi ${toName}, <strong>${fromName}</strong> is reminding you about a payment.</p>
        <div style="background:#E8F8F5;padding:16px;border-radius:12px;margin:16px 0">
          <p style="margin:0;font-size:24px;font-weight:700;color:#1A6B6B">${currency} ${amount}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/settlements"
           style="background:#1A6B6B;color:#fff;padding:12px 24px;border-radius:12px;
                  text-decoration:none;display:inline-block">
          Settle Now
        </a>
      </div>`
  })
}
