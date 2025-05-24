// TaskPicker.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/shadcn/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select";
import { Control } from "react-hook-form";
import type { Task } from "@prisma/client";

interface Props {
    control: Control<{ taskId: string }>;
    name: "taskId";
    tasks: Task[];
}

export default function TaskPicker({ control, name, tasks }: Props) {
    return (
        <FormField
            control={control}
            name={name}
            rules={{ required: "Please select a task." }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Task</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a task" />
                            </SelectTrigger>
                            <SelectContent
                                className="max-h-60 overflow-y-auto"
                            >
                                {tasks.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
