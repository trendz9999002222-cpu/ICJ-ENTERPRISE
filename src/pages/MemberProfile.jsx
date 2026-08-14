import { useEffect, useState, useMemo } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	TextField,
	MenuItem,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Stack,
	CircularProgress,
	Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkIcon from "@mui/icons-material/Work";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import HistoryIcon from "@mui/icons-material/History";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SecurityIcon from "@mui/icons-material/Security";
import PushPinIcon from "@mui/icons-material/PushPin";
import ForumIcon from "@mui/icons-material/Forum";

import useAuth from "../hooks/useAuth";
import ProfileService from "../services/profileService";
import AuthService from "../services/authService";
import ProfileHeader from "../components/memberprofile/ProfileHeader";
import MasterDataService from "../services/masterDataService";
import MemberService from "../services/memberService";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Autocomplete } from "@mui/material";
import ProfileTabs from "../components/memberprofile/ProfileTabs";
import PersonalInfo from "../components/memberprofile/PersonalInfo";
import AddressCard from "../components/memberprofile/AddressCard";
import MembershipCard from "../components/memberprofile/MembershipCard";
import EmailVerificationStudio from "../components/common/EmailVerificationStudio.jsx";
import KYCCard from "../components/memberprofile/KYCCard";
import ProfessionalCard from "../components/memberprofile/ProfessionalCard";
import LegalCasesCard from "../components/memberprofile/LegalCasesCard";
import AdvocateCard from "../components/memberprofile/AdvocateCard";
import AdvocatePracticeTeamCard from "../components/memberprofile/AdvocatePracticeTeamCard";
import WalletCard from "../components/memberprofile/WalletCard";
import TokenCard from "../components/memberprofile/TokenCard";
import DocumentList from "../components/memberprofile/DocumentList";
import ActivityTable from "../components/memberprofile/ActivityTable";
import AccountSecurityCard from "../components/memberprofile/AccountSecurityCard";
import PinnedNotesCard from "../components/memberprofile/PinnedNotesCard";
import CommunicationHistoryCard from "../components/memberprofile/CommunicationHistoryCard";

