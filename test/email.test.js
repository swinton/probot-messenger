// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
// Requiring our app
const app = require('..')

// Mock nodemailer
const nodemailer = require('nodemailer')

const sendEmailMock = jest.fn(mailOptions => {
  return Promise.resolve()
})
nodemailer.createTransport = jest.fn(address => {
  return {
    sendMail: sendEmailMock
  }
})

function fixture (name, path) {
  return {
    event: name,
    payload: require(path)
  }
}

describe('probot-messenger', () => {
  let robot
  let github

  beforeEach(() => {
    sendEmailMock.mockClear()

    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)
  })

  describe('sending email', () => {
    beforeEach(() => {
      const config = `
      services:
        -
          name: email
          addresses:
            - hubot@users.noreply.github.com
            - octocat@users.noreply.github.com
      `

      github = {
        repos: {
          getContent: jest.fn().mockImplementation(() => Promise.resolve({
            data: {
              content: Buffer.from(config).toString('base64')
            }
          }))
        }
      }
      // Passes the mocked out GitHub API into out robot instance
      robot.auth = () => Promise.resolve(github)
    })

    it('sends an email when receiving a push payload', async () => {
      const payload = fixture('push', './fixtures/push.json')
      // Simulates delivery of a payload
      await robot.receive(payload)

      const request = {
        'from': 'Probot Messenger <probot-messenger@no-reply.com>',
        'to': 'hubot@users.noreply.github.com',
        'subject': '[baxterthehacker/public-repo] 0d1a26e6: Update README.md',
        'text': `Branch: refs/heads/changes
        Home:   https://github.com/baxterthehacker/public-repo
        Commit: 0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c
            https://github.com/baxterthehacker/public-repo/commit/0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c
        Author: baxterthehacker <baxterthehacker@users.noreply.github.com>
        Date:   2015-05-05T19:40:15-04:00 (Tue, 05 May 2015)

        Log Message:
        -----------
        Update README.md

        Compare: https://github.com/baxterthehacker/public-repo/compare/9049f1265b7d...0d1a26e67d8f
        `.replace(/^ {8}/gm, '')
      }

      expect(sendEmailMock).toHaveBeenCalled()
      const argumentToMock = sendEmailMock.mock.calls[0][0]
      expect(request.from).toEqual(argumentToMock.from)
      expect(request.to).toEqual(argumentToMock.to)
      expect(request.subject).toEqual(argumentToMock.subject)
      expect(request.text).toEqual(argumentToMock.text)
      expect(`<pre>${request.text}</pre>`).toEqual(argumentToMock.html)
    })
  })
})
