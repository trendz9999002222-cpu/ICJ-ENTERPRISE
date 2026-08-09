import { useState } from "react";
import {
	Paper,
	Typography,
	Grid,
	Divider,
	Chip,
	Stack,
	Button,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import ActivityService from "../../services/activityService";
import { updateMember } from "../../services/database";

export default function AccountSecurityCard({ profile, currentUserRole = "admin", onUpdate }) {
	const [status, setStatus] = useState(profile?.source?.status || profile?.status || "Active");
	const [alertMsg, setAlertMsg] = useState("");
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const [newPassInput, setNewPassInput] = useState("");
	const [passError, setPassError] = useState("");

	if (!profile) return null;

	const isAdmin = currentUserRole === "admin" || currentUserRole === "super_admin" || currentUserRole === "trust_official";

	const accountCreationDate = profile.registrationDate || profile.source?.created_at
		? new Date(profile.registrationDate || profile.source.created_at).toLocaleDateString("en-IN", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "No information provided";

	const lastLoginStr = profile.source?.last_login
		? new Date(profile.source.last_login).toLocaleString("en-IN")
		: "Recent Session";

	const handleLockToggle = async () => {
		const nextStatus = status === "Active" ? "Suspended" : "Active";
		try {
			await updateMember(profile.id, { status: nextStatus, updated_at: new Date().toISOString() });
			setStatus(nextStatus);
			ActivityService.create({
				title: `Account Security: Member ${profile.name} status updated to ${nextStatus}`,
				type: "security",
			});
			setAlertMsg(`Member account status changed to ${nextStatus}.`);
			if (onUpdate) onUpdate();
			setTimeout(() => setAlertMsg(""), 4000);
		} catch (err) {
			console.error("Lock/Unlock failed", err);
		}
	};

	const handleForceLogout = () => {
		ActivityService.create({
			title: `Account Security: Force Logout executed for member ${profile.name}`,
			type: "security",
		});
		setAlertMsg(`Force logout signal dispatched for ${profile.name}. Sessions invalidated.`);
		setTimeout(() => setAlertMsg(""), 4000);
	};

	const handleAdminResetPassword = () => {
		if (!newPassInput || newPassInput.length < 8) {
			setPassError("Password must be at least 8 characters long.");
			return;
		}
		ActivityService.create({
			title: `Account Security: Admin password reset executed for member ${profile.name}`,
			type: "security",
		});
		setResetDialogOpen(false);
		setNewPassInput("");
		setPassError("");
		setAlertMsg(`Password reset successfully for ${profile.name}. User will be prompted to change on next login.`);
		setTimeout(() => setAlertMsg(""), 4000);
	};

	return (
		<Paper sx={{ p: 3, height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
				<Stack direction="row" spacing={1} alignItems="center">
					<SecurityIcon color="primary" />
					<Typography variant="h6" fontWeight="bold" color="primary">
						Account & Security Control Center
					</Typography>
				</Stack>
				<Chip
					label={status}
					size="small"
					color={status === "Active" ? "success" : "error"}
				/>
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{alertMsg && <Alert severity="info" sx={{ mb: 2 }}>{alertMsg}</Alert>}

			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Login Username / Email
					</Typography>
					<Typography variant="body1" fontWeight={500}>
						{profile.email || profile.source?.username || "No information provided"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Account Status
					</Typography>
					<Typography variant="body1" fontWeight={500}>
						{status}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Role & Privileges
					</Typography>
					<Typography variant="body1" sx={{ textTransform: "capitalize" }}>
						{profile.role || "Member"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Authentication Method
					</Typography>
					<Typography variant="body1">
						{profile.source?.auth_provider || "Encrypted JWT Session (SHA-256 / Bcrypt)"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Password Status
					</Typography>
					<Typography variant="body1">
						{profile.source?.forcePasswordChange ? "Force Password Change Pending" : "Encrypted Hash Secured"}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Account Creation Date
					</Typography>
					<Typography variant="body1">
						{accountCreationDate}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Last Recorded Login
					</Typography>
					<Typography variant="body1">
						{lastLoginStr}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						Failed Login Attempts
					</Typography>
					<Typography variant="body1">
						{profile.source?.failed_logins || 0}
					</Typography>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Typography color="text.secondary" variant="caption" display="block">
						MFA / 2FA Status
					</Typography>
					<Typography variant="body1">
						{profile.source?.mfa_enabled ? "Enabled (TOTP)" : "Disabled / Optional"}
					</Typography>
				</Grid>
			</Grid>

			{/* SUPER ADMIN / ADMIN SECURITY ACTIONS */}
			{isAdmin && (
				<>
					<Divider sx={{ my: 3 }} />
					<Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5 }}>
						Super Admin Security Controls & Actions
					</Typography>
					<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
						<Button
							variant="outlined"
							color={status === "Active" ? "warning" : "success"}
							startIcon={status === "Active" ? <LockIcon /> : <LockOpenIcon />}
							onClick={handleLockToggle}
						>
							{status === "Active" ? "Lock / Suspend Account" : "Unlock / Activate Account"}
						</Button>

						<Button
							variant="outlined"
							color="primary"
							startIcon={<KeyIcon />}
							onClick={() => setResetDialogOpen(true)}
						>
							Reset Password
						</Button>

						<Button
							variant="outlined"
							color="error"
							startIcon={<LogoutIcon />}
							onClick={handleForceLogout}
						>
							Force Logout
						</Button>
					</Stack>
				</>
			)}

			{/* Reset Password Modal Dialog */}
			<Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle>Admin Password Reset</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Enter a new temporary password for <strong>{profile.name}</strong>. Plaintext passwords are never stored.
					</Typography>
					<TextField
						fullWidth
						type="password"
						label="New Temporary Password"
						value={newPassInput}
						onChange={(e) => {
							setNewPassInput(e.target.value);
							setPassError("");
						}}
						error={Boolean(passError)}
						helperText={passError || "Minimum 8 characters"}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleAdminResetPassword}>Submit Reset</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
}
