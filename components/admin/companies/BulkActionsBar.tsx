"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, Tag, GitMerge } from "lucide-react";

type Props = {
  selectedCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onPublish: () => void;
  onSuspend: () => void;
  onArchive: () => void;
  onAddTag: () => void;
  onRemoveTag: () => void;
  onDelete: () => void;
  onMerge: () => void;
};

export default function BulkActionsBar(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-2 z-10 mb-4"
    >
      <Card className="p-3 sm:p-4 border-amber-300/40 dark:border-amber-300/30 bg-amber-50/40 dark:bg-amber-400/10">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="text-sm sm:text-base">
            Selected: <b>{props.selectedCount}</b>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={props.onSelectAll}>
              Select all
            </Button>
            <Button size="sm" variant="secondary" onClick={props.onClear}>
              Clear
            </Button>
            <Button size="sm" onClick={props.onPublish}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={props.onSuspend}>
              Suspend
            </Button>
            <Button size="sm" variant="outline" onClick={props.onArchive}>
              Archive
            </Button>
            <Button size="sm" variant="outline" onClick={props.onAddTag}>
              <Tag className="mr-2 h-4 w-4" />
              Add tag
            </Button>
            <Button size="sm" variant="outline" onClick={props.onRemoveTag}>
              Remove tag
            </Button>
            <Button size="sm" variant="outline" onClick={props.onMerge}>
              <GitMerge className="mr-2 h-4 w-4" />
              Merge
            </Button>
            <Button size="sm" variant="destructive" onClick={props.onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