export default function MemberProfile() {
	const { user: authUser, loading: authLoading } = useAuth();
	const [profiles, setProfiles] = useState([]);
	const [selected, setSelected] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [currentUser, setCurrentUser] = useState(null);

	// Edit Profile Modal States
	const [editOpen, setEditOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		category: "",
		forums: [],
		coreSpecialty: "",
		additionalSpecialties: []
	});

	// Suggestion Modal States
	const [suggestOpen, setSuggestOpen] = useState(false);
	const [suggestType, setSuggestType] = useState("forum"); // "forum" | "specialty"
	const [suggestName, setSuggestName] = useState("");
	const [suggestParentCategory, setSuggestParentCategory] = useState("Specialized");

	const handleOpenEdit = () => {
		if (!current) return;
		setEditForm({
			category: current.category || "",
			forums: Array.isArray(current.forums) ? current.forums : (current.forums && current.forums !== "Not Selected" ? String(current.forums).split(", ") : []),
			coreSpecialty: current.coreSpecialty && current.coreSpecialty !== "Not Selected" ? current.coreSpecialty : "",
			additionalSpecialties: Array.isArray(current.additionalSpecialties) ? current.additionalSpecialties : []
		});
		setEditOpen(true);
	};

	const handleSaveProfile = async () => {
		try {
			const targetId = current.id || current.memberId;
			await MemberService.update(targetId, {
				category: editForm.category,
				forums: editForm.forums,
				coreSpecialty: editForm.coreSpecialty,
				additionalSpecialties: editForm.additionalSpecialties
			});
			alert("Profile updated successfully!");
			setEditOpen(false);
			refreshProfileData();
		} catch (err) {
			alert("Failed to update profile: " + err.message);
		}
	};

	const handleSendSuggestion = () => {
		if (!suggestName.trim()) {
			alert("Please enter a name.");
			return;
		}
		const res = MasterDataService.suggestNewEntry(suggestType, suggestName, suggestParentCategory);
		if (res.success) {
			alert("Suggestion submitted successfully for Admin review!");
			setSuggestName("");
			setSuggestOpen(false);
		} else {
			alert(res.message);
		}
	};
	const [expanded, setExpanded] = useState({
		personal: true,
		address: true,
		membership: true,
		notes: true,
		communication: true,
		kyc: true,
		professional: true,
		legal: true,
		advocate: true,
		documents: true,
		wallet: true,
		activity: true,
		security: true,
	});

	const activeUser = currentUser || authUser;
	// FAIL CLOSED: Default role is strictly "member", NEVER "admin"
	const currentUserRole = String(activeUser?.role || "member").toLowerCase();
	const isAdmin = ["admin", "super_admin", "administrator"].includes(currentUserRole);

	useEffect(() => {
		let active = true;

		Promise.all([
			ProfileService.getProfiles(),
			AuthService.getCurrentUser().catch(() => null),
		]).then(([list, user]) => {
			if (!active) return;
			const rows = Array.isArray(list) ? list : [];
			setProfiles(rows);
			const effectiveUser = user || authUser;
			if (effectiveUser) setCurrentUser(effectiveUser);

			const roleStr = String(effectiveUser?.role || "member").toLowerCase();
			const isUserAdmin = ["admin", "super_admin", "administrator"].includes(roleStr);

			if (isUserAdmin) {
				if (rows.length > 0) {
					setSelected(rows[0].id);
				}
			} else if (effectiveUser) {
				const myId = effectiveUser.id || effectiveUser.member_id || effectiveUser.memberId;
				setSelected(myId);
			}
		}).catch((error) => {
			if (!active) return;
			console.error("Failed to load member profiles", error);
		});

		return () => {
			active = false;
		};
	}, [authUser]);

	// SECURITY ENFORCEMENT:
	// Admin users can inspect selected profiles from the dropdown.
	// Non-admin members are strictly locked to their OWN profile ID or Email.
	const current = useMemo(() => {
		if (!profiles.length) return null;

		if (isAdmin) {
			return (
				profiles.find(
					(item) => String(item.id) === String(selected) || String(item.memberId) === String(selected)
				) || profiles[0] || null
			);
		}

		const myId = String(activeUser?.id || activeUser?.member_id || activeUser?.memberId || "").toLowerCase();
		const myEmail = String(activeUser?.email || "").toLowerCase();

		return (
			profiles.find((item) => {
				const itemId = String(item.id || item.member_id || item.memberId || "").toLowerCase();
				const itemEmail = String(item.email || "").toLowerCase();
				return (myId && itemId === myId) || (myEmail && itemEmail === myEmail);
			}) || null
		);
	}, [profiles, selected, isAdmin, activeUser]);

	const availableSections = current
		? {
				address: Boolean(current.address || current.city || current.district || current.state || current.pincode),
				membership: true,
				kyc: Boolean(current.aadhar || current.pan || current.gst),
				professional: Boolean(current.profession || current.organisation || current.experience),
				legal: Boolean(current.linkedCases && current.linkedCases.length > 0),
				legalCount: current.linkedCases ? current.linkedCases.length : 0,
				advocate: Boolean(current.linkedAdvocate),
				docCount: (current.linkedDocuments?.length || 0) + (current.aadhar ? 1 : 0) + (current.pan ? 1 : 0),
		  }
		: {};

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
	};

	const handleTabChange = (tabId) => {
		setActiveTab(tabId);
		if (tabId === "all") {
			setExpanded({
				personal: true,
				address: true,
				membership: true,
				notes: true,
				communication: true,
				kyc: true,
				professional: true,
				legal: true,
				advocate: true,
				documents: true,
				wallet: true,
				activity: true,
				security: true,
			});
		} else {
			setExpanded((prev) => ({
				...prev,
				[tabId]: true,
			}));
		}
	};

	const refreshProfileData = async () => {
		try {
			const list = await ProfileService.getProfiles();
			setProfiles(Array.isArray(list) ? list : []);
		} catch (err) {
			console.error("Failed to refresh profile data", err);
		}
	};

	if (authLoading) {
		return (
			<Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!activeUser) {
		return (
			<Box sx={{ p: 3 }}>
				<Paper sx={{ p: 3 }}>
					<Typography color="error" fontWeight="bold">
						Access Denied: User session cannot be verified.
					</Typography>
				</Paper>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Member Profile
			</Typography>

			{/* MEMBER SELECTOR: Rendered ONLY for Authorized Admin Roles */}
			{isAdmin && (
				<Paper sx={{ p: 3, mt: 2, mb: 2 }}>
					<TextField
						fullWidth
						select
						label="Select Member"
						value={selected}
						onChange={(event) => setSelected(event.target.value)}
					>
						{profiles.map((profile) => (
							<MenuItem key={profile.id} value={profile.id}>
								{profile.name} {profile.memberId ? `(${profile.memberId})` : ""}
							</MenuItem>
						))}
					</TextField>
				</Paper>
			)}

			{current ? (
				<Grid container spacing={2}>
					{/* PROFILE HEADER */}
					<Grid item xs={12}>
						<Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
							<Box sx={{ flexGrow: 1 }}>
								<ProfileHeader profile={current} />
							</Box>
							<Button variant="contained" color="primary" onClick={handleOpenEdit} sx={{ fontWeight: "bold", height: "fit-content", py: 1.5 }}>
								✏️ Edit Profile
							</Button>
						</Stack>
					</Grid>

					{/* POST-LOGIN EMAIL SELF-CORRECTION & VERIFICATION WIDGET */}
					<Grid item xs={12}>
						<EmailVerificationStudio user={current} onUpdateUser={(updated) => setSelected(updated.id)} />
					</Grid>

					{/* DYNAMIC SECTION TABS */}
					<Grid item xs={12}>
						<ProfileTabs
							activeTab={activeTab}
							onTabChange={handleTabChange}
							availableSections={availableSections}
						/>
					</Grid>

					{/* COLLAPSIBLE ACCORDION SECTIONS */}
					<Grid item xs={12}>
						<Stack spacing={2}>
							{/* 1. BASIC / PERSONAL INFORMATION */}
							{(activeTab === "all" || activeTab === "personal") && (
								<Accordion expanded={Boolean(expanded.personal)} onChange={handleAccordionChange("personal")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<PersonIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Basic & Contact Information
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<PersonalInfo profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 2. ADDRESS INFORMATION */}
							{availableSections.address && (activeTab === "all" || activeTab === "address") && (
								<Accordion expanded={Boolean(expanded.address)} onChange={handleAccordionChange("address")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<HomeIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Address Information
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<AddressCard profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 3. MEMBERSHIP INFORMATION */}
							{(activeTab === "all" || activeTab === "membership") && (
								<Accordion expanded={Boolean(expanded.membership)} onChange={handleAccordionChange("membership")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<CardMembershipIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Membership & System Metadata
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<MembershipCard profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 4. PINNED & STICKY NOTES */}
							{(activeTab === "all" || activeTab === "notes") && (
								<Accordion expanded={Boolean(expanded.notes)} onChange={handleAccordionChange("notes")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<PushPinIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												📌 Pinned & Sticky Notes
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<PinnedNotesCard profile={current} currentUserRole={currentUserRole} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 5. COMMUNICATION & INTERACTION HISTORY */}
							{(activeTab === "all" || activeTab === "communication") && (
								<Accordion expanded={Boolean(expanded.communication)} onChange={handleAccordionChange("communication")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<ForumIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												💬 Communication & Interaction History
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<CommunicationHistoryCard profile={current} currentUserRole={currentUserRole} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 6. KYC & IDENTITY INFORMATION */}
							{availableSections.kyc && (activeTab === "all" || activeTab === "kyc") && (
								<Accordion expanded={Boolean(expanded.kyc)} onChange={handleAccordionChange("kyc")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<VerifiedUserIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												KYC & Identity Documents
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<KYCCard profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 7. PROFESSIONAL INFORMATION */}
							{availableSections.professional && (activeTab === "all" || activeTab === "professional") && (
								<Accordion expanded={Boolean(expanded.professional)} onChange={handleAccordionChange("professional")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<WorkIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Professional Information
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<Stack spacing={3}>
											<ProfessionalCard profile={current} />
											<AdvocatePracticeTeamCard profile={current} />
										</Stack>
									</AccordionDetails>
								</Accordion>
							)}

							{/* 8. LEGAL CASES & MATTERS */}
							{availableSections.legal && (activeTab === "all" || activeTab === "legal") && (
								<Accordion expanded={Boolean(expanded.legal)} onChange={handleAccordionChange("legal")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<GavelIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Legal Matters & Cases ({current.linkedCases?.length || 0})
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<LegalCasesCard profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 9. ADVOCATE INFORMATION */}
							{availableSections.advocate && (activeTab === "all" || activeTab === "advocate") && (
								<Accordion expanded={Boolean(expanded.advocate)} onChange={handleAccordionChange("advocate")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<GavelIcon color="secondary" />
											<Typography variant="h6" fontWeight="bold">
												Advocate & Counsel Assignment
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<AdvocateCard profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 10. DOCUMENTS */}
							{(activeTab === "all" || activeTab === "documents") && (
								<Accordion expanded={Boolean(expanded.documents)} onChange={handleAccordionChange("documents")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<FolderIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Submitted & Linked Documents
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<DocumentList profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 11. WALLET & TOKENS */}
							{(activeTab === "all" || activeTab === "wallet" || activeTab === "tokens") && (
								<Accordion expanded={Boolean(expanded.wallet)} onChange={handleAccordionChange("wallet")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<AccountBalanceWalletIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Wallet Balance & Token Ledger
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<Grid container spacing={2}>
											<Grid item xs={12} md={6}>
												<WalletCard profile={current} />
											</Grid>
											<Grid item xs={12} md={6}>
												<TokenCard profile={current} />
											</Grid>
										</Grid>
									</AccordionDetails>
								</Accordion>
							)}

							{/* 12. ACTIVITY HISTORY */}
							{(activeTab === "all" || activeTab === "activity") && (
								<Accordion expanded={Boolean(expanded.activity)} onChange={handleAccordionChange("activity")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<HistoryIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Activity & Audit History
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<ActivityTable profile={current} />
									</AccordionDetails>
								</Accordion>
							)}

							{/* 13. ACCOUNT & SECURITY */}
							{(activeTab === "all" || activeTab === "security") && (
								<Accordion expanded={Boolean(expanded.security)} onChange={handleAccordionChange("security")} sx={{ borderRadius: 2, overflow: "hidden" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<SecurityIcon color="primary" />
											<Typography variant="h6" fontWeight="bold">
												Account & Security Control Center
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<AccountSecurityCard
											profile={current}
											currentUserRole={currentUserRole}
											onUpdate={refreshProfileData}
										/>
									</AccordionDetails>
								</Accordion>
							)}
						</Stack>
					</Grid>
				</Grid>
			) : (
				<Paper sx={{ p: 3 }}>
					<Typography color="text.secondary">No member profiles available.</Typography>
				</Paper>
			)}

			{/* ─── MODAL: EDIT PROFILE ───────────────────────── */}
			<Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: "bold" }}>✏️ Edit Professional Profile</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3} sx={{ pt: 1 }}>
						{/* Category Selector */}
						<FormControl fullWidth>
							<InputLabel>Member Category / श्रेणी</InputLabel>
							<Select
								value={editForm.category}
								label="Member Category / श्रेणी"
								onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
							>
								{MasterDataService.getCategories().map(cat => (
									<MenuItem key={cat} value={cat}>{cat}</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Court Forums Searchable Multi-Select */}
						<Box>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="body2" fontWeight="bold">Court Forums / न्यायालय फोरम</Typography>
								<Button size="small" onClick={() => { setSuggestType("forum"); setSuggestOpen(true); }}>
									💡 Suggest New Forum
								</Button>
							</Stack>
							<Autocomplete
								multiple
								options={MasterDataService.getForums().map(f => f.name)}
								value={editForm.forums}
								onChange={(event, newValue) => {
									setEditForm(prev => ({ ...prev, forums: newValue }));
								}}
								renderInput={(params) => (
									<TextField {...params} placeholder="Search and Select Forums" />
								)}
							/>
						</Box>

						{/* Core Specialty Searchable Selector */}
						<Box>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
								<Typography variant="body2" fontWeight="bold">Core Specialty / मुख्य विशेषता</Typography>
								<Button size="small" onClick={() => { setSuggestType("specialty"); setSuggestOpen(true); }}>
									💡 Suggest New Specialty
								</Button>
							</Stack>
							<Autocomplete
								options={MasterDataService.getSpecialties().map(s => s.name)}
								value={editForm.coreSpecialty}
								onChange={(event, newValue) => {
									setEditForm(prev => ({ ...prev, coreSpecialty: newValue || "" }));
								}}
								renderInput={(params) => (
									<TextField {...params} placeholder="Search and Select Core Specialty" />
								)}
							/>
						</Box>

						{/* Additional Specialties Multi-Select */}
						<Box>
							<Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Additional Specialties / अतिरिक्त विशेषताएं</Typography>
							<Autocomplete
								multiple
								options={MasterDataService.getSpecialties().map(s => s.name)}
								value={editForm.additionalSpecialties}
								onChange={(event, newValue) => {
									setEditForm(prev => ({ ...prev, additionalSpecialties: newValue }));
								}}
								renderInput={(params) => (
									<TextField {...params} placeholder="Search and Select Specialties" />
								)}
							/>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setEditOpen(false)}>Cancel</Button>
					<Button variant="contained" color="success" onClick={handleSaveProfile} sx={{ fontWeight: "bold" }}>
						SAVE CHANGES
					</Button>
				</DialogActions>
			</Dialog>

			{/* ─── MODAL: SUGGEST NEW ENTRY ───────────────────────── */}
			<Dialog open={suggestOpen} onClose={() => setSuggestOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: "bold" }}>💡 Suggest New Entity</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={2} sx={{ pt: 1 }}>
						<TextField
							fullWidth
							label="Name / नाम"
							value={suggestName}
							onChange={(e) => setSuggestName(e.target.value)}
						/>
						{suggestType === "specialty" && (
							<FormControl fullWidth>
								<InputLabel>Parent Category / मूल श्रेणी</InputLabel>
								<Select
									value={suggestParentCategory}
									label="Parent Category / मूल श्रेणी"
									onChange={(e) => setSuggestParentCategory(e.target.value)}
								>
									<MenuItem value="Criminal">Criminal</MenuItem>
									<MenuItem value="Civil">Civil</MenuItem>
									<MenuItem value="Property / Revenue">Property / Revenue</MenuItem>
									<MenuItem value="Family">Family</MenuItem>
									<MenuItem value="Commercial / Corporate">Commercial / Corporate</MenuItem>
									<MenuItem value="Banking / Finance">Banking / Finance</MenuItem>
									<MenuItem value="Tax">Tax</MenuItem>
									<MenuItem value="ADR">ADR</MenuItem>
									<MenuItem value="Public / Constitutional">Public / Constitutional</MenuItem>
									<MenuItem value="Labour">Labour</MenuItem>
									<MenuItem value="Consumer">Consumer</MenuItem>
									<MenuItem value="Specialized">Specialized</MenuItem>
								</Select>
							</FormControl>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setSuggestOpen(false)}>Cancel</Button>
					<Button variant="contained" color="primary" onClick={handleSendSuggestion} sx={{ fontWeight: "bold" }}>
						SEND SUGGESTION
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
