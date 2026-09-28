"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  details,
  loading = false,
  children,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "primary" | "destructive";
  details?: { label: string; value: string }[];
  loading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="pr-8 text-base font-semibold">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">{description}</DialogDescription>
        {details && details.length > 0 ? (
          <dl className="mt-4 divide-y divide-border rounded-md border border-border">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                <dt className="text-muted-foreground">{detail.label}</dt>
                <dd className="font-mono text-[13px]">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
