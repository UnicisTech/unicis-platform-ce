import { useState, useMemo, useCallback } from "react"
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useCanAccess from 'hooks/useCanAccess';
import useTeamTasks from "hooks/useTeamTasks";
import { Team } from "@prisma/client"
import CreateRisk from "./CreateRisk";
import { EmptyState } from "@/components/shared";
import { TaskProperties, TaskWithPiaRisk } from "types";
import RisksTable from "./RisksTable";
import DeleteRisk from "./DeleteRisk";


interface DashboardProps {
    team: Team
}

const Dashboard = ({ team }: DashboardProps) => {
    const { canAccess } = useCanAccess();
    const { t } = useTranslation('common');
    const router = useRouter();
    const { slug } = router.query;
    const { tasks, mutateTasks } = useTeamTasks(slug as string);
    const [perPage, setPerPage] = useState<number>(10);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<TaskWithPiaRisk | null>(
        null
    );
    const [taskToDelete, setTaskToDelete] = useState<TaskWithPiaRisk | null>(
        null
    );

    const tasksWithRisks = useMemo(() => {
        if (!tasks) {
            return [];
        }
        return tasks.filter((tasks) => {
            const taskProperties = tasks.properties as TaskProperties;
            const procedure = taskProperties.pia_risk;
            return procedure;
        }) as TaskWithPiaRisk[];
    }, [tasks]);

    const onEditClickHandler = useCallback((task: TaskWithPiaRisk) => {
        setTaskToEdit(task);
        setIsEditOpen(true);
    }, []);

    const onDeleteClickHandler = useCallback((task: TaskWithPiaRisk) => {
        setTaskToDelete(task);
        setIsDeleteOpen(true);
    }, []);

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
            {isCreateOpen && tasks &&
                <CreateRisk
                    tasks={tasks}
                    mutateTasks={mutateTasks}
                    visible={isCreateOpen}
                    setVisible={setIsCreateOpen}
                />
            }
            {tasksWithRisks.length === 0 ? (
                <EmptyState title={t('rpa-dashboard')} description="No records" />
            ) : (
                <>
                    <RisksTable
                        slug={slug as string}
                        tasks={tasksWithRisks}
                        perPage={perPage}
                        editHandler={onEditClickHandler}
                        deleteHandler={onDeleteClickHandler}
                    />
                    {taskToEdit && isEditOpen && (
                        <CreateRisk
                            tasks={tasks || []}
                            visible={isEditOpen}
                            setVisible={setIsEditOpen}
                            selectedTask={taskToEdit}
                            mutateTasks={mutateTasks}
                        />
                    )}
                    {taskToDelete && isDeleteOpen && (
                        <DeleteRisk
                            visible={isDeleteOpen}
                            setVisible={setIsDeleteOpen}
                            task={taskToDelete}
                            mutate={mutateTasks}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default Dashboard