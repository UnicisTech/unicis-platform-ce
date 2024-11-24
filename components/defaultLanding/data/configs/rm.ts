export const headers = [
    'Describe the the risk and impact',
    'Determine the treatment',
];

export const tabs = [
    'Risk and impact',
    'Treatment',
];

export const fieldPropsMapping = {
    Risk: 'Risk',
    AssetOwner: 'Asset owner',
    Impact: 'Impact',
    RawProbability: 'Raw probability',
    RawImpact: 'Raw impact',
    RiskTreatment: 'Risk treatment',
    TreatmentCost: 'Treatment cost',
    TreatmentStatus: 'Treatment status',
    TreatedProbability: 'Treated probability',
    TreatedImpact: 'Treated impact',
};

export const defaultProcedure = [
    {
        Risk: '',
        AssetOwner: null,
        Impact: '',
        RawProbability: '',
        RawImpact: '',
    },
    {
        RiskTreatment: '',
        TreatmentCost: '',
        TreatmentStatus: '',
        TreatedProbability: '',
        TreatedImpact: '',
    },
];