/**
 * LegalCommunityFeed — ICJ Enterprise Platform
 * World-Class LawTribe / LinkedIn Hybrid Legal Community Portal with Verified Advocate Badges,
 * AI Policy Auto-Moderation, 1-Click Consultation Intake, Fee Transparency & Trust Directives.
 */

import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Chip,
  Stack, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Avatar, Divider, IconButton, Tooltip,
} from "@mui/material";

// Icons
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import GavelIcon from "@mui/icons-material/Gavel";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PolicyIcon from "@mui/icons-material/Policy";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import LegalCommunityService from "../services/legalCommunityService";
import FeeSettlementPolicyService from "../services/feeSettlementPolicyService";
import TrustGovernanceDirectiveService from "../services/trustGovernanceDirectiveService";
import VernacularVoiceAssistantService from "../services/vernacularVoiceAssistantService";

export default function LegalCommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [openPostModal, setOpenPostModal] = useState(false);
  const [openDisclaimerModal, setOpenDisclaimerModal] = useState(false);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courtTag, setCourtTag] = useState("Supreme Court of India");
  const [legalStageTag, setLegalStageTag] = useState("Digital Evidence & Constitutional Law");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const loadPosts = () => {
    const data = LegalCommunityService.getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Check if current user is suspended on load
  useEffect(() => {
    if (user && LegalCommunityService.isUserSuspended(user.email || user.id)) {
      setBlockReason("AI Policy Violation Detected: आपत्तिजनक सामग्री, नकद विज्ञापन या नियमों का उल्लंघन।");
      setOpenBlockModal(true);
    }
  }, [user]);

  const handleOpenPostComposer = () => {
    if (user && LegalCommunityService.isUserSuspended(user.email || user.id)) {
      setBlockReason("आपका खाता नियमों के उल्लंघन के कारण ब्लॉक है।");
      setOpenBlockModal(true);
      return;
    }
    setOpenDisclaimerModal(true);
  };

  const handleDisclaimerProceed = () => {
    setDisclaimerAccepted(true);
    setOpenDisclaimerModal(false);
    setOpenPostModal(true);
  };

  const handleCreatePost = () => {
    if (!title.trim() || !content.trim()) {
      alert("कृपया पोस्ट का शीर्षक व सामग्री दर्ज करें।");
      return;
    }

    try {
      LegalCommunityService.createPost({
        title,
        content,
        courtTag,
        legalStageTag,
        statuteTags: ["Section 63 BSA 2023", "Sec 498A IPC"],
      }, user);

      setOpenPostModal(false);
      setTitle("");
      setContent("");
      loadPosts();
      VernacularVoiceAssistantService.speakInHindi("आपकी विधिक पोस्ट सफलतापूर्वक प्रकाशित कर दी गई है।");
    } catch (err) {
      if (String(err.message).includes("POLICY_VIOLATION_BLOCKED") || String(err.message).includes("SUSPENDED_ACCOUNT")) {
        setOpenPostModal(false);
        setBlockReason(err.message);
        setOpenBlockModal(true);
        VernacularVoiceAssistantService.speakInHindi("नियमों के उल्लंघन के कारण आपकी पोस्ट डिलीट कर दी गई है और खाता ब्लॉक कर दिया गया है।");
      } else {
        alert(err.message);
      }
    }
  };

  const handleUpvote = (postId) => {
    LegalCommunityService.toggleUpvote(postId);
    loadPosts();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* HEADER & LAW TRIBE BANNER */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderLeft: "6px solid #10b981", bgcolor: "#f0fdf4" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ bgcolor: "#10b981", color: "#fff", width: 52, height: 52, borderRadius: 3, display: "grid", placeItems: "center" }}>
                <GroupsIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#065f46" display="flex" alignItems="center" gap={1}>
                  ⚖️ ICJ Enterprise Legal Community Portal
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  सत्यापित अधिवक्ताओं, कम्युनिटी वॉलंटियर्स व नागरिकों का सुरक्षित कानूनी मंच। 100% BCI नियम व AI ऑटो-मॉडरेशन।
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="success"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenPostComposer}
              sx={{ fontWeight: "bold", py: 1.2, px: 3, borderRadius: 2.5 }}
            >
              ✍️ 1-क्लिक नई लीगल पोस्ट लिखें
            </Button>
          </Stack>
        </Paper>

        {/* FEE TRANSPARENCY & TRUST DIRECTIVE NOTICE BANNER */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: "#eff6ff", borderColor: "#bfdbfe" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PolicyIcon color="primary" sx={{ fontSize: 32 }} />
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1e40af">
                💳 फीस पारदर्शिता व ट्रस्ट दिशा-निर्देश (Fee Settlement & Litigant Rights Policy)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                सत्यापित अधिवक्ता एग्रीमेंट का पालन करने हेतु बाध्य हैं। प्राप्त परामर्श फीस को छुपाना या डिफ़ॉल्ट करना <b>Sec 73 Contract Act</b> व बार काउंसिल आचार-संहिता का सीधा उल्लंघन है।
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* POSTS FEED */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              {posts.map((post) => (
                <Paper key={post.id} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", "&:hover": { boxShadow: 3 } }}>
                  {/* AUTHOR INFO */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={post.avatar} sx={{ width: 44, height: 44, border: "2px solid #2563eb" }} />
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {post.authorName}
                          </Typography>
                          {post.isVerifiedAdvocate && (
                            <Chip icon={<VerifiedIcon sx={{ fontSize: "1rem !important" }} />} label="सत्यापित वकील" color="primary" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }} />
                          )}
                          {post.isVerifiedVolunteer && (
                            <Chip icon={<ShieldIcon sx={{ fontSize: "1rem !important" }} />} label="वॉलंटियर" color="success" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }} />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {post.barCouncilRegNo || "Community Member"} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip label={post.courtTag} variant="outlined" color="secondary" size="small" sx={{ fontWeight: "bold", fontSize: "0.65rem" }} />
                  </Stack>

                  {/* POST CONTENT */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="#1e293b">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 2, lineHeight: 1.6 }}>
                    {post.content}
                  </Typography>

                  {/* SMART STATUTE TAGS */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={post.legalStageTag} size="small" sx={{ bgcolor: "#f1f5f9", fontWeight: "bold" }} />
                    {post.statuteTags?.map((st, i) => (
                      <Chip key={i} label={`📜 ${st}`} size="small" color="info" variant="outlined" sx={{ fontWeight: "bold" }} />
                    ))}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* ACTIONS: UPVOTE, RESPOND, CONSULTATION INTAKE */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<ThumbUpIcon />}
                        color={post.isUpvoted ? "primary" : "inherit"}
                        onClick={() => handleUpvote(post.id)}
                        sx={{ fontWeight: "bold" }}
                      >
                        {post.upvotesCount} Upvotes
                      </Button>
                      <Button size="small" startIcon={<CommentIcon />} color="inherit" sx={{ fontWeight: "bold" }}>
                        {post.commentsCount} Comments
                      </Button>
                      <Button size="small" startIcon={<ShareIcon />} color="inherit">
                        Share
                      </Button>
                    </Stack>

                    {/* 1-CLICK LEGAL CONSULTATION INTAKE BUTTON */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<EventAvailableIcon />}
                      onClick={() => alert(`📞 ${post.authorName} के साथ विधिक परामर्श दर्ज करने हेतु सहायता डेस्क पर संपर्क करें।`)}
                      sx={{ fontWeight: "bold", borderRadius: 2 }}
                    >
                      📞 1-क्लिक परामर्श लें (Book Intake)
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* SIDEBAR: COMMUNITY STATS & BCI COMPLIANCE */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "#fff" }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AccountBalanceIcon color="primary" /> कम्युनिटी गाइडलाइन्स (Ethics)
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                  1. केवल प्रामाणिक कानूनी विचार व निर्णय साझा करें।<br />
                  2. बिना रसीद या नकद फीस विज्ञापन पूरी तरह वर्जित है।<br />
                  3. नियमों का उल्लंघन करने पर <b>1-सेकंड में पोस्ट ऑटो-डिलीट व अकाउंट ब्लॉक</b> कर दिया जाएगा।
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📜 BCI Rule 36 नॉन-सॉलिसिटेशन गारंटी
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  यह प्लेटफ़ॉर्म बार काउंसिल ऑफ इंडिया नियमों के अनुसार केवल विधिक तकनीक (Legal Tech SaaS Tool) है। यहाँ वकालत मांगना या विज्ञापन प्रतिबंधित है।
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* DISCLAIMER MODAL BEFORE POSTING */}
        <Dialog open={openDisclaimerModal} onClose={() => setOpenDisclaimerModal(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#fef3c7", color: "#92400e" }}>
            📜 कानूनी डिस्क्लेमर स्वीकृति (Legal Disclaimer)
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. यह एक टेक्नोलॉजी कम्युनिटी मंच है। यहाँ साझा किए गए विचार विधिक सलाह (Legal Advice) नहीं हैं।<br />
              2. बार काउंसिल ऑफ इंडिया के नियमों के तहत वकालत का विज्ञापन या मांगना सख्त वर्जित है।<br />
              3. अनुचित या गाली-युक्त पोस्ट डालने पर <b>खाता तुरंत ब्लॉक</b> हो जाएगा।
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDisclaimerModal(false)}>रद्द करें</Button>
            <Button variant="contained" color="warning" onClick={handleDisclaimerProceed} sx={{ fontWeight: "bold" }}>
              मैं सहमत हूँ (I Agree)
            </Button>
          </DialogActions>
        </Dialog>

        {/* POST COMPOSER MODAL */}
        <Dialog open={openPostModal} onClose={() => setOpenPostModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f0fdf4", color: "#065f46" }}>
            ✍️ 1-क्लिक लीगल पोस्ट प्रकाशित करें (Publish Legal Byte)
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField fullWidth size="small" label="कोर्ट / फोरम चुनें" select value={courtTag} onChange={(e) => setCourtTag(e.target.value)} sx={{ mb: 2, mt: 1 }}>
              <MenuItem value="Supreme Court of India">Supreme Court of India</MenuItem>
              <MenuItem value="High Court of Judicature">High Court of Judicature</MenuItem>
              <MenuItem value="District & Sessions Court">District & Sessions Court</MenuItem>
              <MenuItem value="NCLT / RERA / Debt Tribunal">NCLT / RERA / Debt Tribunal</MenuItem>
            </TextField>

            <TextField fullWidth size="small" label="पोस्ट का शीर्षक (Title)" placeholder="उदा. धारा 63 BSA डिजिटल साक्ष्य प्रमाण पत्र..." value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth multiline rows={4} size="small" label="कानूनी पोस्ट सामग्री (Legal Byte Content)" placeholder="अपनी कानूनी राय या केस का सार यहाँ लिखें..." value={content} onChange={(e) => setContent(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPostModal(false)}>रद्द करें</Button>
            <Button variant="contained" color="success" onClick={handleCreatePost} sx={{ fontWeight: "bold" }}>
              प्रकाशित करें (Publish)
            </Button>
          </DialogActions>
        </Dialog>

        {/* RECOVERY & ACCOUNT SUSPENDED BLOCK MODAL */}
        <Dialog open={openBlockModal} onClose={() => setOpenBlockModal(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#fee2e2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon color="error" /> 🚨 खाता निलंबित / अकाउंट ब्लॉक (Account Suspended)
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {blockReason || "AI नीति उल्लंघन या एग्रीमेंट डिफ़ॉल्ट के कारण आपका खाता ब्लॉक कर दिया गया है।"}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              पुनः सक्रिय (Unblock) करने के लिए आपको सुपर एडमिन या लीगल गवर्नेंस डेस्क से संपर्क करना होगा।<br />
              <b>हेल्पडेस्क ईमेल:</b> support@icjenterprise.org
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained" color="error" onClick={() => setOpenBlockModal(false)}>
              ठीक है (OK)
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
