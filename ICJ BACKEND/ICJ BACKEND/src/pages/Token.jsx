import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, Button } from "@mui/material";
import TokenService from "../services/tokenService";
import TokenDashboard from "../components/token/TokenDashboard";

export default function Token() {
	const [tokens, setTokens] = useState([]);
	const [form, setForm] = useState({ memberId: "", amount: "" });

	const loadTokens = async () => {
		const data = await TokenService.getAll();
		setTokens(Array.isArray(data) ? data : []);
	};

	useEffect(() => {
		TokenService.getAll().then((data) => {
			setTokens(Array.isArray(data) ? data : []);
		});
	}, []);

	const onSubmit = async () => {
		if (!form.amount) {
			alert("Token amount is required.");
			return;
		}

		await TokenService.create({
			memberId: form.memberId,
			amount: Number(form.amount),
			type: "Credit",
		});

		setForm({ memberId: "", amount: "" });
		await loadTokens();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Community Token
			</Typography>

			<Grid container spacing={3} sx={{ mt: 1 }}>
				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Issue Tokens
						</Typography>
						<TextField
							fullWidth
							label="Member ID"
							value={form.memberId}
							onChange={(event) => setForm((prev) => ({ ...prev, memberId: event.target.value }))}
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							type="number"
							label="Amount"
							value={form.amount}
							onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
							sx={{ mb: 2 }}
						/>
						<Button variant="contained" onClick={onSubmit}>
							Issue
						</Button>
					</Paper>
				</Grid>
				<Grid item xs={12} md={8}>
					<TokenDashboard tokens={tokens} />
				</Grid>
			</Grid>
		</Box>
	);
}
