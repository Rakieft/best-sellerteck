const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
});

const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  const message = {
    from: env.smtp.from,
    to: email,
    subject: 'Password reset request',
    text: `Reset your password using this secure link: ${resetUrl}`
  };

  if (env.env === 'development' && !env.smtp.user) {
    console.log('Password reset email preview:', message);
    return message;
  }

  return transporter.sendMail(message);
};

module.exports = { sendPasswordResetEmail };
