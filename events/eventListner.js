const events = require("events");
const { sendActivationEmail } = require("../utils/emailService");

//create an object of EventEmitter class from events module
const event = new events.EventEmitter();
event.setMaxListeners(100);

//Subscribe for ping event
event.on("ping", function (data) {
  console.log("First event: " + data);
});

event.on("sendActivationEmail", function (user) {
  console.log("Send Activation email event trigged");

  const { email, lastname, firstname, activationToken } = user;

  const link = `${
    process.env.WEBSITE_URL || "http://localhost:3000"
  }/account/activate/${activationToken}`;

  sendActivationEmail({
    email,
    name: lastname + " " + firstname,
    link,
  });
});

event.on("error", (err) => {
  console.error("whoops! there was an error bro!" + err);
});

module.exports = event;
