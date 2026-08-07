import { useCallback, useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, MenuItem, Button, Dialog, DialogContent } from "@mui/material";
import ProfileService from "../services/profileService";
import ProfileHeader from "../components/memberprofile/ProfileHeader";
import ProfileTabs from "../components/memberprofile/ProfileTabs";
import PersonalInfo from "../components/memberprofile/PersonalInfo";
import WalletCard from "../components/memberprofile/WalletCard";
import TokenCard from "../components/memberprofile/TokenCard";
import DocumentList from "../components/memberprofile/DocumentList";
import ActivityTable from "../components/memberprofile/ActivityTable";
import MemberForm from "../components/membership/MemberForm";
import { MemberService } from "../services/memberService";

export default function MemberProfile() {
	const [profiles, setProfiles] = useState([]);
	const [selected, setSelected] = useState("");
	const [editOpen, setEditOpen] = useState(false);
	const [editForm, setEditForm] = useState({});

	const mapProfileToForm = (profile) => {
		const source = profile?.source || {};
		return {
			name: source.name || profile?.name || "",
			email: source.email || profile?.email || "",
			mobile: source.mobile || profile?.mobile || "",
			whatsapp: source.whatsapp || profile?.whatsapp || "",
			dob: source.dob || profile?.dob || "",
			gender: source.gender || profile?.gender || "",
			aadhar: source.aadhar || "",
			pan: source.pan || "",
			profession: source.profession || profile?.profession || "",
			organisation: source.organisation || profile?.organisation || "",
			country: source.country || profile?.country || "",
			address: source.address || profile?.address || "",
			address_line2: source.address_line2 || profile?.address_line2 || "",
			landmark: source.landmark || profile?.landmark || "",
			city: source.city || profile?.city || "",
			state: source.state || profile?.state || "",
			district: source.district || profile?.district || "",
			locality: source.locality || profile?.locality || "",
			post_office: source.post_office || profile?.post_office || "",
			postal_code: source.postal_code || profile?.postal_code || source.pincode || profile?.pincode || "",
			pincode: source.pincode || profile?.pincode || source.postal_code || profile?.postal_code || "",
			gst: source.gst || "",
			member_type: source.member_type || profile?.memberType || "",
			verification_status: source.verification_status || profile?.verificationStatus || "Pending",
			member_level: source.member_level || "BASIC",
			status: source.status || "Pending",
			remarks: source.remarks || profile?.remarks || "",
			profile_photo: source.profile_photo || profile?.profilePhoto || "",
		};
	};

	const loadProfiles = useCallback(async (selectedId = "") => {
		const list = await ProfileService.getProfiles();
		const rows = Array.isArray(list) ? list : [];
		setProfiles(rows);
		if (rows.length === 0) {
			setSelected("");
			return;
		}
		if (selectedId && rows.some((item) => String(item.id) === String(selectedId))) {
			setSelected(selectedId);
			return;
		}
		setSelected(rows[0].id);
	}, []);

	useEffect(() => {
		let active = true;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadProfiles()
			.then(() => {
				if (!active) return;
			})
			.catch((error) => {
				if (!active) return;
				console.error("Failed to load member profiles", error);
			});

		return () => {
			active = false;
		};
	}, [loadProfiles]);

	const current = profiles.find((item) => item.id === selected) || null;

	const onEditOpen = () => {
		if (!current) return;
		setEditForm(mapProfileToForm(current));
		setEditOpen(true);
	};

	const onEditClose = () => {
		setEditOpen(false);
	};

	const onEditChange = (event) => {
		const { name, value } = event.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSaveProfile = async () => {
		if (!current) return;
		const memberId = current.source?.id || current.id;
		await MemberService.update(memberId, editForm);
		await loadProfiles(current.id);
		onEditClose();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
				<Typography variant="h4" fontWeight="bold" gutterBottom>
					Member Profile
				</Typography>
				<Button variant="contained" size="small" onClick={onEditOpen} disabled={!current}>
					Edit Profile
				</Button>
			</Box>

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
							{profile.name}
						</MenuItem>
					))}
				</TextField>
			</Paper>

			{current ? (
				<Grid container spacing={2}>
					<Grid xs={12}>
						<ProfileHeader profile={current} />
					</Grid>
					<Grid xs={12}>
						<ProfileTabs />
					</Grid>
					<Grid xs={12} md={8}>
						<PersonalInfo profile={current} />
					</Grid>
					<Grid xs={12} md={4}>
						<Grid container spacing={2}>
							<Grid xs={12}>
								<WalletCard profile={current} />
							</Grid>
							<Grid xs={12}>
								<TokenCard profile={current} />
							</Grid>
						</Grid>
					</Grid>
					<Grid xs={12} md={6}>
						<DocumentList profile={current} />
					</Grid>
					<Grid xs={12} md={6}>
						<ActivityTable profile={current} />
					</Grid>
				</Grid>
			) : (
				<Paper sx={{ p: 3 }}>
					<Typography color="text.secondary">No member profiles available.</Typography>
				</Paper>
			)}

			<Dialog open={editOpen} onClose={onEditClose} maxWidth="md" fullWidth>
				<DialogContent>
					<MemberForm
						form={editForm}
						handleChange={onEditChange}
						saveMember={onSaveProfile}
						submitLabel="SAVE PROFILE"
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}

