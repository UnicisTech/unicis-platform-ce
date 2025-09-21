import type { Team } from '@prisma/client';
import CscTabs from './CscTabs';
import { useState } from 'react';
import { ISO } from 'types';
import useISO from 'hooks/useISO';
import { Loading } from '@/components/shared';
import CscPanel from './CscPanel';
import useTeamTasks from 'hooks/useTeamTasks';

const Dashboard = ({ team, iso }: { team: Team, iso: ISO[] }) => {
    const [activeTab, setActiveTab] = useState<ISO>(iso[0])
    const { tasks, mutateTasks } = useTeamTasks(team.slug)

    if (!tasks) {
        return <Loading />
    }

    return (
        <>
            <h2 className="text-xl font-medium leading-none tracking-tight">
                {'Cybersecurity Controls Dashboard: '}
                {team.name}
            </h2>
            <CscTabs
                iso={iso}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <CscPanel
                key={activeTab}
                slug={team.slug}
                iso={activeTab}
                tasks={tasks}
                mutateTasks={mutateTasks}
            />
        </>
    )
}

//TODO: remake
const WithISO = ({ team }: { team: Team }) => {
    const { ISO } = useISO(team)

    if (!ISO) {
        return <Loading />
    }

    return <Dashboard team={team} iso={ISO} />

}

export default WithISO;