import { PiaConfig, RiskProbability, RiskSecurity } from "types/pia";

export const headers = [
    'Data processing',
    'Confidentiality and Integrity',
    'Availability',
    'Transparency, and data minimization',
    'Results',
    'Corrective measures',
]

export const fieldPropsMapping = {
    isDataProcessingNecessary: 'Is the data processing necessary',
    isDataProcessingNecessaryAssessment: 'Assessment',

    isProportionalToPurpose: 'Is it proportional to the purpose',
    isProportionalToPurposeAssessment: 'Assessment',

    confidentialityRiskProbability: 'Probability of the risk',
    confidentialityRiskSecurity: 'Impact of the risk',
    confidentialityAssessment: 'Assessment',

    availabilityRiskProbability: 'Probability of the risk',
    availabilityRiskSecurity: 'Impact of the risk',
    availabilityAssessment: 'Assessment',

    transparencyRiskProbability: 'Probability of the risk',
    transparencyRiskSecurity: 'Impact of the risk',
    transparencyAssessment: 'Assessment',

    guarantees: "Guarantees",
    securityMeasures: "Security measures",
    securityCompliance: "Compliance with security notices issued by supervisory authorities",
    dealingWithResidualRisk: "Dealing with existing residual risk",
    dealingWithResidualRiskAssessment: "Assessment",
    supervisoryAuthorityInvolvement: "Involvement of the supervisory authority if the risk is unacceptable",
};

export const config: PiaConfig = {
    isDataProcessingNecessary: [
        { value: 'necessary', label: 'Necessary' },
        { value: 'unnecessary', label: 'Unnecessary' },
    ],
    isProportionalToPurpose: [
        { value: 'proportional', label: 'Proportional' },
        { value: 'not_proportional', label: 'Not proportional' },
    ],
    confidentialityRiskProbability: [
        { value: 'rare', label: 'Rare' },
        { value: 'unlikely', label: 'Unlikely' },
        { value: 'possible', label: 'Possible' },
        { value: 'probable', label: 'Probable' },
        { value: 'severe', label: 'Severe' },
    ],
    confidentialityRiskSecurity: [
        { value: 'insignificant', label: <span><b>Insignificant:</b> The loss of confidentiality and integrity of personal data, where processing has minimal operational impact and negligible costs, and does not notably affect the data subject's business or finances.</span> },
        { value: 'minor', label: <span><b>Minor:</b> The loss of confidentiality and integrity of personal data, where processing has a noticeable but limited operational impact, some costs, and may lead to a minor financial impact for the data subject, but is unlikely to significantly affect their rights.</span> },
        { value: 'moderate', label: <span><b>Moderate:</b> The loss of confidentiality and integrity of personal data, where processing has a substantial operational impact, very costly, and may cause considerable business or financial harm to the data subject, but does not involve special categories or sensitive data with a major rights impact.</span> },
        { value: 'major', label: <span><b>Major:</b> The loss of confidentiality and integrity of personal data, where processing causes severe operational disruption, highly damaging and extremely costly to both the organization and data subjects. It could involve special categories (like criminal history or sensitive data), leading to significant risks to the rights and freedoms of data subjects.</span> },
        { value: 'extreme', label: <span><b>Extreme:</b> The loss of confidentiality and integrity of personal data, where processing results in complete operational failure and is unsurvivable, with potential life-threatening consequences or severe impacts on personal freedoms and rights of the data subjects.</span> }
    ],
    availabilityRiskProbability: [
        { value: 'rare', label: 'Rare' },
        { value: 'unlikely', label: 'Unlikely' },
        { value: 'possible', label: 'Possible' },
        { value: 'probable', label: 'Probable' },
        { value: 'severe', label: 'Severe' },
    ],
    availabilityRiskSecurity: [
        { value: 'insignificant', label: <span><b>Insignificant:</b> The loss of availability of personal data, where processing has minimal operational impact and negligible costs, and does not notably affect the data subject's business or finances.</span> },
        { value: 'minor', label: <span><b>Minor:</b> The loss of availability of personal data, where processing has a noticeable but limited operational impact, some costs, and may lead to minor financial inconvenience for the data subject, but without substantial impact on their rights.</span> },
        { value: 'moderate', label: <span><b>Moderate:</b> The loss of availability of personal data, where processing causes a substantial operational impact, is very costly, and leads to significant business or financial harm for the data subject, but does not involve sensitive categories that pose a major risk to their rights.</span> },
        { value: 'major', label: <span><b>Major:</b> The loss of availability of personal data, where processing results in severe operational disruption, is highly damaging and extremely costly, and could involve special categories (e.g., criminal histories or sensitive data), potentially leading to considerable risks to the data subject's rights and freedoms.</span> },
        { value: 'extreme', label: <span><b>Extreme:</b> The loss of availability of personal data, where processing causes complete operational failure, with potentially life-threatening consequences or severe impacts on personal freedoms and rights of the data subjects.</span> }
    ],
    transparencyRiskProbability: [
        { value: 'rare', label: 'Rare' },
        { value: 'unlikely', label: 'Unlikely' },
        { value: 'possible', label: 'Possible' },
        { value: 'probable', label: 'Probable' },
        { value: 'severe', label: 'Severe' },
    ],
    transparencyRiskSecurity: [
        { value: 'insignificant', label: <span><b>Insignificant:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it has minimal operational impact, negligible costs, and does not notably affect the data subject's business or finances.</span> },
        { value: 'minor', label: <span><b>Minor:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it has a noticeable but limited operational impact, some costs, and may lead to minor financial consequences for the data subject, but without a substantial impact on their rights.</span> },
        { value: 'moderate', label: <span><b>Moderate:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it results in substantial operational impact, is very costly, and may cause significant business or financial harm to the data subject, but without involving special categories that pose major risks to their rights.</span> },
        { value: 'major', label: <span><b>Major:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it causes severe operational disruption, is highly damaging and extremely costly. It may involve special categories (e.g., sensitive data or criminal histories), with a potential for significant risks to the data subject's rights and freedoms.</span> },
        { value: 'extreme', label: <span><b>Extreme:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it leads to complete operational failure, posing potential threats to life or personal freedoms, with serious impacts on the rights of data subjects.</span> }
    ],
    dealingWithResidualRisk: [
        { value: "acceptable", label: "Acceptable" },
        { value: "acceptable_with_conditions", label: "Acceptable with limitations under certain conditions" },
        { value: "not_acceptable", label: "Not acceptable" },
    ],
    supervisoryAuthorityInvolvement: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
    ]
}

export const riskProbabilityPoints: Record<RiskProbability, number> = {
    rare: 0,
    unlikely: 1,
    possible: 2,
    probable: 3,
    severe: 4,
};

export const riskSecurityPoints: Record<RiskSecurity, number> = {
    insignificant: 0,
    minor: 1,
    moderate: 2,
    major: 3,
    extreme: 4,
};

export const piaDashboardConfig = [
    {
        id: 1,
        title: "Confidentiality and Integrity",
        security: "confidentialityRiskSecurity",
        probability: "confidentialityRiskProbability",
    },
    {
        id: 2,
        title: "Availability",
        security: "availabilityRiskSecurity",
        probability: "availabilityRiskProbability",
    },
    {
        id: 3,
        title: "Transparency, purpose limitation and data minimization",
        security: "transparencyRiskSecurity",
        probability: "transparencyRiskProbability",
    },
];