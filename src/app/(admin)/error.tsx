"use client";

import { ErrorState } from "@/components/states/feedback-states";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <ErrorState
        title="This page failed to render"
        message="The operations console hit an unexpected error. Retry the view. If it continues, check the server log for the request."
        onRetry={reset}
      />
    </div>
  );
}
