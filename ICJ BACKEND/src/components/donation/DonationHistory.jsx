import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function DonationHistory({ donations = [] }) {
	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Donation History
			</Typography>

			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Receipt</TableCell>
						<TableCell>Donor</TableCell>
						<TableCell>Amount</TableCell>
						<TableCell>Mode</TableCell>
						<TableCell>Date</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{donations.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} align="center">
								No donations recorded.
							</TableCell>
						</TableRow>
					) : (
						donations.map((item) => (
							<TableRow key={item.id}>
								<TableCell>{item.receiptNo}</TableCell>
								<TableCell>{item.donorName || "-"}</TableCell>
								<TableCell>{`₹${Number(item.amount || 0).toLocaleString("en-IN")}`}</TableCell>
								<TableCell>{item.paymentMode || "-"}</TableCell>
								<TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Paper>
	);
}

