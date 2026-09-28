"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createAgent, updateAgent } from "@/lib/api/agents";
import { ApiError } from "@/lib/api/errors";
import {
  createAgentSchema,
  type AgentListItem,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/validation/agents";

export function AgentFormDialog({
  mode,
  agent,
  onOpenChange,
  onCompleted,
}: {
  mode: "create" | "edit";
  agent?: AgentListItem;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: agent?.name ?? "",
      contactName: agent?.contactName ?? "",
      username: agent?.username ?? "",
      email: agent?.email ?? "",
      phone: agent?.phone ?? "",
    },
  });

  async function onSubmit(values: CreateAgentInput) {
    setSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await createAgent(values)
          : await updateAgent(agent?.id ?? "", {
              name: values.name,
              contactName: values.contactName,
              email: values.email,
              phone: values.phone,
            } satisfies UpdateAgentInput);
      const saved = result.data.agent;
      if (mode === "create" && saved.status !== "pending") {
        toast.error("The backend did not open this agent as pending.", { description: result.requestId });
        return;
      }
      if (mode === "edit" && saved.name !== values.name) {
        toast.error("The backend did not confirm the saved name.", { description: result.requestId });
        return;
      }
      toast.success(result.message ?? (mode === "create" ? "Agent submitted." : "Agent profile saved."), {
        description: result.requestId,
      });
      onCompleted();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "The agent could not be saved.";
      form.setError("name", { message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{mode === "create" ? "Create agent" : "Edit agent"}</DialogTitle>
        <DialogDescription className="mt-1">
          {mode === "create"
            ? "Opens a pending desk. Balances, turnover, and commission stay at zero until the backend posts them."
            : "Updates contact details only. Wallet balances are not edited here."}
        </DialogDescription>
        <form key={mode} className="mt-4 grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Desk name" htmlFor="agent-name" error={form.formState.errors.name?.message}>
            <Input id="agent-name" {...form.register("name")} />
          </FormField>
          <FormField label="Contact name" htmlFor="agent-contact" error={form.formState.errors.contactName?.message}>
            <Input id="agent-contact" {...form.register("contactName")} />
          </FormField>
          <FormField label="Username" htmlFor="agent-username" error={form.formState.errors.username?.message}>
            <Input id="agent-username" autoComplete="off" readOnly={mode === "edit"} {...form.register("username")} />
          </FormField>
          <FormField label="Email" htmlFor="agent-email" error={form.formState.errors.email?.message}>
            <Input id="agent-email" type="email" autoComplete="off" {...form.register("email")} />
          </FormField>
          <FormField label="Phone" htmlFor="agent-phone" error={form.formState.errors.phone?.message}>
            <Input id="agent-phone" autoComplete="off" placeholder="+91 98000 00000" {...form.register("phone")} />
          </FormField>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === "create" ? "Create agent" : "Save profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
