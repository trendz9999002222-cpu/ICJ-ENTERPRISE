import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, MenuItem } from "@mui/material";
import ProfileService from "../services/profileService";
import ProfileHeader from "../components/memberprofile/ProfileHeader";
import ProfileTabs from "../components/memberprofile/ProfileTabs";
import PersonalInfo from "../components/memberprofile/PersonalInfo";
import WalletCard from "../components/memberprofile/WalletCard";
import TokenCard from "../components/memberprofile/TokenCard";
import DocumentList from "../components/memberprofile/DocumentList";
import ActivityTable from "../components/memberprofile/ActivityTable";

export default function MemberProfile() {
	const [profiles, setProfiles] = useState([]);
	const [selected, setSelected] = useState("");

	useEffect(() => {
		let active = true;

		ProfileService.getProfiles()
			.then((list) => {
				if (!active) return;
				const rows = Array.isArray(list) ? list : [];
				setProfiles(rows);
				if (rows.length > 0) {
					setSelected(rows[0].id);
				}
			})
			.catch((error) => {
				if (!active) return;
				console.error("Failed to load member profiles", error);
			});

		return () => {
			active = false;
		};
	}, []);

	const current = profiles.find((item) => item.id === selected) || null;

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Member Profile
			</Typography>

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
					<Grid item xs={12}>
						<ProfileHeader profile={current} />
					</Grid>
					<Grid item xs={12}>
						<ProfileTabs />
					</Grid>
					<Grid item xs={12} md={8}>
						<PersonalInfo profile={current} />
					</Grid>
					<Grid item xs={12} md={4}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<WalletCard profile={current} />
							</Grid>
							<Grid item xs={12}>
								<TokenCard profile={current} />
							</Grid>
						</Grid>
					</Grid>
					<Grid item xs={12} md={6}>
						<DocumentList profile={current} />
					</Grid>
					<Grid item xs={12} md={6}>
						<ActivityTable profile={current} />
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
