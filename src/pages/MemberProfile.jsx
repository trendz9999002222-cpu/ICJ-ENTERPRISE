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
import ProfileTabs from "../components/memberprofile/ProfileTabs";
import PersonalInfo from "../components/memberprofile/PersonalInfo";
import AddressCard from "../components/memberprofile/AddressCard";
import MembershipCard from "../components/memberprofile/MembershipCard";
import KYCCard from "../components/memberprofile/KYCCard";
import ProfessionalCard from "../components/memberprofile/ProfessionalCard";
import LegalCasesCard from "../components/memberprofile/LegalCasesCard";
import AdvocateCard from "../components/memberprofile/AdvocateCard";
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
						<ProfileHeader profile={current} />
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
										<ProfessionalCard profile={current} />
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
		</Box>
	);
}
