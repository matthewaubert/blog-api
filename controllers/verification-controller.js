const nodemailer = require('nodemailer'); // https://nodemailer.com/

exports.get = (req, res) => {
  const { user } = req.authData;

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'http://horizons-ma.pages.dev/'
      : 'http://localhost:5173/';

  const url = `${baseUrl}verify-email?token=${req.token}`;
  const mailto = 'horizons-support@matthewaubert.com';
  const outputHtml = `
    <p>Hi, ${user.firstName}. Thanks for using Horizons!</p>
    <p>
      To verify that this is your email address, <a href="${url}">please click here</a>
      or copy and paste the link below into your browser, and you'll be sent to a page
      where you can get started writing your own posts.
    </p>
    <p>Link: <a href="${url}">${url}</a></p>
    <p>
      If you have any trouble, please feel free to email us at
      <a href="mailto:${mailto}">${mailto}</a>
    </p>
    <p>Sincerely,<br />The Horizons Team</p>
  `;

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    name: 'mail.matthewaubert.com',
    host: 'mail.matthewaubert.com',
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: 'horizons-noreply@matthewaubert.com',
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  async function sendVerificationEmail() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Matthew Aubert" <horizons-noreply@matthewaubert.com>', // sender address
      to: user.email, // list of receivers
      subject: 'Email Verification', // Subject line
      html: outputHtml, // html body
    });

    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    console.log('Message sent:', info.messageId);
  }

  sendVerificationEmail().catch(console.error);

  res.json({
    success: true,
    message: `Verification email sent to ${user.email}`,
  });
};
