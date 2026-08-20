import { Paper, Typography, Grid, Divider, Chip, Stack } from "@mui/material";
import {
	normalizeMemberId,
	normalizeMemberType,
	normalizeMembershipLevel,
} from "../../services/memberService.js";

export default function MembershipCard({ profile }) {
	if (!profile) return null;

	const memberIdDisplay = normalizeMemberId(profile) || profile.memberId || profile.id || "No information provided";
	const displayMemberType = normalizeMemberType(profile.memberType || profile.rawMemberType);
	const displayMemberLevel = normalizeMembershipLevel(profile.memberLevel || profile.rawMemberLevel);

	const regDateStr = profile.registrationDate
		? new Date(profile.registrationDate).toLocaleDateString("en-IN", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "";

	const validTillStr = profile.validTill
		? new Date(profile.validTill).toLocaleDateString("en-IN", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "";

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
				Membership & System Status
			</Typography>
			<Divider sx={{ mb: 2 }} />

			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Member ID / Code
					</Typography>
					<Typography variant="body1" fontWeight={600}>
						{memberIdDisplay}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Member Type
					</Typography>
					<Typography variant="body1">
						{displayMemberType}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Membership Level
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
						<Chip
							label={displayMemberLevel}
							size="small"
							color={
								displayMemberLevel === "EXECUTIVE"
									? "secondary"
									: displayMemberLevel === "PRO"
									? "primary"
									: "default"
							}
						/>
					</Stack>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Role / Privilege Level
					</Typography>
					<Typography variant="body1" sx={{ textTransform: "capitalize" }}>
						{profile.role || "Member"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Verification Status
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
						<Chip
							label={profile.verificationStatus || "Pending"}
							size="small"
							color={
								profile.verificationStatus === "Approved" || profile.verificationStatus === "Verified"
									? "success"
									: profile.verificationStatus === "Rejected"
									? "error"
									: "warning"
							}
						/>
					</Stack>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Registration Date
					</Typography>
					<Typography variant="body1">
						{regDateStr || "No information provided"}
					</Typography>
				</Grid>

				{validTillStr && (
					<Grid item xs={12} sm={6}>
						<Typography color="text.secondary" variant="caption" display="block">
							Validity Period
						</Typography>
						<Typography variant="body1">Valid till {validTillStr}</Typography>
					</Grid>
				)}

				{profile.remarks && (
					<Grid item xs={12}>
						<Typography color="text.secondary" variant="caption" display="block">
							Remarks / Governance Notes
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{profile.remarks}
						</Typography>
					</Grid>
				)}
			</Grid>
		</Paper>
	);
}
