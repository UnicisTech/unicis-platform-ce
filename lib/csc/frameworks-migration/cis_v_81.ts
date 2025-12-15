export default [
  {
    id: 'cisv81-1-1',
    code: '1,1',
    section: 'Identify',
    control: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    label: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    requirements:
      'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices,\u00a0MDM type tools can support this process, where appropriate. This inventory includes assets\u00a0connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise\u2019s network infrastructure, even if they are\u00a0not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.',
  },
  {
    id: 'cisv81-1-2',
    code: '1,2',
    section: 'Respond',
    control: 'Address Unauthorized Assets',
    label: 'Address Unauthorized Assets',
    requirements:
      'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
  },
  {
    id: 'cisv81-1-3',
    code: '1,3',
    section: 'Detect',
    control: 'Utilize an Active Discovery Tool',
    label: 'Utilize an Active Discovery Tool',
    requirements:
      'Utilize an active discovery tool to identify assets connected to the enterprise\u2019s network. Configure the active discovery tool to execute daily, or more frequently.',
  },
  {
    id: 'cisv81-1-4',
    code: '1,4',
    section: 'Identify',
    control:
      'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
    label:
      'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
    requirements:
      'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise\u2019s asset inventory. Review and use logs to update the enterprise\u2019s asset inventory weekly, or more frequently.',
  },
  {
    id: 'cisv81-1-5',
    code: '1,5',
    section: 'Detect',
    control: 'Use a Passive Asset Discovery Tool',
    label: 'Use a Passive Asset Discovery Tool',
    requirements:
      'Use a passive discovery tool to identify assets connected to the enterprise\u2019s network. Review and use scans to update the enterprise\u2019s asset inventory at least weekly, or more frequently.',
  },
  {
    id: 'cisv81-2-1',
    code: '2,1',
    section: 'Identify',
    control: 'Establish and Maintain a Software Inventory',
    label: 'Establish and Maintain a Software Inventory',
    requirements:
      'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
  },
  {
    id: 'cisv81-2-2',
    code: '2,2',
    section: 'Identify',
    control: 'Ensure Authorized Software is Currently Supported\u00a0',
    label: 'Ensure Authorized Software is Currently Supported\u00a0',
    requirements:
      'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise\u2019s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.',
  },
  {
    id: 'cisv81-2-3',
    code: '2,3',
    section: 'Respond',
    control: 'Address Unauthorized Software',
    label: 'Address Unauthorized Software',
    requirements:
      'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
  },
  {
    id: 'cisv81-2-4',
    code: '2,4',
    section: 'Detect',
    control: 'Utilize Automated Software Inventory Tools',
    label: 'Utilize Automated Software Inventory Tools',
    requirements:
      'Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.\u00a0',
  },
  {
    id: 'cisv81-2-5',
    code: '2,5',
    section: 'Protect',
    control: 'Allowlist Authorized Software',
    label: 'Allowlist Authorized Software',
    requirements:
      'Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess\u00a0bi-annually, or more frequently.',
  },
  {
    id: 'cisv81-2-6',
    code: '2,6',
    section: 'Protect',
    control: 'Allowlist Authorized Libraries',
    label: 'Allowlist Authorized Libraries',
    requirements:
      'Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually, or more frequently.',
  },
  {
    id: 'cisv81-2-7',
    code: '2,7',
    section: 'Protect',
    control: 'Allowlist Authorized Scripts',
    label: 'Allowlist Authorized Scripts',
    requirements:
      'Use technical controls, such as digital signatures and version control, to ensure that only authorized scripts, such as specific .ps1 and .py files, are allowed to execute. Block unauthorized scripts from executing. Reassess\u00a0bi-annually, or more frequently.',
  },
  {
    id: 'cisv81-3-1',
    code: '3,1',
    section: 'Govern',
    control: 'Establish and Maintain a Data Management Process',
    label: 'Establish and Maintain a Data Management Process',
    requirements:
      'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-3-2',
    code: '3,2',
    section: 'Identify',
    control: 'Establish and Maintain a Data Inventory',
    label: 'Establish and Maintain a Data Inventory',
    requirements:
      'Establish and maintain a data\u00a0inventory based on the enterprise\u2019s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.',
  },
  {
    id: 'cisv81-3-3',
    code: '3,3',
    section: 'Protect',
    control: 'Configure Data Access Control Lists',
    label: 'Configure Data Access Control Lists',
    requirements:
      'Configure data access control lists based on a user\u2019s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.',
  },
  {
    id: 'cisv81-3-4',
    code: '3,4',
    section: 'Protect',
    control: 'Enforce Data Retention',
    label: 'Enforce Data Retention',
    requirements:
      'Retain data according to the enterprise\u2019s documented data management process. Data retention must include both minimum and maximum timelines.',
  },
  {
    id: 'cisv81-3-5',
    code: '3,5',
    section: 'Protect',
    control: 'Securely Dispose of Data',
    label: 'Securely Dispose of Data',
    requirements:
      'Securely dispose of data as outlined in the enterprise\u2019s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.',
  },
  {
    id: 'cisv81-3-6',
    code: '3,6',
    section: 'Protect',
    control: 'Encrypt Data on End-User Devices',
    label: 'Encrypt Data on End-User Devices',
    requirements:
      'Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker\u00ae, Apple FileVault\u00ae, Linux\u00ae\u00a0dm-crypt.',
  },
  {
    id: 'cisv81-3-7',
    code: '3,7',
    section: 'Identify',
    control: 'Establish and Maintain a Data Classification Scheme',
    label: 'Establish and Maintain a Data Classification Scheme',
    requirements:
      'Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as \u201cSensitive,\u201d \u201cConfidential,\u201d and \u201cPublic,\u201d and classify their data according to those labels. Review and update the classification scheme annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-3-8',
    code: '3,8',
    section: 'Identify',
    control: 'Document Data Flows',
    label: 'Document Data Flows',
    requirements:
      'Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise\u2019s data management process. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-3-9',
    code: '3,9',
    section: 'Protect',
    control: 'Encrypt Data on Removable Media',
    label: 'Encrypt Data on Removable Media',
    requirements: 'Encrypt data on removable media.',
  },
  {
    id: 'cisv81-3-10',
    code: '3,10',
    section: 'Protect',
    control: 'Encrypt Sensitive Data in Transit',
    label: 'Encrypt Sensitive Data in Transit',
    requirements:
      'Encrypt sensitive data in transit. Example implementations can include: Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).',
  },
  {
    id: 'cisv81-3-11',
    code: '3,11',
    section: 'Protect',
    control: 'Encrypt Sensitive Data at Rest',
    label: 'Encrypt Sensitive Data at Rest',
    requirements:
      'Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this Safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.',
  },
  {
    id: 'cisv81-3-12',
    code: '3,12',
    section: 'Protect',
    control: 'Segment Data Processing and Storage Based on Sensitivity',
    label: 'Segment Data Processing and Storage Based on Sensitivity',
    requirements:
      'Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.',
  },
  {
    id: 'cisv81-3-13',
    code: '3,13',
    section: 'Protect',
    control: 'Deploy a Data Loss Prevention Solution',
    label: 'Deploy a Data Loss Prevention Solution',
    requirements:
      "Implement an automated tool, such as a host-based Data Loss Prevention (DLP) tool to identify all sensitive data\u00a0stored, processed, or transmitted through enterprise assets, including those located onsite or at a remote service provider, and update the enterprise's data inventory.",
  },
  {
    id: 'cisv81-3-14',
    code: '3,14',
    section: 'Detect',
    control: 'Log Sensitive Data Access',
    label: 'Log Sensitive Data Access',
    requirements:
      'Log sensitive data access, including modification and disposal.',
  },
  {
    id: 'cisv81-4-1',
    code: '4,1',
    section: 'Govern',
    control: 'Establish and Maintain a Secure Configuration Process',
    label: 'Establish and Maintain a Secure Configuration Process',
    requirements:
      'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and\u00a0software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-4-2',
    code: '4,2',
    section: 'Govern',
    control:
      'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
    label:
      'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
    requirements:
      'Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-4-3',
    code: '4,3',
    section: 'Protect',
    control: 'Configure Automatic Session Locking on Enterprise Assets',
    label: 'Configure Automatic Session Locking on Enterprise Assets',
    requirements:
      'Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.',
  },
  {
    id: 'cisv81-4-4',
    code: '4,4',
    section: 'Protect',
    control: 'Implement and Manage a Firewall on\u00a0Servers',
    label: 'Implement and Manage a Firewall on\u00a0Servers',
    requirements:
      'Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.',
  },
  {
    id: 'cisv81-4-5',
    code: '4,5',
    section: 'Protect',
    control: 'Implement and Manage a Firewall on End-User Devices',
    label: 'Implement and Manage a Firewall on End-User Devices',
    requirements:
      'Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.',
  },
  {
    id: 'cisv81-4-6',
    code: '4,6',
    section: 'Protect',
    control: 'Securely Manage Enterprise Assets and Software',
    label: 'Securely Manage Enterprise Assets and Software',
    requirements:
      'Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.',
  },
  {
    id: 'cisv81-4-7',
    code: '4,7',
    section: 'Protect',
    control: 'Manage Default Accounts on Enterprise Assets and Software',
    label: 'Manage Default Accounts on Enterprise Assets and Software',
    requirements:
      'Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include: disabling default accounts or making them unusable.',
  },
  {
    id: 'cisv81-4-8',
    code: '4,8',
    section: 'Protect',
    control:
      'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
    label:
      'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
    requirements:
      'Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.',
  },
  {
    id: 'cisv81-4-9',
    code: '4,9',
    section: 'Protect',
    control: 'Configure Trusted DNS Servers on Enterprise Assets',
    label: 'Configure Trusted DNS Servers on Enterprise Assets',
    requirements:
      'Configure trusted DNS servers on network infrastructure. Example implementations include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.\u00a0',
  },
  {
    id: 'cisv81-4-10',
    code: '4,10',
    section: 'Protect',
    control: 'Enforce Automatic Device Lockout on Portable End-User Devices',
    label: 'Enforce Automatic Device Lockout on Portable End-User Devices',
    requirements:
      'Enforce automatic device lockout following a predetermined threshold of local failed authentication attempts on portable end-user devices, where supported. For laptops, do not allow more than 20 failed authentication attempts; for tablets and smartphones, no more than 10 failed authentication attempts. Example implementations include Microsoft\u00ae InTune Device Lock and Apple\u00ae Configuration Profile maxFailedAttempts.',
  },
  {
    id: 'cisv81-4-11',
    code: '4,11',
    section: 'Protect',
    control: 'Enforce Remote Wipe Capability on Portable End-User Devices',
    label: 'Enforce Remote Wipe Capability on Portable End-User Devices',
    requirements:
      'Remotely wipe enterprise data from enterprise-owned portable end-user devices when deemed appropriate such as lost or stolen devices, or when an individual no longer supports the enterprise.',
  },
  {
    id: 'cisv81-4-12',
    code: '4,12',
    section: 'Protect',
    control: 'Separate Enterprise Workspaces on Mobile End-User Devices',
    label: 'Separate Enterprise Workspaces on Mobile End-User Devices',
    requirements:
      'Ensure separate enterprise workspaces are used on mobile end-user devices, where supported. Example implementations include using an Apple\u00ae Configuration Profile or Android\u2122 Work Profile to separate enterprise applications and data from personal applications and data.',
  },
  {
    id: 'cisv81-5-1',
    code: '5,1',
    section: 'Identify',
    control: 'Establish and Maintain an Inventory of Accounts',
    label: 'Establish and Maintain an Inventory of Accounts',
    requirements:
      'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person\u2019s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.',
  },
  {
    id: 'cisv81-5-2',
    code: '5,2',
    section: 'Protect',
    control: 'Use Unique Passwords',
    label: 'Use Unique Passwords',
    requirements:
      'Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\u00a0',
  },
  {
    id: 'cisv81-5-3',
    code: '5,3',
    section: 'Protect',
    control: 'Disable Dormant Accounts',
    label: 'Disable Dormant Accounts',
    requirements:
      'Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.',
  },
  {
    id: 'cisv81-5-4',
    code: '5,4',
    section: 'Protect',
    control:
      'Restrict Administrator Privileges to Dedicated Administrator Accounts',
    label:
      'Restrict Administrator Privileges to Dedicated Administrator Accounts',
    requirements:
      'Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user\u2019s primary, non-privileged account.',
  },
  {
    id: 'cisv81-5-5',
    code: '5,5',
    section: 'Identify',
    control: 'Establish and Maintain an Inventory of Service Accounts',
    label: 'Establish and Maintain an Inventory of Service Accounts',
    requirements:
      'Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.',
  },
  {
    id: 'cisv81-5-6',
    code: '5,6',
    section: 'Govern',
    control: 'Centralize Account Management',
    label: 'Centralize Account Management',
    requirements:
      'Centralize account management through a directory or identity service.',
  },
  {
    id: 'cisv81-6-1',
    code: '6,1',
    section: 'Govern',
    control: 'Establish an Access Granting Process',
    label: 'Establish an Access Granting Process',
    requirements:
      'Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.',
  },
  {
    id: 'cisv81-6-2',
    code: '6,2',
    section: 'Govern',
    control: 'Establish an Access Revoking Process',
    label: 'Establish an Access Revoking Process',
    requirements:
      'Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.',
  },
  {
    id: 'cisv81-6-3',
    code: '6,3',
    section: 'Protect',
    control: 'Require MFA for Externally-Exposed Applications',
    label: 'Require MFA for Externally-Exposed Applications',
    requirements:
      'Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this Safeguard.',
  },
  {
    id: 'cisv81-6-4',
    code: '6,4',
    section: 'Protect',
    control: 'Require MFA for Remote Network Access',
    label: 'Require MFA for Remote Network Access',
    requirements: 'Require MFA for remote network access.',
  },
  {
    id: 'cisv81-6-5',
    code: '6,5',
    section: 'Protect',
    control: 'Require MFA for Administrative Access',
    label: 'Require MFA for Administrative Access',
    requirements:
      'Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.',
  },
  {
    id: 'cisv81-6-6',
    code: '6,6',
    section: 'Identify',
    control:
      'Establish and Maintain an Inventory of Authentication and Authorization Systems',
    label:
      'Establish and Maintain an Inventory of Authentication and Authorization Systems',
    requirements:
      'Establish and maintain an inventory of the enterprise\u2019s authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually, or more frequently.',
  },
  {
    id: 'cisv81-6-7',
    code: '6,7',
    section: 'Protect',
    control: 'Centralize Access Control',
    label: 'Centralize Access Control',
    requirements:
      'Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.',
  },
  {
    id: 'cisv81-6-8',
    code: '6,8',
    section: 'Govern',
    control: 'Define and Maintain Role-Based Access Control',
    label: 'Define and Maintain Role-Based Access Control',
    requirements:
      'Define and maintain role-based access control, through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties. Perform access control reviews of enterprise assets to validate that all privileges are authorized, on a recurring schedule at a minimum annually, or more frequently.',
  },
  {
    id: 'cisv81-7-1',
    code: '7,1',
    section: 'Govern',
    control: 'Establish and Maintain a Vulnerability Management Process',
    label: 'Establish and Maintain a Vulnerability Management Process',
    requirements:
      'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-7-2',
    code: '7,2',
    section: 'Govern',
    control: 'Establish and Maintain a Remediation Process',
    label: 'Establish and Maintain a Remediation Process',
    requirements:
      'Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.',
  },
  {
    id: 'cisv81-7-3',
    code: '7,3',
    section: 'Protect',
    control: 'Perform Automated Operating System Patch Management',
    label: 'Perform Automated Operating System Patch Management',
    requirements:
      'Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
  },
  {
    id: 'cisv81-7-4',
    code: '7,4',
    section: 'Protect',
    control: 'Perform Automated Application Patch Management',
    label: 'Perform Automated Application Patch Management',
    requirements:
      'Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
  },
  {
    id: 'cisv81-7-5',
    code: '7,5',
    section: 'Identify',
    control:
      'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
    label:
      'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
    requirements:
      'Perform automated vulnerability scans of internal enterprise assets on a quarterly, or more frequent, basis. Conduct both authenticated and unauthenticated scans.',
  },
  {
    id: 'cisv81-7-6',
    code: '7,6',
    section: 'Identify',
    control:
      'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
    label:
      'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
    requirements:
      'Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly, or more frequent, basis.\u00a0',
  },
  {
    id: 'cisv81-7-7',
    code: '7,7',
    section: 'Respond',
    control: 'Remediate Detected Vulnerabilities',
    label: 'Remediate Detected Vulnerabilities',
    requirements:
      'Remediate detected vulnerabilities in software through processes and tooling on a monthly, or more frequent, basis, based on the remediation process.',
  },
  {
    id: 'cisv81-8-1',
    code: '8,1',
    section: 'Govern',
    control: 'Establish and Maintain an Audit Log Management Process',
    label: 'Establish and Maintain an Audit Log Management Process',
    requirements:
      'Establish and maintain a documented audit log management process that defines the enterprise\u2019s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-8-2',
    code: '8,2',
    section: 'Detect',
    control: 'Collect Audit Logs',
    label: 'Collect Audit Logs',
    requirements:
      'Collect audit logs. Ensure that logging, per the enterprise\u2019s audit log management process, has been enabled across enterprise assets.',
  },
  {
    id: 'cisv81-8-3',
    code: '8,3',
    section: 'Protect',
    control: 'Ensure Adequate Audit Log Storage',
    label: 'Ensure Adequate Audit Log Storage',
    requirements:
      'Ensure that logging destinations maintain adequate storage to comply with the enterprise\u2019s audit log management process.',
  },
  {
    id: 'cisv81-8-4',
    code: '8,4',
    section: 'Protect',
    control: 'Standardize Time Synchronization',
    label: 'Standardize Time Synchronization',
    requirements:
      'Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.',
  },
  {
    id: 'cisv81-8-5',
    code: '8,5',
    section: 'Detect',
    control: 'Collect Detailed Audit Logs',
    label: 'Collect Detailed Audit Logs',
    requirements:
      'Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.',
  },
  {
    id: 'cisv81-8-6',
    code: '8,6',
    section: 'Detect',
    control: 'Collect DNS Query Audit Logs',
    label: 'Collect DNS Query Audit Logs',
    requirements:
      'Collect DNS query audit logs on enterprise assets, where appropriate and supported.',
  },
  {
    id: 'cisv81-8-7',
    code: '8,7',
    section: 'Detect',
    control: 'Collect URL Request Audit Logs',
    label: 'Collect URL Request Audit Logs',
    requirements:
      'Collect URL request audit logs on enterprise assets, where appropriate and supported.',
  },
  {
    id: 'cisv81-8-8',
    code: '8,8',
    section: 'Detect',
    control: 'Collect Command-Line Audit Logs',
    label: 'Collect Command-Line Audit Logs',
    requirements:
      'Collect command-line audit logs. Example implementations include collecting audit logs from PowerShell\u00ae, BASH\u2122, and remote administrative terminals.',
  },
  {
    id: 'cisv81-8-9',
    code: '8,9',
    section: 'Detect',
    control: 'Centralize Audit Logs',
    label: 'Centralize Audit Logs',
    requirements:
      'Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example implementations primarily include leveraging a SIEM tool to centralize multiple log sources.',
  },
  {
    id: 'cisv81-8-10',
    code: '8,10',
    section: 'Protect',
    control: 'Retain Audit Logs',
    label: 'Retain Audit Logs',
    requirements:
      'Retain audit logs across enterprise assets for a minimum of 90 days.',
  },
  {
    id: 'cisv81-8-11',
    code: '8,11',
    section: 'Detect',
    control: 'Conduct Audit Log Reviews',
    label: 'Conduct Audit Log Reviews',
    requirements:
      'Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.',
  },
  {
    id: 'cisv81-8-12',
    code: '8,12',
    section: 'Detect',
    control: 'Collect Service Provider Logs',
    label: 'Collect Service Provider Logs',
    requirements:
      'Collect service provider logs, where supported. Example implementations include collecting authentication and authorization events, data creation and disposal events, and user management events.',
  },
  {
    id: 'cisv81-9-1',
    code: '9,1',
    section: 'Protect',
    control: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
    label: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
    requirements:
      'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
  },
  {
    id: 'cisv81-9-2',
    code: '9,2',
    section: 'Protect',
    control: 'Use DNS Filtering Services',
    label: 'Use DNS Filtering Services',
    requirements:
      'Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.',
  },
  {
    id: 'cisv81-9-3',
    code: '9,3',
    section: 'Protect',
    control: 'Maintain and Enforce Network-Based URL Filters',
    label: 'Maintain and Enforce Network-Based URL Filters',
    requirements:
      'Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example implementations include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.',
  },
  {
    id: 'cisv81-9-4',
    code: '9,4',
    section: 'Protect',
    control:
      'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
    label:
      'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
    requirements:
      'Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.',
  },
  {
    id: 'cisv81-9-5',
    code: '9,5',
    section: 'Protect',
    control: 'Implement DMARC',
    label: 'Implement DMARC',
    requirements:
      'To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.',
  },
  {
    id: 'cisv81-9-6',
    code: '9,6',
    section: 'Protect',
    control: 'Block Unnecessary File Types',
    label: 'Block Unnecessary File Types',
    requirements:
      'Block unnecessary file types attempting to enter the enterprise\u2019s email gateway.',
  },
  {
    id: 'cisv81-9-7',
    code: '9,7',
    section: 'Protect',
    control: 'Deploy and Maintain Email Server Anti-Malware Protections',
    label: 'Deploy and Maintain Email Server Anti-Malware Protections',
    requirements:
      'Deploy and maintain email server anti-malware protections, such as attachment scanning and/or sandboxing.',
  },
  {
    id: 'cisv81-10-1',
    code: '10,1',
    section: 'Detect',
    control: 'Deploy and Maintain Anti-Malware Software',
    label: 'Deploy and Maintain Anti-Malware Software',
    requirements:
      'Deploy and maintain anti-malware software on all enterprise assets.',
  },
  {
    id: 'cisv81-10-2',
    code: '10,2',
    section: 'Protect',
    control: 'Configure Automatic Anti-Malware Signature Updates',
    label: 'Configure Automatic Anti-Malware Signature Updates',
    requirements:
      'Configure automatic updates for anti-malware signature files on all enterprise assets.',
  },
  {
    id: 'cisv81-10-3',
    code: '10,3',
    section: 'Protect',
    control: 'Disable Autorun and Autoplay for Removable Media',
    label: 'Disable Autorun and Autoplay for Removable Media',
    requirements:
      'Disable autorun and autoplay auto-execute functionality for removable media.',
  },
  {
    id: 'cisv81-10-4',
    code: '10,4',
    section: 'Detect',
    control: 'Configure Automatic Anti-Malware Scanning of Removable Media',
    label: 'Configure Automatic Anti-Malware Scanning of Removable Media',
    requirements:
      'Configure anti-malware software to automatically scan removable media.',
  },
  {
    id: 'cisv81-10-5',
    code: '10,5',
    section: 'Protect',
    control: 'Enable Anti-Exploitation Features',
    label: 'Enable Anti-Exploitation Features',
    requirements:
      'Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft\u00ae Data Execution Prevention (DEP), Windows\u00ae Defender Exploit Guard (WDEG), or Apple\u00ae System Integrity Protection (SIP) and Gatekeeper\u2122.',
  },
  {
    id: 'cisv81-10-6',
    code: '10,6',
    section: 'Protect',
    control: 'Centrally Manage Anti-Malware Software',
    label: 'Centrally Manage Anti-Malware Software',
    requirements: 'Centrally manage anti-malware software.',
  },
  {
    id: 'cisv81-10-7',
    code: '10,7',
    section: 'Detect',
    control: 'Use Behavior-Based Anti-Malware Software',
    label: 'Use Behavior-Based Anti-Malware Software',
    requirements: 'Use behavior-based anti-malware software.',
  },
  {
    id: 'cisv81-11-1',
    code: '11,1',
    section: 'Govern',
    control: 'Establish and Maintain a Data Recovery Process\u00a0',
    label: 'Establish and Maintain a Data Recovery Process\u00a0',
    requirements:
      'Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-11-2',
    code: '11,2',
    section: 'Recover',
    control: 'Perform Automated Backups\u00a0',
    label: 'Perform Automated Backups\u00a0',
    requirements:
      'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.',
  },
  {
    id: 'cisv81-11-3',
    code: '11,3',
    section: 'Protect',
    control: 'Protect Recovery Data',
    label: 'Protect Recovery Data',
    requirements:
      'Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.',
  },
  {
    id: 'cisv81-11-4',
    code: '11,4',
    section: 'Recover',
    control:
      'Establish and Maintain an Isolated Instance of Recovery Data\u00a0',
    label: 'Establish and Maintain an Isolated Instance of Recovery Data\u00a0',
    requirements:
      'Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.',
  },
  {
    id: 'cisv81-11-5',
    code: '11,5',
    section: 'Recover',
    control: 'Test Data Recovery',
    label: 'Test Data Recovery',
    requirements:
      'Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.',
  },
  {
    id: 'cisv81-12-1',
    code: '12,1',
    section: 'Protect',
    control: 'Ensure Network Infrastructure is Up-to-Date',
    label: 'Ensure Network Infrastructure is Up-to-Date',
    requirements:
      'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network-as-a-service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.',
  },
  {
    id: 'cisv81-12-2',
    code: '12,2',
    section: 'Protect',
    control: 'Establish and Maintain a Secure Network Architecture',
    label: 'Establish and Maintain a Secure Network Architecture',
    requirements:
      'Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example implementations may include documentation, policy, and design components.',
  },
  {
    id: 'cisv81-12-3',
    code: '12,3',
    section: 'Protect',
    control: 'Securely Manage Network Infrastructure',
    label: 'Securely Manage Network Infrastructure',
    requirements:
      'Securely manage network infrastructure. Example implementations include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.\u00a0',
  },
  {
    id: 'cisv81-12-4',
    code: '12,4',
    section: 'Govern',
    control: 'Establish and Maintain Architecture Diagram(s)',
    label: 'Establish and Maintain Architecture Diagram(s)',
    requirements:
      'Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-12-5',
    code: '12,5',
    section: 'Protect',
    control:
      'Centralize Network Authentication, Authorization, and Auditing (AAA)',
    label:
      'Centralize Network Authentication, Authorization, and Auditing (AAA)',
    requirements: 'Centralize network AAA.',
  },
  {
    id: 'cisv81-12-6',
    code: '12,6',
    section: 'Protect',
    control:
      'Use of Secure Network Management and Communication Protocols\u00a0',
    label: 'Use of Secure Network Management and Communication Protocols\u00a0',
    requirements:
      'Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).',
  },
  {
    id: 'cisv81-12-7',
    code: '12,7',
    section: 'Protect',
    control:
      'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise\u2019s AAA Infrastructure',
    label:
      'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise\u2019s AAA Infrastructure',
    requirements:
      'Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.',
  },
  {
    id: 'cisv81-12-8',
    code: '12,8',
    section: 'Protect',
    control:
      'Establish and Maintain Dedicated Computing Resources for All Administrative Work',
    label:
      'Establish and Maintain Dedicated Computing Resources for All Administrative Work',
    requirements:
      "Establish and maintain\u00a0dedicated computing resources,\u00a0either physically or logically separated, for all administrative tasks or tasks requiring administrative access. The computing resources should be segmented from the enterprise's primary network and not be allowed internet access.",
  },
  {
    id: 'cisv81-13-1',
    code: '13,1',
    section: 'Detect',
    control: 'Centralize Security Event Alerting',
    label: 'Centralize Security Event Alerting',
    requirements:
      'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.',
  },
  {
    id: 'cisv81-13-2',
    code: '13,2',
    section: 'Detect',
    control: 'Deploy a Host-Based Intrusion Detection Solution',
    label: 'Deploy a Host-Based Intrusion Detection Solution',
    requirements:
      'Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.',
  },
  {
    id: 'cisv81-13-3',
    code: '13,3',
    section: 'Detect',
    control: 'Deploy a Network Intrusion Detection Solution',
    label: 'Deploy a Network Intrusion Detection Solution',
    requirements:
      'Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example implementations include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.',
  },
  {
    id: 'cisv81-13-4',
    code: '13,4',
    section: 'Protect',
    control: 'Perform Traffic Filtering Between Network Segments',
    label: 'Perform Traffic Filtering Between Network Segments',
    requirements:
      'Perform traffic filtering between network segments, where appropriate.',
  },
  {
    id: 'cisv81-13-5',
    code: '13,5',
    section: 'Protect',
    control: 'Manage Access Control for Remote Assets',
    label: 'Manage Access Control for Remote Assets',
    requirements:
      'Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.',
  },
  {
    id: 'cisv81-13-6',
    code: '13,6',
    section: 'Detect',
    control: 'Collect Network Traffic Flow Logs\u00a0',
    label: 'Collect Network Traffic Flow Logs\u00a0',
    requirements:
      'Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.',
  },
  {
    id: 'cisv81-13-7',
    code: '13,7',
    section: 'Protect',
    control: 'Deploy a Host-Based Intrusion Prevention Solution',
    label: 'Deploy a Host-Based Intrusion Prevention Solution',
    requirements:
      'Deploy a host-based intrusion prevention solution on enterprise assets, where appropriate and/or supported. Example implementations include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.',
  },
  {
    id: 'cisv81-13-8',
    code: '13,8',
    section: 'Protect',
    control: 'Deploy a Network Intrusion Prevention Solution',
    label: 'Deploy a Network Intrusion Prevention Solution',
    requirements:
      'Deploy a network intrusion prevention solution, where appropriate. Example implementations include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.',
  },
  {
    id: 'cisv81-13-9',
    code: '13,9',
    section: 'Protect',
    control: 'Deploy Port-Level Access Control',
    label: 'Deploy Port-Level Access Control',
    requirements:
      'Deploy port-level access control. Port-level access control utilizes 802.1x, or similar network access control protocols, such as certificates, and may incorporate user and/or device authentication.',
  },
  {
    id: 'cisv81-13-10',
    code: '13,10',
    section: 'Protect',
    control: 'Perform Application Layer Filtering',
    label: 'Perform Application Layer Filtering',
    requirements:
      'Perform application layer filtering. Example implementations include a filtering proxy, application layer firewall, or gateway.',
  },
  {
    id: 'cisv81-13-11',
    code: '13,11',
    section: 'Detect',
    control: 'Tune Security Event Alerting Thresholds',
    label: 'Tune Security Event Alerting Thresholds',
    requirements:
      'Tune security event alerting thresholds monthly, or more frequently.',
  },
  {
    id: 'cisv81-14-1',
    code: '14,1',
    section: 'Govern',
    control: 'Establish and Maintain a Security Awareness Program',
    label: 'Establish and Maintain a Security Awareness Program',
    requirements:
      'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-14-2',
    code: '14,2',
    section: 'Protect',
    control: 'Train Workforce Members to Recognize Social Engineering Attacks',
    label: 'Train Workforce Members to Recognize Social Engineering Attacks',
    requirements:
      'Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.\u00a0',
  },
  {
    id: 'cisv81-14-3',
    code: '14,3',
    section: 'Protect',
    control: 'Train Workforce Members on Authentication Best Practices',
    label: 'Train Workforce Members on Authentication Best Practices',
    requirements:
      'Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.',
  },
  {
    id: 'cisv81-14-4',
    code: '14,4',
    section: 'Protect',
    control: 'Train Workforce on Data Handling Best Practices',
    label: 'Train Workforce on Data Handling Best Practices',
    requirements:
      'Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.',
  },
  {
    id: 'cisv81-14-5',
    code: '14,5',
    section: 'Protect',
    control: 'Train Workforce Members on Causes of Unintentional Data Exposure',
    label: 'Train Workforce Members on Causes of Unintentional Data Exposure',
    requirements:
      'Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.',
  },
  {
    id: 'cisv81-14-6',
    code: '14,6',
    section: 'Protect',
    control:
      'Train Workforce Members on Recognizing and Reporting Security Incidents',
    label:
      'Train Workforce Members on Recognizing and Reporting Security Incidents',
    requirements:
      'Train workforce members to be able to recognize a potential incident and be able to report such an incident.\u00a0',
  },
  {
    id: 'cisv81-14-7',
    code: '14,7',
    section: 'Protect',
    control:
      'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
    label:
      'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
    requirements:
      'Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.',
  },
  {
    id: 'cisv81-14-8',
    code: '14,8',
    section: 'Protect',
    control:
      'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
    label:
      'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
    requirements:
      'Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.',
  },
  {
    id: 'cisv81-14-9',
    code: '14,9',
    section: 'Protect',
    control: 'Conduct Role-Specific Security Awareness and Skills Training',
    label: 'Conduct Role-Specific Security Awareness and Skills Training',
    requirements:
      'Conduct role-specific security awareness and skills training. Example implementations include secure system administration courses for IT professionals, OWASP\u00ae Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.',
  },
  {
    id: 'cisv81-15-1',
    code: '15,1',
    section: 'Identify',
    control: 'Establish and Maintain an Inventory of Service Providers',
    label: 'Establish and Maintain an Inventory of Service Providers',
    requirements:
      'Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.\u00a0',
  },
  {
    id: 'cisv81-15-2',
    code: '15,2',
    section: 'Govern',
    control: 'Establish and Maintain a Service Provider Management Policy',
    label: 'Establish and Maintain a Service Provider Management Policy',
    requirements:
      'Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-15-3',
    code: '15,3',
    section: 'Govern',
    control: 'Classify Service Providers',
    label: 'Classify Service Providers',
    requirements:
      'Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-15-4',
    code: '15,4',
    section: 'Govern',
    control: 'Ensure Service Provider Contracts Include Security Requirements',
    label: 'Ensure Service Provider Contracts Include Security Requirements',
    requirements:
      'Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.',
  },
  {
    id: 'cisv81-15-5',
    code: '15,5',
    section: 'Govern',
    control: 'Assess Service Providers',
    label: 'Assess Service Providers',
    requirements:
      'Assess service providers consistent with the enterprise’s service provider management policy. Assessment scope may vary based on classification(s), and may include review of standardized assessment reports, such as Service Organization Control 2 (SOC 2) and Payment Card Industry (PCI) Attestation of Compliance (AoC), customized questionnaires, or other appropriately rigorous processes. Reassess service providers annually, at a minimum, or with new and renewed contracts.',
  },
  {
    id: 'cisv81-15-6',
    code: '15,6',
    section: 'Govern',
    control: 'Monitor Service Providers',
    label: 'Monitor Service Providers',
    requirements:
      'Monitor service providers consistent with the enterprise’s service provider management policy. Monitoring may include periodic reassessment of service provider compliance, monitoring service provider release notes, and dark web monitoring.',
  },
  {
    id: 'cisv81-15-7',
    code: '15,7',
    section: 'Protect',
    control: 'Securely Decommission Service Providers',
    label: 'Securely Decommission Service Providers',
    requirements:
      'Securely decommission service providers. Example considerations include user and service account deactivation, termination of data flows, and secure disposal of enterprise data within service provider systems.\u00a0',
  },
  {
    id: 'cisv81-16-1',
    code: '16,1',
    section: 'Govern',
    control:
      'Establish and Maintain a Secure Application Development\u00a0Process',
    label:
      'Establish and Maintain a Secure Application Development\u00a0Process',
    requirements:
      'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-16-2',
    code: '16,2',
    section: 'Govern',
    control:
      'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
    label:
      'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
    requirements:
      'Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report.\u00a0The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing.\u00a0As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities.\u00a0Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\nThird-party application developers need to consider this an externally-facing policy that helps to set expectations for outside stakeholders.',
  },
  {
    id: 'cisv81-16-3',
    code: '16,3',
    section: 'Detect',
    control: 'Perform Root Cause Analysis on Security Vulnerabilities',
    label: 'Perform Root Cause Analysis on Security Vulnerabilities',
    requirements:
      'Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.',
  },
  {
    id: 'cisv81-16-4',
    code: '16,4',
    section: 'Identify',
    control:
      'Establish and Manage an Inventory of Third-Party Software Components',
    label:
      'Establish and Manage an Inventory of Third-Party Software Components',
    requirements:
      'Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use.\u00a0This inventory is to include any risks that each third-party component could pose.\u00a0Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.\u00a0',
  },
  {
    id: 'cisv81-16-5',
    code: '16,5',
    section: 'Protect',
    control: 'Use Up-to-Date and Trusted Third-Party Software Components',
    label: 'Use Up-to-Date and Trusted Third-Party Software Components',
    requirements:
      'Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security.\u00a0Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.',
  },
  {
    id: 'cisv81-16-6',
    code: '16,6',
    section: 'Govern',
    control:
      'Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities',
    label:
      'Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities',
    requirements:
      'Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.',
  },
  {
    id: 'cisv81-16-7',
    code: '16,7',
    section: 'Protect',
    control:
      'Use Standard Hardening Configuration Templates for Application Infrastructure',
    label:
      'Use Standard Hardening Configuration Templates for Application Infrastructure',
    requirements:
      'Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.',
  },
  {
    id: 'cisv81-16-8',
    code: '16,8',
    section: 'Protect',
    control: 'Separate Production and Non-Production Systems',
    label: 'Separate Production and Non-Production Systems',
    requirements:
      'Maintain separate environments for production and non-production systems.',
  },
  {
    id: 'cisv81-16-9',
    code: '16,9',
    section: 'Protect',
    control:
      'Train Developers in Application Security Concepts and Secure Coding',
    label:
      'Train Developers in Application Security Concepts and Secure Coding',
    requirements:
      'Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.',
  },
  {
    id: 'cisv81-16-10',
    code: '16,10',
    section: 'Protect',
    control: 'Apply Secure Design Principles in Application Architectures',
    label: 'Apply Secure Design Principles in Application Architectures',
    requirements:
      'Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of "never trust user input." Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.',
  },
  {
    id: 'cisv81-16-11',
    code: '16,11',
    section: 'Protect',
    control:
      'Leverage Vetted Modules or Services for Application Security Components',
    label:
      'Leverage Vetted Modules or Services for Application Security Components',
    requirements:
      'Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or implementation errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.',
  },
  {
    id: 'cisv81-16-12',
    code: '16,12',
    section: 'Protect',
    control: 'Implement Code-Level Security Checks',
    label: 'Implement Code-Level Security Checks',
    requirements:
      'Apply static and dynamic analysis tools within the application life cycle to verify that secure coding practices are being followed.',
  },
  {
    id: 'cisv81-16-13',
    code: '16,13',
    section: 'Detect',
    control: 'Conduct Application Penetration Testing',
    label: 'Conduct Application Penetration Testing',
    requirements:
      'Conduct application penetration testing. For critical applications, authenticated penetration testing is better suited to finding business logic vulnerabilities than code scanning and automated security testing.\u00a0Penetration testing relies on the skill of the tester to manually manipulate an application as an authenticated and unauthenticated user.\u00a0',
  },
  {
    id: 'cisv81-16-14',
    code: '16,14',
    section: 'Protect',
    control: 'Conduct Threat Modeling',
    label: 'Conduct Threat Modeling',
    requirements:
      'Conduct threat modeling. Threat modeling is the process of identifying and addressing application security design flaws within a design, before code is created. It is conducted through specially trained individuals who evaluate the application design and gauge security risks for each entry point and access level. The goal is to map out the application, architecture, and infrastructure in a structured way to understand its weaknesses.',
  },
  {
    id: 'cisv81-17-1',
    code: '17,1',
    section: 'Respond',
    control: 'Designate Personnel to Manage Incident Handling',
    label: 'Designate Personnel to Manage Incident Handling',
    requirements:
      'Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel\u00a0are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-17-2',
    code: '17,2',
    section: 'Govern',
    control:
      'Establish and Maintain Contact Information for Reporting Security Incidents',
    label:
      'Establish and Maintain Contact Information for Reporting Security Incidents',
    requirements:
      'Establish and maintain\u00a0contact\u00a0information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.',
  },
  {
    id: 'cisv81-17-3',
    code: '17,3',
    section: 'Govern',
    control:
      'Establish and Maintain an Enterprise Process for Reporting Incidents',
    label:
      'Establish and Maintain an Enterprise Process for Reporting Incidents',
    requirements:
      'Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-17-4',
    code: '17,4',
    section: 'Govern',
    control: 'Establish and Maintain an Incident Response Process',
    label: 'Establish and Maintain an Incident Response Process',
    requirements:
      'Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-17-5',
    code: '17,5',
    section: 'Respond',
    control: 'Assign Key Roles and Responsibilities',
    label: 'Assign Key Roles and Responsibilities',
    requirements:
      'Assign key roles and responsibilities\u00a0for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-17-6',
    code: '17,6',
    section: 'Respond',
    control: 'Define Mechanisms for Communicating During Incident Response',
    label: 'Define Mechanisms for Communicating During Incident Response',
    requirements:
      'Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails,\u00a0secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-17-7',
    code: '17,7',
    section: 'Recover',
    control: 'Conduct Routine Incident Response Exercises',
    label: 'Conduct Routine Incident Response Exercises',
    requirements:
      'Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.',
  },
  {
    id: 'cisv81-17-8',
    code: '17,8',
    section: 'Recover',
    control: 'Conduct Post-Incident Reviews',
    label: 'Conduct Post-Incident Reviews',
    requirements:
      'Conduct post-incident reviews. Post-incident reviews help prevent incident recurrence through identifying lessons learned and follow-up action.',
  },
  {
    id: 'cisv81-17-9',
    code: '17,9',
    section: 'Recover',
    control: 'Establish and Maintain Security Incident Thresholds',
    label: 'Establish and Maintain Security Incident Thresholds',
    requirements:
      'Establish and maintain security incident thresholds, including, at a minimum, differentiating between an incident and an event. Examples can include: abnormal activity, security vulnerability, security weakness, data breach, privacy incident, etc. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  },
  {
    id: 'cisv81-18-1',
    code: '18,1',
    section: 'Govern',
    control: 'Establish and Maintain a Penetration Testing Program',
    label: 'Establish and Maintain a Penetration Testing Program',
    requirements:
      'Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.',
  },
  {
    id: 'cisv81-18-2',
    code: '18,2',
    section: 'Detect',
    control: 'Perform Periodic External Penetration Tests',
    label: 'Perform Periodic External Penetration Tests',
    requirements:
      'Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.',
  },
  {
    id: 'cisv81-18-3',
    code: '18,3',
    section: 'Protect',
    control: 'Remediate Penetration Test Findings',
    label: 'Remediate Penetration Test Findings',
    requirements:
      'Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.',
  },
  {
    id: 'cisv81-18-4',
    code: '18,4',
    section: 'Protect',
    control: 'Validate Security Measures',
    label: 'Validate Security Measures',
    requirements:
      'Validate security measures after each penetration test. If deemed necessary, modify rulesets and capabilities to detect the techniques used during testing.',
  },
  {
    id: 'cisv81-18-5',
    code: '18,5',
    section: 'Detect',
    control: 'Perform Periodic Internal Penetration Tests',
    label: 'Perform Periodic Internal Penetration Tests',
    requirements:
      'Perform periodic internal penetration tests based on program requirements, no less than annually. The testing may be clear box or opaque box.',
  },
];
