require('dotenv').config()

const getConfig = require('probot-config');
const send = require('gmail-send');

module.exports = robot => {
  robot.on('push', async context => {
    const config = await getConfig(context, 'probot-messenger.yml');
    let addresses = [];

    let name_with_owner = context.payload.repository.full_name;
    let first_commit_sha = context.payload.commits[0].id.slice(0, 8);
    let first_commit_title = context.payload.commits[0]['message'];
    let compare = context.payload.compare;

    config.services.forEach( (el) => {
      if (el.name == 'email') {
        addresses = el.addresses
      }
    });

    if (addresses.length != 0) {
      sendEmail(addresses, name_with_owner, first_commit_sha, first_commit_title, compare);
    }
  });

  robot.on('repository.publicized', async context => {
    // Code was pushed to the repo, what should we do with it?
    robot.log(context)
  })

  function sendEmail (addresses, name_with_owner, first_commit_sha, first_commit_title, compare) {
    // Message object
    let message = {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
      to: addresses,
      subject: `[${name_with_owner}] ${first_commit_sha}: ${first_commit_title}`,
      text: compare,
      html: compare
    };

    send(message);
  }
}
