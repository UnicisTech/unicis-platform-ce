export type RmOption = {
    label: string;
    value: string;
};

export type RMProcedureInterface = [
    {
        Risk: string;
        AssetOwner: string; //Or a number - the id of the user
        Impact: string;
        RawProbability: number;
        RawImpact: number;
    },
    {
        RiskTreatment: string;
        TreatmentCost: string;
        TreatmentStatus: string;
        TreatedProbability: number;
        TreatedImpact: number;
    },
];