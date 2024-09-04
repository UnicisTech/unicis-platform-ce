# Unicis Platform Community (free and open source)

![Static Badge](https://img.shields.io/badge/Github%20stargazers%2C%20https%3A%2F%2Fgithub.com%2FUnicisTech%2Funicis-platform-ce%2Fstargazers?logo=github&label=GitHub%20Star&link=https%3A%2F%2Fgithub.com%2FUnicisTech%2Funicis-platform-ce%2Fstargazer)
![Static Badge](https://img.shields.io/badge/Github%20fork%2C%20https%3A%2F%2Fgithub.com%2FUnicisTech%2Funicis-platform-ce%2Ffork?logo=github&label=GitHub%20Fork&link=https%3A%2F%2Fgithub.com%2FUnicisTech%2Funicis-platform-ce%2Ffork)
[Mastodon](https://mastodon.xyz/@unicis_tech) |
![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/UnicisTech)
![Static Badge](https://img.shields.io/badge/LinkedIn%2C%20https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Funicis-tech-o%C3%BC%2F?logo=LinkedIn&label=LinkedIn&link=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Funicis-tech-o%C3%BC%2F) |
<a href="https://discord.com/invite/8TwyeD97HD">Discord</a>

Unicis Platform Community Edition - an open core, enterprise-ready trust management platform for startups and SMEs.

Please star ⭐ the repo if you want us to continue developing and improving the Unicis Platform! 😀

## 📖 Additional Resources

- [Unicis Platform getting started documentation](https://www.unicis.tech/docs/unicis_platform)

## 🛠️ Built With

- [SaaS-Starter-Kit](https://github.com/boxyhq/saas-starter-kit/)
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com) and [Atlaskit](https://atlaskit.atlassian.com/)
- [Postgres](https://www.postgresql.org)
- [React](https://reactjs.org)
- [Prisma](https://www.prisma.io)
- [TypeScript](https://www.typescriptlang.org)
- [SAML Jackson](https://github.com/boxyhq/jackson) (Provides SAML SSO, Directory Sync)
- [Svix](https://www.svix.com/) (Provides Webhook Orchestration)
- [Retraced](https://github.com/retracedhq/retraced) (Provides Audit Logs Service)
- Endpoints collection (Provided by [Osquery](https://osquery.io/))

## 🚀 Deployment

To Be Done

## ✨ Getting Started

Please follow these simple steps to get a local copy up and running.

### Prerequisites

- Node.js (Version: >=18.x)
- PostgreSQL
- NPM
- Docker compose

### Development

#### 1. Setup

- [Fork](https://github.com/UnicisTech/unicis-platform-ce/fork) the repository
- Clone the repository by using this command:

```bash
git clone https://github.com/<your_github_username>/unicis-platform-ce.git
```

#### 2. Go to the project folder

```bash
cd unicis-platform-ce
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Set up your .env file

Duplicate `.env.example` to `.env`.

```bash
cp .env.example .env
```

#### 5. Create a database (Optional)

To make the process of installing dependencies easier, we offer a `docker-compose.yml` with a Postgres container.

```bash
docker-compose up -d
```

#### 6. Set up database schema

```bash
npx prisma db push
```

#### 7. Start the server

In a development environment:

```bash
npm run dev
```

#### 8. Start the Prisma Studio

Prisma Studio is a visual editor for the data in your database.

```bash
npx prisma studio
```

#### 9. Testing

We are using [Playwright](https://playwright.dev/) to execute E2E tests. Add all tests inside the `/tests` folder.

Update `playwright.config.ts` to change the playwright configuration.

##### Install Playwright dependencies

```bash
npm run playwright:update
```

##### Run E2E tests

```bash
npm run test:e2e
```

_Note: HTML test report is generated inside the `report` folder. Currently supported browsers for test execution `chromium` and `firefox`_

#### Free and open source community edition - all-in-one tools for security, privacy and compliance team

![unicis-platform-beta-poster](https://www.unicis.tech/img/unicis-platform-beta-001.png)

## Applications

- [Record of Processing Activities](https://www.unicis.tech/docs/rpa)
- [Transfer Impact Assessment](https://www.unicis.tech/docs/tia)
- [Cybersecurity Controls: MVSP](https://www.unicis.tech/docs/csc)

## 🥇 Features

- Create account
- Sign in with Email and Password
- Sign in with Magic Link
- Sign in with SAML SSO
- Sign in with Google [[Setting up Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)]
- Sign in with GitHub [[Creating a Github OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)]
- Directory Sync (SCIM)
- Update account
- Create team
- Invite users to the team
- Manage team members
- Update team settings
- Webhooks & Events
- Internationalization
- Audit logs
- Roles and Permissions
- Dark mode

## ✨ Contributing

Thanks for taking the time to contribute! Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

[Contributing Guide](https://github.com/UnicisTech/unicis-platform-ce/blob/main/CONTRIBUTING.md)

## 🤩 Community

- [Discord](https://discord.com/invite/8TwyeD97HD) (For live discussion with the Open-Source Community and Unicis team)
- [X](https://twitter.com/UnicisTech) / [LinkedIn](https://www.linkedin.com/company/unicis-tech-oü/) / [Mastodon](https://mastodon.xyz/@unicis_tech) (Follow us)
- [Vimeo](https://vimeo.com/user183384852) (Watch community events and tutorials)
- [GitHub Issues](https://github.com/UnicisTech/unicis-platform-ce/issues) (Contributions, report issues, and product ideas)

## 🌍 Contributors

<a href="https://github.com/UnicisTech/unicis-platform-ce/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=UnicisTech/unicis-platform-ce" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## 🛡️ License

[Apache 2.0 License](https://github.com/UnicisTech/unicis-platform-ce/blob/community-edition/LICENSE)
