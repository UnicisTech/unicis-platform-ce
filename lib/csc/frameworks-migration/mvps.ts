export default [
  {
    id: 'mvsp-1-1',
    code: 'MVSP-1.1',
    section: 'Business controls',
    control: 'Vulnerability reports',
    label: 'Vulnerability reports',
    requirements:
      'Publish the point of contact for security reports on your website\nRespond to security reports within a reasonable time frame',
  },
  {
    id: 'mvsp-1-2',
    code: 'MVSP-1.2',
    section: 'Business controls',
    control: 'Customer testing',
    label: 'Customer testing',
    requirements:
      'On request, enable your customers or their delegates to test the security of your application\nTest on a non-production environment if it closely resembles the production environment in functionality\nEnsure non-production environments do not contain production data',
  },
  {
    id: 'mvsp-1-3',
    code: 'MVSP-1.3',
    section: 'Business controls',
    control: 'Self-assessment',
    label: 'Self-assessment',
    requirements:
      'Perform annual (at a minimum) security self-assessments using this document',
  },
  {
    id: 'mvsp-1-4',
    code: 'MVSP-1.4',
    section: 'Business controls',
    control: 'External testing',
    label: 'External testing',
    requirements:
      'Contract a security vendor to perform annual, comprehensive penetration tests on your systems',
  },
  {
    id: 'mvsp-1-5',
    code: 'MVSP-1.5',
    section: 'Business controls',
    control: 'Training',
    label: 'Training',
    requirements:
      'Implement role-specific security training for your personnel that is relevant to their business function',
  },
  {
    id: 'mvsp-1-6',
    code: 'MVSP-1.6',
    section: 'Business controls',
    control: 'Compliance',
    label: 'Compliance',
    requirements:
      'Comply with all industry security standards relevant to your business such as PCI DSS, HITRUST, ISO27001, and SSAE 18\nComply with local laws and regulations in jurisdictions applicable to your company and your customers, such as GDPR, Binding Corporate Rules, and Standard Contractual Clauses\nEnsure data localization requirements are implemented in line with local regulations and contractual obligations',
  },
  {
    id: 'mvsp-1-7',
    code: 'MVSP-1.7',
    section: 'Business controls',
    control: 'Incident handling',
    label: 'Incident handling',
    requirements:
      'Notify your customers about a breach without undue delay, no later than 72 hours upon discovery\nInclude the following information in the notification:\n- Relevant point of contact\n- Preliminary technical analysis of the breach\n- Remediation plan with reasonable timelines',
  },
  {
    id: 'mvsp-1-8',
    code: 'MVSP-1.8',
    section: 'Business controls',
    control: 'Data handling',
    label: 'Data handling',
    requirements:
      'Ensure media sanitization processes based on NIST SP 800-88 or equivalent are implemented',
  },
  {
    id: 'mvsp-2-1',
    code: 'MVSP-2.1',
    section: 'Application design controls',
    control: 'Single Sign-On',
    label: 'Single Sign-On',
    requirements:
      'Implement single sign-on using modern and industry standard protocols',
  },
  {
    id: 'mvsp-2-2',
    code: 'MVSP-2.2',
    section: 'Application design controls',
    control: 'HTTPS-only',
    label: 'HTTPS-only',
    requirements:
      'Redirect traffic from HTTP protocol (port 80) to HTTPS (port 443)\nNote: This does not apply to secure protocols designed to run on top of unencrypted connections, such as OCSP\nScan and address issues using freely available modern TLS scanning tools\nInclude the Strict-Transport-Security header on all pages with the includeSubdomains directive',
  },
  {
    id: 'mvsp-2-3',
    code: 'MVSP-2.3',
    section: 'Application design controls',
    control: 'Security Headers',
    label: 'Security Headers',
    requirements:
      'Apply appropriate security headers to reduce the application attack surface and limit post exploitation:\n- Set a minimally permissive Content Security Policy\n- Limit the ability to iframe sensitive application content where appropriate',
  },
  {
    id: 'mvsp-2-4',
    code: 'MVSP-2.4',
    section: 'Application design controls',
    control: 'Password policy',
    label: 'Password policy',
    requirements:
      'If password authentication is used in addition to single sign-on:\n- Do not limit the permitted characters that can be used\n- Do not limit the length of the password to anything below 64 characters\n- Do not use secret questions as a sole password reset requirement\n- Require email verification of a password change request\n- Require the current password in addition to the new password during password change\n- Store passwords in a hashed and salted format using a memory-hard or CPU-hard one-way hash function\n- Enforce appropriate account lockout and brute-force protection on account access',
  },
  {
    id: 'mvsp-2-5',
    code: 'MVSP-2.5',
    section: 'Application design controls',
    control: 'Security libraries',
    label: 'Security libraries',
    requirements:
      'Use frameworks, template languages, or libraries that systemically address implementation weaknesses by escaping the outputs and sanitizing the inputs\nExample: ORM for database access, UI framework for rendering DOM',
  },
  {
    id: 'mvsp-2-6',
    code: 'MVSP-2.6',
    section: 'Application design controls',
    control: 'Dependency Patching',
    label: 'Dependency Patching',
    requirements:
      'Apply security patches with a severity score of "medium" or higher, or ensure equivalent mitigations are available for all components of the application stack within one month of the patch release',
  },
  {
    id: 'mvsp-2-7',
    code: 'MVSP-2.7',
    section: 'Application design controls',
    control: 'Logging',
    label: 'Logging',
    requirements:
      'Keep logs of:\n- Users logging in and out\n- Read, write, delete operations on application and system\n- Security settings changes (including disabling logging)\n- Application owner access to customer data (access transparency)\n\nLogs must include user ID, IP address, valid timestamp, type of action performed, and object of this action. Logs must be stored for at least 30 days, and should not contain sensitive data or payloads. Users\n and objects',
  },
  {
    id: 'mvsp-2-8',
    code: 'MVSP-2.8',
    section: 'Application design controls',
    control: 'Encryption',
    label: 'Encryption',
    requirements:
      'Use available means of encryption to protect sensitive data in transit between systems and at rest in online data storages and backups',
  },
  {
    id: 'mvsp-3-1',
    code: 'MVSP-3.1',
    section: 'Application implementation controls',
    control: 'List of data',
    label: 'List of data',
    requirements:
      'Maintain a list of sensitive data types that the application is expected to process',
  },
  {
    id: 'mvsp-3-2',
    code: 'MVSP-3.2',
    section: 'Application implementation controls',
    control: 'Data flow diagram',
    label: 'Data flow diagram',
    requirements:
      'Maintain an up-to-date diagram indicating how sensitive data reaches your systems and where it ends up being stored',
  },
  {
    id: 'mvsp-3-3',
    code: 'MVSP-3.3',
    section: 'Application implementation controls',
    control: 'Vulnerability prevention',
    label: 'Vulnerability prevention',
    requirements:
      "Train your developers and implement development guidelines to prevent at least the following vulnerabilities:\n- Authorization bypass. Example: Accessing other customers' data or admin features from a regular account\n- Insecure session ID. Examples: Guessable token; a token stored in an insecure location (e.g. cookie without secure and httpOnly flags set)\n- Injections. Examples: SQL injection, NoSQL injection, XXE, OS command injection\n- Cross-site scripting. Examples: Calling insecure JavaScript functions, performing insecure DOM manipulations, echoing back user input into HTML without escaping\n- Cross-site request forgery. Example: Accepting requests with an Origin header from a different domain\n- Use of vulnerable libraries. Example: Using server-side frameworks or JavaScript libraries with known vulnerabilities",
  },
  {
    id: 'mvsp-3-4',
    code: 'MVSP-3.4',
    section: 'Application implementation controls',
    control: 'Time to fix vulnerabilities',
    label: 'Time to fix vulnerabilities',
    requirements:
      'Produce and deploy patches to address application vulnerabilities that materially impact security within 90 days of discovery',
  },
  {
    id: 'mvsp-3-5',
    code: 'MVSP-3.5',
    section: 'Application implementation controls',
    control: 'Build process',
    label: 'Build process',
    requirements:
      'Build processes must be fully scripted/automated and generate provenance (SLSA Level 1)',
  },
  {
    id: 'mvsp-4-1',
    code: 'MVSP-4.1',
    section: 'Operational controls',
    control: 'Physical access',
    label: 'Physical access',
    requirements:
      'Validate the physical security of relevant facilities by ensuring the following controls are in place:\n- Layered perimeter controls and interior barriers\n- Managed access to keys\n- Entry and exit logs\n- Appropriate response plan for intruder alerts',
  },
  {
    id: 'mvsp-4-2',
    code: 'MVSP-4.2',
    section: 'Operational controls',
    control: 'Logical access',
    label: 'Logical access',
    requirements:
      '- Limit sensitive data access exclusively to users with a legitimate need. The data owner must authorize such access\n- Deactivate redundant accounts and expired access grants in a timely manner\n- Perform regular reviews of access to validate need to know\n- Ensure remote access to customer data or production systems requires the use of Multi-Factor Authentication',
  },
  {
    id: 'mvsp-4-3',
    code: 'MVSP-4.3',
    section: 'Operational controls',
    control: 'Sub-processors',
    label: 'Sub-processors',
    requirements:
      '- Publish a list of third-party companies with access to customer data on your website\n- Assess third-party companies annually against this baseline',
  },
  {
    id: 'mvsp-4-4',
    code: 'MVSP-4.4',
    section: 'Operational controls',
    control: 'Backup and Disaster recovery',
    label: 'Backup and Disaster recovery',
    requirements:
      '- Securely back up all data to a different location than where the application is running\n- Maintain and periodically test disaster recovery plans\n- Periodically test backup restoration',
  },
];
