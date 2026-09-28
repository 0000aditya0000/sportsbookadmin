import { AlertTriangle, Ban, Inbox, Unplug, WifiOff } from "lucide-react";
import { StatePanel } from "@/components/states/state-panel";
import { CopyButton } from "@/components/display/copy-button";
import { ApiError } from "@/lib/api/errors";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <StatePanel icon={<Inbox className="size-5" />} title={title} description={description} />;
}

export function ErrorState({
  title = "This view could not be loaded",
  message,
  requestId,
  onRetry,
}: {
  title?: string;
  message: string;
  requestId?: string;
  onRetry?: () => void;
}) {
  return (
    <div>
      <StatePanel
        icon={<AlertTriangle className="size-5" />}
        title={title}
        description={message}
        action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
      />
      {requestId ? (
        <p className="flex items-center gap-1 px-4 pb-4 font-mono text-xs text-muted-foreground">
          {requestId}
          <CopyButton value={requestId} label="Copy request ID" />
        </p>
      ) : null}
    </div>
  );
}

export function UnauthorizedState() {
  return (
    <StatePanel
      icon={<Ban className="size-5" />}
      title="Sign in required"
      description="The backend did not accept this session."
    />
  );
}

export function ForbiddenState() {
  return (
    <StatePanel
      icon={<Ban className="size-5" />}
      title="You do not have access"
      description="This action is outside the permissions returned for the current admin."
    />
  );
}

export function SessionExpiredState({ reason }: { reason: "expired" | "revoked" }) {
  return (
    <StatePanel
      title={reason === "revoked" ? "Session revoked" : "Session expired"}
      description={
        reason === "revoked"
          ? "This session was revoked. Sign in again with your password and authentication code."
          : "This session is no longer valid. Sign in again."
      }
    />
  );
}

export function ProviderUnavailableState() {
  return (
    <StatePanel
      icon={<Unplug className="size-5" />}
      title="Provider unavailable"
      description="The backend reported that the sports provider cannot be reached."
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <StatePanel
      icon={<WifiOff className="size-5" />}
      title="Network unavailable"
      description="The console could not reach the backend."
      action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
    />
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <p className="px-4 py-8 text-sm text-muted-foreground">{label}</p>;
}

export function QueryFailure({
  error,
  onRetry,
  fallback,
}: {
  error: unknown;
  onRetry?: () => void;
  fallback: string;
}) {
  if (error instanceof ApiError && error.code === "NETWORK") return <NetworkErrorState onRetry={onRetry} />;
  if (error instanceof ApiError && error.code === "FORBIDDEN") return <ForbiddenState />;
  if (error instanceof ApiError && error.code === "UNAUTHORIZED") return <UnauthorizedState />;
  if (error instanceof ApiError && error.code === "PROVIDER_UNAVAILABLE") return <ProviderUnavailableState />;
  if (error instanceof ApiError) {
    return <ErrorState message={error.message} requestId={error.requestId} onRetry={onRetry} />;
  }
  return <ErrorState message={fallback} onRetry={onRetry} />;
}
