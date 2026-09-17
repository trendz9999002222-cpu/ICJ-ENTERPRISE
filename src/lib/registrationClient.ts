/**
 * Single place where registration data comes from.
 *
 * Right now everything is read from data/registration.json.
 * When the backend is ready, change ONLY the bodies of these functions
 * (e.g. `const res = await fetch("/api/registration/categories")`).
 * No component needs to change, because they all go through this file.
 */

import rawConfig from "@/data/registration.json";
import type {
  Category,
  FormSchema,
  Group,
  RegistrationConfig,
  Sidebar,
  StepId,
  StepMeta,
} from "@/types/registration";

const config = rawConfig as unknown as RegistrationConfig;

/* ------------------------------ sync readers ------------------------------ */

export function getConfig(): RegistrationConfig {
  return config;
}

export function getCategories(): Category[] {
  return config.categories;
}

export function getCategory(categoryId: string | null): Category | null {
  if (!categoryId) return null;
  return config.categories.find((c) => c.id === categoryId) ?? null;
}

export function getGroups(categoryId: string | null): Group[] {
  return getCategory(categoryId)?.groups ?? [];
}

export function getGroup(categoryId: string | null, groupId: string | null): Group | null {
  if (!groupId) return null;
  return getGroups(categoryId).find((g) => g.id === groupId) ?? null;
}

export function getFormSchema(group: Group | null): FormSchema | null {
  if (!group) return null;
  return config.forms[group.formId] ?? config.forms.default ?? null;
}

export function getSidebar(group: Group | null): Sidebar {
  if (group && config.sidebars[group.sidebarId]) return config.sidebars[group.sidebarId];
  return config.sidebars.default;
}

export function getOptions(optionsRef?: string, inline?: string[]): string[] {
  if (inline?.length) return inline;
  if (optionsRef && config.optionSets[optionsRef]) return config.optionSets[optionsRef];
  return [];
}

/**
 * The live step list. Category and group choices change it in real time:
 * before a group is picked we show the default track, after that the
 * group's own track (some groups skip Profession or Specialisation).
 */
export function getSteps(group: Group | null): StepId[] {
  return group?.steps?.length ? group.steps : config.defaultSteps;
}

export function getStepMeta(stepId: StepId): StepMeta {
  return config.stepCatalog[stepId];
}

export function buildYearOptions(from = 1960): string[] {
  const now = new Date().getFullYear();
  const out: string[] = [];
  for (let y = now; y >= from; y -= 1) out.push(String(y));
  return out;
}

/* ------------------------------ async readers ----------------------------- */
/**
 * Async mirrors of the readers above. Use these in components so that
 * switching to a real API later needs no component changes at all.
 */

export async function fetchCategories(): Promise<Category[]> {
  // return (await fetch("/api/registration/categories")).json();
  return Promise.resolve(getCategories());
}

export async function fetchGroups(categoryId: string): Promise<Group[]> {
  // return (await fetch(`/api/registration/categories/${categoryId}/groups`)).json();
  return Promise.resolve(getGroups(categoryId));
}

export async function fetchFormSchema(categoryId: string, groupId: string): Promise<FormSchema | null> {
  // return (await fetch(`/api/registration/forms/${categoryId}/${groupId}`)).json();
  return Promise.resolve(getFormSchema(getGroup(categoryId, groupId)));
}

export async function submitRegistration(payload: unknown): Promise<{ referenceId: string }> {
  // const res = await fetch("/api/registration", { method: "POST", body: JSON.stringify(payload) });
  // if (!res.ok) throw new Error("Submission failed");
  // return res.json();
  console.info("[registration] payload", payload);
  const referenceId = `ICJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  return Promise.resolve({ referenceId });
}
