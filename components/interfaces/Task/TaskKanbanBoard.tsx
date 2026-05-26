import { useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Task } from 'types';
import { EmptyState, PriorityBadge, StatusBadge } from '@/components/shared';
import ModuleBadge from '@/components/shared/ModuleBadge';
import { cn } from '@/components/shadcn/lib/utils';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { getTaskModules, statuses } from '@/lib/tasks';

type TasksByStatus = Record<string, Task[]>;

const getTaskDragId = (taskNumber: number) => `task:${taskNumber}`;
const getColumnDragId = (status: string) => `column:${status}`;

const getTaskNumberFromDragId = (id: UniqueIdentifier) => {
  const value = String(id);

  if (!value.startsWith('task:')) {
    return null;
  }

  const taskNumber = Number(value.slice(5));
  return Number.isInteger(taskNumber) ? taskNumber : null;
};

const getStatusFromColumnDragId = (id: UniqueIdentifier) => {
  const value = String(id);

  if (!value.startsWith('column:')) {
    return null;
  }

  const status = value.slice(7);
  return statuses.includes(status) ? status : null;
};

const sortTasksByBoardOrder = (tasks: Task[]) =>
  [...tasks].sort((a, b) => {
    const orderDiff = a.kanbanOrder - b.kanbanOrder;
    return orderDiff || a.taskNumber - b.taskNumber;
  });

const buildTasksByStatus = (tasks: Task[]) =>
  statuses.reduce<TasksByStatus>((acc, status) => {
    acc[status] = sortTasksByBoardOrder(
      tasks.filter((task) => task.status === status)
    );
    return acc;
  }, {});

const getStatusFromDroppableId = (id: UniqueIdentifier, tasks: Task[]) => {
  const columnStatus = getStatusFromColumnDragId(id);

  if (columnStatus) {
    return columnStatus;
  }

  const taskNumber = getTaskNumberFromDragId(id);
  return tasks.find((task) => task.taskNumber === taskNumber)?.status ?? null;
};

const normalizeBoardOrders = (tasksByStatus: TasksByStatus) =>
  statuses.flatMap((status) =>
    (tasksByStatus[status] ?? []).map((task, index) => ({
      ...task,
      status,
      kanbanOrder: index,
    }))
  );

const reorderBoardTasks = ({
  activeTaskNumber,
  overId,
  tasks,
}: {
  activeTaskNumber: number;
  overId: UniqueIdentifier;
  tasks: Task[];
}) => {
  const activeTask = tasks.find((task) => task.taskNumber === activeTaskNumber);
  const targetStatus = getStatusFromDroppableId(overId, tasks);

  if (!activeTask || !targetStatus) {
    return tasks;
  }

  const tasksByStatus = buildTasksByStatus(tasks);
  const sourceStatus = activeTask.status;
  const overTaskNumber = getTaskNumberFromDragId(overId);

  if (sourceStatus === targetStatus && overTaskNumber) {
    const sourceItems = tasksByStatus[sourceStatus] ?? [];
    const activeIndex = sourceItems.findIndex(
      (task) => task.taskNumber === activeTaskNumber
    );
    const overIndex = sourceItems.findIndex(
      (task) => task.taskNumber === overTaskNumber
    );

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return tasks;
    }

    tasksByStatus[sourceStatus] = arrayMove(
      sourceItems,
      activeIndex,
      overIndex
    );

    return normalizeBoardOrders(tasksByStatus);
  }

  tasksByStatus[sourceStatus] = (tasksByStatus[sourceStatus] ?? []).filter(
    (task) => task.taskNumber !== activeTaskNumber
  );

  const targetItems = (tasksByStatus[targetStatus] ?? []).filter(
    (task) => task.taskNumber !== activeTaskNumber
  );
  const nextTask = { ...activeTask, status: targetStatus };
  const overIndex = overTaskNumber
    ? targetItems.findIndex((task) => task.taskNumber === overTaskNumber)
    : -1;
  const insertIndex = overIndex >= 0 ? overIndex : targetItems.length;

  targetItems.splice(insertIndex, 0, nextTask);
  tasksByStatus[targetStatus] = targetItems;

  return normalizeBoardOrders(tasksByStatus);
};

