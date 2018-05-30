const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const process = require('process')

async function sendEmail (addresses, nameWithOwner, firstCommitSha, firstCommitTitle, compare) {
  let options = {
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD
    }
  }

  let client = nodemailer.createTransport(sgTransport(options))

  addresses.forEach((address) => {
    // Message object
    let message = {
      from: 'Probot Messenger <probot-messenger@no-reply.com>',
      to: address,
      subject: `[${nameWithOwner}] ${firstCommitSha}: ${firstCommitTitle}`,
      text: compare,
      html: compare
    }

    client.sendMail(message, (err, info) => {
      if (err) {
        console.log(`Error occurred: ${err.message}`)
      } else {
        console.log(`Message sent: ${info.response}`)
      }
    })
  })
}

module.exports = sendEmail
