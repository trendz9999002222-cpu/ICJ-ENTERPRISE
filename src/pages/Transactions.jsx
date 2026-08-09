import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import DonationService from "../services/donationService";
import TokenService from "../services/tokenService";

export default function Transactions() {
	const [donations, setDonations] = useState([]);
	const [tokens, setTokens] = useState([]);

	useEffect(() => {
		Promise.all([DonationService.getAll(), TokenService.getAll()]).then(([donationRows, tokenRows]) => {
			setDonations(Array.isArray(donationRows) ? donationRows : []);
			setTokens(Array.isArray(tokenRows) ? tokenRows : []);
		});
	}, []);

	const rows = useMemo(() => {
		const donationRows = donations.map((item) => ({
			id: `don-${item.id}`,
			type: "Donation",
			ref: item.receiptNo,
			amount: Number(item.amount || 0),
			timestamp: item.createdAt,
		}));

		const tokenRows = tokens.map((item) => ({
			id: `tok-${item.id}`,
			type: "Token",
			ref: item.tokenNo,
			amount: Number(item.amount || 0),
			timestamp: item.createdAt,
		}));

		return [...donationRows, ...tokenRows].sort(
			(a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
		);
	}, [donations, tokens]);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>
				Transactions
			</Typography>

			<Paper sx={{ p: 3, mt: 2 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Type</TableCell>
							<TableCell>Reference</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									No transactions available.
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => (
								<TableRow key={row.id}>
									<TableCell>{row.type}</TableCell>
									<TableCell>{row.ref}</TableCell>
									<TableCell>{`₹${row.amount.toLocaleString("en-IN")}`}</TableCell>
									<TableCell>{row.timestamp ? new Date(row.timestamp).toLocaleString("en-IN") : "-"}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Paper>
		</Box>
	);
}