const hasBoardOrderChanged = (currentTasks: Task[], nextTasks: Task[]) =>
  nextTasks.some((nextTask) => {
    const currentTask = currentTasks.find(
      (task) => task.taskNumber === nextTask.taskNumber
    );

    return (
      !currentTask ||
      currentTask.status !== nextTask.status ||
      currentTask.kanbanOrder !== nextTask.kanbanOrder
    );
  });

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return rectIntersection(args);
};

const KanbanColumnBody = ({
  children,
  status,
}: {
  children: ReactNode;
  status: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: getColumnDragId(status),
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-1 flex-col gap-2 p-2 transition-colors',
        isOver && 'bg-primary/5'
      )}
    >
      {children}
    </div>
  );
};

const TaskCard = ({
  canDelete,
  canReorder,
  canUpdate,
  formatDueDate,
  isDragging = false,
  onDeleteTask,
  slug,
  task,
  dragAttributes,
  dragListeners,
  setNodeRef,
  transform,
  transition,
}: {
  canDelete: boolean;
  canReorder: boolean;
  canUpdate: boolean;
  formatDueDate: (value?: string | null) => string;
  isDragging?: boolean;
  onDeleteTask: (taskNumber: number) => void;
  slug: string;
  task: Task;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  setNodeRef?: (node: HTMLElement | null) => void;
  transform?: string;
  transition?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'rounded-md border-border shadow-none transition-shadow',
        canReorder && 'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-30'
      )}
      style={{
        transform,
        transition,
      }}
      {...(dragAttributes || {})}
      {...(dragListeners || {})}
    >
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              href={`/teams/${slug}/tasks/${task.taskNumber}`}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              #{task.taskNumber}
            </Link>
            <Link
              href={`/teams/${slug}/tasks/${task.taskNumber}`}
              className="line-clamp-2 block text-sm font-medium leading-5 underline-offset-4 hover:underline"
            >
              {task.title}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {(canUpdate || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={t('actions')}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canUpdate && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/teams/${slug}/tasks/${task.taskNumber}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      {t('edit-task')}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteTask(task.taskNumber)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge
            value={task.priority}
            label={t(`task-priorities.${task.priority}`)}
          />
          {typeof task.properties === 'object' &&
            task.properties &&
            getTaskModules(task.properties as Record<string, unknown>).map(
              (key) => <ModuleBadge key={key} propName={key} />
            )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDueDate(task.duedate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const SortableTaskCard = ({
  canDelete,
  canReorder,
  canUpdate,
  formatDueDate,
  onDeleteTask,
  slug,
  task,
}: {
  canDelete: boolean;
  canReorder: boolean;
  canUpdate: boolean;
  formatDueDate: (value?: string | null) => string;
  onDeleteTask: (taskNumber: number) => void;
  slug: string;
  task: Task;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: getTaskDragId(task.taskNumber),
    disabled: !canReorder,
    data: {
      taskNumber: task.taskNumber,
      status: task.status,
    },
  });

  return (
    <TaskCard
      canDelete={canDelete}
      canReorder={canReorder}
      canUpdate={canUpdate}
      dragAttributes={canReorder ? attributes : undefined}
      dragListeners={canReorder ? listeners || undefined : undefined}
      formatDueDate={formatDueDate}
      isDragging={isDragging}
      onDeleteTask={onDeleteTask}
      setNodeRef={setNodeRef}
      slug={slug}
      task={task}
      transform={CSS.Transform.toString(transform)}
      transition={transition}
    />
  );
};

const TaskKanbanBoard = ({
  canDelete,
  canReorder,
  canUpdate,
  onDeleteTask,
  onReorder,
  slug,
  tasks,
}: {
  canDelete: boolean;
  canReorder: boolean;
  canUpdate: boolean;
  onDeleteTask: (taskNumber: number) => void;
  onReorder: (tasks: Task[]) => void;
  slug: string;
  tasks: Task[];
}) => {
  const { t } = useTranslation('common');
  const [activeTaskNumber, setActiveTaskNumber] = useState<number | null>(null);
  const [dragTasks, setDragTasks] = useState<Task[] | null>(null);
  const dragTasksRef = useRef<Task[] | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const boardTasks = dragTasks ?? tasks;
  const tasksByStatus = useMemo(
    () => buildTasksByStatus(boardTasks),
    [boardTasks]
  );
  const activeTask =
    boardTasks.find((task) => task.taskNumber === activeTaskNumber) ?? null;

  const formatDueDate = (value?: string | null) => {
    if (!value) return t('no-due-date');
    const [year, month, day] = value.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canReorder) {
      return;
    }

    const taskNumber = getTaskNumberFromDragId(event.active.id);
    setActiveTaskNumber(taskNumber);
    dragTasksRef.current = taskNumber ? tasks : null;
    setDragTasks(taskNumber ? tasks : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canReorder || !event.over) {
      return;
    }

    const activeTaskNumber = getTaskNumberFromDragId(event.active.id);
    const overId = event.over.id;

    if (!activeTaskNumber || !getStatusFromColumnDragId(overId)) {
      return;
    }

    const baseTasks = dragTasksRef.current ?? tasks;
    const reorderedTasks = reorderBoardTasks({
      activeTaskNumber,
      overId,
      tasks: baseTasks,
    });
    const nextTasks = hasBoardOrderChanged(baseTasks, reorderedTasks)
      ? reorderedTasks
      : baseTasks;

    dragTasksRef.current = nextTasks;
    setDragTasks(nextTasks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const visualTasks = dragTasksRef.current;

    setActiveTaskNumber(null);
    dragTasksRef.current = null;
    setDragTasks(null);

    if (!canReorder || !event.over) {
      return;
    }

    const activeTaskNumber = getTaskNumberFromDragId(event.active.id);

    if (!activeTaskNumber) {
      return;
    }

    const overId = event.over.id;
    const reorderedTasks = reorderBoardTasks({
      activeTaskNumber,
      overId,
      tasks: visualTasks ?? tasks,
    });

    if (hasBoardOrderChanged(tasks, reorderedTasks)) {
      onReorder(reorderedTasks);
    }
  };

  const handleDragCancel = () => {
    setActiveTaskNumber(null);
    dragTasksRef.current = null;
    setDragTasks(null);
  };

  if (tasks.length === 0) {
    return <EmptyState title={t('no-tasks-available')} />;
  }

  return (
    <DndContext
      collisionDetection={kanbanCollisionDetection}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-max gap-3">
          {statuses.map((status) => {
            const statusTasks = tasksByStatus[status] ?? [];

            return (
              <section
                key={status}
                className="flex min-h-[28rem] w-72 shrink-0 flex-col rounded-md border bg-muted/20"
              >
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <StatusBadge
                    value={status}
                    label={t(`task-statuses.${status}`)}
                  />
                  <Badge variant="outline">{statusTasks.length}</Badge>
                </div>
                <SortableContext
                  items={statusTasks.map((task) =>
                    getTaskDragId(task.taskNumber)
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <KanbanColumnBody status={status}>
                    {statusTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        canDelete={canDelete}
                        canReorder={canReorder}
                        canUpdate={canUpdate}
                        formatDueDate={formatDueDate}
                        onDeleteTask={onDeleteTask}
                        slug={slug}
                        task={task}
                      />
                    ))}
                  </KanbanColumnBody>
                </SortableContext>
              </section>
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="pointer-events-none w-72">
            <TaskCard
              canDelete={false}
              canReorder={false}
              canUpdate={false}
              formatDueDate={formatDueDate}
              onDeleteTask={onDeleteTask}
              slug={slug}
              task={activeTask}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
