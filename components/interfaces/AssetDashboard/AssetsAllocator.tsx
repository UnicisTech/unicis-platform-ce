import FormattedDate from '@/components/shared/Date';
import useCanAccess from '@/hooks/useCanAccess';
import { NodesResponse } from '@/types'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';


const AssetsAllocator = (nodes: NodesResponse) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [status, setStatus] = useState('all');
  
  return (
    <div className=''>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead className="bg-base-200 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-3 py-3">
                  {t('owner')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('device')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('monitoring')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('last-check')}
                </th>
                <th scope="col" className="px-3 py-3">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {nodes.nodes.map((node) => {
                  return (
                    <tr key={node.id}>
                      <td className="px-6 py-3 align-top">
                        <Link href={`/teams/${slug}/asset-management/nodes/${node.id}`}>
                          <div className="flex items-center justify-start">
                            <span className="">{node.team.user?.firstname!} {node.team.user?.lastname[0].toUpperCase()}</span>
                          </div>
                          <span className="">{node.team.user?.email!}</span>
                        </Link>
                      </td>
                      <td className="w-[25%] py-3 align-top">
                        <div className="grid grid-cols-1 gap-1 font-bold items-center justify-start">
                          <span className="">{node.node_info?.system_info.computer_name}</span>
                          <span className="">SN: {node.node_info?.system_info.hardware_serial}</span>
                          <span className="">{node.node_info?.os_version.name}</span>
                        </div>
                      </td>
                      <td className="py-3 w-[25%] align-top">
                        <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                          <span className="">{node.node_info?.osquery_info.watcher}</span>
                          <span className="">{node.node_info?.osquery_info.config_valid}</span>
                          <span className="">{node.node_info?.osquery_info.platform_mask}</span>
                        </div>
                      </td>
                      <td className="w-[25%] py-3 align-top">
                        <FormattedDate style={'text-md'}  dateString={node.last_checkin} />
                      </td>
                      <td className="py-3 w-[25%] align-top">
                        <div className="grid grid-cols-1 gap-1 text-center font-bold items-center justify-start">
                          
                        </div>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default AssetsAllocator