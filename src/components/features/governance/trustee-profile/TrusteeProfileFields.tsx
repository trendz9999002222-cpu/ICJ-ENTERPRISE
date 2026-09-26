"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { TrusteeFieldConfig } from "@/config/governance/trusteeProfileSections";
import { districtsForState, resolveTrusteeMasterOptions } from "@/lib/governance/trusteeMasterData";
import type { TrusteeAddressFields, TrusteeKycDocumentRow, TrusteeProfileFormState } from "@/types/governance/trusteeProfile";

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" },
} as const;

const DECLARATION_TEXT =
  "I hereby declare that the information and documents provided by me are true and correct to the best of my knowledge and belief. I undertake to inform the organisation of any change in my personal, contact, address, professional or governance details.";

type Props = {
  fields: TrusteeFieldConfig[];
  state: TrusteeProfileFormState;
  systemMeta: {
    governingBodyMemberId: string;
    createdDate: string;
    createdBy: string;
    lastUpdatedDate: string;
    lastUpdatedBy: string;
    verificationDate: string;
    verifiedBy: string;
    recordStatus: string;
  };
  onPatch: (patch: Partial<TrusteeProfileFormState>) => void;
};

function labelWithStar(label: string, required?: boolean) {
  return required ? `${label} *` : label;
}

function phoneCountryField(mobileField: string): keyof TrusteeProfileFormState {
  if (mobileField === "primaryMobile") return "primaryMobileCountry";
  if (mobileField === "whatsappNumber") return "whatsappCountry";
  return "alternateMobileCountry";
}

