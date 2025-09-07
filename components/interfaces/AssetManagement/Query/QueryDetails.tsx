import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { Loading } from "@/components/shared";
import type { User } from "@prisma/client";
import { PLATFORMS } from "@/lib/fleet/constants";
import toast from "react-hot-toast";
import DeleteQuery from "./DeleteQuery";
import { useGetQueryId } from "@/hooks/fleets/queries/useGetQueryId";
import { useUpdateQuery } from "@/hooks/fleets/queries/useUpdateQuery";
import PacksSelector from "../PacksSelector";
import TagsSelector from "../TagsSelector";
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
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/ui/select";

interface Option {
  label: string;
  value: string;
}

const QueryDetails = ({
  user,
  queryID,
  fleetTeamId,
}: {
  user: Partial<User>;
  queryID: string;
  fleetTeamId: string;
}) => {
  const { t } = useTranslation("common");
  const updateQuery = useUpdateQuery();
  const { query, isLoading } = useGetQueryId(fleetTeamId, queryID);

  const [visible, setVisible] = useState(true);
  const [removed, setRemoved] = useState(false);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<null | string>(null);

  useEffect(() => {
    if (query) {
      setRemoved(query.removed);
      setSelectedPacks(query.packs?.map((p) => p.id) || []);
      setSelectedTags(query.tags?.map((t) => t.id) || []);
    }
  }, [query]);

  if (isLoading) {
    return <Loading />;
  }

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
      await updateQuery(fleetTeamId, queryData, queryID);
      toast.success(t("success-creating-query"));
    } catch (err) {
      toast.error(t("error-creating-query"));
    }
  };

  const openDeleteModal = (id: string) => {
    setQueryToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <div>
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("edit-query")}</DialogTitle>
            </DialogHeader>

            {/* Name */}
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input name="name" defaultValue={query?.name} required />
            </div>

            {/* SQL */}
            <div>
              <Label htmlFor="sql">{t("sql")}</Label>
              <Input name="sql" defaultValue={query?.sql} required />
            </div>

            {/* Platform */}
            <div>
              <Label htmlFor="platform">{t("platform")}</Label>
              <Select
                name="platform"
                defaultValue={
                  PLATFORMS.find((p) => p.value === query?.platform)?.value ||
                  "all"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((option: Option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Version + Shard */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="version">{t("version")}</Label>
                <Input name="version" defaultValue={query?.version} required />
              </div>
              <div>
                <Label htmlFor="shard">{t("shard")}</Label>
                <Input
                  type="number"
                  name="shard"
                  defaultValue={query?.shard}
                  required
                />
              </div>
            </div>

            {/* Interval + Value */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="interval">{t("interval")}</Label>
                <Input
                  type="number"
                  name="interval"
                  defaultValue={query?.interval}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">{t("value")}</Label>
                <Input name="value" defaultValue={query?.value} required />
              </div>
            </div>

            {/* Removed */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={removed}
                onCheckedChange={(checked) => setRemoved(!!checked)}
              />
              <Label htmlFor="removed">{t("removed")}</Label>
            </div>

            {/* Packs */}
            <div>
              <Label>{t("assign-packs")}</Label>
              <PacksSelector
                fleetTeamId={fleetTeamId}
                preSelectedPack={query?.packs}
                setSectionPack={setSelectedPacks}
                onSelect={() => {}}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>{t("tags")}</Label>
              <TagsSelector
                fleetTeamId={fleetTeamId}
                preSelectedTag={query?.tags}
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
              <Button type="submit">{t("save-changes")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteQuery
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        queryId={queryToDelete!}
        fleetTeamId={fleetTeamId!}
      />
    </div>
  );
};

export default QueryDetails;
