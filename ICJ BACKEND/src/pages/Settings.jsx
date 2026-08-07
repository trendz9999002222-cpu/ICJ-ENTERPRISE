import { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, FormControlLabel, Switch, Button } from "@mui/material";
import SettingsService from "../services/settingsService";

export default function Settings() {
	const [config, setConfig] = useState({
		enableNotifications: true,
		enableAuditLog: true,
		compactView: false,
	});

	useEffect(() => {
		SettingsService.get().then((data) => {
			setConfig(data);
		});
	}, []);

	const onToggle = (event) => {
		const { name, checked } = event.target;
		setConfig((prev) => ({ ...prev, [name]: checked }));
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				System Settings
			</Typography>

			<Paper sx={{ p: 3, mt: 2 }}>
				<Grid container spacing={2}>
					<Grid xs={12}>
						<FormControlLabel
							control={<Switch checked={config.enableNotifications} name="enableNotifications" onChange={onToggle} />}
							label="Enable notifications"
						/>
					</Grid>
					<Grid xs={12}>
						<FormControlLabel
							control={<Switch checked={config.enableAuditLog} name="enableAuditLog" onChange={onToggle} />}
							label="Enable audit log"
						/>
					</Grid>
					<Grid xs={12}>
						<FormControlLabel
							control={<Switch checked={config.compactView} name="compactView" onChange={onToggle} />}
							label="Use compact dashboard view"
						/>
					</Grid>
					<Grid xs={12}>
						<Button variant="contained" onClick={async () => {
							await SettingsService.save(config);
							alert("Settings saved successfully.");
						}}>
							Save Settings
						</Button>
					</Grid>
				</Grid>
			</Paper>
		</Box>
	);
}