function AddressFieldsBlock({
  title,
  prefix,
  value,
  onChange,
}: {
  title: string;
  prefix: "registeredAddress" | "correspondenceAddress";
  value: TrusteeAddressFields;
  onChange: (next: TrusteeAddressFields) => void;
}) {
  const districts = value.country === "India" && value.state ? districtsForState(value.state) : [];

  const set = (key: keyof TrusteeAddressFields, v: string) => onChange({ ...value, [key]: v });

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#e2e8f0" }}>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>{title}</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label={labelWithStar("Address Line 1", prefix === "registeredAddress")}
            value={value.line1}
            onChange={(e) => set("line1", e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Address Line 2"
            value={value.line2}
            onChange={(e) => set("line2", e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Landmark"
            value={value.landmark}
            onChange={(e) => set("landmark", e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            size="small"
            options={resolveTrusteeMasterOptions("countries")}
            value={value.country || "India"}
            onChange={(_, v) => set("country", v ?? "India")}
            renderInput={(params) => <TextField {...params} label={labelWithStar("Country", prefix === "registeredAddress")} sx={inputSx} />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            size="small"
            options={value.country === "India" ? resolveTrusteeMasterOptions("indianStates") : []}
            value={value.state || null}
            onChange={(_, v) => {
              onChange({ ...value, state: v ?? "", district: "", city: "" });
            }}
            renderInput={(params) => (
              <TextField {...params} label={labelWithStar("State / Province", prefix === "registeredAddress")} sx={inputSx} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            size="small"
            options={districts}
            value={value.district || null}
            onChange={(_, v) => set("district", v ?? "")}
            disabled={!value.state}
            renderInput={(params) => (
              <TextField {...params} label={labelWithStar("District", prefix === "registeredAddress")} sx={inputSx} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="City / Town"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Locality / Area"
            value={value.locality}
            onChange={(e) => set("locality", e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label={labelWithStar("PIN Code", prefix === "registeredAddress")}
            value={value.pinCode}
            onChange={(e) => set("pinCode", e.target.value)}
            sx={inputSx}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function TrusteeProfileFields({ fields, state, systemMeta, onPatch }: Props) {
  const patchScalar = (name: string, value: unknown) => {
    onPatch({ [name]: value } as Partial<TrusteeProfileFormState>);
  };

  const addKycRow = () => {
    const row: TrusteeKycDocumentRow = {
      id: crypto.randomUUID(),
      documentType: "",
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      fileName: "",
      verificationStatus: "Pending",
      verifiedBy: "",
      verificationDate: "",
      remarks: "",
    };
    onPatch({ kycDocuments: [...state.kycDocuments, row] });
  };

  const updateKycRow = (id: string, patch: Partial<TrusteeKycDocumentRow>) => {
    onPatch({
      kycDocuments: state.kycDocuments.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const removeKycRow = (id: string) => {
    onPatch({ kycDocuments: state.kycDocuments.filter((r) => r.id !== id) });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 2,
      }}
    >
      {fields.map((field) => {
        const col = field.col ?? 6;
        const wrap = (node: React.ReactNode) => (
          <Box key={field.name} sx={{ gridColumn: { xs: "span 12", md: `span ${col}` } }}>
            {node}
          </Box>
        );

        if (field.type === "address-block") {
          return wrap(
            <AddressFieldsBlock
              title="Registered / Official Address"
              prefix="registeredAddress"
              value={state.registeredAddress}
              onChange={(next) => onPatch({ registeredAddress: next })}
            />,
          );
        }

        if (field.type === "correspondence-block") {
          return wrap(
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.correspondenceSameAsRegistered}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onPatch({
                        correspondenceSameAsRegistered: checked,
                        correspondenceAddress: checked
                          ? { ...state.registeredAddress }
                          : state.correspondenceAddress,
                      });
                    }}
                  />
                }
                label="Same as Registered / Official Address"
              />
              <AddressFieldsBlock
                title="Correspondence Address"
                prefix="correspondenceAddress"
                value={
                  state.correspondenceSameAsRegistered
                    ? state.registeredAddress
                    : state.correspondenceAddress
                }
                onChange={(next) => onPatch({ correspondenceAddress: next, correspondenceSameAsRegistered: false })}
              />
            </Stack>,
          );
        }

        if (field.type === "kyc-documents") {
          return wrap(
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#e2e8f0" }}>
              <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>KYC / Documents</Typography>
                <Button startIcon={<AddIcon />} size="small" onClick={addKycRow} sx={{ textTransform: "none" }}>
                  Add document
                </Button>
              </Stack>
              {state.kycDocuments.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No documents added yet. Use &quot;Add document&quot; to attach KYC records.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {state.kycDocuments.map((row) => (
                    <Paper key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
                      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Autocomplete
                            size="small"
                            options={resolveTrusteeMasterOptions("documentTypes")}
                            value={row.documentType || null}
                            onChange={(_, v) => updateKycRow(row.id, { documentType: v ?? "" })}
                            renderInput={(params) => <TextField {...params} label="Document Type" sx={inputSx} />}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Document Number"
                            value={row.documentNumber}
                            onChange={(e) => updateKycRow(row.id, { documentNumber: e.target.value })}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Issue Date"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={row.issueDate}
                            onChange={(e) => updateKycRow(row.id, { issueDate: e.target.value })}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Expiry Date"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={row.expiryDate}
                            onChange={(e) => updateKycRow(row.id, { expiryDate: e.target.value })}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<UploadFileIcon />}
                            fullWidth
                            sx={{ textTransform: "none", height: 40 }}
                          >
                            {row.fileName ? "Change file" : "Upload"}
                            <input
                              type="file"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                updateKycRow(row.id, { fileName: file?.name ?? "" });
                              }}
                            />
                          </Button>
                          {row.fileName && (
                            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#64748b" }}>
                              {row.fileName}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Autocomplete
                            size="small"
                            options={resolveTrusteeMasterOptions("verificationStatuses")}
                            value={row.verificationStatus || "Pending"}
                            onChange={(_, v) => updateKycRow(row.id, { verificationStatus: v ?? "Pending" })}
                            renderInput={(params) => (
                              <TextField {...params} label="Verification Status" sx={inputSx} />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Remarks"
                            value={row.remarks}
                            onChange={(e) => updateKycRow(row.id, { remarks: e.target.value })}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 1 }}>
                          <IconButton aria-label="Remove document" onClick={() => removeKycRow(row.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>,
          );
        }

        if (field.type === "declaration-block") {
          return wrap(
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#e2e8f0" }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#334155", mb: 2, lineHeight: 1.6 }}>{DECLARATION_TEXT}</Typography>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.declarationAccepted}
                      onChange={(e) => patchScalar("declarationAccepted", e.target.checked)}
                    />
                  }
                  label={labelWithStar("Declaration Accepted", true)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Declaration Date"
                  value={systemMeta.createdDate}
                  disabled
                  sx={inputSx}
                />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{ alignSelf: "flex-start", textTransform: "none" }}
                >
                  {state.signatureFileName ? `Signature: ${state.signatureFileName}` : "Signature upload"}
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={(e) => patchScalar("signatureFileName", e.target.files?.[0]?.name ?? "")}
                  />
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.consentCommunication}
                      onChange={(e) => patchScalar("consentCommunication", e.target.checked)}
                    />
                  }
                  label="Consent for Communication"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.consentWhatsapp}
                      onChange={(e) => patchScalar("consentWhatsapp", e.target.checked)}
                    />
                  }
                  label="Consent for WhatsApp Communication"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.consentEmail}
                      onChange={(e) => patchScalar("consentEmail", e.target.checked)}
                    />
                  }
                  label="Consent for Email Communication"
                />
              </Stack>
            </Paper>,
          );
        }

        if (field.type === "system-info") {
          const rows = [
            ["Governing Body Member ID", systemMeta.governingBodyMemberId],
            ["Created Date", systemMeta.createdDate],
            ["Created By", systemMeta.createdBy],
            ["Last Updated Date", systemMeta.lastUpdatedDate],
            ["Last Updated By", systemMeta.lastUpdatedBy],
            ["Verification Date", systemMeta.verificationDate || "—"],
            ["Verified By", systemMeta.verifiedBy || "—"],
            ["Record Status", systemMeta.recordStatus],
          ];
          return wrap(
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "#e2e8f0", bgcolor: "#f8fafc" }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>System / Verification (read-only)</Typography>
              <Grid container spacing={2}>
                {rows.map(([label, val]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth size="small" label={label} value={val} disabled sx={inputSx} />
                  </Grid>
                ))}
              </Grid>
            </Paper>,
          );
        }

        if (field.type === "phone") {
          const countryKey = phoneCountryField(field.name);
          const countryVal = state[countryKey] as string;
          const mobileVal = state[field.name as keyof TrusteeProfileFormState] as string;
          return wrap(
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                size="small"
                label="Country code"
                value={countryVal}
                onChange={(e) => patchScalar(countryKey, e.target.value)}
                sx={{ ...inputSx, minWidth: 110 }}
              >
                {resolveTrusteeMasterOptions("phoneCountryCodes").map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="small"
                label={labelWithStar(field.label, field.required)}
                value={mobileVal}
                onChange={(e) => {
                  const next = e.target.value;
                  patchScalar(field.name, next);
                  if (field.name === "primaryMobile" && state.whatsappSameAsPrimary) {
                    onPatch({ whatsappNumber: next, whatsappCountry: countryVal });
                  }
                }}
                sx={inputSx}
              />
            </Stack>,
          );
        }

        if (field.type === "checkbox" && field.name === "whatsappSameAsPrimary") {
          return wrap(
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.whatsappSameAsPrimary}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onPatch({
                      whatsappSameAsPrimary: checked,
                      whatsappNumber: checked ? state.primaryMobile : state.whatsappNumber,
                      whatsappCountry: checked ? state.primaryMobileCountry : state.whatsappCountry,
                    });
                  }}
                />
              }
              label={field.label}
            />,
          );
        }

        if (field.type === "autocomplete" && field.masterKey) {
          const options = resolveTrusteeMasterOptions(field.masterKey);
          const val = state[field.name as keyof TrusteeProfileFormState] as string;
          return wrap(
            <Autocomplete
              size="small"
              options={options}
              value={val || null}
              onChange={(_, v) => patchScalar(field.name, v ?? "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={labelWithStar(field.label, field.required)}
                  helperText={field.helperText}
                  sx={inputSx}
                />
              )}
            />,
          );
        }

        if (field.type === "multiselect" && field.masterKey) {
          const options = resolveTrusteeMasterOptions(field.masterKey);
          const val = state[field.name as keyof TrusteeProfileFormState] as string[];
          return wrap(
            <Autocomplete
              multiple
              size="small"
              options={options}
              value={val}
              onChange={(_, v) => patchScalar(field.name, v)}
              renderInput={(params) => (
                <TextField {...params} label={field.label} placeholder={`Search ${field.label.toLowerCase()}...`} sx={inputSx} />
              )}
            />,
          );
        }

        if (field.type === "readonly") {
          const val = state[field.name as keyof TrusteeProfileFormState] as string;
          return wrap(<TextField fullWidth size="small" label={field.label} value={val} disabled sx={inputSx} />);
        }

        if (field.type === "file") {
          const val = state[field.name as keyof TrusteeProfileFormState] as string;
          return wrap(
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} sx={{ textTransform: "none" }}>
              {val ? val : field.label}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => patchScalar(field.name, e.target.files?.[0]?.name ?? "")}
              />
            </Button>,
          );
        }

        const scalar = state[field.name as keyof TrusteeProfileFormState] as string;
        const commonProps = {
          fullWidth: true,
          size: "small" as const,
          label: labelWithStar(field.label, field.required),
          value: scalar ?? "",
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => patchScalar(field.name, e.target.value),
          sx: inputSx,
        };

        if (field.type === "date") {
          return wrap(<TextField {...commonProps} type="date" slotProps={{ inputLabel: { shrink: true } }} />);
        }
        if (field.type === "email") {
          return wrap(<TextField {...commonProps} type="email" />);
        }
        return wrap(<TextField {...commonProps} />);
      })}
    </Box>
  );
}
