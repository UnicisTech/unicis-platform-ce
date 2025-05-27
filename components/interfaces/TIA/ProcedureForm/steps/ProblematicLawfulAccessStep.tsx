"use client";

import * as React from "react";
import { Control, useFormContext } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/shadcn/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { Textarea } from "@/components/shadcn/ui/textarea";

import { config, fieldPropsMapping } from "@/components/defaultLanding/data/configs/tia";
import type { TiaProcedureInterface } from "types";
import type { ProblematicLawfulAccessValues } from "../types";
import DaisyBadge from "@/components/shared/daisyUI/DaisyBadge";
import { getTransferIsValue } from "@/lib/tia";
import { Message } from "@/components/shared/atlaskit";

export function TransferIs() {
    const { getValues } = useFormContext();
    const values = getValues();

    const status = getTransferIsValue(values);

    const variant = status === "NOT PERMITTED" ? "error" : "success";

    return (
        <div className="flex items-center space-x-2">
            <span className="font-bold">
                Based on the answers given above, the transfer is <DaisyBadge color={variant}>{status}</DaisyBadge>
            </span>
        </div>
    );
}

interface ProblematicLawfulAccessStepProps {
    initial?: TiaProcedureInterface[1];
    control: Control<ProblematicLawfulAccessValues>;
}

export default function ProblematicLawfulAccessStep({ initial, control }: ProblematicLawfulAccessStepProps) {
    return (
        <>
            <Message text={`To be completed by the exporter`} />

            {/* Encryption in Transit */}
            <FormField
                control={control}
                name="EncryptionInTransit"
                rules={{ required: "Select yes or no." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.EncryptionInTransit}</FormLabel>
                        <FormDescription>
                            Is the personal data at issue protected with adequate encryption
                            in-transit (i.e. when transmitted)?
                        </FormDescription>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                {config.EncryptionInTransit.map((opt) => (
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

            {/* Reason Encryption */}
            <FormField
                control={control}
                name="ReasonEncryptionInTransit"
                rules={{ required: "Enter a reason." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonEncryptionInTransit}</FormLabel>
                        <FormControl>
                            <Textarea
                                {...field}
                                placeholder="Provide details"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Transfer Mechanism */}
            <FormField
                control={control}
                name="TransferMechanism"
                rules={{ required: "Select yes or no." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.TransferMechanism}</FormLabel>
                        <FormDescription>
                            Is the personal data at issue protected by a transfer mechanism
                            approved by applicable data protection law (e.g., the EU Standard
                            Contractual Clauses in case of the GDPR, approved BCR, or - in the
                            case of an onward transfer - a back-to-back-contract in line with
                            the EU SCC), and compliance with it and its judicial enforcement
                            be expected, insofar permitted under the importer&apos;s law?
                        </FormDescription>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                {config.TransferMechanism.map((opt) => (
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

            {/* Reason Transfer Mechanism */}
            <FormField
                control={control}
                name="ReasonTransferMechanism"
                rules={{ required: "Enter a reason." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonTransferMechanism}</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Provide details" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Message
                appearance="warning"
                text={`If the answer is NO please enter details into the EU Standard Contractual Clauses or similar safeguard!`}
            />

            <p className="font-bold">
                Based on the legal analysis above, the lawful access laws in the country
                of the importer are compatible with EU and CH law
            </p>

            {/* Lawful Access */}
            <FormField
                control={control}
                name="LawfulAccess"
                rules={{ required: "Select yes or no." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.LawfulAccess}</FormLabel>
                        <FormDescription>
                            … in connection with targeted lawful access (e.g., investigations
                            by the police, state prosecutors and other authorities)
                        </FormDescription>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                {config.LawfulAccess.map((opt) => (
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

            {/* Reason Lawful Access */}
            <FormField
                control={control}
                name="ReasonLawfulAccess"
                rules={{ required: "Enter a reason." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonLawfulAccess}</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Provide details" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Mass Surveillance */}
            <FormField
                control={control}
                name="MassSurveillanceTelecommunications"
                rules={{ required: "Select yes or no." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.MassSurveillanceTelecommunications}</FormLabel>
                        <FormDescription>
                            … in connection with mass surveillance of telecommunications,
                            online services, etc. (e.g., by intelligence agencies)
                        </FormDescription>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                {config.MassSurveillanceTelecommunications.map((opt) => (
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

            {/* Reason Mass Surveillance */}
            <FormField
                control={control}
                name="ReasonMassSurveillanceTelecommunications"
                rules={{ required: "Enter a reason." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonMassSurveillanceTelecommunications}</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Provide details" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Self-Reporting Obligations */}
            <FormField
                control={control}
                name="SelfReportingObligations"
                rules={{ required: "Select yes or no." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.SelfReportingObligations}</FormLabel>
                        <FormDescription>
                            … in connection with self-reporting obligations
                        </FormDescription>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                {config.SelfReportingObligations.map((opt) => (
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

            {/* Reason Self-Reporting */}
            <FormField
                control={control}
                name="ReasonSelfReportingObligations"
                rules={{ required: "Enter a reason." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldPropsMapping.ReasonSelfReportingObligations}</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Provide details" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <TransferIs />
        </>
    );
}
