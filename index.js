const getConfig = require("probot-config");
const nodemailer = require('nodemailer');

module.exports = robot => {
  robot.on("push", async context => {
    const config = await getConfig(context, "probot-messenger.yml");
    let addresses = []
    config.services.forEach( (el) => {
      if (el.name == "email") {
        addresses = el.addresses
      }
    });

    if (addresses.length != 0) {
      sendEmail(addresses);
    }
  })

  robot.on("repository.publicized", async context => {
    // Code was pushed to the repo, what should we do with it?
    robot.log(context)
  })

  function sendEmail (addresses) {
    // Generate SMTP service account from ethereal.email
    nodemailer.createTestAccount((err, account) => {
      if (err) {
          console.error('Failed to create a testing account. ' + err.message);
          return process.exit(1);
      }

      console.log('Credentials obtained, sending message...');

      // Create a SMTP transporter object
      let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
      });

      // Message object
      let message = {
        from: 'Sender Name <sender@example.com>',
        to: 'Recipient <recipient@example.com>',
        subject: 'Nodemailer is unicode friendly ✔',
        text: 'Hello to myself!',
        html: '<p><b>Hello</b> to myself!</p>'
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  }
}
