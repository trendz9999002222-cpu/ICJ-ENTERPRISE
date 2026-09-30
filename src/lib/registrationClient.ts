/**
 * Public professional registration — API-backed (admin configuration is source of truth).
 */

import {
  DEFAULT_ONBOARDING_SIDEBAR,
  buildYearOptions,
  getStepMeta,
  getSteps,
} from "@/lib/onboarding/stepCatalog";
import { professionalOnboardingPublicService } from "@/services/public/professionalOnboardingPublic.service";
import type { Sidebar, StepId, StepMeta } from "@/types/registration";

export { buildYearOptions, getStepMeta, getSteps };

export function getSidebar(): Sidebar {
  return DEFAULT_ONBOARDING_SIDEBAR;
}

export function getOptions(
  _optionsRef?: string,
  inline?: string[],
  optionItems?: { value: string; label: string }[],
): string[] {
  if (optionItems?.length) return optionItems.map((o) => o.value);
  if (inline?.length) return inline;
  return [];
}

export async function fetchCategories() {
  return professionalOnboardingPublicService.fetchCategories();
}

export async function fetchGroups(categoryId: string) {
  return professionalOnboardingPublicService.fetchGroups(categoryId);
}

export async function fetchGroupsForCategories(categoryIds: string[]) {
  if (!categoryIds.length) return [];
  const batches = await Promise.all(
    categoryIds.map(async (categoryId) => {
      const groups = await fetchGroups(categoryId);
      return groups.map((g) => ({ ...g, categoryId }));
    }),
  );
  const seen = new Set<string>();
  return batches.flat().filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

export async function fetchProfessions(groupId: string) {
  return professionalOnboardingPublicService.fetchProfessions(groupId);
}

export async function fetchProfessionsForGroups(groupIds: string[]) {
  if (!groupIds.length) return [];
  const batches = await Promise.all(
    groupIds.map(async (groupId) => {
      const professions = await fetchProfessions(groupId);
      return professions.map((p) => ({ ...p, groupId }));
    }),
  );
  const seen = new Set<string>();
  return batches.flat().filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export async function fetchProfessionConfiguration(professionId: string) {
  return professionalOnboardingPublicService.fetchProfessionConfiguration(professionId);
}

export async function submitRegistration(payload: {
  categoryIds: string[];
  groupIds: string[];
  professionIds: string[];
  commonValues: Record<string, unknown>;
  professionValuesByProfession: Record<string, Record<string, unknown>>;
  files: Record<string, File | null>;
  idempotencyKey?: string;
  password: string;
  confirmPassword: string;
}) {
  return professionalOnboardingPublicService.submitRegistration(payload);
}

export type { StepId, StepMeta };
