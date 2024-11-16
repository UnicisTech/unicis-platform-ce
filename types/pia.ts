type Option = {
    label: string | any;
    value: string;
  };

export interface PiaConfig {
    isDataProcessingNecessary: Option[]
    isProportionalToPurpose: Option[]
    confidentialityRiskProbability: Option[],
    confidentialityRiskSecurity: Option[],
    availabilityRiskProbability: Option[],
    availabilityRiskSecurity: Option[],
    transparencyRiskProbability: Option[],
    transparencyRiskSecurity: Option[],
    // category: RpaOption[];
    // specialcategory: RpaOption[];
    // datasubject: RpaOption[];
    // retentionperiod: RpaOption[];
    // recipientType: RpaOption[];
    // guarantee: RpaOption[];
    // toms: RpaOption[];
    // country: RpaOption[];
    // involveProfiling: RpaOption[];
    // useAutomated: RpaOption[];
    // involveSurveillance: RpaOption[];
    // processedSpecialCategories: RpaOption[];
    // isBigData: RpaOption[];
    // dataSetsCombined: RpaOption[];
    // multipleControllers: RpaOption[];
    // imbalanceInRelationship: RpaOption[];
    // innovativeTechnologyUsed: RpaOption[];
    // transferredOutside: RpaOption[];
    // rightsRestricted: RpaOption[];
    // piaNeeded: RpaOption[];
  }