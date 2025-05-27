"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/shadcn/ui/form";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";

import { config, fieldPropsMapping, questions } from "@/components/defaultLanding/data/configs/tia";
import type { ProbabilityStepValues } from "../types";
import { Message } from "@/components/shared/atlaskit";
import { Input } from "@/components/shadcn/ui/input";
import DaisyBadge from "@/components/shared/daisyUI/DaisyBadge";
import { TiaProcedureInterface } from "types";

interface ProbabilityStepProps {
    problematicLawfulAccessValues: TiaProcedureInterface[1];
    riskValues: TiaProcedureInterface[2];
    control: Control<ProbabilityStepValues>;
}

export default function ProbabilityStep({ control, problematicLawfulAccessValues, riskValues }: ProbabilityStepProps) {
    return (
        <>
            <Message text={`To be completed by the exporter`} />
            <Message
                text={`If a problematic lawful access were to occur on the part of the importer as per Step 3, the transfer is nevertheless permitted if one of the derogations provided for by Art. 49 GDPR or the corresponding provisions of the CH DPA applies:`}
            />

            <p>{questions['DataTransferImporter']}</p>

            <FormField
                control={control}
                name="RelevantDataTransferImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.RelevantDataTransferImporter}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                                placeholder="Enter relevant data transfer details"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ProbabilityDataTransferImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ProbabilityDataTransferImporter}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                                placeholder="Enter probability (e.g. high, low, etc.)"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ReasonDataTransferImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonDataTransferImporter}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                autoComplete="off"
                                placeholder="Provide reasoning for data transfer probability"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <p>{questions['TransferToImporter']}</p>

            <FormField
                control={control}
                name="RelevantTransferToImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.RelevantTransferToImporter}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ProbabilityTransferToImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ProbabilityTransferToImporter}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ReasonTransferToImporter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonTransferToImporter}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <p>{questions['TransferToImporterForPerformance']}</p>

            <FormField
                control={control}
                name="RelevantTransferToImporterForPerformance"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.RelevantTransferToImporterForPerformance}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ProbabilityTransferToImporterPerformance"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ProbabilityTransferToImporterPerformance}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ReasonTransferToImporterPerformance"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonTransferToImporterPerformance}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <p>{questions['LegalGround']}</p>

            <FormField
                control={control}
                name="RelevantLegalGround"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.RelevantLegalGround}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                                placeholder="Describe the relevant legal ground"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ProbabilityLegalGround"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ProbabilityLegalGround}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                autoComplete="off"
                                placeholder="Enter probability"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="ReasonLegalGround"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonLegalGround}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                autoComplete="off"
                                placeholder="Provide reasoning for legal ground"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <p className="font-bold">Importer has reason to expect …</p>

            <p>
                <span>
                    ... a problematic targeted lawful access concerning the data at issue?
                    {riskValues.DataIssueInvestigation === '2' ? (
                        <DaisyBadge appearance="added">Yes</DaisyBadge>
                    ) : (
                        <DaisyBadge appearance="removed">No</DaisyBadge>
                    )}
                </span>
            </p>

            <p>
                <span>
                    ... a problematic mass surveillance involving the data at issue?
                    {riskValues.PassMassSurveillanceConnection === '4' ? (
                        <DaisyBadge appearance="added">Yes</DaisyBadge>
                    ) : (
                        <DaisyBadge appearance="removed">No</DaisyBadge>
                    )}
                </span>
            </p>

            <p>
                <span>
                    ... a problematic self-reporting obligation (according to the
                    Importer):
                    {riskValues.AssessmentProduceReport === '4' ? (
                        <DaisyBadge appearance="added">Yes</DaisyBadge>
                    ) : (
                        <DaisyBadge appearance="removed">No</DaisyBadge>
                    )}
                </span>
            </p>

            <Message
                text={`Based on the responses of the importer and the analysis done, does the exporter have reason to believe that (i) the importer will during the assessment period have to produce the data at issue) and (ii) it will be unable to justify such lawful access by way of one of the derogations of Art. 49 GDPR ...)`}
            />

            {problematicLawfulAccessValues.LawfulAccess === 'no' && (
                <>
                    <FormField
                        control={control}
                        name="ConnectionTargetedAccess"
                        rules={{ required: "Please select an option." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldPropsMapping.ConnectionTargetedAccess}</FormLabel>
                                <FormDescription>
                                    (e.g., investigations by the police, state prosecutors and
                                    other authorities)
                                </FormDescription>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                                        {config.ConnectionTargetedAccess.map((opt) => (
                                            <div key={opt.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt.value} id={opt.value} />
                                                <label htmlFor={opt.value}>{opt.label}</label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="ReasonConnectionTargetedAccess"
                        rules={{ required: "Please provide a reason." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldPropsMapping.ReasonConnectionTargetedAccess}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        autoComplete="off"
                                        placeholder="Provide details"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </>
            )}

            {problematicLawfulAccessValues.MassSurveillanceTelecommunications === 'no' && (
                <>
                    <FormField
                        control={control}
                        name="ConnectionSurveillanceTele"
                        rules={{ required: "Please select an option." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldPropsMapping.ConnectionSurveillanceTele}</FormLabel>
                                <FormDescription>(e.g., by intelligence agencies)</FormDescription>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                                        {config.ConnectionSurveillanceTele.map((opt) => (
                                            <div key={opt.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt.value} id={opt.value} />
                                                <label htmlFor={opt.value}>{opt.label}</label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="ReasonConnectionSurveillanceTele"
                        rules={{ required: "Please provide a reason." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldPropsMapping.ReasonConnectionSurveillanceTele}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        autoComplete="off"
                                        placeholder="Provide details"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </>
            )}
            {problematicLawfulAccessValues.SelfReportingObligations === 'no' && (
                <>
                    <FormField
                        control={control}
                        name="ConnectionSelfreportingObligations"
                        rules={{ required: "Please select an option." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{fieldPropsMapping.ConnectionSelfreportingObligations}</FormLabel>
                                <FormDescription>(e.g., by intelligence agencies)</FormDescription>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                                        {config.ConnectionSelfreportingObligations.map((opt) => (
                                            <div key={opt.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt.value} id={opt.value} />
                                                <label htmlFor={opt.value}>{opt.label}</label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="ReasonConnectionSelfreportingObligations"
                        rules={{ required: "Please provide a reason." }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {fieldPropsMapping.ReasonConnectionSelfreportingObligations}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        autoComplete="off"
                                        placeholder="Provide details"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
        </>
    )
}
