import React, { Fragment, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import type { User } from '@prisma/client';
import { useCreateDistributors } from "@/hooks/fleets/distributors/useCreateDistributor";
import { useDistributors } from "@/hooks/fleets/distributors/useDistributors";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Calendar } from "@/components/shadcn/ui/calendar";
import NodesSelector from "../AssetsSelector";
import TagsSelector from "../TagsSelector";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/shadcn/ui/popover";
import { CalendarIcon } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface FormData {
  sql: string;
  not_before: string;
  nodes: string[];
  tags: string[];
  description: string;
}

const CreateDistributors = ({
  visible,
  setVisible,
  user,
  fleetTeamId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  user: Partial<User>;
  fleetTeamId: string;
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notBeforeDate, setNotBeforeDate] = useState<Date | undefined>(new Date());
  const { t } = useTranslation("common");
  const createDistributor = useCreateDistributors();
  const { mutateDistributorsTasks } = useDistributors(fleetTeamId);

  const handleNodeSelection = (nodeKeys: string[]) => {
    setSelectedNodes(nodeKeys);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const description = formData.get("description") as string;
    const sql = formData.get("sql") as string;

    const queryData = {
      description,
      sql,
      tags: selectedTags,
      nodes: selectedNodes,
      not_before: notBeforeDate?.toISOString(),
    };

    try {
      await createDistributor(fleetTeamId, queryData);
      toast.success(t("success"));
      mutateDistributorsTasks();
      setVisible(false);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("Create Script")}</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* SQL */}
          <div className="space-y-2">
            <Label htmlFor="sql">{t("SQL Code")}</Label>
            <Input
              id="sql"
              name="sql"
              placeholder="Enter SQL code..."
              required
            />
          </div>

          {/* Nodes */}
          <div className="space-y-2">
            <Label>{t("Assign Assets")}</Label>
            <NodesSelector
              fleetTeamId={fleetTeamId}
              setSectionNode={setSelectedNodes}
              onSelect={handleNodeSelection}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("Description")}</Label>
            <ReactQuill theme="snow" id="description" />
          </div>

          {/* Not Before Date */}
          <div className="space-y-2">
            <Label>{t("Not Before")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {notBeforeDate
                    ? notBeforeDate.toLocaleString()
                    : t("Pick a date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={notBeforeDate}
                  onSelect={setNotBeforeDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t("Tags")}</Label>
            <TagsSelector
              fleetTeamId={fleetTeamId}
              setSectionTag={setSelectedTags}
              onSelect={() => {}}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              {t("close")}
            </Button>
            <Button type="submit" ref={submitButtonRef}>
              {t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDistributors;
