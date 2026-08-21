/**
 * ClientPartnerDeskPanel — ICJ Enterprise Platform
 *
 * Golden Rule: No IIFE, props-driven, safe defaults, never crashes.
 */
import { Grid, Paper, Typography, Stack, Chip, Button, Alert, Box } from "@mui/material";
import SystemConfigService from "../../services/systemConfigService.js";

export default function ClientPartnerDeskPanel({ memberId = "ICJ-2026-MEM-0001" }) {
  const egovActive = SystemConfigService.isPlanActive("plan_egov");
  const affiliateActive = SystemConfigService.isPlanActive("plan_affiliate");
  const lawfirmActive = SystemConfigService.isPlanActive("plan_lawfirm");

  return (
    <Grid container spacing={3}>
      {/* PLAN 2: E-GOVERNANCE PORTALS DESK */}
      <Grid item xs={12} md={4}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: egovActive ? "#f0fdf4" : "#fffbe6",
            borderColor: egovActive ? "#10b981" : "#f59e0b",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                💻 E-Governance Services
              </Typography>
              <Chip
                label={egovActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                color={egovActive ? "success" : "warning"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            {egovActive ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Operate online government portals directly:
                </Typography>
                <Button size="small" variant="outlined" color="primary" href="https://ecourts.gov.in" target="_blank">
                  🌐 e-Courts Cause List &amp; Orders
                </Button>
                <Button size="small" variant="outlined" color="primary" href="https://upbhulekh.gov.in" target="_blank">
                  📜 State Land Revenue Bhulekh
                </Button>
                <Button size="small" variant="outlined" color="primary" href="https://rtionline.gov.in" target="_blank">
                  📝 RTI Online Portal
                </Button>
              </Stack>
            ) : (
              <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                🔒 E-Governance Digital Assistance Plan Launch Pending by ICJ Trust Admin.
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* PLAN 3: LEGAL REFERRAL AFFILIATE DESK */}
      <Grid item xs={12} md={4}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: affiliateActive ? "#fff8f0" : "#fffbe6",
            borderColor: affiliateActive ? "#f97316" : "#f59e0b",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                🟠 Legal Referral Incentives
              </Typography>
              <Chip
                label={affiliateActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                color={affiliateActive ? "warning" : "warning"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            {affiliateActive ? (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Refer legal clients and earn wallet rewards:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">Your Referral Code</Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="secondary.main">
                    REF-{memberId}
                  </Typography>
                  <Typography variant="caption" color="success.main" display="block" fontWeight="bold">
                    Referral Wallet Earnings: ₹0.00
                  </Typography>
                </Paper>
              </Stack>
            ) : (
              <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                🔒 Legal Referral Affiliate Earnings Plan Launch Pending by ICJ Trust Admin.
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* PLAN 4: LAW FIRM ENTERPRISE PARTNERSHIP DESK */}
      <Grid item xs={12} md={4}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: lawfirmActive ? "#f3e8ff" : "#fffbe6",
            borderColor: lawfirmActive ? "#9333ea" : "#f59e0b",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                🟣 Law Firm Enterprise Desk
              </Typography>
              <Chip
                label={lawfirmActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                color={lawfirmActive ? "secondary" : "warning"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            {lawfirmActive ? (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Operate a Law Firm / Legal Services Centre with ICJ Senior Counsel:
                </Typography>
                <Button variant="contained" color="secondary" fullWidth size="small" sx={{ fontWeight: "bold" }}>
                  APPLY FOR ICJ LAW FIRM COLLABORATION 🤝
                </Button>
              </Stack>
            ) : (
              <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                🔒 Law Firm Enterprise Partnership Plan Launch Pending by ICJ Trust Admin.
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
