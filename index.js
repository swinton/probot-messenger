const getConfig = require('probot-config')
const sendEmail = require('./lib/email')

module.exports = (robot) => {
  robot.on('push', async context => {
    const config = await getConfig(context, 'probot-messenger.yml')
    let addresses = []

    let nameWithOwner = context.payload.repository.full_name
    let firstCommitSha = context.payload.commits[0].id.slice(0, 8)
    let firstCommitTitle = context.payload.commits[0]['message']
    let compare = context.payload.compare

    config.services.forEach((el) => {
      if (el.name === 'email') {
        addresses = el.addresses
      }
    })

    if (addresses.length !== 0) {
      sendEmail(addresses, nameWithOwner, firstCommitSha, firstCommitTitle, compare)
    }
  })

  robot.on('repository.publicized', async context => {
    // Code was pushed to the repo, what should we do with it?
    robot.log(context)
  })
}
