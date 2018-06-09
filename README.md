# probot-messenger

[![](https://api.travis-ci.org/gjtorikian/probot-messenger.svg?branch=master)](https://travis-ci.org/gjtorikian/probot-messenger/)

> A self-hosted [Probot](https://github.com/probot/probot) app that delivers [push event](https://developer.github.com/v3/activity/events/types/#pushevent) details to your inbox

`probot-messenger` may be used as a self-hosted replacement to the [email service](https://github.com/github/github-services/blob/f9e3a6b98d76d9964a6613d581164039b8d54d89/lib/services/email.rb) that is [due to be deprecated](https://developer.github.com/changes/2018-04-25-github-services-deprecation/) on January 31, 2019.

## Setup

### Overview

1. [Register a GitHub App](#register-a-github-app)
1. [Create a SendGrid API key](#create-a-sendgrid-api-key)
    - [Domain authentication](#domain-authentication)
1. [Deploy to Heroku](#deploy-to-heroku)
1. [Update your GitHub App](#update-your-github-app)
1. [Install your GitHub App](#install-your-github-app)
1. [Configure your installation](#configure-your-installation)

### Detail

#### Register a GitHub App

[Register a new GitHub App](https://developer.github.com/apps/building-github-apps/creating-a-github-app/), providing a `GitHub App name`, and `Homepage URL`, and having the following properties:

**Permissions**

1. `Repository contents`: Read only

**Event subscriptions**

1. `Push`

**Webhook URL**

For now, use a temporary value, such as `http://localhost`, we'll come back to this shortly.

**Webhook Secret**

Be sure to [secure your webhooks](https://developer.github.com/webhooks/securing/), to ensure the authenticity of requests from GitHub, by providing a `Webhook Secret`. Use a random string with high entropy (e.g., by taking the output of `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'` at the terminal).

**Private key**

After creating the GitHub App, be sure to [generate a private key](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#generating-a-private-key), store this in a safe place.

#### Create a SendGrid API key

[Sign up for a _free_ SendGrid account](https://app.sendgrid.com/signup), and [create an API key](https://app.sendgrid.com/settings/api_keys) with Mail Send access.

##### Domain authentication

It is recommended to set up [domain authentication](https://sendgrid.com/docs/User_Guide/Settings/Sender_authentication/How_to_set_up_domain_authentication.html) in SendGrid in order to signal to email providers that SendGrid has permission to send emails on your behalf.

#### Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/gjtorikian/probot-messenger/tree/master)

[Deploy your app to Heroku](https://heroku.com/deploy?template=https://github.com/gjtorikian/probot-messenger/tree/master), populating the `Config Vars` with your GitHub App's `APP_ID`, `WEBHOOK_SECRET`, and `PRIVATE_KEY`, as well as your SendGrid API key, `SENDGRID_APIKEY`.

#### Update your GitHub App

Update your GitHub App's `Webhook URL`, with the `URL` of your Heroku app.

#### Install your GitHub App

Install your GitHub App on the account, or repository that you wish to receive email notifications from.

#### Configure your installation

Configure the installed app, by creating a `.github/probot-messenger.yml` file in the root of the repository, for example:

```yaml
---
services:
- name: email
  addresses: # a list of addresses to send notifications to
  - to@example.com
  sender: # the email address of the notification sender
    name: From
    address: from@example.com
```

Consider adding your `sender.from` address as a contact, to avoid it being flagged as spam.

## Usage

Once configured, a push to any branch of a configured repository will generate a notification to the addresses defined in your `.github/probot-messenger.yml`.
