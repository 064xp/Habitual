const nodemailer = require("nodemailer");

if (process.env.NODE_ENV == "debug") {
  const dotenv = require("dotenv");
  dotenv.config();
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_ADDR,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    ciphers: "SSLv3"
  }
});

module.exports.sendMail = (recipients, subject, contents, isHtml = true) => {
  var mailOptions = {
    from: process.env.EMAIL_ADDR,
    to: recipients,
    subject: subject,
    text: isHtml ? undefined : contents,
    html: isHtml ? contents : undefined
  };

  return transporter.sendMail(mailOptions);
};
