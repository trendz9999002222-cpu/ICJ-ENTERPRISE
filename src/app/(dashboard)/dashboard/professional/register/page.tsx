"use client";

import AddIcon from "@mui/icons-material/Add";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";

import SectionCard from "@/components/ui/SectionCard";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { env } from "@/config/env";
import type { ProfessionConfiguration } from "@/types/public/professionalOnboardingPublic";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

type CategoryItem = { id: string; title: string };
type GroupItem = { id: string; title: string };
type ProfessionItem = { id: string; title: string };

const steps = ["Select Profession", "Additional Details", "Documents"];

export default function RegisterPracticePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [professionsList, setProfessionsList] = useState<ProfessionItem[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [config, setConfig] = useState<ProfessionConfiguration | null>(null);

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [fileValues, setFileValues] = useState<Record<string, File | null>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [activeStep, setActiveStep] = useState(0);

  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${env.apiUrl}/professional-onboarding/categories/`)
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || json;
        setCategories(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => {});
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedGroup("");
    setSelectedProfession("");
    setProfessionsList([]);
    setGroups([]);
    setConfig(null);
    if (!categoryId) return;

    try {
      const res = await fetch(`${env.apiUrl}/professional-onboarding/categories/${categoryId}/groups/`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setGroups(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // ignore
    }
  };

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedProfession("");
    setProfessionsList([]);
    setConfig(null);
    if (!groupId) return;

    try {
      const res = await fetch(`${env.apiUrl}/professional-onboarding/groups/${groupId}/professions/`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setProfessionsList(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // ignore
    }
  };

  const handleProfessionChange = async (profId: string) => {
    setSelectedProfession(profId);
    setConfig(null);
    setFormValues({});
    setFileValues({});
  };

  const loadConfiguration = async () => {
    if (!selectedProfession) return;
    setLoadingConfig(true);
    try {
      const res = await fetch(`${env.apiUrl}/professional-onboarding/professions/${selectedProfession}/configuration/`);
      if (res.ok) {
        const json = await res.json();
        setConfig(json.data || json);
        setActiveStep(1); // Move to next step
      }
    } catch {
      // ignore
    } finally {
      setLoadingConfig(false);
    }
  };

  const scrollToTop = () => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (config) {
        setActiveStep(1);
      } else {
        loadConfiguration();
      }
    } else if (activeStep === 1) {
      // Frontend validation for Step 1
      const errors: Record<string, string[]> = {};
      let hasError = false;
      
      config?.profession_fields?.forEach(field => {
        const val = formValues[field.field_key];
        if (field.is_required && (!val || val.toString().trim() === '')) {
          errors[field.field_key] = [`${field.label} is required.`];
          hasError = true;
        } else if (val) {
          if (field.field_type === 'number' && isNaN(Number(val))) {
             errors[field.field_key] = [`Must be a valid number.`];
             hasError = true;
          }
          if ((field.field_key.includes('phone') || field.field_key.includes('mobile')) && val.length !== 10) {
             errors[field.field_key] = [`Must be exactly 10 digits.`];
             hasError = true;
          }
        }
      });
      
      if (hasError) {
        setFieldErrors(errors);
        setSubmitError("Please fix the highlighted fields below.");
        scrollToTop();
        return;
      }
      
      setSubmitError("");
      setFieldErrors({});
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Frontend validation for Step 2
      const errors: Record<string, string[]> = {};
      let hasError = false;
      
      config?.documents?.forEach(doc => {
        if (doc.is_required && !fileValues[doc.document_key]) {
          errors[doc.document_key] = [`${doc.name} is required.`];
          hasError = true;
        }
      });
      
      if (hasError) {
        setFieldErrors(errors);
        setSubmitError("Please upload all required documents below.");
        scrollToTop();
        return;
      }

      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!selectedProfession) return;
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});
    setSubmitSuccess(false);

    try {
      const token = readCookie("icj_access_token");
      const formData = new FormData();
      
      formData.set("category_ids", JSON.stringify([selectedCategory]));
      formData.set("group_ids", JSON.stringify([selectedGroup]));
      formData.set("profession_ids", JSON.stringify([selectedProfession]));
      formData.set("common_field_values", JSON.stringify({})); 
      
      const profValues = {
        [selectedProfession]: formValues
      };
      formData.set("profession_field_values", JSON.stringify(profValues));

      Object.entries(fileValues).forEach(([key, file]) => {
        if (file) formData.append(`document__${key}`, file);
      });

      const res = await fetch(`${env.apiUrl}/professional-onboarding/register/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setActiveStep(0);
        setSelectedCategory("");
        setSelectedGroup("");
        setSelectedProfession("");
        setConfig(null);
        setFormValues({});
        setFileValues({});
        scrollToTop();
      } else {
        const err = await res.json().catch(() => null);
        if (err?.errors) {
            setFieldErrors(err.errors);
            setSubmitError("Validation failed. Please check the highlighted fields.");
            
            // Auto-navigate to correct step
            const hasFieldErrors = Object.keys(err.errors).some(k => k.startsWith('profession_field_values') || !config?.documents?.find(d => d.document_key === k));
            if (hasFieldErrors) {
               setActiveStep(1);
            }
            scrollToTop();
        } else {
            setSubmitError(err?.message || err?.detail || "Registration failed. Please try again.");
            scrollToTop();
        }
      }
    } catch {
      setSubmitError("Network error. Please try again.");
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (key: string) => {
    const professionKey = `profession_field_values.${selectedProfession}.${key}`;
    if (fieldErrors[professionKey]) return fieldErrors[professionKey][0];
    if (fieldErrors[key]) return fieldErrors[key][0];
    return null;
  };

  return (
    <PortalPageShell
      title="Register New Practice"
      subtitle="Register as a professional in a new category or group."
    >
      <Box sx={{ width: '100%', mb: 4 }} ref={errorRef}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {submitSuccess ? (
        <Alert severity="success" sx={{ mb: 3, fontWeight: 700 }}>
          Registration submitted successfully! You can view your new application status on the dashboard.
        </Alert>
      ) : submitError ? (
        <Alert severity="error" sx={{ mb: 3, fontWeight: 700 }}>
          {submitError}
        </Alert>
      ) : null}

      <Box sx={{ minHeight: "400px" }}>
        {activeStep === 0 && (
          <SectionCard
            title="1. Select Profession"
            icon={<WorkspacePremiumIcon sx={{ color: "#2563eb", fontSize: 20 }} />}
          >
            <Stack spacing={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Practice Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Practice Category"
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!selectedCategory}>
                <InputLabel>Practice Group</InputLabel>
                <Select
                  value={selectedGroup}
                  label="Practice Group"
                  onChange={(e) => handleGroupChange(e.target.value)}
                >
                  {groups.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!selectedGroup}>
                <InputLabel>Profession</InputLabel>
                <Select
                  value={selectedProfession}
                  label="Profession"
                  onChange={(e) => handleProfessionChange(e.target.value)}
                >
                  {professionsList.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </SectionCard>
        )}

        {activeStep === 1 && (
          loadingConfig ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ mt: 2, color: "#64748b" }}>
                Loading requirements...
              </Typography>
            </Box>
          ) : config && config.profession_fields && config.profession_fields.length > 0 ? (
            <SectionCard title="2. Additional Details">
              <Stack spacing={2.5}>
                {config.profession_fields.map((field) => {
                  const errorMsg = getFieldError(field.field_key);
                  const isError = Boolean(errorMsg);

                  const hasOptions = Array.isArray(field.options) && field.options.length > 0;
                  const isSelectLike = field.field_type === "select" || field.field_type === "radio" || field.field_type === "checkbox" || hasOptions;
                  const isMultiple = field.field_type === "checkbox";

                  if (isSelectLike) {
                    return (
                      <FormControl key={field.field_key} fullWidth size="small" error={isError}>
                        <InputLabel>{field.label} {field.is_required ? "*" : ""}</InputLabel>
                        <Select
                          multiple={isMultiple}
                          value={formValues[field.field_key] !== undefined ? formValues[field.field_key] : (isMultiple ? [] : "")}
                          label={`${field.label} ${field.is_required ? "*" : ""}`}
                          onChange={(e) => {
                             setFormValues(p => ({ ...p, [field.field_key]: e.target.value }));
                             // Clear error on change
                             if (fieldErrors[field.field_key] || fieldErrors[`profession_field_values.${selectedProfession}.${field.field_key}`]) {
                                 setFieldErrors(prev => {
                                     const next = { ...prev };
                                     delete next[field.field_key];
                                     delete next[`profession_field_values.${selectedProfession}.${field.field_key}`];
                                     return next;
                                 });
                             }
                          }}
                        >
                          {field.options?.map((o) => (
                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                          ))}
                        </Select>
                        {(isError || field.help_text) && (
                          <FormHelperText>{errorMsg || field.help_text}</FormHelperText>
                        )}
                      </FormControl>
                    );
                  }
                  
                  return (
                    <TextField
                      key={field.field_key}
                      label={`${field.label} ${field.is_required ? "*" : ""}`}
                      placeholder={field.placeholder || ""}
                      type={field.field_type === "number" ? "text" : field.field_type === "date" ? "date" : "text"}
                      multiline={field.field_type === "textarea"}
                      rows={field.field_type === "textarea" ? 3 : 1}
                      size="small"
                      fullWidth
                      value={formValues[field.field_key] || ""}
                      onChange={(e) => {
                         let val = e.target.value;
                         if (field.field_type === 'number') {
                            val = val.replace(/[^0-9]/g, '');
                         }
                         if (field.field_key.includes('phone') || field.field_key.includes('mobile')) {
                            val = val.replace(/[^0-9]/g, '').slice(0, 10);
                         }
                         setFormValues(p => ({ ...p, [field.field_key]: val }));
                         
                         // Clear error on type
                         if (fieldErrors[field.field_key] || fieldErrors[`profession_field_values.${selectedProfession}.${field.field_key}`]) {
                             setFieldErrors(prev => {
                                 const next = { ...prev };
                                 delete next[field.field_key];
                                 delete next[`profession_field_values.${selectedProfession}.${field.field_key}`];
                                 return next;
                             });
                         }
                      }}
                      error={isError}
                      helperText={errorMsg || field.help_text}
                      slotProps={field.field_type === "date" ? { inputLabel: { shrink: true } } : undefined}
                    />
                  );
                })}
              </Stack>
            </SectionCard>
          ) : (
            <Box sx={{ p: 5, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Typography variant="body1">No additional details required for this profession.</Typography>
            </Box>
          )
        )}

        {activeStep === 2 && (
          config && config.documents && config.documents.length > 0 ? (
            <SectionCard title="3. Documents" icon={<FolderOpenIcon sx={{ color: "#2563eb", fontSize: 20 }} />}>
              <Stack spacing={3}>
                {config.documents.map((doc) => {
                  const errorMsg = getFieldError(doc.document_key);
                  const isError = Boolean(errorMsg);
                  return (
                    <Box 
                      key={doc.document_key} 
                      sx={{ 
                        border: isError ? "1px dashed #ef4444" : "1px dashed #cbd5e1", 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: isError ? "#fef2f2" : "transparent"
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: isError ? "#ef4444" : "inherit" }}>
                        {doc.name} {doc.is_required && <span style={{ color: "#ef4444" }}>*</span>}
                      </Typography>
                      {doc.instructions && (
                        <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>{doc.instructions}</Typography>
                      )}
                      <input
                        type="file"
                        accept={doc.allowed_file_types?.join(",")}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFileValues(p => ({ ...p, [doc.document_key]: e.target.files![0] }));
                          } else {
                            setFileValues(p => ({ ...p, [doc.document_key]: null }));
                          }
                          
                          // Clear error on change
                          if (fieldErrors[doc.document_key]) {
                             setFieldErrors(prev => {
                                 const next = { ...prev };
                                 delete next[doc.document_key];
                                 return next;
                             });
                          }
                        }}
                      />
                      {isError && (
                        <Typography variant="caption" sx={{ color: "#ef4444", display: 'block', mt: 1 }}>
                          {errorMsg}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </SectionCard>
          ) : (
            <Box sx={{ p: 5, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Typography variant="body1">No document uploads required for this profession.</Typography>
            </Box>
          )
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 3 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0 || submitting}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            {submitting ? "Submitting Registration..." : "Submit Registration"}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={activeStep === 0 && (!selectedCategory || !selectedGroup || !selectedProfession)}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            {activeStep === 0 && loadingConfig ? "Loading..." : "Next"}
          </Button>
        )}
      </Box>
    </PortalPageShell>
  );
}
