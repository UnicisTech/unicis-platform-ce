import { useSession } from "next-auth/react";

import type { NextPageWithLayout } from "types";
import { Card } from "@/components/ui";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";

const TIA: NextPageWithLayout = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  return (

    <Card heading="Transfer Impact Assessment">
      <Card.Body>
        <div className="p-3">
          <div className="flex flex-col w-full lg:flex-row">
            <div className="grid flex-grow h-32 card bg-base-300">
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
             <div className="divider lg:divider-horizontal"></div> 
            <div className="grid flex-grow p-3 card bg-base-300">

              <div className="flex flex-col w-full lg:flex-row">

                <div className="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
                  <select className="select w-full max-w-xs">
                    <option disabled selected>Filter by</option>
                    <option>Transfer PERMITED</option>
                    <option>Transfer NOT PERMITED</option>
                  </select>
                </div>
                <div className="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
                        <button className="btn">+ Add</button>
                </div> 
               
                
              </div>
                  
                  
            </div>
          </div>  
          
          
        </div>
        
        <div className="overflow-x-auto">
                <table className="table w-full">
                  
                  <thead>
                    <tr>
                      <th></th>
                      <th>Transfer Impact Assessment</th>
                      <th>Data exporter</th>
                      <th>Data importer</th>
                      <th>Assessment Date</th>
                      <th>Ending Date</th>
                      <th>Legal analysis</th>
                      <th>Transfer is</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>1</th>
                      <td>Cy Ganderton</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td><div className="badge badge-success">PERMITED</div></td>
                      <td>
                          <button className="btn btn-info">Edit</button>
                          <button className="btn btn-square btn-outline">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th>2</th>
                      <td>Cy Ganderton</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td><div className="badge badge-error">NOT PERMITED</div></td>
                    </tr>
                    <tr>
                      <th>3</th>
                      <td>Cy Ganderton</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td>Blue</td>
                      <td>Quality Control Specialist</td>
                      <td><div className="badge badge-success">PERMITED</div></td>
                    </tr>
                  </tbody>
                </table>
              


        </div>

      </Card.Body>
    </Card>
    
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default TIA;
