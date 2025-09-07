import React, { useState } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import { useUpdateQuery } from "@/hooks/fleets/queries/useUpdateQuery";
import { useQueries } from "@/hooks/fleets/queries/useQueries";
import PacksSelector from "../PacksSelector";
import TagsSelector from "../TagsSelector";
import { PLATFORMS } from "@/lib/fleet/constants";
import type { Team } from "@prisma/client";
import type { Query } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/shadcn/ui/select";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface Option {
  label: string;
  value: string;
}

const EditQuery = ({
  visible,
  setVisible,
  query,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  query: Query;
  team: Team;
}) => {
  const [selectedPacks, setSelectedPacks] = useState<string[]>(
    query.packs?.map((p) => p.id) || []
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    query.tags?.map((t) => t.id) || []
  )
  const [removed, setRemoved] = useState<boolean>(query.removed);
  const { t } = useTranslation("common");
  const updateQuery = useUpdateQuery();
  const { mutateQueries } = useQueries(team?.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const queryData = {
      name: formData.get("name") as string,
      sql: formData.get("sql") as string,
      platform: formData.get("platform") as string,
      version: formData.get("version") as string,
      shard: Number(formData.get("shard")),
      interval: Number(formData.get("interval")),
      value: formData.get("value") as string,
      description: formData.get("description") as string,
      packs: selectedPacks,
      tags: selectedTags.join(","),
      removed,
    };

    try {
      await updateQuery(team.id, queryData, query.id);
      toast.success(t("Successfully updated"));
      mutateQueries();
      setVisible(false);
    } catch (err) {
      toast.error(t("Error updating"));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{t("Edit Query")}</DialogTitle>
          </DialogHeader>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" defaultValue={query.name} required />
          </div>

          {/* SQL */}
          <div>
            <Label htmlFor="sql">SQL Code</Label>
            <Input name="sql" defaultValue={query.sql} required />
          </div>

          {/* Platform */}
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select
              name="platform"
              defaultValue={
                PLATFORMS.find(({ value }) => value === query.platform)?.value ||
                "all"
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Version + Shard */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input name="version" defaultValue={query.version} required />
            </div>
            <div>
              <Label htmlFor="shard">Shard</Label>
              <Input name="shard" defaultValue={query.shard} required />
            </div>
          </div>

          {/* Interval + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interval">Interval</Label>
              <Input
                type="number"
                name="interval"
                defaultValue={query.interval}
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input name="value" defaultValue={query.value} required />
            </div>
          </div>

          {/* Removed */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={removed}
              onCheckedChange={(checked) => setRemoved(!!checked)}
            />
            <Label htmlFor="removed">Removed</Label>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <ReactQuill theme="snow" defaultValue={query.description} />
          </div>

          {/* Packs */}
          <div>
            <Label>Assign Packs</Label>
            <PacksSelector
              fleetTeamId={team.id}
              preSelectedPack={query.packs}
              setSectionPack={setSelectedPacks}
              onSelect={() => {}}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <TagsSelector
              fleetTeamId={team.id}
              preSelectedTag={query.tags}
              setSectionTag={setSelectedTags}
              onSelect={() => {}}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVisible(false)}>
              {t("close")}
            </Button>
            <Button type="submit">{t("save-changes")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuery;
