import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import type { User } from "@prisma/client";
import { useCreateTag } from "@/hooks/fleets/Tags/useCreateTag";
import { useTags } from "@/hooks/fleets/Tags/useTags";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";

const CreateTag = ({
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
  const createTag = useCreateTag();
  const { mutateTags } = useTags(fleetTeamId);
  const { t } = useTranslation("common");

  const [submitting, setSubmitting] = useState(false);
  const [tagValue, setTagValue] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createTag(fleetTeamId, { tags: tagValue });
      toast.success(t("success"));
      mutateTags();
      setVisible(false);
      setTagValue("");
    } catch (err) {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("create-tag")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="tags">{t("tags")}</Label>
            <Input
              id="tags"
              name="tags"
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              required
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
            <Button type="submit" disabled={submitting}>
              {submitting ? t("creating...") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTag;
