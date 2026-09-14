"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedIcon from "@mui/icons-material/Verified";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PageHeader from "@/components/features/public/PageHeader";
import { academyService } from "@/services/public";
import type { AcademyCourse } from "@/types/public";
import Link from "next/link";

export default function AcademyPage() {
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Enrolment Modal State
  const [enrolCourse, setEnrolCourse] = useState<AcademyCourse | null>(null);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [enrolSuccess, setEnrolSuccess] = useState(false);

  useEffect(() => {
    academyService.listCourses().then((data) => {
      setCourses(data.results);
      setLoading(false);
    });
  }, []);

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !email || !mobile) return;
    setEnrolSuccess(true);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="ICJ Academy of Continuing Legal Education"
        subtitle="Executive certificate masterclasses, advanced judicial training, and professional development programs delivered by senior jurists and industry practitioners."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academy" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Academy Pillars */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              icon: <SchoolIcon sx={{ color: "#2563eb", fontSize: 32 }} />,
              title: "Senior Faculty & Judges",
              desc: "Courses designed and delivered by empaneled Senior Advocates, former High Court judges, and leading subject experts.",
            },
            {
              icon: <CastForEducationIcon sx={{ color: "#059669", fontSize: 32 }} />,
              title: "Live Interactive Masterclasses",
              desc: "Weekend intensive modules, case simulation moot exercises, and procedural drafting workshops.",
            },
            {
              icon: <VerifiedIcon sx={{ color: "#7c3aed", fontSize: 32 }} />,
              title: "Accredited Digital Certificates",
              desc: "Earn tamper-proof, QR-verifiable CLE certificate credentials recognized across institutional and corporate networks.",
            },
          ].map((item, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "1.05rem" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Course Catalog */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 700, letterSpacing: 1.2 }}>
              EXECUTIVE MASTERCLASSES
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
              Featured Certification Programs
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 650, mx: "auto", mt: 1 }}>
              Equip yourself with specialized practical expertise in modern and high-demand areas of contemporary law.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {courses.map((c) => (
                <Grid size={{ xs: 12, md: 6 }} key={c.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3.5,
                      height: "100%",
                      bgcolor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#2563eb",
                        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Chip
                          label={c.level}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                          label={c.duration}
                          size="small"
                          variant="outlined"
                          sx={{ color: "#64748b", fontSize: "0.75rem" }}
                        />
                      </Box>

                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, lineHeight: 1.3 }}>
                        {c.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#475569", mb: 2.5, lineHeight: 1.6 }}>
                        {c.description}
                      </Typography>

                      <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, mb: 2.5, border: "1px solid #f1f5f9" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Lead Faculty & Instructors:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", mt: 0.3 }}>
                          {c.instructor} — {c.instructorTitle}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                        Key Program Highlights:
                      </Typography>
                      <List dense disablePadding sx={{ mb: 3 }}>
                        {[
                          `${c.modulesCount} Comprehensive Academic Modules`,
                          `Delivery Format: ${c.mode} Interactive Sessions`,
                          c.certificateProvided ? "ICJ Accredited Digital CLE Certificate" : "Certificate of Completion",
                          `Next Intake: ${c.upcomingBatchDate}`,
                        ].map((highlight, mIdx) => (
                          <ListItem key={mIdx} disableGutters sx={{ py: 0.3 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={highlight}
                              slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155" } } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setEnrolCourse(c);
                        setEnrolSuccess(false);
                      }}
                      sx={{
                        py: 1.3,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "#0f172a",
                        "&:hover": { bgcolor: "#1e293b" },
                      }}
                    >
                      Enrol in Course ({c.mode})
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Certificate Verification Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Have an ICJ Academy Certificate to Verify?
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Use our public credential registry to validate authenticity, student details, and issuing authority seal.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/verify-certificate"
            variant="contained"
            sx={{
              bgcolor: "#2563eb",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              whiteSpace: "nowrap",
            }}
          >
            Verify Certificate
          </Button>
        </Card>
      </Container>

      {/* Enrolment Modal */}
      <Dialog
        open={Boolean(enrolCourse)}
        onClose={() => setEnrolCourse(null)}
        maxWidth="sm"
        fullWidth
      >
        {enrolCourse && (
          <>
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Course Enrolment Request
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                {enrolCourse.title} ({enrolCourse.duration})
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3.5, py: 2 }}>
              {enrolSuccess ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <VerifiedIcon sx={{ fontSize: 48, color: "#059669", mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                    Enrolment Request Acknowledged
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
                    Our academic admissions office will send your batch schedule, LMS credentials, and invoice details to <b>{email}</b>.
                  </Typography>
                  <Alert severity="success">Batch orientation date: 1st of Next Month</Alert>
                </Box>
              ) : (
                <form id="enrol-form" onSubmit={handleEnrolSubmit}>
                  <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      label="Candidate Full Name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      type="email"
                      label="Official Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Mobile Contact Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </Stack>
                </form>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3.5, pb: 3 }}>
              {enrolSuccess ? (
                <Button
                  variant="contained"
                  onClick={() => setEnrolCourse(null)}
                  sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0f172a" }}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setEnrolCourse(null)}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#64748b" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="enrol-form"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb" }}
                  >
                    Submit Enrolment
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
