const getConfig = require("probot-config");
const nodemailer = require('nodemailer');

module.exports = robot => {
  robot.on("push", async context => {
    const config = await getConfig(context, "probot-messenger.yml");
    let addresses = [];

    let name_with_owner = context.payload.repository.full_name;
    let first_commit_sha = context.payload.commits[0].id.slice(0, 8);
    let first_commit_title = context.payload.commits[0]['message'];
    let compare = context.payload.compare;

    config.services.forEach( (el) => {
      if (el.name == "email") {
        addresses = el.addresses
      }
    });

    if (addresses.length != 0) {
      sendEmail(addresses, name_with_owner, first_commit_sha, first_commit_title, compare);
    }
  });

  robot.on("repository.publicized", async context => {
    // Code was pushed to the repo, what should we do with it?
    robot.log(context)
  })

  function sendEmail (addresses, name_with_owner, first_commit_sha, first_commit_title, compare) {
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
        subject: `[${name_with_owner}] ${first_commit_sha}: ${first_commit_title}`,
        text: compare,
        html: compare
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
