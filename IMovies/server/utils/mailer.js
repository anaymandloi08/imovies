const nodemailer = require("nodemailer");

// Create reusable transporter object using either environment config or mock
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "test@example.com",
      pass: process.env.SMTP_PASS || "password",
    },
  });
} catch (err) {
  console.log("Transporter creation notice:", err.message);
}

const verifyTransport = () => {
  if (transporter && process.env.SMTP_HOST) {
    transporter.verify((error, success) => {
      if (error) {
        console.log("Mailer verification warning:", error.message);
      } else {
        console.log("Mailer is ready to send messages");
      }
    });
  } else {
    console.log("Mailer configured in local/simulation mode");
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (transporter && process.env.SMTP_HOST) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"iMovies Support" <support@imovies.com>',
        to,
        subject,
        text,
        html,
      });
      return { success: true, info };
    } else {
      console.log(`[Simulated Email] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  verifyTransport,
  sendEmail,
};
