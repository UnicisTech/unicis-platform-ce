import type { TiaProcedureInterface, Option } from "types";

type StringifiedOption<T> = {
    [P in keyof T]: T[P] extends Option ? string : T[P];
};

// export type TransferScenarioStepValues = StringifiedOption<TiaProcedureInterface[0]>
export type TransferScenarioStepValues = TiaProcedureInterface[0]


export type ProblematicLawfulAccessValues = TiaProcedureInterface[1]

export type RiskStepValues = TiaProcedureInterface[2]

export type ProbabilityStepValues = TiaProcedureInterface[3]


