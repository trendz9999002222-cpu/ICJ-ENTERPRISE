import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import MemberService from "../../services/memberService.js";
import JudiciaryMasterService from "../../services/judiciaryMasterService.js";
import MemberBatchImporter from "../membership/MemberBatchImporter.jsx";
import SpecialtyUpgradeModal from "../membership/SpecialtyUpgradeModal.jsx";

export default function AdvocateResearchDirectory() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [forumFilter, setForumFilter] = useState("All");
  const [importerOpen, setImporterOpen] = useState(false);
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await MemberService.getAll();
      setMembers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const forums = JudiciaryMasterService.getForums();

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = search.toLowerCase();
      const name = String(m.fullName || m.name || "").toLowerCase();
      const mob = String(m.mobile || "");
      const email = String(m.email || "").toLowerCase();
      const city = String(m.city || m.district || "").toLowerCase();

      const matchesSearch = !term || name.includes(term) || mob.includes(term) || email.includes(term) || city.includes(term);
      return matchesSearch;
    });
  }, [members, search]);

  return (
    <Box sx={{ p: 3, bgcolor: "#0f172a", minHeight: "100vh", color: "#ffffff" }}>
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#1e293b", color: "#ffffff", borderRadius: 3, border: "1px solid #334155" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#ffffff">
              🏢 Pan-India Advocate Master Research & Intelligence Directory
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              10 Judicial Forum Ranks | 12 Core Practice Specialties | Zero-Typing Excel Batch Importer
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<WorkspacePremiumIcon />}
            onClick={() => setImporterOpen(true)}
            sx={{ fontWeight: 800, py: 1.2, px: 2.5 }}
          >
            📊 Excel / CSV Batch Auto-Importer
          </Button>
        </Stack>
      </Paper>

      {/* SEARCH & FILTERS */}
      <Paper sx={{ p: 2.5, mb: 3, bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155" }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Search by Advocate Name, Mobile, Email, District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#fcd34d" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 350 },
              input: { color: "#ffffff", fontWeight: 700 },
              "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", "& fieldset": { borderColor: "#475569" } },
            }}
          />
        </Stack>
      </Paper>

      {/* MASTER DATA TABLE */}
      <Paper sx={{ bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155", overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0f172a" }}>
            <TableRow>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>Member ID</TableCell>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>Advocate Name</TableCell>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>🏛️ Judicial Forum Rank</TableCell>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>🥇 Core Specialties</TableCell>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>Mobile</TableCell>
              <TableCell sx={{ color: "#fcd34d", fontWeight: 800 }}>District / State</TableCell>
              <TableCell align="right" sx={{ color: "#fcd34d", fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((m) => (
              <TableRow key={m.id || m.member_id} hover sx={{ "&:hover": { bgcolor: "#334155" } }}>
                <TableCell sx={{ color: "#93c5fd", fontFamily: "monospace", fontWeight: 700 }}>{m.member_id || m.id}</TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>{m.fullName || m.name}</TableCell>
                <TableCell>
                  <Chip label="Rank 3: District & Sessions" size="small" color="primary" sx={{ fontWeight: 800 }} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {JudiciaryMasterService.formatSpecialtyBadges(m.unlockedSpecialties || ["CRIMINAL_BAIL"]).map((spec, idx) => (
                      <Chip key={idx} label={`${spec.rankIcon} ${spec.name.split(" ")[0]}`} size="small" color="success" sx={{ fontWeight: 800 }} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: "#cbd5e1" }}>{m.mobile || "—"}</TableCell>
                <TableCell sx={{ color: "#cbd5e1" }}>{m.city || m.district || "Lucknow"}, {m.state || "UP"}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      setSelectedMember(m);
                      setSpecialtyModalOpen(true);
                    }}
                    sx={{ fontWeight: 800 }}
                  >
                    Upgrade Badges
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* MODALS */}
      <MemberBatchImporter open={importerOpen} onClose={() => setImporterOpen(false)} onSuccess={loadMembers} />
      <SpecialtyUpgradeModal
        open={specialtyModalOpen}
        onClose={() => setSpecialtyModalOpen(false)}
        onSuccess={loadMembers}
        memberId={selectedMember?.id || selectedMember?.member_id}
        memberName={selectedMember?.fullName || selectedMember?.name}
      />
    </Box>
  );
}
