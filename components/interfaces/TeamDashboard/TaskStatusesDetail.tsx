import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import type { Task } from "@prisma/client";

const TaskStatusesDetail = ({
  tasks,
  statusCounts,
}: {
  tasks: Array<Task> | any;
  statusCounts: { [key: string]: number };
}) => {
  const stats = [
    { label: "Total Tasks", value: tasks?.length || 0 },
    { label: "To Do", value: statusCounts?.todo || 0 },
    { label: "In Progress", value: statusCounts?.inprogress || 0 },
    { label: "In Review", value: statusCounts?.inreview || 0 },
    { label: "Feedback", value: statusCounts?.feedback || 0 },
    { label: "Done", value: statusCounts?.done || 0 },
  ];

  return (
    <Card className="flex-1 h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Status Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded border bg-background p-4 text-center shadow-sm"
          >
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TaskStatusesDetail;
