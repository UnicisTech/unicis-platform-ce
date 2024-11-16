import { PiaConfig } from "types/pia";

export const fieldPropsMapping = {
    isDataProcessingNecessary: 'Is the data processing necessary',
    isDataProcessingNecessaryAssessment: 'Assessment',

    isProportionalToPurpose: 'Is it proportional to the purpose',
    isProportionalToPurposeAssessment: 'Assessment',

    confidentialityRiskProbability: 'Probability of the risk',
    confidentialityRiskSecurity: 'Security of the risk',
    confidentialityAssessment: 'Assessment',

    availabilityRiskProbability: 'Probability of the risk',
    availabilityRiskSecurity: 'Security of the risk',
    availabilityAssessment: 'Assessment',

    transparencyRiskProbability: 'Probability of the risk',
    transparencyRiskSecurity: 'Security of the risk',
    transparencyAssessment: 'Assessment',
};

export const config: PiaConfig = {
    isDataProcessingNecessary: [
        { value: 'necessary', label: 'necessary' },
        { value: 'unnecessary', label: 'unnecessary' },
    ],
    isProportionalToPurpose: [
        { value: 'proportional', label: 'proportional' },
        { value: 'not proportional', label: 'not proportional' },
    ],
    confidentialityRiskProbability: [
        { value: 'rare', label: 'Rare' },
        { value: 'unlikely', label: 'Unlikely' },
        { value: 'possible', label: 'Possible' },
        { value: 'probable', label: 'Probable' },
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
    ],
    transparencyRiskSecurity: [
        { value: 'insignificant', label: <span><b>Insignificant:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it has minimal operational impact, negligible costs, and does not notably affect the data subject's business or finances.</span> },
        { value: 'minor', label: <span><b>Minor:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it has a noticeable but limited operational impact, some costs, and may lead to minor financial consequences for the data subject, but without a substantial impact on their rights.</span> },
        { value: 'moderate', label: <span><b>Moderate:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it results in substantial operational impact, is very costly, and may cause significant business or financial harm to the data subject, but without involving special categories that pose major risks to their rights.</span> },
        { value: 'major', label: <span><b>Major:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it causes severe operational disruption, is highly damaging and extremely costly. It may involve special categories (e.g., sensitive data or criminal histories), with a potential for significant risks to the data subject's rights and freedoms.</span> },
        { value: 'extreme', label: <span><b>Extreme:</b> The loss of transparency, appropriateness, and data minimization in processing personal data, where it leads to complete operational failure, posing potential threats to life or personal freedoms, with serious impacts on the rights of data subjects.</span> }
    ]
}