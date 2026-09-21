"use client";

import { MenuItem, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { professionalOnboardingService } from "@/services/admin/professionalOnboarding.service";
import type {
  OnboardingCategory,
  OnboardingGroup,
  OnboardingProfession,
} from "@/types/admin/professionalOnboarding";

export type CascadeValue = {
  categoryId: string;
  groupId: string;
  professionId: string;
};

type Props = {
  value: CascadeValue;
  onChange: (value: CascadeValue) => void;
  requireProfession?: boolean;
  disabled?: boolean;
};

export default function CategoryGroupProfessionSelect({
  value,
  onChange,
  requireProfession = true,
  disabled = false,
}: Props) {
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [groups, setGroups] = useState<OnboardingGroup[]>([]);
  const [professions, setProfessions] = useState<OnboardingProfession[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingProf, setLoadingProf] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCat(true);
      try {
        const res = await professionalOnboardingService.listCategories({
          is_active: true,
          page_size: 200,
          ordering: "display_order",
        });
        if (!cancelled) setCategories(res.results);
      } finally {
        if (!cancelled) setLoadingCat(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadGroups = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setGroups([]);
      return;
    }
    setLoadingGroups(true);
    try {
      const res = await professionalOnboardingService.listGroups({
        category: categoryId,
        is_active: true,
        page_size: 200,
        ordering: "display_order",
      });
      setGroups(res.results);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadProfessions = useCallback(async (groupId: string) => {
    if (!groupId) {
      setProfessions([]);
      return;
    }
    setLoadingProf(true);
    try {
      const res = await professionalOnboardingService.listProfessions({
        group: groupId,
        is_active: true,
        page_size: 200,
        ordering: "display_order",
      });
      setProfessions(res.results);
    } finally {
      setLoadingProf(false);
    }
  }, []);

  useEffect(() => {
    loadGroups(value.categoryId);
  }, [value.categoryId, loadGroups]);

  useEffect(() => {
    loadProfessions(value.groupId);
  }, [value.groupId, loadProfessions]);

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        select
        fullWidth
        size="small"
        label="Category"
        disabled={disabled || loadingCat}
        value={value.categoryId}
        onChange={(e) =>
          onChange({ categoryId: e.target.value, groupId: "", professionId: "" })
        }
      >
        <MenuItem value="">Select category</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        fullWidth
        size="small"
        label="Group"
        disabled={disabled || !value.categoryId || loadingGroups}
        value={value.groupId}
        onChange={(e) =>
          onChange({ ...value, groupId: e.target.value, professionId: "" })
        }
      >
        <MenuItem value="">Select group</MenuItem>
        {groups.map((g) => (
          <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        fullWidth
        size="small"
        label="Profession"
        disabled={disabled || !value.groupId || loadingProf}
        value={value.professionId}
        onChange={(e) => onChange({ ...value, professionId: e.target.value })}
        required={requireProfession}
      >
        <MenuItem value="">Select profession</MenuItem>
        {professions.map((p) => (
          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
