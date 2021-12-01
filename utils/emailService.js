const sgMail = require("@sendgrid/mail");

const sendActivationEmail = (data) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: data.email, // Change to your recipient
    from: "contact.ugmaroc@gmail.com", // Change to your verified sender
    subject: "Activation de votre compte E-learning",
    // text: 'and easy to do anywhere, even with Node.js',
    // html: `<strong>and easy to do anywhere, even with Node.js ${data.email}</strong>`,
    templateId: "d-e50ff19ee9db4b90823b14cff05ecbaf",
    dynamic_template_data: data,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  sendActivationEmail,
};
