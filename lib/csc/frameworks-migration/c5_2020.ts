export default [
    {
        id: 'c5-2020-ois-01',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-01',
        control: 'Information Security Management System (ISMS)',
        label: 'Information Security Management System (ISMS)',
        requirements:
            "The Cloud Service Provider operates an information security management system (ISMS) in accordance with ISO/IEC 27001. The scope of the ISMS covers the Cloud Service Provider's organisational units, locations and procedures for providing the cloud service.\nThe measures for setting up, implementing, maintaining and continuously improving the ISMS are documented. \nThe documentation includes:\n\n• Scope of the ISMS (Section 4.3 of ISO/IEC 27001);\n\n• Declaration of applicability (Section 6.1.3), and\n\n• Results of the last management review (Section 9.3)."
    },
    {
        id: 'c5-2020-ois-02',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-02',
        control: 'Information Security Policy',
        label: 'Information Security Policy',
        requirements:
            "The top management of the Cloud Service Provider has adopted an information security policy and communicated it to internal and external employees as well as cloud customers.\nThe policy describes:\n\n• the importance of information security, based on the requirements of cloud customers in relation to information security;\n\n• the security objectives and the desired security level, based on the business goals and tasks of the Cloud Service Provider;\n\n• the most important aspects of the security strategy to achieve the security objectives set; and\n\n• the organisational structure for information security in the ISMS application area."
    },
    {
        id: 'c5-2020-ois-03',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-03',
        control: 'Interfaces and Dependencies',
        label: 'Interfaces and Dependencies',
        requirements:
            'Interfaces and dependencies between cloud service delivery activities performed by the Cloud Service Provider and activities performed by third parties are documented and communicated. This includes dealing with the following events:\n\n• Vulnerabilities;\n\n• Security incidents; and\n\n• Malfunctions.\n\nThe type and scope of the documentation is geared towards the information requirements of the subject matter experts of the affected organisations in order to carry out the activities appropriately (e.g. definition of roles and responsibilities in guidelines, description of cooperation obligations in service descriptions and contracts).\n\nThe communication of changes to the interfaces and dependencies takes place in a timely manner so that the affected organisations and third parties can react appropriately with organisational and technical measures before the changes take effect.'
    },
    {
        id: 'c5-2020-ois-04',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-04',
        control: 'Segregation of Duties',
        label: 'Segregation of Duties',
        requirements:
            'Conflicting tasks and responsibilities are separated based on an OIS-06 risk assessment to reduce the risk of unauthorised or unintended changes or misuse of cloud customer data processed, stored or transmitted in the cloud service.\n\nThe risk assessment covers the following areas, insofar as these are applicable to the provision of the Cloud Service and are in the area of responsibility of the Cloud Service Provider:\n\n• Administration of rights profiles, approval and assignment of access and access authorisations (cf. IDM-01);\n\n• Development, testing and release of changes (cf. DEV-01); and\n\n• Operation of the system components.\n\nIf separation cannot be established for organisational or technical reasons, measures are in place to monitor the activities in order to detect unauthorised or unintended changes as well as misuse and to take appropriate actions.'
    },
    {
        id: 'c5-2020-ois-05',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-05',
        control: 'Contact with Relevant Government Agencies and Interest Groups',
        label: 'Contact with Relevant Government Agencies and Interest Groups',
        requirements:
            'The Cloud Service Provider leverages relevant authorities and interest groups in order to stay informed about current threats and vulnerabilities. The information flows into the procedures for handling risks (cf. OIS-06) and vulnerabilities (cf. OPS-19).'
    },
    {
        id: 'c5-2020-ois-06',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-06',
        control: 'Risk Management Policy',
        label: 'Risk Management Policy',
        requirements:
            'Policies and instructions for risk management procedures are documented, communicated and provided in accordance with SP-01 for the following aspects:\n\n• Identification of risks associated with the loss of confidentiality, integrity, availability and authenticity of information within the scope of the ISMS and assigning risk owners;\n\n• Analysis of the probability and impact of occurrence and determination of the level of risk;\n\n• Evaluation of the risk analysis based on defined criteria for risk acceptance and prioritisation of handling;\n\n• Handling of risks through measures, including approval of authorisation and acceptance of residual risks by risk owners; and\n\n• Documentation of the activities implemented to enable consistent, valid and comparable results.',
    },
    {
        id: 'c5-2020-ois-07',
        section: 'Organisation of Information Security (OIS)',
        code: 'OIS-07',
        control: 'Application of the Risk Management Policy',
        label: 'Application of the Risk Management Policy',
        requirements:
            'The Cloud Service Provider executes the process for handling risks as needed or at least once a year. The following aspects are taken into account when identifying risks, insofar as they are applicable to the cloud service provided and are within the area of responsibility of the Cloud Service Provider:\n\n• Processing, storage or transmission of data of cloud customers with different protection needs;\n\n• Occurrence of vulnerabilities and malfunctions in technical protective measures for separating shared resources;\n\n• Attacks via access points, including interfaces accessible from public networks;\n\n• Conflicting tasks and areas of responsibility that cannot be separated for organisational or technical reasons; and\n\n• Dependencies on subservice organisations.\n\nThe analysis, evaluation and treatment of risks, including the approval of actions and acceptance of residual risks, is reviewed for adequacy at least annually by the risk owners.',
    },
    {
        id: 'c5-2020-sp-01',
        section: 'Security Policies and Instructions (SP)',
        code: 'SP-01',
        control: 'Documentation, communication and provision of policies and instructions',
        label: 'Documentation, communication and provision of policies and instructions',
        requirements:
            'Policies and instructions (incl. concepts and guidelines) are derived from the information security policy and are documented according to a uniform structure. They are communicated and made available to all internal and external employees of the Cloud Service Provider in an appropriate manner.\n\nThe policies and instructions are version controlled and approved by the top management of the Cloud Service Provider or an authorised body.\n\nThe policies and instructions describe at least the following aspects:\n\n• Objectives;\n\n• Scope;\n\n• Roles and responsibilities, including staff qualification requirements and the establishment of substitution rules;\n\n• Roles and dependencies on other organisations (especially cloud customers and subservice organisations);\n\n• Steps for the execution of the security strategy; and\n\n• Applicable legal and regulatory requirements.',
    },
    {
        id: 'c5-2020-sp-02',
        section: 'Security Policies and Instructions (SP)',
        code: 'SP-02',
        control: 'Review and Approval of Policies and Instructions',
        label: 'Review and Approval of Policies and Instructions',
        requirements:
            "Information security policies and instructions are reviewed at least annually for adequacy by the Cloud Service Provider's subject matter experts.\n\nThe review shall consider at least the following aspects:\n\n• Organisational and technical changes in the procedures for providing the cloud service; and\n\n• Legal and regulatory changes in the Cloud Service Provider's environment.\n\nRevised policies and instructions are approved before they become effective.",
    },
    {
        id: 'c5-2020-sp-03',
        section: 'Security Policies and Instructions (SP)',
        code: 'SP-03',
        control: 'Exceptions from Existing Policies and Instructions',
        label: 'Exceptions from Existing Policies and Instructions',
        requirements:
            'Exceptions to the policies and instructions for information security as well as respective controls go through the OIS-06 risk management process, including approval of these exceptions and acceptance of the associated risks by the risk owners. The approvals of exceptions are documented, limited in time and are reviewed for appropriateness at least annually by the risk owners.',
    },
    {
        id: 'c5-2020-hr-01',
        section: 'Personnel (HR)',
        code: 'HR-01',
        control: 'Verification of qualification and trustworthiness',
        label: 'Verification of qualification and trustworthiness',
        requirements:
            "The competency and integrity of all internal and external employees of the Cloud Service Provider with access to cloud customer data or system components under the Cloud Service Provider's responsibility who are responsible to provide the cloud service in the production environment shall be verified prior to commencement of employment in accordance with local legislation and regulation by the Cloud Service Provider.\n\nTo the extent permitted by law, the review will cover the following areas:\n\n• Verification of the person through identity card;\n\n• Verification of the CV;\n\n• Verification of academic titles and degrees;\n\n• Request of a police clearance certificate for applicants;\n\n• Certificate of good conduct or national equivalent; and\n\n• Evaluation of the risk to be blackmailed.",
    },
    {
        id: 'c5-2020-hr-02',
        section: 'Personnel (HR)',
        code: 'HR-02',
        control: 'Employment terms and conditions',
        label: 'Employment terms and conditions',
        requirements:
            "The Cloud Service Provider's internal and external employees are required by the employment terms and conditions to comply with applicable policies and instructions relating to information security.\n\nThe information security policy, and the policies and instructions based on it, are to be acknowledged by the internal and external personnel in a documented form before access is granted to any cloud customer data or system components under the responsibility of the Cloud Service Provider used to provide the cloud service in the production environment.",
    },
    {
        id: 'c5-2020-hr-03',
        section: 'Personnel (HR)',
        code: 'HR-03',
        control: 'Security training and awareness programme',
        label: 'Security training and awareness programme',
        requirements:
            'The Cloud Service Provider operates a target group-oriented security awareness and training program, which is completed by all internal and external employees of the Cloud Service Provider on a regular basis. The program is regularly updated based on changes to policies and instructions and the current threat situation and includes the following aspects:\n\n• Handling system components used to provide the cloud service in the production environment in accordance with applicable policies and procedures;\n\n• Handling cloud customer data in accordance with applicable policies and instructions and applicable legal and regulatory requirements;\n\n• Information about the current threat situation; and\n\n• Correct behaviour in the event of security incidents.',
    },
    {
        id: 'c5-2020-hr-04',
        section: 'Personnel (HR)',
        code: 'HR-04',
        control: 'Disciplinary measures',
        label: 'Disciplinary measures',
        requirements:
            'In the event of violations of policies and instructions or applicable legal and regulatory requirements, actions are taken in accordance with a defined policy that includes the following aspects:\n\n• Verifying whether a violation has occurred; and\n\n• Consideration of the nature and severity of the violation and its impact.\n\nThe internal and external employees of the Cloud Service Provider are informed about possible disciplinary measures.\n\nThe use of disciplinary measures is appropriately documented.',
    },
    {
        id: 'c5-2020-hr-05',
        section: 'Personnel (HR)',
        code: 'HR-05',
        control: 'Responsibilities in the event of termination or change of employment',
        label: 'Responsibilities in the event of termination or change of employment',
        requirements:
            'Internal and external employees have been informed about which responsibilities, arising from employment terms and conditions relating to information security, will remain in place when their employment is terminated or changed and for how long.',
    },
    {
        id: 'c5-2020-hr-06',
        section: 'Personnel (HR)',
        code: 'HR-06',
        control: 'Confidentiality agreements',
        label: 'Confidentiality agreements',
        requirements:
            'The non-disclosure or confidentiality agreements to be agreed with internal employees, external service providers and suppliers of the Cloud Service Provider are based on the requirements identified by the Cloud Service Provider for the protection of confidential information and operational details.\n\nThe agreements are to be accepted by external service providers and suppliers when the contract is agreed. The agreements must be accepted by internal employees of the Cloud Service Provider before authorisation to access data of cloud customers is granted.\n\nThe requirements must be documented and reviewed at regular intervals (at least annually). If the review shows that the requirements need to be adapted, the non-disclosure or confidentiality agreements are updated.\n\nThe Cloud Service Provider must inform the internal employees, external service providers and suppliers and obtain confirmation of the updated confidentiality or non-disclosure agreement.',
    },
    {
        id: 'c5-2020-am-01',
        section: 'Asset Management (AM)',
        code: 'AM-01',
        control: 'Asset Inventory',
        label: 'Asset Inventory',
        requirements: 'The Cloud Service Provider has established procedures for inventorying assets.\n\nThe inventory is performed automatically and/or by the people or teams responsible for the assets to ensure complete, accurate, valid and consistent inventory throughout the asset lifecycle.\n\nAssets are recorded with the information needed to apply the Risk Management Procedure (Cf. OIS-07), including the measures taken to manage these risks throughout the asset lifecycle. Changes to this information are logged.',
    },
    {
        id: 'c5-2020-am-02',
        section: 'Asset Management (AM)',
        code: 'AM-02',
        control: 'Acceptable Use and Safe Handling of Assets Policy',
        label: 'Acceptable Use and Safe Handling of Assets Policy',
        requirements: 'Policies and instructions for acceptable use and safe handling of assets are documented, communicated and provided in accordance with SP-01 and address the following aspects of the asset lifecycle as applicable to the asset:\n\n\u2022 Approval procedures for acquisition, commissioning, maintenance, decommissioning, and disposal by authorised personnel or system components;\n\n\u2022 Inventory;\n\n\u2022 Classification and labelling based on the need for protection of the information and measures for the level of protection identified;\n\n\u2022 Secure configuration of mechanisms for error handling, logging, encryption, authentication and authorisation;\n\n\u2022 Requirements for versions of software and images as well as application of patches;\n\n\u2022 Handling of software for which support and security patches are not available anymore;\n\n\u2022 Restriction of software installations or use of services;\n\n\u2022 Protection against malware;\n\n\u2022 Remote deactivation, deletion or blocking;\n\n\u2022 Physical delivery and transport;\n\n\u2022 dealing with incidents and vulnerabilities; and\n\n\u2022 Complete and irrevocable deletion of the data upon decommissioning.',
    },
    {
        id: 'c5-2020-am-03',
        section: 'Asset Management (AM)',
        code: 'AM-03',
        control: 'Commissioning of Hardware',
        label: 'Commissioning of Hardware',
        requirements:
            'The Cloud Service Provider has an approval process for the use of hardware to be commissioned, which is used to provide the cloud service in the production environment, in which the risks arising from the commissioning are identified, analysed and mitigated. Approval is granted after verification of the secure configuration of the mechanisms for error handling, logging, encryption, authentication and authorisation according to the intended use and based on the applicable policies.',
    },
    {
        id: 'c5-2020-am-04',
        section: 'Asset Management (AM)',
        code: 'AM-04',
        control: 'Decommissioning of Hardware',
        label: 'Decommissioning of Hardware',
        requirements:
            'The decommissioning of hardware used to operate system components supporting the cloud service production environment under the responsibility of the Cloud Service Provider requires approval based on the applicable policies.\n\nThe decommissioning includes the complete and permanent deletion of the data or proper destruction of the media.',
    },
    {
        id: 'c5-2020-am-05',
        section: 'Asset Management (AM)',
        code: 'AM-05',
        control: 'Commitment to Permissible Use, Safe Handling and Return of Assets',
        label: 'Commitment to Permissible Use, Safe Handling and Return of Assets',
        requirements:
            "The Cloud Service Provider's internal and external employees are provably committed to the policies and instructions for acceptable use and safe handling of assets before they can be used if the Cloud Service Provider has determined in a risk assessment that loss or unauthorised access could compromise the information security of the Cloud Service.\n\nAny assets handed over are provably returned upon termination of employment.",
    },
    {
        id: 'c5-2020-am-06',
        section: 'Asset Management (AM)',
        code: 'AM-06',
        control: 'Asset Classification and Labelling',
        label: 'Asset Classification and Labelling',
        requirements:
            'Assets are classified and, if possible, labelled. Classification and labelling of an asset reflect the protection needs of the information it processes, stores, or transmits.\n\nThe need for protection is determined by the individuals or groups responsible for the assets of the Cloud Service Provider according to a uniform schema. The schema provides levels of protection for the confidentiality, integrity, availability, and authenticity protection objectives.',
    },
    {
        id: 'c5-2020-ps-01',
        section: 'Physical Security (PS)',
        code: 'PS-01',
        control: 'Physical Security and Environmental Control Requirements',
        label: 'Physical Security and Environmental Control Requirements',
        requirements:
            'Security requirements for premises and buildings related to the cloud service provided, are based on the security objectives of the information security policy, identified protection requirements for the cloud service and the assessment of risks to physical and environmental security. The security requirements are documented, communicated and provided in a policy or concept according to SP-01.\n\nThe security requirements for data centres are based on criteria which comply with established rules of technology. They are suitable for addressing the following risks in accordance with the applicable legal and contractual requirements:\n\n• Faults in planning;\n\n• Unauthorised access;\n\n• Insufficient surveillance;\n\n• Insufficient air-conditioning;\n\n• Fire and smoke;\n\n• Water;\n\n• Power failure; and\n\n• Air ventilation and filtration.\n\nIf the Cloud Service Provider uses premises or buildings operated by third parties to provide the Cloud Service, the document describes which security requirements the Cloud Service Provider places on these third parties.\n\nThe appropriate and effective verification of implementation is carried out in accordance with the criteria for controlling and monitoring subcontractors (cf. SSO-01, SSO-02).',
    },
    {
        id: 'c5-2020-ps-02',
        section: 'Physical Security (PS)',
        code: 'PS-02',
        control: 'Redundancy model',
        label: 'Redundancy model',
        requirements:
            'The cloud service is provided from two locations that are redundant to each other. The locations meet the security requirements of the Cloud Service Provider (cf. PS-01 Security Concept) and are located in an adequate distance to each other to achieve operational redundancy. Operational redundancy is designed in a way that ensures that the availability requirements specified in the service level agreement are met. The functionality of the redundancy is checked at least annually by suitable tests and exercises (cf. BCM-04 - Verification, updating and testing of business continuity).',
    },
    {
        id: 'c5-2020-ps-03',
        section: 'Physical Security (PS)',
        code: 'PS-03',
        control: 'Perimeter Protection',
        label: 'Perimeter Protection',
        requirements:
            'The structural shell of premises and buildings related to the cloud service provided are physically solid and protected by adequate security measures that meet the security requirements of the Cloud Service Provider (cf. PS-01 Security Concept).\n\nThe security measures are designed to detect and prevent unauthorised access so that the information security of the cloud service is not compromised.\n\nThe outer doors, windows and other construction elements exhibit an appropriate security level and withstand a burglary attempt for at least 10 minutes.\n\nThe surrounding wall constructions as well as the locking mechanisms meet the associated requirements.',
    },
    {
        id: 'c5-2020-ps-04',
        section: 'Physical Security (PS)',
        code: 'PS-04',
        control: 'Physical site access control',
        label: 'Physical site access control',
        requirements:
            'At access points to premises and buildings related to the cloud service provided, physical access controls are set up in accordance with the Cloud Service Provider’s security requirements (cf. PS-01 Security Concept) to prevent unauthorised access.\n\nAccess controls are supported by an access control system.\n\nThe requirements for the access control system are documented, communicated and provided in a policy or concept in accordance with SP-01 and include the following aspects:\n\n• Specified procedure for the granting and revoking of access authorisations (cf. IDM-02) based on the principle of least authorisation (“least-privilege-principle”) and as necessary for the performance of tasks (“need-to-know-principle”);\n\n• Automatic revocation of access authorisations if they have not been used for a period of 2 month;\n\n• Automatic withdrawal of access authorisations if they have not been used for a period of 6 months;\n\n• Two-factor authentication for access to areas hosting system components that process cloud customer information;\n\n• Visitors and external personnel are tracked individually by the access control during their work in the premises and buildings, identified as such (e.g. by visible wearing of a visitor pass) and supervised during their stay; and\n\n• Existence and nature of access logging that enables the Cloud Service Provider, in the sense of an effectiveness audit, to check whether only defined personnel have entered the premises and buildings related to the cloud service provided.',
    },
    {
        id: 'c5-2020-ps-05',
        section: 'Physical Security (PS)',
        code: 'PS-05',
        control: 'Protection from fire and smoke',
        label: 'Protection from fire and smoke',
        requirements:
            'Premises and buildings related to the cloud service provided are protected from fire and smoke by structural, technical and organisational measures that meet the security requirements of the Cloud Service Provider (cf. PS-01 Security Concept) and include the following aspects:\n\na) Structural Measures:\n\nEstablishment of fire sections with a fire resistance duration of at least 90 minutes for all structural parts.\n\nb) Technical Measures:\n\n• Early fire detection with automatic voltage release. The monitored areas are sufficiently fragmented to ensure that the prevention of the spread of incipient fires is proportionate to the maintenance of the availability of the cloud service provided;\n\n• Extinguishing system or oxygen reduction; and\n\n• Fire alarm system with reporting to the local fire department.\n\nc) Organisational Measures:\n\n• Regular fire protection inspections to check compliance with fire protection requirements; and\n\n• Regular fire protection exercises.',
    },
    {
        id: 'c5-2020-ps-06',
        section: 'Physical Security (PS)',
        code: 'PS-06',
        control: 'Protection against interruptions caused by power failures and other such risks',
        label: 'Protection against interruptions caused by power failures and other such risks',
        requirements:
            'Measures to prevent the failure of the technical supply facilities required for the operation of system components with which information from cloud customers is processed, are documented and set up in accordance with the security requirements of the Cloud Service Provider (cf. PS-01 Security Concept) with respect to the following aspects:\n\na) Operational redundancy (N+1) in power and cooling supply\n\nb) Use of appropriately sized uninterruptible power supplies (UPS) and emergency power systems (NEA), designed to ensure that all data remains undamaged in the event of a power failure. The functionality of UPS and NEA is checked at least annually by suitable tests and exercises (cf. BCM-04 - Verification, updating and testing of business continuity).\n\nc) Maintenance (servicing, inspection, repair) of the utilities in accordance with the manufacturer’s recommendations.\n\nd) Protection of power supply and telecommunications lines against interruption, interference, damage and eavesdropping. The protection is checked regularly, but at least every two years, as well as in case of suspected manipulation by qualified personnel regarding the following aspects:\n\n• Traces of violent attempts to open closed distributors;\n\n• Up-to-datedness of the documentation in the distribution list;\n\n• Conformity of the actual wiring and patching with the documentation;\n\n• The short-circuits and earthing of unneeded cables are intact; and\n\n• Impermissible installations and modifications.',
    },
    {
        id: 'c5-2020-ps-07',
        section: 'Physical Security (PS)',
        code: 'PS-07',
        control: 'Surveillance of operational and environmental parameters',
        label: 'Surveillance of operational and environmental parameters',
        requirements:
            'The operating parameters of the technical utilities (cf. PS-06) and the environmental parameters of the premises and buildings related to the cloud service provided are monitored and controlled in accordance with the security requirements of the Cloud Service Provider (cf. PS-01 Security Concept). When the permitted control range is exceeded, the responsible departments of the Cloud-Provider are automatically informed in order to promptly initiate the necessary measures for return to the control range.',
    },
    {
        id: 'c5-2020-ops-01',
        section: 'Operations (OPS)',
        code: 'OPS-01',
        control: 'Capacity Management - Planning',
        label: 'Capacity Management - Planning',
        requirements:
            'The planning of capacities and resources (personnel and IT resources) follows an established procedure in order to avoid possible capacity bottlenecks. The procedures include forecasting future capacity requirements in order to identify usage trends and manage system overload.\n\nCloud Service Providers take appropriate measures to ensure that they continue to meet the requirements agreed with cloud customers for the provision of the cloud service in the event of capacity bottlenecks or outages regarding personnel and IT resources, in particular those relating to the dedicated use of system components, in accordance with the respective agreements.',
    },
    {
        id: 'c5-2020-ops-02',
        section: 'Operations (OPS)',
        code: 'OPS-02',
        control: 'Capacity Management - Monitoring',
        label: 'Capacity Management - Monitoring',
        requirements:
            'Technical and organisational safeguards for the monitoring and provisioning and de-provisioning of cloud services are defined. Thus, the Cloud Service Provider ensures that resources are provided and/or services are rendered according to the contractual agreements and that compliance with the service level agreements is ensured.',
    },
    {
        id: 'c5-2020-ops-03',
        section: 'Operations (OPS)',
        code: 'OPS-03',
        control: 'Capacity Management - Controlling of Resources',
        label: 'Capacity Management - Controlling of Resources',
        requirements:
            'Depending on the capabilities of the respective service model, the cloud customer can control and monitor the allocation of the system resources assigned to the customer for administration/use in order to avoid overcrowding of resources and to achieve sufficient performance.',
    },
    {
        id: 'c5-2020-ops-04',
        section: 'Operations (OPS)',
        code: 'OPS-04',
        control: 'Protection Against Malware - Concept',
        label: 'Protection Against Malware - Concept',
        requirements:
            'Policies and instructions with specifications for protection against malware are documented, communicated, and provided in accordance with SP-01 with respect to the following aspects:\n\n• Use of system-specific protection mechanisms;\n\n• Operating protection programs on system components under the responsibility of the Cloud Service Provider that are used to provide the cloud service in the production environment; and\n\n• Operation of protection programs for employees’ terminal equipment.',
    },
    {
        id: 'c5-2020-ops-05',
        section: 'Operations (OPS)',
        code: 'OPS-05',
        control: 'Protection Against Malware - Implementation',
        label: 'Protection Against Malware - Implementation',
        requirements:
            "System components under the Cloud Service Provider's responsibility that are used to deploy the cloud service in the production environment are configured with malware protection according to the policies and instructions. If protection programs are set up with signature and behaviour-based malware detection and removal, these protection programs are updated at least daily.",
    },
    {
        id: 'c5-2020-ops-06',
        section: 'Operations (OPS)',
        code: 'OPS-06',
        control: 'Data Protection and Recovery - Concept',
        label: 'Data Protection and Recovery - Concept',
        requirements:
            'Policies and instructions for data backup and recovery are documented, communicated and provided in accordance with SP-01 regarding the following aspects.\n\n• The extent and frequency of data backups and the duration of data retention are consistent with the contractual agreements with the cloud customers and the Cloud Service Provider\'s operational continuity requirements for Recovery Time Objective (RTO) and Recovery Point Objective (RPO);\n\n• Data is backed up in encrypted, state-of-the-art form;\n\n• Access to the backed-up data and the execution of restores is performed only by authorised persons; and\n\n• Tests of recovery procedures (cf. OPS-08).',
    },
    {
        id: 'c5-2020-ops-07',
        section: 'Operations (OPS)',
        code: 'OPS-07',
        control: 'Data Backup and Recovery - Monitoring',
        label: 'Data Backup and Recovery - Monitoring',
        requirements:
            "The execution of data backups is monitored by technical and organisational measures. Malfunctions are investigated by qualified staff and rectified promptly to ensure compliance with contractual obligations to cloud customers or the Cloud Service Provider's business requirements regarding the scope and frequency of data backup and the duration of storage.",
    },
    {
        id: 'c5-2020-ops-08',
        section: 'Operations (OPS)',
        code: 'OPS-08',
        control: 'Data Backup and Recovery - Regular Testing',
        label: 'Data Backup and Recovery - Regular Testing',
        requirements:
            'Restore procedures are tested regularly, at least annually. The tests allow an assessment to be made as to whether the contractual agreements as well as the specifications for the maximum tolerable downtime (Recovery Time Objective, RTO) and the maximum permissible data loss (Recovery Point Objective, RPO) are adhered to (cf. BCM-02).\n\nDeviations from the specifications are reported to the responsible personnel or system components so that these can promptly assess the deviations and initiate the necessary actions.',
    },
    {
        id: 'c5-2020-ops-09',
        section: 'Operations (OPS)',
        code: 'OPS-09',
        control: 'Data Backup and Recovery - Storage',
        label: 'Data Backup and Recovery - Storage',
        requirements:
            'The Cloud Service Provider transfers data to be backed up to a remote location or transports these on backup media to a remote location. If the data backup is transmitted to the remote location via a network, the data backup or the transmission of the data takes place in an encrypted form that corresponds to the state-of-the-art. The distance to the main site is chosen after sufficient consideration of the factors recovery times and impact of disasters on both sites. The physical and environmental security measures at the remote site are at the same level as at the main site.',
    },
    {
        id: 'c5-2020-ops-10',
        section: 'Operations (OPS)',
        code: 'OPS-10',
        control: 'Logging and Monitoring - Concept',
        label: 'Logging and Monitoring - Concept',
        requirements:
            'The Cloud Service Provider has established policies and instructions that govern the logging and monitoring of events on system components within its area of responsibility. These policies and instructions are documented, communicated and provided according to SP-01 with respect to the following aspects:\n\n• Definition of events that could lead to a violation of the protection goals;\n\n• Specifications for activating, stopping and pausing the various logs;\n\n• Information regarding the purpose and retention period of the logs.\n\n• Define roles and responsibilities for setting up and monitoring logging;\n\n• Time synchronisation of system components; and\n\n• Compliance with legal and regulatory frameworks.',
    },
    {
        id: 'c5-2020-ops-11',
        section: 'Operations (OPS)',
        code: 'OPS-11',
        control: 'Logging and Monitoring - Metadata Management Concept',
        label: 'Logging and Monitoring - Metadata Management Concept',
        requirements:
            'Policies and instructions for the secure handling of metadata (usage data) are documented, communicated and provided according to SP-01 with regard to the following aspects:\n\n• Metadata is collected and used solely for billing, incident management and security incident management purposes;\n\n• Exclusively anonymous metadata to deploy and enhance the cloud service so that no conclusions can be drawn about the cloud customer or user;\n\n• No commercial use;\n\n• Storage for a fixed period reasonably related to the purposes of the collection;\n\n• Immediate deletion if the purposes of the collection are fulfilled and further storage is no longer necessary.\n\n• Provision to cloud customers according to contractual agreements.',
    },
    {
        id: 'c5-2020-ops-12',
        section: 'Operations (OPS)',
        code: 'OPS-12',
        control: 'Logging and Monitoring - Access, Storage and Deletion',
        label: 'Logging and Monitoring - Access, Storage and Deletion',
        requirements:
            'The requirements for the logging and monitoring of events and for the secure handling of metadata are implemented by technically supported procedures with regard to the following restrictions:\n\n• Access only for authorised users and systems;\n\n• Retention for the specified period; and\n\n• Deletion when further retention is no longer necessary for the purpose of collection.',
    },
    {
        id: 'c5-2020-ops-13',
        section: 'Operations (OPS)',
        code: 'OPS-13',
        control: 'Logging and Monitoring - Identification of Events',
        label: 'Logging and Monitoring - Identification of Events',
        requirements:
            'The logging data is automatically monitored for events that may violate the protection goals in accordance with the logging and monitoring requirements. This also includes the detection of relationships between events (event correlation).\n\nIdentified events are automatically reported to the appropriate departments for prompt evaluation and action.',
    },
    {
        id: 'c5-2020-ops-14',
        section: 'Operations (OPS)',
        code: 'OPS-14',
        control: 'Logging and Monitoring - Storage of the Logging Data',
        label: 'Logging and Monitoring - Storage of the Logging Data',
        requirements:
            'The Cloud Service Provider retains the generated log data and keeps these in an appropriate, unchangeable and aggregated form, regardless of the source of such data, so that a central, authorised evaluation of the data is possible. Log data is deleted if it is no longer required for the purpose for which they were collected.\n\nBetween logging servers and the assets to be logged, authentication takes place to protect the integrity and authenticity of the information transmitted and stored. The transfer takes place using state-of-the-art encryption or a dedicated administration network (out-of-band management).',
    },
    {
        id: 'c5-2020-ops-15',
        section: 'Operations (OPS)',
        code: 'OPS-15',
        control: 'Logging and Monitoring - Accountability',
        label: 'Logging and Monitoring - Accountability',
        requirements:
            'The log data generated allows an unambiguous identification of user accesses at tenant level to support (forensic) analysis in the event of a security incident.\n\nInterfaces are available to conduct forensic analyses and perform backups of infrastructure components and their network communication.',
    },
    {
        id: 'c5-2020-ops-16',
        section: 'Operations (OPS)',
        code: 'OPS-16',
        control: 'Logging and Monitoring - Configuration',
        label: 'Logging and Monitoring - Configuration',
        requirements:
            'Access to system components for logging and monitoring in the Cloud Service Provider’s area of responsibility is restricted to authorised users. Changes to the configuration are made in accordance with the applicable policies (cf. DEV-03).',
    },
    {
        id: 'c5-2020-ops-17',
        section: 'Operations (OPS)',
        code: 'OPS-17',
        control: 'Logging and Monitoring - Availability of the Monitoring Software',
        label: 'Logging and Monitoring - Availability of the Monitoring Software',
        requirements:
            'The Cloud Service Provider monitors the system components for logging and monitoring in its area of responsibility. Failures are automatically and promptly reported to the Cloud Service Provider’s responsible departments so that these can assess the failures and take required action.',
    },
    {
        id: 'c5-2020-ops-18',
        section: 'Operations (OPS)',
        code: 'OPS-18',
        control: 'Managing Vulnerabilities, Malfunctions and Errors - Concept',
        label: 'Managing Vulnerabilities, Malfunctions and Errors - Concept',
        requirements:
            'Guidelines and instructions with technical and organisational measures are documented, communicated and provided in accordance with SP-01 to ensure the timely identification and addressing of vulnerabilities in the system components used to provide the cloud service. These guidelines and instructions contain specifications regarding the following aspects:\n\n• Regular identification of vulnerabilities;\n\n• Assessment of the severity of identified vulnerabilities;\n\n• Prioritisation and implementation of actions to promptly remediate or mitigate identified vulnerabilities based on severity and according to defined timelines; and\n\n• Handling of system components for which no measures are initiated for the timely remediation or mitigation of vulnerabilities.',
    },
    {
        id: 'c5-2020-ops-19',
        section: 'Operations (OPS)',
        code: 'OPS-19',
        control: 'Managing Vulnerabilities, Malfunctions and Errors - Penetration Tests',
        label: 'Managing Vulnerabilities, Malfunctions and Errors - Penetration Tests',
        requirements:
            'The Cloud Service Provider has penetration tests carried out by qualified internal personnel or external service providers at least once a year. The penetration tests are carried out according to a documented test methodology and include the system components relevant to the provision of the cloud service in the area of responsibility of the Cloud Service Provider, which have been identified as such in a risk analysis.\n\nThe Cloud Service Provider assess the severity of the findings made in penetration tests according to defined criteria.\n\nFor findings with medium or high criticality regarding the confidentiality, integrity or availability of the cloud service, actions must be taken within defined time windows for prompt remediation or mitigation.',
    },
    {
        id: 'c5-2020-ops-20',
        section: 'Operations (OPS)',
        code: 'OPS-20',
        control: 'Managing Vulnerabilities, Malfunctions and Errors - Measurements, Analyses and Assessments of Procedures',
        label: 'Managing Vulnerabilities, Malfunctions and Errors - Measurements, Analyses and Assessments of Procedures',
        requirements:
            'The Cloud Service Provider regularly measures, analyses and assesses the procedures with which vulnerabilities and incidents are handled to verify their continued suitability, appropriateness and effectiveness.\n\nResults are evaluated at least quarterly by accountable departments at the Cloud Service Provider to initiate continuous improvement actions and to verify their effectiveness.',
    },
    {
        id: 'c5-2020-ops-21',
        section: 'Operations (OPS)',
        code: 'OPS-21',
        control: 'Involvement of Cloud customers in the event of incidents',
        label: 'Involvement of Cloud customers in the event of incidents',
        requirements:
            "The Cloud Service Provider periodically informs the cloud customer on the status of incidents affecting the cloud customer, or, where appropriate and necessary, involve the customer in the resolution, in a manner consistent with the contractual agreements.\n\nAs soon as an incident has been resolved from the Cloud Service Provider's perspective, the cloud customer is informed according to the contractual agreements, about the actions taken.",
    },
    {
        id: 'c5-2020-ops-22',
        section: 'Operations (OPS)',
        code: 'OPS-22',
        control: 'Testing and Documentation of known Vulnerabilities',
        label: 'Testing and Documentation of known Vulnerabilities',
        requirements:
            'System components in the area of responsibility of the Cloud Service Provider for the provision of the cloud service are automatically checked for known vulnerabilities at least once a month in accordance with the policies for handling vulnerabilities (cf. OPS-18), the severity is assessed in accordance with defined criteria and measures for timely remediation or mitigation are initiated within defined time windows.',
    },
    {
        id: 'c5-2020-ops-23',
        section: 'Operations (OPS)',
        code: 'OPS-23',
        control: 'Managing Vulnerabilities, Malfunctions and Errors - System Hardening',
        label: 'Managing Vulnerabilities, Malfunctions and Errors - System Hardening',
        requirements:
            'System components in the production environment used to provide the cloud service under the Cloud Service Provider\'s responsibility are hardened according to generally accepted industry standards. The hardening requirements for each system component are documented.\n\nIf non-modifiable ("immutable") images are used, compliance with the hardening specifications as defined in the hardening requirements is checked upon creation of the images. Configuration and log files regarding the continuous availability of the images are retained.',
    },
    {
        id: 'c5-2020-ops-24',
        section: 'Operations (OPS)',
        code: 'OPS-24',
        control: 'Separation of Datasets in the Cloud Infrastructure',
        label: 'Separation of Datasets in the Cloud Infrastructure',
        requirements:
            'Cloud customer data stored and processed on shared virtual and physical resources is securely and strictly separated according to a documented approach based on OIS-07 risk analysis to ensure the confidentiality and integrity of this data.',
    },
    {
        id: 'c5-2020-idm-01',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-01',
        control: 'Policy for user accounts and access rights',
        label: 'Policy for user accounts and access rights',
        requirements:
            'A role and rights concept based on the business and security requirements of the Cloud Service Provider as well as a policy for managing user accounts and access rights for internal and external employees of the Cloud Service Provider and system components that have a role in automated authorisation processes of the Cloud Service Provider are documented, communicated and made available according to SP-01:\n\n• Assignment of unique usernames;\n\n• Granting and modifying user accounts and access rights based on the “least-privilege-principle” and the “need-to-know” principle;\n\n• Segregation of duties between operational and monitoring functions (“Segregation of Duties”);\n\n• Segregation of duties between managing, approving and assigning user accounts and access rights;\n\n• Approval by authorised individual(s) or system(s) for granting or modifying user accounts and access rights before data of the cloud customer or system components used to provision the cloud service can be accessed;\n\n• Regular review of assigned user accounts and access rights;\n\n• Blocking and removing access accounts in the event of inactivity;\n\n• Time-based or event-driven removal or adjustment of access rights in the event of changes to job responsibility;\n\n• Two-factor or multi-factor authentication for users with privileged access;\n\n• Requirements for the approval and documentation of the management of user accounts and access rights.',
    },
    {
        id: 'c5-2020-idm-02',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-02',
        control: 'Granting and change of user accounts and access rights',
        label: 'Granting and change of user accounts and access rights',
        requirements:
            'Specified procedures for granting and modifying user accounts and access rights for internal and external employees of the Cloud Service Provider as well as for system components involved in automated authorisation processes of the Cloud Service Provider ensure compliance with the role and rights concept as well as the policy for managing user accounts and access rights.',
    },
    {
        id: 'c5-2020-idm-03',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-03',
        control: 'Locking and withdrawal of user accounts in the event of inactivity or multiple failed logins',
        label: 'Locking and withdrawal of user accounts in the event of inactivity or multiple failed logins',
        requirements:
            'User accounts of internal and external employees of the Cloud Service Provider as well as for system components involved in automated authorisation processes of the Cloud Service Provider are automatically locked if they have not been used for a period of two months. Approval from authorised personnel or system components are required to unlock these accounts.\n\nLocked user accounts are automatically revoked after six months. After revocation, the procedure for granting user accounts and access rights (cf. IDM-02) must be repeated.',
    },
    {
        id: 'c5-2020-idm-04',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-04',
        control: 'Withdraw or adjust access rights as the task area changes',
        label: 'Withdraw or adjust access rights as the task area changes',
        requirements:
            'Access rights are promptly revoked if the job responsibilities of the Cloud Service Provider\'s internal or external staff or the tasks of system components involved in the Cloud Service Provider\'s automated authorisation processes change. Privileged access rights are adjusted or revoked within 48 hours after the change taking effect. All other access rights are adjusted or revoked within 14 days. After revocation, the procedure for granting user accounts and access rights (cf. IDM-02) must be repeated.',
    },
    {
        id: 'c5-2020-idm-05',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-05',
        control: 'Regular review of access rights',
        label: 'Regular review of access rights',
        requirements:
            'Access rights of internal and external employees of the Cloud Service Provider as well as of system components that play a role in automated authorisation processes of the Cloud Service Provider are reviewed at least once a year to ensure that they still correspond to the actual area of use. The review is carried out by authorised persons from the Cloud Service Provider\'s organisational units, who can assess the appropriateness of the assigned access rights based on their knowledge of the task areas of the employees or system components. Identified deviations will be dealt with promptly, but no later than 7 days after their detection, by appropriate modification or withdrawal of the access rights.',
    },
    {
        id: 'c5-2020-idm-06',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-06',
        control: 'Privileged access rights',
        label: 'Privileged access rights',
        requirements:
            'Privileged access rights for internal and external employees as well as technical users of the Cloud Service Provider are assigned and changed in accordance to the policy for managing user accounts and access rights (cf. IDM-01) or a separate specific policy.\n\nPrivileged access rights are personalised, limited in time according to a risk assessment and assigned as necessary for the execution of tasks (“need-to-know principle”). Technical users are assigned to internal or external employees of the Cloud Service Provider.\n\nActivities of users with privileged access rights are logged in order to detect any misuse of privileged access in suspicious cases. The logged information is automatically monitored for defined events that may indicate misuse. When such an event is identified, the responsible personnel are automatically informed so that they can promptly assess whether misuse has occurred and take corresponding action. In the event of proven misuse of privileged access rights, disciplinary measures are taken in accordance with HR-04.',
    },
    {
        id: 'c5-2020-idm-07',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-07',
        control: 'Access to cloud customer data',
        label: 'Access to cloud customer data',
        requirements:
            'The cloud customer is informed by the Cloud Service Provider whenever internal or external employees of the Cloud Service Provider read or write to the cloud customer\'s data processed, stored or transmitted in the cloud service or have accessed it without the prior consent of the cloud customer. The Information is provided whenever data of the cloud customer is/was not encrypted, the encryption is/was disabled for access or the contractual agreements do not explicitly exclude such information. The information contains the cause, time, duration, type and scope of the access. The information is sufficiently detailed to enable subject matter experts of the cloud customer to assess the risks of the access. The information is provided in accordance with the contractual agreements, or within 72 hours after the access.',
    },
    {
        id: 'c5-2020-idm-08',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-08',
        control: 'Confidentiality of authentication information',
        label: 'Confidentiality of authentication information',
        requirements:
            'The allocation of authentication information to access system components used to provide the cloud service to internal and external users of the cloud provider and system components that are involved in automated authorisation processes of the cloud provider is done in an orderly manner that ensures the confidentiality of the information. If passwords are used as authentication information, their confidentiality is ensured by the following procedures, as far as technically possible:\n\n• Users can initially create the password themselves or must change an initial password when logging on to the system component for the first time. An initial password loses its validity after a maximum of 14 days.\n\n• When creating passwords, compliance with the password specifications (cf. IDM-09) is enforced as far as technically possible.\n\n• The user is informed about changing or resetting the password.\n\n• The server-side storage takes place using cryptographically strong hash functions.\n\nDeviations are evaluated by means of a risk analysis and mitigating measures derived from this are implemented.',
    },
    {
        id: 'c5-2020-idm-09',
        section: 'Identity and Access Management (IDM)',
        code: 'IDM-09',
        control: 'Authentication mechanisms',
        label: 'Authentication mechanisms',
        requirements:
            'System components in the Cloud Service Provider\'s area of responsibility that are used to provide the cloud service, authenticate users of the Cloud Service Provider\'s internal and external employees as well as system components that are involved in the Cloud Service Provider\'s automated authorisation processes. Access to the production environment requires two-factor or multi-factor authentication. Within the production environment, user authentication takes place through passwords, digitally signed certificates or procedures that achieve at least an equivalent level of security. If digitally signed certificates are used, administration is carried out in accordance with the Guideline for Key Management (cf. CRY-01). The password requirements are derived from a risk assessment and documented, communicated and provided in a password policy according to SP-01. Compliance with the requirements is enforced by the configuration of the system components, as far as technically possible.',
    },
    {
        id: 'c5-2020-cry-01',
        section: 'Cryptography and Key Management (CRY)',
        code: 'CRY-01',
        control: 'Policy for the use of encryption procedures and key management',
        label: 'Policy for the use of encryption procedures and key management',
        requirements:
            'Policies and instructions with technical and organisational safeguards for encryption procedures and key management are documented, communicated and provided according to SP-01, in which the following aspects are described:\n\n• Usage of strong encryption procedures and secure network protocols that correspond to the state-of-the-art;\n\n• Risk-based provisions for the use of encryption which are aligned with the information classification schemes (cf. AM-06) and consider the communication channel, type, strength and quality of the encryption;\n\n• Requirements for the secure generation, storage, archiving, retrieval, distribution, withdrawal and deletion of the keys; and\n\n• Consideration of relevant legal and regulatory obligations and requirements.',
    },
    {
        id: 'c5-2020-cry-02',
        section: 'Cryptography and Key Management (CRY)',
        code: 'CRY-02',
        control: 'Encryption of data for transmission (transport encryption)',
        label: 'Encryption of data for transmission (transport encryption)',
        requirements:
            'The Cloud Service Provider has established procedures and technical measures for strong encryption and authentication for the transmission of data of cloud customers over public networks.',
    },
    {
        id: 'c5-2020-cry-03',
        section: 'Cryptography and Key Management (CRY)',
        code: 'CRY-03',
        control: "Encryption of sensitive data for storage",
        label: "Encryption of sensitive data for storage",
        requirements:
            "The Cloud Service Provider has established procedures and technical safeguards to encrypt cloud customers' data during storage. The private keys used for encryption are known only to the cloud customer in accordance with applicable legal and regulatory obligations and requirements. Exceptions follow a specified procedure. The procedures for the use of private keys, including any exceptions, must be contractually agreed with the cloud customer.",
    },
    {
        id: 'c5-2020-cry-04',
        section: 'Cryptography and Key Management (CRY)',
        code: 'CRY-04',
        control: 'Secure key management',
        label: 'Secure key management',
        requirements:
            'Procedures and technical safeguards for secure key management in the area of responsibility of the Cloud Service Provider include at least the following aspects:\n\n• Generation of keys for different cryptographic systems and applications;\n\n• Issuing and obtaining public-key certificates;\n\n• Provisioning and activation of the keys;\n\n• Secure storage of keys (separation of key management system from application and middleware level) including description of how authorised users get access;\n\n• Changing or updating cryptographic keys including policies defining under which conditions and in which manner the changes and/or updates are to be realised;\n\n• Handling of compromised keys;\n\n• Withdrawal and deletion of keys; and\n\n• If pre-shared keys are used, the specific provisions relating to the safe use of this procedure are specified separately.',
    },
    {
        id: 'c5-2020-cos-01',
        section: 'Communication Security (COS)',
        code: 'COS-01',
        control: 'Technical safeguards',
        label: 'Technical safeguards',
        requirements:
            'Based on the results of a risk analysis carried out according to OIS-06, the Cloud Service Provider has implemented technical safeguards which are suitable to promptly detect and respond to network-based attacks on the basis of irregular incoming or outgoing traffic patterns and/or Distributed Denial-of-Service (DDoS) attacks. Data from corresponding technical protection measures implemented is fed into a comprehensive SIEM (Security Information and Event Management) system, so that (counter) measures regarding correlating events can be initiated. The safeguards are documented, communicated and provided in accordance with SP-01.',
    },
    {
        id: 'c5-2020-cos-02',
        section: 'Communication Security (COS)',
        code: 'COS-02',
        control: "Security requirements for connections in the Cloud Service Provider's network",
        label: "Security requirements for connections in the Cloud Service Provider's network",
        requirements:
            "Specific security requirements are designed, published and provided for establishing connections within the Cloud Service Provider's network. The security requirements define for the Cloud Service Provider's area of responsibility:\n\n• in which cases the security zones are to be separated and in which cases cloud customers are to be logically or physically segregated;\n\n• which communication relationships and which network and application protocols are permitted in each case;\n\n• how the data traffic for administration and monitoring is segregated from each on network level;\n\n• which internal, cross-location communication is permitted and;\n\n• which cross-network communication is allowed",
    },
    {
        id: 'c5-2020-cos-03',
        section: 'Communication Security (COS)',
        code: 'COS-03',
        control: "Monitoring of connections in the Cloud Service Provider's network",
        label: "Monitoring of connections in the Cloud Service Provider's network",
        requirements:
            "A distinction is made between trusted and untrusted networks. Based on a risk assessment, these are separated into different security zones for internal and external network areas (and DMZ, if applicable). Physical and virtualised network environments are designed and configured to restrict and monitor the established connection to trusted or untrusted networks according to the defined security requirements.\n\nThe entirety of the conception and configuration undertaken to monitor the connections mentioned is assessed in a risk-oriented manner, at least annually, with regard to the resulting security requirements.\n\nIdentified vulnerabilities and deviations are subject to risk assessment in accordance with the risk management procedure (cf. OIS-06) and follow-up measures are defined and tracked (cf. OPS-18).\n\nAt specified intervals, the business justification for using all services, protocols, and ports is reviewed. The review also includes the justifications for compensatory measures for the use of protocols that are considered insecure.",
    },
    {
        id: 'c5-2020-cos-04',
        section: 'Communication Security (COS)',
        code: 'COS-04',
        control: 'Cross-network access',
        label: 'Cross-network access',
        requirements:
            'Each network perimeter is controlled by security gateways. The system access authorisation for cross-network access is based on a security assessment based on the requirements of the cloud customers.',
    },
    {
        id: 'c5-2020-cos-05',
        section: 'Communication Security (COS)',
        code: 'COS-05',
        control: 'Networks for administration',
        label: 'Networks for administration',
        requirements:
            'There are separate networks for the administrative management of the infrastructure and for the operation of management consoles. These networks are logically or physically separated from the cloud customer\'s network and protected from unauthorised access by multi-factor authentication (cf. IDM-09). Networks used by the Cloud Service Provider to migrate or create virtual machines are also physically or logically separated from other networks',
    },
    {
        id: 'c5-2020-cos-06',
        section: 'Communication Security (COS)',
        code: 'COS-06',
        control: 'Segregation of data traffic in jointly used network environments',
        label: 'Segregation of data traffic in jointly used network environments',
        requirements:
            'Data traffic of cloud customers in jointly used network environments is segregated on network level according to a documented concept to ensure the confidentiality and integrity of the data transmitted.',
    },
    {
        id: 'c5-2020-cos-07',
        section: 'Communication Security (COS)',
        code: 'COS-07',
        control: 'Documentation of the network topology',
        label: 'Documentation of the network topology',
        requirements:
            'The documentation of the logical structure of the network used to provision or operate the Cloud Service, is traceable and up-to-date, in order to avoid administrative errors during live operation and to ensure timely recovery in the event of malfunctions in accordance with contractual obligations. The documentation shows how the subnets are allocated and how the network is zoned and segmented. In addition, the geographical locations in which the cloud customers\' data is stored are indicated.',
    },
    {
        id: 'c5-2020-cos-08',
        section: 'Communication Security (COS)',
        code: 'COS-08',
        control: 'Policies for data transmission',
        label: 'Policies for data transmission',
        requirements:
            'Policies and instructions with technical and organisational safeguards in order to protect the transmission of data against unauthorised interception, manipulation, copying, modification, redirection or destruction are documented, communicated and provided according to SP-01. The policies and instructions establish a reference to the classification of information (cf. AM-06).',
    },
    {
        id: 'c5-2020-pi-01',
        section: 'Portability and Interoperability (PI)',
        code: 'PI-01',
        control: 'Documentation and safety of input and output interfaces',
        label: 'Documentation and safety of input and output interfaces',
        requirements:
            "The cloud service can be accessed by other cloud services or IT systems of cloud customers through documented inbound and outbound interfaces. Further, the interfaces are clearly documented for subject matter experts on how they can be used to retrieve the data.\n\nCommunication takes place through standardised communication protocols that ensure the confidentiality and integrity of the transmitted information according to its protection requirements. Communication over untrusted networks is encrypted according to CRY-02.\n\nThe type and scope of the documentation on the interfaces is geared to the needs of the cloud customers' subject matter experts in order to enable the use of these interfaces. The information is maintained in such a way that it is applicable for the cloud service's version which is intended for productive use.",
    },
    {
        id: 'c5-2020-pi-02',
        section: 'Portability and Interoperability (PI)',
        code: 'PI-02',
        control: 'Contractual agreements for the provision of data',
        label: 'Contractual agreements for the provision of data',
        requirements:
            'In contractual agreements, the following aspects are defined with regard to the termination of the contractual relationship, insofar as these are applicable to the cloud service:\n\n• Type, scope and format of the data the Cloud Service Provider provides to the cloud customer;\n\n• Definition of the timeframe, within which the Cloud Service Provider makes the data available to the cloud customer\n\n• Definition of the point in time as of which the Cloud Service Provider makes the data inaccessible to the cloud customer and deletes these; and\n\n• The cloud customers\' responsibilities and obligations to cooperate for the provision of the data.\n\nThe definitions are based on the needs of subject matter experts of potential customers who assess the suitability of the cloud service with regard to a dependency on the Cloud Service Provider as well as legal and regulatory requirements.',
    },
    {
        id: 'c5-2020-pi-03',
        section: 'Portability and Interoperability (PI)',
        code: 'PI-03',
        control: 'Secure deletion of data',
        label: 'Secure deletion of data',
        requirements:
            "The Cloud Service Provider's procedures for deleting the cloud customers' data upon termination of the contractual relationship ensure compliance with the contractual agreements (cf. PI-02).\n\nThe deletion includes data in the cloud customer's environment, metadata and data stored in the data backups.\n\nThe deletion procedures prevent recovery by forensic means.",
    },
    {
        id: 'c5-2020-dev-01',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-01',
        control: 'Policies for the development/procurement of information systems',
        label: 'Policies for the development/procurement of information systems',
        requirements:
            'Policies and instructions with technical and organisational measures for the secure development of the cloud service are documented, communicated and provided in accordance with SP-01.\n\nThe policies and instructions contain guidelines for the entire life cycle of the cloud service and are based on recognised standards and methods with regard to the following aspects:\n\n• Security in Software Development (Requirements, Design, Implementation, Testing and Verification);\n\n• Security in software deployment (including continuous delivery); and\n\n• Security in operation (reaction to identified faults and vulnerabilities).',
    },
    {
        id: 'c5-2020-dev-02',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-02',
        control: 'Outsourcing of the development',
        label: 'Outsourcing of the development',
        requirements:
            'In the case of outsourced development of the cloud service (or individual system components), specifications regarding the following aspects are contractually agreed between the Cloud Service Provider and the outsourced development contractor:\n\n• Security in software development (requirements, design, implementation, tests and verifications) in accordance with recognised standards and methods;\n\n• Acceptance testing of the quality of the services provided in accordance with the agreed functional and non-functional requirements; and\n\n• Providing evidence that sufficient verifications have been carried out to rule out the existence of known vulnerabilities.',
    },
    {
        id: 'c5-2020-dev-03',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-03',
        control: 'Policies for changes to information systems',
        label: 'Policies for changes to information systems',
        requirements:
            'Policies and instructions with technical and organisational safeguards for change management of system components of the cloud service within the scope of software deployment are documented, communicated and provided according to SP-01 with regard to the following aspects:\n\n• Criteria for risk assessment, categorisation and prioritisation of changes and related requirements for the type and scope of testing to be performed, and necessary approvals for the development/implementation of the change and releases for deployment in the production environment by authorised personnel or system components;\n\n• Requirements for the performance and documentation of tests;\n\n• Requirements for segregation of duties during development, testing and release of changes;\n\n• Requirements for the proper information of cloud customers about the type and scope of the change as well as the resulting obligations to cooperate in accordance with the contractual agreements;\n\n• Requirements for the documentation of changes in system, operational and user documentation; and\n\n• Requirements for the implementation and documentation of emergency changes that must comply with the same level of security as normal changes.',
    },
    {
        id: 'c5-2020-dev-04',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-04',
        control:
            'Safety training and awareness programme regarding continuous software delivery and associated systems, components or tools.',
        label:
            'Safety training and awareness programme regarding continuous software delivery and associated systems, components or tools.',
        requirements:
            'The Cloud Service Provider provides a training program for regular, target group-oriented security training and awareness for internal and external employees on standards and methods of secure software development and provision as well as on how to use the tools used for this purpose. The program is regularly reviewed and updated with regard to the applicable policies and instructions, the assigned roles and responsibilities and the tools used.',
    },
    {
        id: 'c5-2020-dev-05',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-05',
        control: 'Risk assessment, categorisation and prioritisation of changes',
        label: 'Risk assessment, categorisation and prioritisation of changes',
        requirements:
            'In accordance with the applicable policies (cf. DEV-03), changes are subjected to a risk assessment with regard to potential effects on the system components concerned and are categorised and prioritised accordingly.',
    },
    {
        id: 'c5-2020-dev-06',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-06',
        control: 'Testing changes',
        label: 'Testing changes',
        requirements:
            'Changes to the cloud service are subject to appropriate testing during software development and deployment.\n\nThe type and scope of the tests correspond to the risk assessment. The tests are carried out by appropriately qualified personnel of the Cloud Service Provider or by automated test procedures that comply with the state-of-the-art. Cloud customers are involved into the tests in accordance with the contractual requirements.\n\nThe severity of the errors and vulnerabilities identified in the tests, which are relevant for the deployment decision, is determined according to defined criteria and actions for timely remediation or mitigation are initiated.',
    },
    {
        id: 'c5-2020-dev-07',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-07',
        control: 'Logging of changes',
        label: 'Logging of changes',
        requirements:
            'System components and tools for source code management and software deployment that are used to make changes to system components of the cloud service in the production environment are subject to a role and rights concept according to IDM-01 and authorisation mechanisms. They must be configured in such a way that all changes are logged and can therefore be traced back to the individuals or system components executing them.',
    },
    {
        id: 'c5-2020-dev-08',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-08',
        control: 'Version Control',
        label: 'Version Control',
        requirements:
            'Version control procedures are set up to track dependencies of individual changes and to restore affected system components back to their previous state as a result of errors or identified vulnerabilities.',
    },
    {
        id: 'c5-2020-dev-09',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-09',
        control: 'Approvals for provision in the production environment',
        label: 'Approvals for provision in the production environment',
        requirements:
            'Authorised personnel or system components of the Cloud Service Provider approve changes to the cloud service based on defined criteria (e.g. test results and required approvals) before these are made available to the cloud customers in the production environment.\n\nCloud customers are involved in the release according to contractual requirements.',
    },
    {
        id: 'c5-2020-dev-10',
        section: 'Procurement, Development and Modification of Information Systems (DEV)',
        code: 'DEV-10',
        control: 'Separation of environments',
        label: 'Separation of environments',
        requirements:
            'Production environments are physically or logically separated from test or development environments to prevent unauthorised access to cloud customer data, the spread of malware, or changes to system components. Data contained in the production environments is not used in test or development environments in order not to compromise their confidentiality.',
    },
    {
        id: 'c5-2020-sso-01',
        section: 'Control and Monitoring of Service Providers and Suppliers (SSO)',
        code: 'SSO-01',
        control: 'Policies and instructions for controlling and monitoring third parties',
        label: 'Policies and instructions for controlling and monitoring third parties',
        requirements:
            'Policies and instructions for controlling and monitoring third parties (e.g. service providers or suppliers) whose services contribute to the provision of the cloud service are documented, communicated and provided in accordance with SP-01 with respect to the following aspects:\n\n• Requirements for the assessment of risks resulting from the procurement of third-party services;\n\n• Requirements for the classification of third parties based on the risk assessment by the Cloud Service Provider and the determination of whether the third party is a subcontractor (cf. Supplementary Information);\n\n• Information security requirements for the processing, storage or transmission of information by third parties based on recognised industry standards;\n\n• Information security awareness and training requirements for staff;\n\n• applicable legal and regulatory requirements;\n\n• Requirements for dealing with vulnerabilities, security incidents and malfunctions;\n\n• Specifications for the contractual agreement of these requirements;\n\n• Specifications for the monitoring of these requirements; and\n\n• Specifications for applying these requirements also to service providers used by the third parties, insofar as the services provided by these service providers also contribute to the provision of the cloud service.',
    },
    {
        id: 'c5-2020-sso-02',
        section: 'Control and Monitoring of Service Providers and Suppliers (SSO)',
        code: 'SSO-02',
        control: 'Risk assessment of service providers and suppliers',
        label: 'Risk assessment of service providers and suppliers',
        requirements:
            'Service providers and suppliers of the Cloud Service Provider undergo a risk assessment in accordance with the policies and instructions for the control and monitoring of third parties prior to contributing to the delivery of the cloud service. The adequacy of the risk assessment is reviewed regularly, at least annually, by qualified personnel of the Cloud Service Provider during service usage.\n\nThe risk assessment includes the identification, analysis, evaluation, handling and documentation of risks with regard to the following aspects:\n\n• Protection needs regarding the confidentiality, integrity, availability and authenticity of information processed, stored or transmitted by the third party;\n\n• Impact of a protection breach on the provision of the cloud service;\n\n• The Cloud Service Provider\'s dependence on the service provider or supplier for the scope, complexity and uniqueness of the service purchased, including the consideration of possible alternatives.',
    },
    {
        id: 'c5-2020-sso-03',
        section: 'Control and Monitoring of Service Providers and Suppliers (SSO)',
        code: 'SSO-03',
        control: 'Directory of service providers and suppliers',
        label: 'Directory of service providers and suppliers',
        requirements:
            'The Cloud Service Provider maintains a directory for controlling and monitoring the service providers and suppliers who contribute services to the delivery of the cloud service. The following information is maintained in the directory:\n\n• Company name;\n\n• Address;\n\n• Locations of data processing and storage;\n\n• Responsible contact person at the service provider/supplier;\n\n• Responsible contact person at the cloud service provider;\n\n• Description of the service;\n\n• Classification based on the risk assessment;\n\n• Beginning of service usage; and\n\n• Proof of compliance with contractually agreed requirements.\n\nThe information in the list is checked at least annually for completeness, accuracy and validity.',
    },
    {
        id: 'c5-2020-sso-04',
        section: 'Control and Monitoring of Service Providers and Suppliers (SSO)',
        code: 'SSO-04',
        control: 'Monitoring of compliance with requirements',
        label: 'Monitoring of compliance with requirements',
        requirements:
            'The Cloud Service Provider monitors compliance with information security requirements and applicable legal and regulatory requirements in accordance with policies and instructions concerning controlling and monitoring of third-parties.\n\nMonitoring includes a regular review of the following evidence to the extent that such evidence is to be provided by third parties in accordance with the contractual agreements:\n\n• reports on the quality of the service provided;\n\n• certificates of the management systems\' compliance with international standards;\n\n• independent third-party reports on the suitability and operating effectiveness of their service-related internal control systems; and\n\n• Records of the third parties on the handling of vulnerabilities, security incidents and malfunctions.\n\nThe frequency of the monitoring corresponds to the classification of the third party based on the risk assessment conducted by the Cloud Service Provider (cf. SSO-02). The results of the monitoring are included in the review of the third party\'s risk assessment.\n\nIdentified violations and deviations are subjected to analysis, evaluation and treatment in accordance with the risk management procedure (cf. OIS-07).',
    },
    {
        id: 'c5-2020-sso-05',
        section: 'Control and Monitoring of Service Providers and Suppliers (SSO)',
        code: 'SSO-05',
        control: 'Exit strategy for the receipt of benefits',
        label: 'Exit strategy for the receipt of benefits',
        requirements:
            'The Cloud Service Provider has defined and documented exit strategies for the purchase of services where the risk assessment of the service providers and suppliers regarding the scope, complexity and uniqueness of the purchased service resulted in a very high dependency (cf. Supplementary Information).\n\nExit strategies are aligned with operational continuity plans and include the following aspects:\n\n• Analysis of the potential costs, impacts, resources and timing of the transition of a purchased service to an alternative service provider or supplier;\n\n• Definition and allocation of roles, responsibilities and sufficient resources to perform the activities for a transition;\n\n• Definition of success criteria for the transition; and\n\n• Definition of indicators for monitoring the performance of services, which should initiate the withdrawal from the service if the results are unacceptable.',
    },
    {
        id: 'c5-2020-sim-01',
        section: 'Security Incident Management (SIM)',
        code: 'SIM-01',
        control: 'Policy for security incident management',
        label: 'Policy for security incident management',
        requirements:
            'Policies and instructions with technical and organisational safeguards are documented, communicated and provided in accordance with SP-01 to ensure a fast, effective and proper response to all known security incidents.\n\nThe Cloud Service Provider defines guidelines for the classification, prioritisation and escalation of security incidents and creates interfaces to the incident management and business continuity management.\n\nIn addition, the Cloud Service Provider has set up a "Computer Emergency Response Team" (CERT), which contributes to the coordinated resolution of occurring security incidents.\n\nCustomers affected by security incidents are informed in a timely and appropriate manner.',
    },
    {
        id: 'c5-2020-sim-02',
        section: 'Security Incident Management (SIM)',
        code: 'SIM-02',
        control: 'Processing of security incidents',
        label: 'Processing of security incidents',
        requirements:
            'Subject matter experts of the Cloud Service Provider, together with external security providers where appropriate, classify, prioritise and perform root-cause analyses for events that could constitute a security incident.',
    },
    {
        id: 'c5-2020-sim-03',
        section: 'Security Incident Management (SIM)',
        code: 'SIM-03',
        control: 'Documentation and reporting of security incidents',
        label: 'Documentation and reporting of security incidents',
        requirements:
            'After a security incident has been processed, the solution is documented in accordance with the contractual agreements and the report is sent to the affected customers for final acknowledgement or, if applicable, as confirmation.',
    },
    {
        id: 'c5-2020-sim-04',
        section: 'Security Incident Management (SIM)',
        code: 'SIM-04',
        control: 'Duty of the users to report security incidents to a central body',
        label: 'Duty of the users to report security incidents to a central body',
        requirements:
            'The Cloud Service Provider informs employees and external business partners of their obligations. If necessary, they agree to or are contractually obliged to report all security events that become known to them and are directly related to the cloud service provided by the Cloud Service Provider to a previously designated central office of the Cloud Service Provider promptly.\n\nIn addition, the Cloud Service Provider communicates that "false reports" of events that do not subsequently turn out to be incidents do not have any negative consequences.',
    },
    {
        id: 'c5-2020-sim-05',
        section: 'Security Incident Management (SIM)',
        code: 'SIM-05',
        control: 'Evaluation and learning process',
        label: 'Evaluation and learning process',
        requirements:
            'Mechanisms are in place to measure and monitor the type and scope of security incidents and to report them to support agencies. The information obtained from the evaluation is used to identify recurrent or significant incidents and to identify the need for further protection.',
    },
    {
        id: 'c5-2020-bcm-01',
        section: 'Business Continuity Management (BCM)',
        code: 'BCM-01',
        control: 'Top management responsibility',
        label: 'Top management responsibility',
        requirements:
            'The top management (or a member of the top management) of the Cloud Service Provider is named as the process owner of business continuity and emergency management and is responsible for establishing the process within the company as well as ensuring compliance with the guidelines. They must ensure that sufficient resources are made available for an effective process.\n\nPeople in management and other relevant leadership positions demonstrate leadership and commitment to this issue by encouraging employees to actively contribute to the effectiveness of continuity and emergency management.',
    },
    {
        id: 'c5-2020-bcm-02',
        section: 'Business Continuity Management (BCM)',
        code: 'BCM-02',
        control: 'Business impact analysis policies and instructions',
        label: 'Business impact analysis policies and instructions',
        requirements:
            'Policies and instructions to determine the impact of any malfunction to the cloud service or enterprise are documented, communicated and made available in accordance with SP-01. The following aspects are considered as minimum:\n\n• Possible scenarios based on a risk analysis;\n\n• Identification of critical products and services\n\n• Identify dependencies, including processes (including resources required), applications, business partners and third parties;\n\n• Capture threats to critical products and services;\n\n• Identification of effects resulting from planned and unplanned malfunctions and changes over time;\n\n• Determination of the maximum acceptable duration of malfunctions;\n\n• Identification of restoration priorities;\n\n• Determination of time targets for the resumption of critical products and services within the maximum acceptable time period (RTO);\n\n• Determination of time targets for the maximum reasonable period during which data can be lost and not recovered (RPO); and\n\n• Estimation of the resources needed for resumption.',
    },
    {
        id: 'c5-2020-bcm-03',
        section: 'Business Continuity Management (BCM)',
        code: 'BCM-03',
        control: 'Planning business continuity',
        label: 'Planning business continuity',
        requirements:
            'Based on the business impact analysis, a single framework for operational continuity and business plan planning will be implemented, documented and enforced to ensure that all plans are consistent. Planning is based on established standards, which are documented in a "Statement of Applicability".\n\nBusiness continuity plans and contingency plans take the following aspects into account:\n\n• Defined purpose and scope with consideration of the relevant dependencies;\n\n• Accessibility and comprehensibility of the plans for persons who are to act accordingly;\n\n• Ownership by at least one designated person responsible for review, updating and approval;\n\n• Defined communication channels, roles and responsibilities including notification of the customer;\n\n• Recovery procedures, manual interim solutions and reference information (taking into account prioritisation in the recovery of cloud infrastructure components and services and alignment with customers);\n\n• Methods for putting the plans into effect;\n\n• Continuous process improvement; and\n\n• Interfaces to Security Incident Management.',
    },
    {
        id: 'c5-2020-bcm-04',
        section: 'Business Continuity Management (BCM)',
        code: 'BCM-04',
        control: 'Verification, updating and testing of the business continuity',
        label: 'Verification, updating and testing of the business continuity',
        requirements:
            'The business impact analysis, business continuity plans and contingency plans are reviewed, updated and tested on a regular basis (at least annually) or after significant organisational or environmental changes. Tests involve affected customers (tenants) and relevant third parties. The tests are documented and results are taken into account for future operational continuity measures.',
    },
    {
        id: 'c5-2020-com-01',
        section: 'Compliance (COM)',
        code: 'COM-01',
        control: 'Identification of applicable legal, regulatory, self-imposed or contractual requirements',
        label: 'Identification of applicable legal, regulatory, self-imposed or contractual requirements',
        requirements:
            'The legal, regulatory, self-imposed and contractual requirements relevant to the information security of the cloud service as well as the Cloud Service Provider\'s procedures for complying with these requirements are explicitly defined and documented.',
    },
    {
        id: 'c5-2020-com-02',
        section: 'Compliance (COM)',
        code: 'COM-02',
        control: 'Policy for planning and conducting audits',
        label: 'Policy for planning and conducting audits',
        requirements:
            'Policies and instructions for planning and conducting audits are documented, communicated and made available in accordance with SP-01 and address the following aspects:\n\n• Restriction to read-only access to system components in accordance with the agreed audit plan and as necessary to perform the activities;\n\n• Activities that may result in malfunctions to the cloud service or breaches of contractual requirements are performed during scheduled maintenance windows or outside peak periods; and\n\n• Logging and monitoring of activities.',
    },
    {
        id: 'c5-2020-com-03',
        section: 'Compliance (COM)',
        code: 'COM-03',
        control: 'Internal audits of the information security management system',
        label: 'Internal audits of the information security management system',
        requirements:
            'Subject matter experts check the compliance of the information security management system at regular intervals, at least annually, with the relevant and applicable legal, regulatory, self-imposed or contractual requirements (cf. COM-01) as well as compliance with the policies and instructions (cf. SP-01) within their scope of responsibility (cf. OIS-01) through internal audits (cf. § 9.2 of ISO/IEC 27001).\n\nIdentified vulnerabilities and deviations are subject to risk assessment in accordance with the risk management procedure (cf. OIS-06) and follow-up measures are defined and tracked (cf. OPS-18).',
    },
    {
        id: 'c5-2020-com-04',
        section: 'Compliance (COM)',
        code: 'COM-04',
        control: 'Information on information security performance and management assessment of the ISMS',
        label: 'Information on information security performance and management assessment of the ISMS',
        requirements:
            'The top management of the Cloud Service Provider is regularly informed about the information security performance within the scope of the ISMS in order to ensure its continued suitability, adequacy and effectiveness. The information is included in the management review of the ISMS at is performed at least once a year.',
    },
    {
        id: 'c5-2020-inq-01',
        section: 'Dealing with investigation requests from government agencies (INQ)',
        code: 'INQ-01',
        control: 'Legal Assessment of Investigative Inquiries',
        label: 'Legal Assessment of Investigative Inquiries',
        requirements:
            'Investigation requests from government agencies are subjected to a legal assessment by subject matter experts of the Cloud Service Provider. The assessment determines whether the government agency has an applicable and legally valid legal basis and what further steps need to be taken.',
    },
    {
        id: 'c5-2020-inq-02',
        section: 'Dealing with investigation requests from government agencies (INQ)',
        code: 'INQ-02',
        control: 'Informing Cloud Customers about Investigation Requests',
        label: 'Informing Cloud Customers about Investigation Requests',
        requirements:
            'The Cloud Service Provider informs the affected Cloud Customer(s) without undue delay, unless the applicable legal basis on which the government agency is based prohibits this or there are clear indications of illegal actions in connection with the use of the Cloud Service.',
    },
    {
        id: 'c5-2020-inq-03',
        section: 'Dealing with investigation requests from government agencies (INQ)',
        code: 'INQ-03',
        control: 'Conditions for Access to or Disclosure of Data in Investigation Requests',
        label: 'Conditions for Access to or Disclosure of Data in Investigation Requests',
        requirements:
            'Access to or disclosure of cloud customer data in connection with government investigation requests is subject to the proviso that the Cloud Service Provider\'s legal assessment has shown that an applicable and valid legal basis exists and that the investigation request must be granted on that basis.',
    },
    {
        id: 'c5-2020-inq-04',
        section: 'Dealing with investigation requests from government agencies (INQ)',
        code: 'INQ-04',
        control: 'Limiting Access to or Disclosure of Data in Investigation Requests',
        label: 'Limiting Access to or Disclosure of Data in Investigation Requests',
        requirements:
            'The Cloud Service Provider\'s procedures establishing access to or disclosing data of cloud customers in the context of investigation requests from governmental agencies ensure that the agencies only gain access to or insight into the data that is the subject of the investigation request.\n\nIf no clear limitation of the data is possible, the Cloud Service Provider anonymises or pseudonymises the data so that government agencies can only assign it to those cloud customers who are subject of the investigation request.',
    },
    {
        id: 'c5-2020-pss-01',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-01',
        control: 'Guidelines and Recommendations for Cloud Customers',
        label: 'Guidelines and Recommendations for Cloud Customers',
        requirements:
            'The Cloud Service Provider provides cloud customers with guidelines and recommendations for the secure use of the cloud service provided. The information contained therein is intended to assist the cloud customer in the secure configuration, installation and use of the cloud service, to the extent applicable to the cloud service and the responsibility of the cloud user.\n\nThe type and scope of the information provided will be based on the needs of subject matter experts of the cloud customers who set information security requirements, implement them or verify the implementation (e.g. IT, Compliance, Internal Audit). The information in the guidelines and recommendations for the secure use of the cloud service address the following aspects, where applicable to the cloud service:\n\n• Instructions for secure configuration;\n\n• Information sources on known vulnerabilities and update mechanisms;\n\n• Error handling and logging mechanisms;\n\n• Authentication mechanisms;\n\n• Roles and rights concept including combinations that result in an elevated risk; and\n\n• Services and functions for administration of the cloud service by privileged users.\n\nThe information is maintained so that it is applicable to the cloud service provided in the version intended for productive use.',
    },
    {
        id: 'c5-2020-pss-02',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-02',
        control: 'Identification of Vulnerabilities of the Cloud Service',
        label: 'Identification of Vulnerabilities of the Cloud Service',
        requirements:
            'The Cloud Service Provider applies appropriate measures to check the cloud service for vulnerabilities which might have been integrated into the cloud service during the software development process.\n\nThe procedures for identifying such vulnerabilities are part of the software development process and, depending on a risk assessment, include the following activities:\n\n• Static Application Security Testing;\n\n• Dynamic Application Security Testing;\n\n• Code reviews by the Cloud Service Provider\'s subject matter experts; and\n\n• Obtaining information about confirmed vulnerabilities in software libraries provided by third parties and used in their own cloud service.\n\nThe severity of identified vulnerabilities is assessed according to defined criteria and measures are taken to immediately eliminate or mitigate them.',
    },
    {
        id: 'c5-2020-pss-03',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-03',
        control: 'Online Register of Known Vulnerabilities',
        label: 'Online Register of Known Vulnerabilities',
        requirements:
            'The Cloud Service Provider operates or refers to a daily updated online register of known vulnerabilities that affect the Cloud Service Provider and assets provided by the Cloud Service Provider that the cloud customers have to install, provide or operate themselves under the customers responsibility.\n\nThe presentation of the vulnerabilities follows the Common Vulnerability Scoring System (CVSS).\n\nThe online register is easily accessible to any cloud customer. The information contained therein forms a suitable basis for risk assessment and possible follow-up measures on the part of cloud users.\n\nFor each vulnerability, it is indicated whether software updates (e.g. patch, update) are available, when they will be rolled out and whether they will be deployed by the Cloud Service Provider, the cloud customer or both of them together.',
    },
    {
        id: 'c5-2020-pss-04',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-04',
        control: 'Error handling and Logging Mechanisms',
        label: 'Error handling and Logging Mechanisms',
        requirements:
            'The cloud service provided is equipped with error handling and logging mechanisms. These enable cloud users to obtain security-related information about the security status of the cloud service as well as the data, services or functions it provides.\n\nThe information is detailed enough to allow cloud users to check the following aspects, insofar as they are applicable to the cloud service:\n\n• Which data, services or functions available to the cloud user within the cloud service, have been accessed by whom and when (Audit Logs);\n\n• Malfunctions during processing of automatic or manual actions; and\n\n• Changes to security-relevant configuration parameters, error handling and logging mechanisms, user authentication, action authorisation, cryptography, and communication security.\n\nThe logged information is protected from unauthorised access and modification and can be deleted by the Cloud Customer.\n\nIf the cloud customer is responsible for the activation or type and scope of logging, the Cloud Service Provider must provide appropriate logging capabilities.',
    },
    {
        id: 'c5-2020-pss-05',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-05',
        control: 'Authentication Mechanisms',
        label: 'Authentication Mechanisms',
        requirements:
            'The Cloud Service Provider provides authentication mechanisms that can force strong authentication (e.g. two or more factors) for users, IT components or applications within the cloud users\' area of responsibility.\nThese authentication mechanisms are set up at all access points that allow users, IT components or applications to interact with the cloud service.\n\nFor privileged users, IT components or applications, these authentication mechanisms are enforced.',
    },
    {
        id: 'c5-2020-pss-06',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-06',
        control: 'Session Management',
        label: 'Session Management',
        requirements:
            'To protect confidentiality, availability, integrity and authenticity during interactions with the cloud service, a suitable session management system is used that at least corresponds to the state-of-the-art and is protected against known attacks. Mechanisms are implemented that invalidate a session after it has been detected as inactive. The inactivity can be detected by time measurement. In this case, the time interval can be configured by the Cloud Service Provider or - if technically possible - by the cloud customer.',
    },
    {
        id: 'c5-2020-pss-07',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-07',
        control: 'Confidentiality of Authentication Information',
        label: 'Confidentiality of Authentication Information',
        requirements:
            'If passwords are used as authentication information for the cloud service, their confidentiality is ensured by the following procedures:\n\n• Users can initially create the password themselves or must change an initial password when logging in to the cloud service for the first time. An initial password loses its validity after a maximum of 14 days.\n\n• When creating passwords, compliance with the length and complexity requirements of the Cloud Service Provider (cf. IDM-09) or the cloud customer is technically enforced.\n\n• The user is informed about changing or resetting the password.\n\n• The server-side storage takes place using state-of-the-art cryptographically strong hash functions in combination with at least 32-bit long salt values.',
    },
    {
        id: 'c5-2020-pss-08',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-08',
        control: 'Roles and Rights Concept',
        label: 'Roles and Rights Concept',
        requirements:
            'The Cloud Service Provider provides cloud users with a roles and rights concept for managing access rights. It describes rights profiles for the functions provided by the cloud service.\n\nThe rights profiles are suitable for enabling cloud users to manage access authorisations and permissions in accordance with the principle of least-privilege and how it is necessary for the performance of tasks ("need-to-know principle") and to implement the principle of functional separation between operational and controlling functions ("separation of duties").',
    },
    {
        id: 'c5-2020-pss-09',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-09',
        control: 'Authorisation Mechanisms',
        label: 'Authorisation Mechanisms',
        requirements:
            'Access to the functions provided by the cloud service is restricted by access controls (authorisation mechanisms) that verify whether users, IT components, or applications are authorised to perform certain actions.\n\nThe Cloud Service Provider validates the functionality of the authorisation mechanisms before new functions are made available to cloud users and in the event of changes to the authorisation mechanisms of existing functions (cf. DEV-06). The severity of identified vulnerabilities is assessed according to defined criteria based on industry standard metrics (e.g. Common Vulnerability Scoring System) and measures for timely resolution or mitigation are initiated. Vulnerabilities that have not been fixed are listed in the online register of known vulnerabilities (cf. PSS-02).',
    },
    {
        id: 'c5-2020-pss-10',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-10',
        control: 'Software Defined Networking',
        label: 'Software Defined Networking',
        requirements:
            'If the Cloud Service offers functions for software-defined networking (SDN), the confidentiality of the data of the cloud user is ensured by suitable SDN procedures.\n\nThe Cloud Service Provider validates the functionality of the SDN functions before providing new SDN features to cloud users or modifying existing SDN features. Identified defects are assessed and corrected in a risk-oriented manner.',
    },
    {
        id: 'c5-2020-pss-11',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-11',
        control: 'Images for Virtual Machines and Containers',
        label: 'Images for Virtual Machines and Containers',
        requirements:
            'If cloud customers operate virtual machines or containers with the cloud service, the Cloud Service Provider must ensure the following aspects:\n\n• The cloud customer can restrict the selection of images of virtual machines or containers according to his specifications, so that users of this cloud customer can only launch the images or containers released according to these restrictions.\n\n• If the Cloud Service Provider provides images of virtual machines or containers to the Cloud Customer, the Cloud Service Provider appropriately inform the Cloud Customer of the changes made to the previous version.\n\n• In addition, these images provided by the Cloud Service Provider are hardened according to generally accepted industry standards.',
    },
    {
        id: 'c5-2020-pss-12',
        section: 'Product Safety and Security (PSS)',
        code: 'PSS-12',
        control: 'Locations of Data Processing and Storage',
        label: 'Locations of Data Processing and Storage',
        requirements:
            'The cloud customer is able to specify the locations (location/country) of the data processing and storage including data backups according to the contractually available options.\n\nThis must be ensured by the cloud architecture.',
    }

];