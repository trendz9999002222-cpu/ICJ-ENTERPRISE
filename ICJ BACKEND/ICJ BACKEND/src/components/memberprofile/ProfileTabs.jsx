import { Paper, Typography, Stack, Chip } from "@mui/material";

export default function ProfileTabs({ activeTab = "all", onTabChange, availableSections = {} }) {
	const tabs = [
		{ id: "all", label: "Overview", show: true },
		{ id: "personal", label: "Personal & Contact", show: true },
		{ id: "address", label: "Address", show: Boolean(availableSections.address) },
		{ id: "membership", label: "Membership", show: Boolean(availableSections.membership) },
		{ id: "notes", label: "📌 Pinned Notes", show: true },
		{ id: "communication", label: "💬 Communication", show: true },
		{ id: "kyc", label: "KYC & Identity", show: Boolean(availableSections.kyc) },
		{ id: "professional", label: "Professional", show: Boolean(availableSections.professional) },
		{ id: "legal", label: "Legal & Cases", show: Boolean(availableSections.legal), count: availableSections.legalCount },
		{ id: "advocate", label: "Advocate Info", show: Boolean(availableSections.advocate) },
		{ id: "documents", label: "Documents", show: true, count: availableSections.docCount },
		{ id: "wallet", label: "Wallet", show: true },
		{ id: "tokens", label: "Tokens", show: true },
		{ id: "activity", label: "Activity", show: true },
		{ id: "security", label: "Account & Security", show: true },
	];

	return (
		<Paper sx={{ p: 2 }}>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
				Profile Sections
			</Typography>
			<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
				{tabs
					.filter((tab) => tab.show !== false)
					.map((tab) => {
						const isActive = activeTab === tab.id;
						const labelStr = tab.count ? `${tab.label} (${tab.count})` : tab.label;
						return (
							<Chip
								key={tab.id}
								size="small"
								label={labelStr}
								color={isActive ? "primary" : "default"}
								variant={isActive ? "filled" : "outlined"}
								onClick={() => onTabChange && onTabChange(tab.id)}
								sx={{ cursor: "pointer", fontWeight: isActive ? "bold" : "normal" }}
							/>
						);
					})}
			</Stack>
		</Paper>
	);
}
