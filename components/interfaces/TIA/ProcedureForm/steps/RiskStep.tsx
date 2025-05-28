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
import DaisyBadge from "@/components/shared/daisyUI/DaisyBadge";

import { getTiaRisks, getProblematicLawfulAccesses } from "@/lib/tia";
import { config, fieldPropsMapping } from "@/components/defaultLanding/data/configs/tia";
import type { TiaProcedureInterface } from "types";
import type { RiskStepValues } from "../types";
import RiskLevel from "../../RiskLevel";
import { Message } from "@/components/shared/atlaskit";

interface RiskStepProps {
  problematicLawfulAccessValues: TiaProcedureInterface[1];
  control: Control<RiskStepValues>;
}

export default function RiskStep({ problematicLawfulAccessValues, control }: RiskStepProps) {
  const { getValues } = useFormContext();
  const values = getValues();

  const { targetedRisk, nonTargetedRisk, selfReportingRisk } = getTiaRisks(values);
  const { isDataIssueInvestigationProblematic, isPassMassSurveillanceConnectionProblematic, isAssessmentProduceReportProblematic } = getProblematicLawfulAccesses(values);
  return (
    <>
      <Message text={`To be completed by the importer`} />

      {problematicLawfulAccessValues.LawfulAccess === 'no' && (
        <>
          <Message
            text={`Targeted lawful access (investigation): Risk of the importer (a) receiving a search warrant or subpoena (i.e. order to produce documents) from the police, a state prosecutor or other authority investigating a potential violation of local law or development of relevance for national security7), or (b) otherwise individually becoming subject of surveillance or other lawful access measures by these authorities as part of an investigation (e.g., its phone lines and Internet connections being intercepted or its cloud provider or ISP being required to produce the importer's messages or data); only those forms of lawful access need to be considered that were found to be incompatible with EU and CH law in the legal analysis`}
          />

          <FormField
            control={control}
            name="WarrantsSubpoenas"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.WarrantsSubpoenas}</FormLabel>
                <FormDescription>
                  The local authorities in principle have the right to issue to
                  the importer or its providers warrants or subpoenas as
                  described above for the type of data at issue
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.WarrantsSubpoenas.map((opt) => (
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
            name="ReasonWarrantsSubpoenas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonWarrantsSubpoenas}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder="Provide your reasoning here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ViolationLocalLaw"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ViolationLocalLaw}</FormLabel>
                <FormDescription>
                  The local authorities issue such requests regardless of
                  whether they really believe that a violation of local law has
                  occured or that there is threat for national security (e.g.,
                  for political reasons or as a scheme of extortion)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.ViolationLocalLaw.map((opt) => (
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
            name="ReasonViolationLocalLaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonViolationLocalLaw}</FormLabel>
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

          <FormField
            control={control}
            name="HighViolationLocalLaw"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.HighViolationLocalLaw}</FormLabel>
                <FormDescription>
                  The data subjects (of the data at issue) have a high
                  probability of violating local laws and the data at issue
                  would be particularly interesting to investigate these
                  violations
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.HighViolationLocalLaw.map((opt) => (
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
            name="ReasonHighViolationLocalLaw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonHighViolationLocalLaw}</FormLabel>
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

          <FormField
            control={control}
            name="HighViolationDataIssue"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.HighViolationDataIssue}</FormLabel>
                <FormDescription>
                  The importer has a high probability of violating local laws,
                  and the data at issue would be particularly interesting to
                  investigate these violations
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.HighViolationDataIssue.map((opt) => (
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
            name="ReasonHighViolationDataIssue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonHighViolationDataIssue}</FormLabel>
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

          <FormField
            control={control}
            name="InvestigatingImporter"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.InvestigatingImporter}</FormLabel>
                <FormDescription>
                  There are other reasons why the local authorities would be
                  interested in investigating the importer (e.g., because it is
                  considered of relevance for national security or economic
                  espionage by the local government) and, therefore, requesting
                  the data at issue from the importer or its providers
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.InvestigatingImporter.map((opt) => (
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
            name="ReasonInvestigatingImporter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonInvestigatingImporter}</FormLabel>
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

          <FormField
            control={control}
            name="PastWarrantSubpoena"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.PastWarrantSubpoena}</FormLabel>
                <FormDescription>
                  In the past 5-10 years, the importer was already required to
                  produce the type of data at issue following such a warrant or
                  subpoena from a local authority (or, to the importer&apos;s
                  best knowledge, one of its providers was required to grant
                  access to the importer&apos;s data)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.PastWarrantSubpoena.map((opt) => (
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
            name="ReasonPastWarrantSubpoena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonPastWarrantSubpoena}</FormLabel>
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

          <RiskLevel value={targetedRisk} />

          <FormField
            control={control}
            name="DataIssueInvestigation"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.DataIssueInvestigation}</FormLabel>
                <FormDescription>
                  Based on the above and the legal analysis, does the importer
                  have reason to believe that during the assessment period it
                  (or one of its providers) will have to produce some of the
                  data at issue for an investigation as described above?
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.DataIssueInvestigation.map((opt) => (
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
            name="ReasonDataIssueInvestigation"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonDataIssueInvestigation}</FormLabel>
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

          {isDataIssueInvestigationProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                Problematic Lawful Access expected!
              </DaisyBadge>
            </p>
          )}
        </>
      )}

      {problematicLawfulAccessValues.MassSurveillanceTelecommunications === 'no' && (
        <>
          <Message
            isBold={true}
            text={
              'Non-targeted lawful access (mass surveillance): Risk of the importer receiving a request of an intelligence agency or other authority to participate in the routine monitoring of communications or other data)'
            }
          />

          <FormField
            control={control}
            name="LocalIssueWarrants"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalIssueWarrants}</FormLabel>
                <FormDescription>
                  The local authorities in principle have the right to issue to
                  the importer warrants or subpoenas as described above for the
                  type of data at issue
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.LocalIssueWarrants.map((opt) => (
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
            name="ReasonLocalIssueWarrants"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonLocalIssueWarrants}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Provide details" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalMassSurveillance"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalMassSurveillance}</FormLabel>
                <FormDescription>
                  The type of the data at issue is in principle of interest for
                  mass surveillance (e.g., because it contains large volumes of
                  third party communications or third party communications that
                  could be of relevance for national security purposes)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.LocalMassSurveillance.map((opt) => (
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
            name="ReasonLocalMassSurveillance"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonLocalMassSurveillance}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Provide details" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="LocalAccessMassSurveillance"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalAccessMassSurveillance}</FormLabel>
                <FormDescription>
                  The local authorities could consider the importer to be a
                  provider that has access to such type of data (e.g., because
                  it is offering a corresponding service or is contracted to
                  process such data)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.LocalAccessMassSurveillance.map((opt) => (
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
            name="ReasonLocalAccessMassSurveillance"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonLocalAccessMassSurveillance}</FormLabel>
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

          <FormField
            control={control}
            name="LocalRoutinelyMonitor"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalRoutinelyMonitor}</FormLabel>
                <FormDescription>
                  There are other reasons why the local authorities would be
                  interested requiring the importer to routinely monitor the
                  data at issue for and on behalf of the government (e.g.,
                  because it is considered of relevance for national security or
                  economic espionage by the local government)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.LocalRoutinelyMonitor.map((opt) => (
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
            name="ReasonLocalRoutinelyMonitor"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonLocalRoutinelyMonitor}</FormLabel>
                <FormControl>
                  <Textarea {...field} autoComplete="off" placeholder="Provide details" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="PassMassSurveillance"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.PassMassSurveillance}</FormLabel>
                <FormDescription>
                  In the past 5-10 years the importer was already required to
                  engage in mass surveillance for the local authorities
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.PassMassSurveillance.map((opt) => (
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
            name="ReasonPassMassSurveillance"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonPassMassSurveillance}</FormLabel>
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

          <RiskLevel value={nonTargetedRisk} />

          <FormField
            control={control}
            name="PassMassSurveillanceConnection"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.PassMassSurveillanceConnection}</FormLabel>
                <FormDescription>
                  Based on the above and the legal analysis, does the importer
                  have reason to believe that during the assessment period it
                  will have to produce some of the data at issue in connection
                  with such mass surveillance?
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.PassMassSurveillanceConnection.map((opt) => (
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
            name="ReasonPassMassSurveillanceConnection"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonPassMassSurveillanceConnection}</FormLabel>
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

          {isPassMassSurveillanceConnectionProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                Problematic Lawful Access expected!
              </DaisyBadge>
            </p>
          )}
        </>
      )}

      {problematicLawfulAccessValues.SelfReportingObligations === 'no' && (
        <>
          <Message
            isBold={true}
            text={`Self-reporting to authorities: Risk of the importer being required to self-report data to the public authorities for investigational purposes)`}
          />

          <FormField
            control={control}
            name="ImporterObligation"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ImporterObligation}</FormLabel>
                <FormDescription>
                  The importer could in principle be subject to such a reporting
                  obligation with regard to the type of data at issue
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.ImporterObligation.map((opt) => (
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
            name="ReasonImporterObligation"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonImporterObligation}</FormLabel>
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

          <FormField
            control={control}
            name="LocalSelfReporting"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.LocalSelfReporting}</FormLabel>
                <FormDescription>
                  The data at issue typically contains information that is
                  subject to local self-reporting obligations (for the purpose
                  of permitting the local authorities to investigate a matter;
                  self-reporting obligations as part of prudential supervision
                  are not in-scope)
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.LocalSelfReporting.map((opt) => (
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
            name="ReasonLocalSelfReporting"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonLocalSelfReporting}</FormLabel>
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

          <FormField
            control={control}
            name="PastSelfReporting"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.PastSelfReporting}</FormLabel>
                <FormDescription>
                  In the past 5-10 years the importer already self-reported data
                  of this type to the authorities
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.PastSelfReporting.map((opt) => (
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
            name="ReasonPastSelfReporting"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonPastSelfReporting}</FormLabel>
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

          <RiskLevel value={selfReportingRisk} />

          <FormField
            control={control}
            name="AssessmentProduceReport"
            rules={{ required: "Please select an option." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.AssessmentProduceReport}</FormLabel>
                <FormDescription>
                  Based on the above and the legal analysis, does the importer
                  have reason to believe that it will during the assessment
                  period have to produce the data at issue as described above?
                </FormDescription>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    {config.AssessmentProduceReport.map((opt) => (
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
            name="ReasonAssessmentProduceReport"
            rules={{ required: "Please provide a reason." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldPropsMapping.ReasonAssessmentProduceReport}</FormLabel>
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

          {isAssessmentProduceReportProblematic && (
            <p>
              <DaisyBadge appearance="removed">
                Problematic Lawful Access expected!
              </DaisyBadge>
            </p>
          )}
        </>
      )}
    </>
  );
}