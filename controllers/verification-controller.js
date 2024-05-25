const User = require('../models/user');
const nodemailer = require('nodemailer'); // https://nodemailer.com/
const createError = require('http-errors'); // https://www.npmjs.com/package/http-errors
const asyncHandler = require('express-async-handler'); // https://www.npmjs.com/package/express-async-handler
const { issueJwt } = require('../utils/util');

/**
 * Generate verification email template to send based on given `name` and `token`.
 * @param {string} name - name of email recipient
 * @param {string} token - JWT
 * @returns {string} HTML email template
 */
function generateEmailTemplate(name, token) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173/'
      : 'http://horizons-ma.pages.dev/';

  const url = `${baseUrl}verify-email?token=${token}`;
  const mailto = 'horizons-support@matthewaubert.com';

  return `
    <p>Hi, ${name}. Thanks for using Horizons!</p>
    <p>
      To verify that this is your email address, <a href="${url}">please click here</a>
      or copy and paste the link below into your browser, and you'll be sent to a page
      where you can get started writing your own posts.
    </p>
    <p>Link: <a href="${url}">${url}</a></p>
    <p>
      If you have any trouble, please feel free to email me at
      <a href="mailto:${mailto}">${mailto}</a>
    </p>
    <p>Sincerely,<br />Matthew<br />Horizons developer</p>
  `;
}

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

/**
 * Send verification email with given `token` to given `user`'s email address.
 * @param {object} user - `User` object instance with `email` and `firstName` properties
 * @param {string} token - JWT
 */
async function sendVerificationEmail(user, token) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Matthew Aubert" <horizons-noreply@matthewaubert.com>', // sender address
    to: user.email, // list of receivers
    subject: 'Horizons Email Verification', // subject line
    html: generateEmailTemplate(user.firstName, token), // html body
  });

  // e.g. 'Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@matthewaubert.com>'
  console.log('Message sent:', info.messageId);
}

// POST email verification (trigger sending an email)
exports.post = async (req, res, next) => {
  const { user } = req.authData;

  try {
    await sendVerificationEmail(user, req.token);
    res.json({
      success: true,
      message: `Verification email sent to ${user.email}`,
    });
  } catch (err) {
    next(createError(500, 'Failed to send verification email'));
  }
};

// PATCH email verification (update `isVerified`)
exports.patch = asyncHandler(async (req, res, next) => {
  // find user and update verification status
  const user = await User.findByIdAndUpdate(
    req.authData.user._id,
    { isVerified: true }, // update
    { new: true }, // options
  ).exec();

  if (!user) return next(createError(500, "Unable to verify user's account"));

  // issue new JWT and user data as JSON
  res.json({
    success: true,
    message: `User '${user.username}' is now verified`,
    token: issueJwt(user),
    data: user,
  });
});
