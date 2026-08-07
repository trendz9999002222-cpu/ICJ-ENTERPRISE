import { useState } from "react";
import { Paper, Typography, Grid, TextField, Button, MenuItem } from "@mui/material";

export default function DocumentUpload({
	onCreate,
	categories = [],
	integrationSources,
	canUpload,
	canManageCategories,
	onAddCategory,
}) {
	const [form, setForm] = useState({
		title: "",
		category: "",
		moduleType: "Membership",
		referenceId: "",
		tags: "",
		owner: "",
		status: "Active",
		description: "",
		fileName: "",
		file: null,
	});
	const [newCategory, setNewCategory] = useState("");

	const selectedCategory = categories.includes(form.category) ? form.category : (categories[0] || "");
	const activeCategory = form.category || selectedCategory;

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onModuleTypeChange = (value) => {
		setForm((prev) => ({ ...prev, moduleType: value, referenceId: "" }));
	};

	const getReferenceOptions = () => {
		if (form.moduleType === "Membership") return integrationSources?.membership || [];
		if (form.moduleType === "Legal") return integrationSources?.legal || [];
		if (form.moduleType === "Finance") return integrationSources?.finance || [];
		if (form.moduleType === "Token") return integrationSources?.token || [];
		return [];
	};

	const onSubmit = () => {
		if (!form.title.trim()) {
			alert("Document title is required.");
			return;
		}

		onCreate?.({ ...form, category: activeCategory });
		setForm({
			title: "",
			category: "",
			moduleType: "Membership",
			referenceId: "",
			tags: "",
			owner: "",
			status: "Active",
			description: "",
			fileName: "",
			file: null,
		});
	};

	const onFileChange = (event) => {
		const file = event.target.files?.[0] || null;
		setForm((prev) => ({
			...prev,
			file,
			fileName: file?.name || prev.fileName,
		}));
	};

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Document Upload
			</Typography>
			<Grid container spacing={2}>
				<Grid xs={12} md={12}>
					<TextField fullWidth label="Title" name="title" value={form.title} onChange={onChange} />
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth select label="Category" name="category" value={activeCategory} onChange={onChange}>
						{categories.map((category) => (
							<MenuItem key={category} value={category}>{category}</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth select label="Module" name="moduleType" value={form.moduleType} onChange={(event) => onModuleTypeChange(event.target.value)}>
						<MenuItem value="Membership">Membership</MenuItem>
						<MenuItem value="Legal">Legal</MenuItem>
						<MenuItem value="Finance">Finance</MenuItem>
						<MenuItem value="Token">Token</MenuItem>
						<MenuItem value="General">General</MenuItem>
					</TextField>
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth select label="Reference" name="referenceId" value={form.referenceId} onChange={onChange}>
						<MenuItem value="">Not linked</MenuItem>
						{getReferenceOptions().map((option) => (
							<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth label="Owner" name="owner" value={form.owner} onChange={onChange} />
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth label="Tags (comma separated)" name="tags" value={form.tags} onChange={onChange} />
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth select label="Status" name="status" value={form.status} onChange={onChange}>
						<MenuItem value="Active">Active</MenuItem>
						<MenuItem value="Draft">Draft</MenuItem>
						<MenuItem value="Archived">Archived</MenuItem>
					</TextField>
				</Grid>
				<Grid xs={12} md={6}>
					<TextField fullWidth label="File Name" name="fileName" value={form.fileName} onChange={onChange} />
				</Grid>
				<Grid xs={12}>
					<TextField
						fullWidth
						multiline
						minRows={2}
						label="Description"
						name="description"
						value={form.description}
						onChange={onChange}
					/>
				</Grid>
				<Grid xs={12}>
					<Button variant="outlined" component="label">
						Choose File
						<input hidden type="file" onChange={onFileChange} />
					</Button>
				</Grid>
				<Grid xs={12}>
					<Button variant="contained" onClick={onSubmit} disabled={!canUpload}>
						Save Document
					</Button>
				</Grid>
				{canManageCategories ? (
					<>
						<Grid xs={12} md={8}>
							<TextField fullWidth label="Add Category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} />
						</Grid>
						<Grid xs={12} md={4}>
							<Button
								fullWidth
								variant="outlined"
								sx={{ height: 56 }}
								onClick={() => {
									onAddCategory?.(newCategory);
									setNewCategory("");
								}}
							>
								Create Category
							</Button>
						</Grid>
					</>
				) : null}
			</Grid>
		</Paper>
	);
}

