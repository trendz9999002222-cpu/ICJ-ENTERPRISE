import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, Button } from "@mui/material";
import DonationService from "../services/donationService";
import DonationHistory from "../components/donation/DonationHistory";

export default function Donations() {
	const [donations, setDonations] = useState([]);
	const [form, setForm] = useState({ donorName: "", amount: "", paymentMode: "Cash" });

	const loadDonations = async () => {
		const data = await DonationService.getAll();
		setDonations(Array.isArray(data) ? data : []);
	};

	useEffect(() => {
		DonationService.getAll().then((data) => {
			setDonations(Array.isArray(data) ? data : []);
		});
	}, []);

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSubmit = async () => {
		if (!form.amount) {
			alert("Donation amount is required.");
			return;
		}

		await DonationService.create({
			donorName: form.donorName,
			amount: Number(form.amount),
			paymentMode: form.paymentMode,
		});

		setForm({ donorName: "", amount: "", paymentMode: "Cash" });
		await loadDonations();
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Donations
			</Typography>

			<Grid container spacing={3} sx={{ mt: 1 }}>
				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Record Donation
						</Typography>
						<TextField fullWidth label="Donor Name" name="donorName" value={form.donorName} onChange={onChange} sx={{ mb: 2 }} />
						<TextField fullWidth label="Amount" name="amount" type="number" value={form.amount} onChange={onChange} sx={{ mb: 2 }} />
						<TextField fullWidth label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={onChange} sx={{ mb: 2 }} />
						<Button variant="contained" onClick={onSubmit}>
							Save Donation
						</Button>
					</Paper>
				</Grid>

				<Grid item xs={12} md={8}>
					<DonationHistory donations={donations} />
				</Grid>
			</Grid>
		</Box>
	);
}
