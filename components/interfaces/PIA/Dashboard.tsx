import { useState } from "react"
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from "hooks/useTeamTasks";
import { Team } from "@prisma/client"
import CreateRisk from "./CreateRisk";


interface DashboardProps {
    team: Team
}

const Dashboard = ({ team }: DashboardProps) => {
    const { canAccess } = useCanAccess();
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug } = router.query;
    const { tasks } = useTeamTasks(slug as string);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-3">
                    <h2 className="text-xl font-medium leading-none tracking-tight">
                        {t('pia-dashboard')}
                    </h2>
                </div>
                <div className="flex justify-end items-center my-1">
                    {canAccess('task', ['update']) && (
                        <Button
                            size="sm"
                            color="primary"
                            variant="outline"
                            onClick={() => {
                                setIsCreateOpen(true);
                            }}
                        >
                            {t('create')}
                        </Button>
                    )}
                </div>
            </div>
            {isCreateOpen && tasks && <CreateRisk tasks={tasks} visible={isCreateOpen} setVisible={setIsCreateOpen}/>}
        </>
    )
}

export default Dashboard