import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Stack,
  Button, Alert, Snackbar, Container, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";

import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StarIcon from "@mui/icons-material/Star";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import SubscriptionService from "../services/subscriptionService";
import TokenRateService from "../services/tokenRateService";
import useAuth from "../hooks/useAuth";

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const memberId = user?.member_id || user?.id || "26ICJ08AA0001";
  const memberName = user?.name || "ICJ Member";

  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [currentRate, setCurrentRate] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const loadData = () => {
    try {
      const pList = SubscriptionService.getPlans();
      const current = SubscriptionService.getActiveSubscription(memberId);
      const rate = TokenRateService.getCurrentRate();
      setPlans(pList);
      setActiveSub(current);
      setCurrentRate(rate);
    } catch (e) {
      console.error("Failed to load subscriptions", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubscribe = (planId, mode) => {
    try {
      const res = SubscriptionService.subscribe({
        memberId,
        memberName,
        planId,
        paymentMode: mode,
      });
      setSnack({
        open: true,
        msg: `✅ ${res.planName} सफलता पूर्वक एक्टिवेट हो गया है!`,
        severity: "success",
      });
      loadData();
    } catch (e) {
      setSnack({ open: true, msg: e.message, severity: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      {/* Hero Banner */}
      <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #059669 100%)", color: "white", py: 5, px: 3, boxShadow: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 60, height: 60 }}>
              <CardMembershipIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">ICJ Subscription Plans Engine</Typography>
              <Typography variant="h6" sx={{ color: "#93c5fd" }}>
                चाहे कैश से भुगतान करें, चाहे ICJ टोकन से — दोनों स्वीकार (Dynamic Token Rate: ₹{currentRate?.tokenToInr}/Token)
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* Active Subscription Badge */}
        {activeSub && (
          <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CheckCircleIcon sx={{ color: "#059669", fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="#047857">
                    वर्तमान सक्रिय योजना: {activeSub.planName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    वैधता तिथि: {new Date(activeSub.expiresAt).toLocaleDateString("en-IN")} | भुगतान का तरीका: {activeSub.paymentMode}
                  </Typography>
                </Box>
              </Stack>
              <Chip label="ACTIVE ✅" color="success" sx={{ fontWeight: "bold" }} />
            </Stack>
          </Paper>
        )}

        {/* Subscription Plans Cards */}
        <Grid container spacing={3}>
          {plans.map((plan) => {
            const isCurrent = activeSub?.planId === plan.id;
            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card
                  elevation={plan.popular ? 6 : 2}
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    borderTop: `6px solid ${plan.color}`,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="MOST POPULAR"
                      size="small"
                      color="secondary"
                      sx={{ position: "absolute", top: 12, right: 12, fontWeight: "bold" }}
                    />
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color={plan.color} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {plan.recommendedFor}
                    </Typography>

                    {/* Price Header */}
                    <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2, textAlign: "center" }}>
                      <Typography variant="h4" fontWeight="bold" color="#0f172a">
                        {plan.priceInr === 0 ? "FREE" : `₹${plan.priceInr}`}
                        <Typography component="span" variant="caption" color="text.secondary"> / {plan.durationDays} Days</Typography>
                      </Typography>
                      <Divider sx={{ my: 1 }}>OR</Divider>
                      <Typography variant="subtitle1" fontWeight="bold" color="#d97706">
                        🪙 {plan.dynamicTokenCost} Tokens
                      </Typography>
                    </Box>

                    {/* Features List */}
                    <List size="small" disablePadding>
                      {plan.features.map((feat, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28, color: plan.color }}>
                            <CheckCircleIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feat} primaryTypographyProps={{ variant: "body2" }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    {isCurrent ? (
                      <Button fullWidth variant="outlined" disabled color="success" sx={{ fontWeight: "bold" }}>
                        वर्तमान में सक्रिय योजना ✓
                      </Button>
                    ) : (
                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleSubscribe(plan.id, "TOKEN")}
                          sx={{ bgcolor: plan.color, fontWeight: "bold" }}
                          startIcon={<MonetizationOnIcon />}
                        >
                          🪙 {plan.dynamicTokenCost} Tokens से रिन्यू करें
                        </Button>

                        {plan.priceInr > 0 && (
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleSubscribe(plan.id, "CASH")}
                            sx={{ borderColor: plan.color, color: plan.color, fontWeight: "bold" }}
                          >
                            ₹{plan.priceInr} नकद से खरीदें
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
