import { useSession } from "next-auth/react";

import type { NextPageWithLayout } from "types";
import { Card } from "@/components/ui";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";

const Dashboard: NextPageWithLayout = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  return (
      <>
          <Card heading="Privacy Overview">
            <Card.Body>
              <div className="p-3 place-content-center">
                <h1>Record Processing Activities</h1>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-title">Total RPA</div>
                      <div className="stat-value">20</div>
                      <div className="stat-desc">Record Processing Activities</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">To Do</div>
                      <div className="stat-value">5</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">In Progress</div>
                      <div className="stat-value">7</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Review</div>
                      <div className="stat-value">8</div>
                      <div className="stat-desc">in 15 days</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Data transfer</div>
                      <div className="stat-value">9</div>
                      <div className="stat-desc"><div className="badge badge-error">ENABLED</div></div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Special PII Category</div>
                      <div className="stat-value">6</div>
                       <div className="stat-desc"><div className="badge badge-error">ENABLED</div></div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <h1>Transfer Impact Assessment</h1>
                <div className="flex flex-col w-full lg:flex-row">
                   
                        <div className="stats stats-vertical lg:stats-horizontal shadow">
          
                        <div className="stat">
                          <div className="stat-title">Ending Date</div>
                          <div className="stat-value">31</div>
                          <div className="stat-desc">in 15 dates</div>
                        </div>
                        
                        <div className="stat">
                          <div className="stat-title">Transfer is</div>
                          <div className="stat-value">4</div>
                          <div className="stat-desc"><div className="badge badge-success">PERMITED</div></div>
                        </div>
                        
                        <div className="stat">
                          <div className="stat-title">Transfer is</div>
                          <div className="stat-value">2</div>
                          <div className="stat-desc"><div className="badge badge-error">NOT PERMITED</div></div>
                        </div>
                        
                      </div>  
                      
                  </div> 
             
                  
                  <div className="divider"></div>

                  <h1>Data Protection Impact Assessment</h1>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-title">Total RPA</div>
                      <div className="stat-value">20</div>
                      <div className="stat-desc">Record Processing Activities</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">To Do</div>
                      <div className="stat-value">5</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">In Progress</div>
                      <div className="stat-value">7</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Review</div>
                      <div className="stat-value">8</div>
                      <div className="stat-desc">in 15 days</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Data transfer</div>
                      <div className="stat-value">9</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Special PII Category</div>
                      <div className="stat-value">6</div>
                    </div>
                  </div>
                  
                  <div className="divider"></div>

                  <h1>Processor Questionnaire Checklist</h1>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                      <div className="stat-title">Total RPA</div>
                      <div className="stat-value">20</div>
                      <div className="stat-desc">Record Processing Activities</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">To Do</div>
                      <div className="stat-value">5</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">In Progress</div>
                      <div className="stat-value">7</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Review</div>
                      <div className="stat-value">8</div>
                      <div className="stat-desc">in 15 days</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Data transfer</div>
                      <div className="stat-value">9</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Special PII Category</div>
                      <div className="stat-value">6</div>
                    </div>
                  </div>
              </div>
            </Card.Body>
          </Card>

          <Card heading="Cybersecurity Overview">
            <Card.Body>
              <div className="p-3">
                  <h1>Cybersecurity Framework Controls</h1>
                  <div className="stats stats-vertical lg:stats-horizontal shadow">
                      <div className="stat">
                        <div className="stat-title">Total RPA</div>
                        <div className="stat-value">20</div>
                        <div className="stat-desc">Record Processing Activities</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">To Do</div>
                        <div className="stat-value">5</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">In Progress</div>
                        <div className="stat-value">7</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Review</div>
                        <div className="stat-value">8</div>
                        <div className="stat-desc">in 15 days</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Data transfer</div>
                        <div className="stat-value">9</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Special PII Category</div>
                        <div className="stat-value">6</div>
                      </div>
                    </div>
                    
                    <div className="divider"></div>

                    <h1>Gap Analysis</h1>
                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                      <div className="stat">
                        <div className="stat-title">Total RPA</div>
                        <div className="stat-value">20</div>
                        <div className="stat-desc">Record Processing Activities</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">To Do</div>
                        <div className="stat-value">5</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">In Progress</div>
                        <div className="stat-value">7</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Review</div>
                        <div className="stat-value">8</div>
                        <div className="stat-desc">in 15 days</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Data transfer</div>
                        <div className="stat-value">9</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Special PII Category</div>
                        <div className="stat-value">6</div>
                      </div>
                    </div>
                    
                    <h1>Vendor Assessment Questionnaire</h1>
                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                      <div className="stat">
                        <div className="stat-title">Total RPA</div>
                        <div className="stat-value">20</div>
                        <div className="stat-desc">Record Processing Activities</div>
                      </div> 
                      <div className="stat">
                        <div className="stat-title">To Do</div>
                        <div className="stat-value">5</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">In Progress</div>
                        <div className="stat-value">7</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Review</div>
                        <div className="stat-value">8</div>
                        <div className="stat-desc">in 15 days</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Data transfer</div>
                        <div className="stat-value">9</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Special PII Category</div>
                        <div className="stat-value">6</div>
                      </div>
                    </div>
                </div>
            </Card.Body>
          </Card>

          <Card heading="Compliance Overview">
            <Card.Body>
              <div className="p-3">
                <p className="text-sm">
                  {`${t("hi")}, ${session?.user.name} ${t("you-have-logged-in-using")} ${
                    session?.user.email
                  }`}
                </p>
              </div>
            </Card.Body>
          </Card>
      </>   
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default Dashboard;
