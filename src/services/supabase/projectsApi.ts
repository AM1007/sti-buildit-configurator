import { supabase } from "../supabaseClient";
import type { Project } from "../../types";

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    clientName: row.client_name as string,
    date: row.date as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    lastExportedAt: (row.last_exported_at as string | null) ?? null,
  };
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch projects:", error.message);
    return [];
  }

  return (data ?? []).map(rowToProject);
}

export async function createProject(
  userId: string,
  name: string,
  clientName?: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name,
      client_name: clientName ?? "",
      date: getTodayISO(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to create project:", error?.message);
    return null;
  }

  return rowToProject(data);
}

export async function renameProject(
  projectId: string,
  name: string
): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", projectId);

  if (error) {
    console.error("Failed to rename project:", error.message);
    return false;
  }

  return true;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Failed to delete project:", error.message);
    return false;
  }

  return true;
}

export async function updateProjectMeta(
  projectId: string,
  meta: Partial<Pick<Project, "name" | "clientName" | "date" | "lastExportedAt">>
): Promise<boolean> {
  const payload: Record<string, unknown> = {};
  if (meta.name !== undefined) payload.name = meta.name;
  if (meta.clientName !== undefined) payload.client_name = meta.clientName;
  if (meta.date !== undefined) payload.date = meta.date;
  if (meta.lastExportedAt !== undefined) payload.last_exported_at = meta.lastExportedAt;

  const { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", projectId);

  if (error) {
    console.error("Failed to update project meta:", error.message);
    return false;
  }

  return true;
}