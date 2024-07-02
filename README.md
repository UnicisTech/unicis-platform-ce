# Unicis Platform Community Edition (free and open source)

![GitHub followers](https://img.shields.io/github/followers/UnicisTech)
![GitHub Repo stars](https://img.shields.io/github/stars/UnicisTech/unicis-platform-ce)
[![GitHub forks](https://img.shields.io/github/forks/UnicisTech/unicis-platform-ce)](https://img.shields.io/github/forks/UnicisTech/unicis-platform-ce)
[![Mastodon Follow](https://img.shields.io/mastodon/follow/110267135494682486)](https://mastodon.xyz/@unicis_tech)
[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/UnicisTech)](https://twitter.com/UnicisTech)
[![Static Badge](https://img.shields.io/badge/LinkedIn%2C%20https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Funicis-tech-o%C3%BC%2F?logo=LinkedIn&label=LinkedIn&link=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Funicis-tech-o%C3%BC%2F)](https://www.linkedin.com/company/unicis-tech-o%C3%BC/)
[![Discord](https://img.shields.io/discord/1110270854824214589)](https://discord.com/invite/8TwyeD97HD)


Unicis Platform Community Edition - an open core, enterprise-ready trust management platform for startups and SMEs.
[Learn how to get started](https://www.unicis.tech/docs/platform/install/unicis-platform-community-edition-hosted) with Unicis Platform Community Edition (Self-Hosted).

> [!NOTE]  
> Unicis Platform Community Edition is currently in **BETA**. We value your [feedback](https://feedback.unicis.tech/) as we progress towards a stable release.

#### Free and open source community edition - all-in-one tools for security, privacy and compliance team

![unicis-platform-beta-poster](https://www.unicis.tech/img/unicis-platform-beta-001.png)

Please star ⭐ the repo if you want us to continue developing and improving the Unicis Platform and [community support](https://www.unicis.tech/community)! 😀

Subscribe to our [newsletter](https://www.unicis.tech/newsletter?mtm_campaign=github&mtm_source=github) to stay informed.

## 📖 Additional Resources

- [Unicis Platform getting started documentation](https://www.unicis.tech/docs/unicis_platform_intro)


## Applications

- [Dashboard](https://www.unicis.tech/docs/platform/using/dashboard)
- [Tasks](https://www.unicis.tech/docs/platform/using/tasks)
- [Record of Processing Activities](https://www.unicis.tech/docs/platform/using/record-processing-actitivities)
- [Transfer Impact Assessment](https://www.unicis.tech/docs/platform/using/transfer-impact-assessment)
- [Cybersecurity Controls: MVSP](https://www.unicis.tech/docs/platform/using/cybersecurity-management-system)
- [Settings](https://www.unicis.tech/docs/platform/using/settings)

## Frameworks Support

We support the following framework controls, international standards and benchmarking:

- [General Data Protection Regulation (GDPR)](https://www.unicis.tech/frameworks/gdpr)
- [Minimum Viable Secure Product (MVSP)](https://www.unicis.tech/frameworks/mvsp)
- [ISO/IEC 27001:2013 and ISO/IEC 27001:2022](https://www.unicis.tech/frameworks/iso27k)
- [National Institute of Standards and Technology (NIST) Cybersecurity Framework (CSF) 2.0](https://www.unicis.tech/frameworks/nist-csf2)
- EU Cyber Resilience Act (coming soon)
- EU Digital Operational Resilience Act (DORA) (coming soon)
- EU The NIS2 Directive (coming soon)
- Payment Card Industry Data Security Standard PCI-DSS (coming soon)
- System and Organization Controls (SOC) (coming soon)
- Center for Internet Security (CIS) (coming soon)
- Cloud Security Alliance (CSA) (comming soon)
- C5 (Cloud Computing Compliance Criteria Catalogue) BSI (coming soon)
- Custom frameworks (coming soon)

## 💳 Plans

> [!NOTE]  
> For self-hosted Unicis Platform Community Edition Premium and Ultimate plans please reach out to us directly and it is only available via private repository, please see [pricing page](https://www.unicis.tech/pricing).

### Community Plan

Applications
- Record of Processing Activities
- Transfer Impact Assessment
- Cybersecurity Controls: MVSP
Features:
- SSO & SAML
- [Community Support](https://discord.com/invite/8TwyeD97HD)

### Premium Plan


Everything in Community

Applications: 
- IA Chat (coming soon)
- Interactive Awareness Program (coming soon)
- Privacy Impact Assessment (coming soon)
- Cybersecurity Controls: MVSP + ISO27001
- Cybersecurity Risk Management (coming soon)

Features

From Community
- Webhooks & API

### Ultimate Plan

Everything in Premium

Applications:
- Processor Questionnaire Checklist (coming soon)
- Cybersecurity Controls + NIST CSF2.0 standard
- Asset Inventory Management (coming soon)
- Benchmark Report (coming soon)
- Vendor Assessment Checklist (coming soon)
- Vendor Report (coming soon)

Features

From Premium
- Audit Logs

For more details please visit the [pricing page](https://www.unicis.tech/pricing).

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
- Billing

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

How to self-host [deployment documentation](https://www.unicis.tech/docs/platform/install/unicis-platform-community-edition-hosted).

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

## Changelog

Available on our website [changelog and released](https://www.unicis.tech/docs/platform/using/settings).

## ✨ Contributing

Thanks for taking the time to contribute! Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

[Contributing Guide](https://github.com/UnicisTech/unicis-platform-ce/blob/main/CONTRIBUTING.md)

## 💰 Support and Sponsor Us

Financially support the project via [GitHub Sponsors](https://github.com/sponsors/UnicisTech) and  [Open Collective](https://opencollective.com/unicis-platform-ce).

## 🤩 Community

- [Discord](https://discord.com/invite/8TwyeD97HD) (For live discussion with the Open-Source Community and Unicis team)
- [X](https://twitter.com/UnicisTech) / [LinkedIn](https://www.linkedin.com/company/unicis-tech-oü/) / [Mastodon](https://mastodon.xyz/@unicis_tech) (Follow us)
- [Vimeo](https://vimeo.com/user183384852) (Watch community events and tutorials)
- [GitHub Issues](https://github.com/UnicisTech/unicis-platform-ce/issues) (Contributions, report issues, and product ideas)
- [Feedback and Roadmap portal](https://feedback.unicis.tech/).


## 🛡️ License

[Apache 2.0 License](https://github.com/UnicisTech/unicis-platform-ce/blob/community-edition/LICENSE)
