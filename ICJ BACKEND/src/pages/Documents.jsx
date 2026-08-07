import { useCallback, useEffect, useState } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Button,
	TextField,
	MenuItem,
} from "@mui/material";
import DocumentService from "../services/documentService";
import DocumentUpload from "../components/documents/DocumentUpload";
import DocumentDashboard from "../components/documents/DocumentDashboard";
import DocumentTable from "../components/documents/DocumentTable";
import DocumentPreviewDialog from "../components/documents/DocumentPreviewDialog";
import DocumentVersionDialog from "../components/documents/DocumentVersionDialog";
import DocumentAuditDialog from "../components/documents/DocumentAuditDialog";
import useAuth from "../hooks/useAuth";

export default function Documents() {
	const { profile, user } = useAuth();
	const role = String(profile?.role || user?.role || "member").toLowerCase();
	const permissions = DocumentService.getPermissions(role);

	const [dashboard, setDashboard] = useState(null);
	const [documents, setDocuments] = useState([]);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [sources, setSources] = useState({ membership: [], legal: [], finance: [], token: [] });
	const [auditRows, setAuditRows] = useState([]);

	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [moduleFilter, setModuleFilter] = useState("ALL");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [ownerFilter, setOwnerFilter] = useState("ALL");
	const [tagFilter, setTagFilter] = useState("ALL");

	const [previewOpen, setPreviewOpen] = useState(false);
	const [versionOpen, setVersionOpen] = useState(false);
	const [auditOpen, setAuditOpen] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [versions, setVersions] = useState([]);

	const loadDocuments = useCallback(async () => {
		const [rows, categoryRows, dashboardRows, sourceRows, tagRows] = await Promise.all([
			DocumentService.getAll(),
			DocumentService.getCategories(),
			DocumentService.getDashboard(),
			DocumentService.getIntegrationSources(),
			DocumentService.getTags(),
		]);
		setDocuments(Array.isArray(rows) ? rows : []);
		setCategories(Array.isArray(categoryRows) ? categoryRows : []);
		setDashboard(dashboardRows || null);
		setSources(sourceRows || { membership: [], legal: [], finance: [], token: [] });
		setTags(Array.isArray(tagRows) ? tagRows : []);
	}, []);

	useEffect(() => {
		Promise.resolve().then(loadDocuments);
	}, [loadDocuments]);

	const createDocument = async (payload) => {
		await DocumentService.create(payload, role);
		await loadDocuments();
	};

	const addCategory = async (name) => {
		if (!name.trim()) {
			alert("Category is required.");
			return;
		}
		await DocumentService.addCategory(name, role);
		await loadDocuments();
	};

	const uploadVersion = async (payload) => {
		if (!selectedDocument) return;
		await DocumentService.addVersion(selectedDocument.id, payload, role);
		setVersions(await DocumentService.getVersions(selectedDocument.id));
		await loadDocuments();
	};

	const openVersions = async (item) => {
		setSelectedDocument(item);
		setVersions(await DocumentService.getVersions(item.id));
		setVersionOpen(true);
	};

	const openAudit = async (item) => {
		setSelectedDocument(item);
		setAuditRows(await DocumentService.getAuditLog(item.id));
		setAuditOpen(true);
	};

	const openPreview = async (item) => {
		setSelectedDocument(item);
		const url = await DocumentService.getPreviewUrl(item, role);
		setPreviewUrl(url || "");
		setPreviewOpen(true);
		await loadDocuments();
	};

	const downloadDocument = async (item) => {
		const url = await DocumentService.getDownloadUrl(item, role);
		if (!url) {
			alert("Download is not available for this document.");
			return;
		}

		window.open(url, "_blank", "noopener,noreferrer");
		await loadDocuments();
	};

	const deleteDocument = async (item) => {
		if (!window.confirm("Delete this document?")) return;
		await DocumentService.remove(item.id, role);
		await loadDocuments();
	};

	const exportDocuments = () => {
		if (!permissions.canExport) {
			alert("You do not have permission to export documents.");
			return;
		}
		const payload = DocumentService.buildExport(filteredDocuments);
		const blob = new Blob([payload.content], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = payload.fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const filteredDocuments = documents.filter((item) => {
		const keyword = search.toLowerCase();
		const matchesSearch =
			!keyword ||
			String(item.documentNo || "").toLowerCase().includes(keyword) ||
			String(item.title || "").toLowerCase().includes(keyword) ||
			String(item.owner || "").toLowerCase().includes(keyword) ||
			String(item.referenceId || "").toLowerCase().includes(keyword);
		const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
		const matchesModule = moduleFilter === "ALL" || item.moduleType === moduleFilter;
		const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
		const matchesOwner = ownerFilter === "ALL" || item.owner === ownerFilter;
		const matchesTag =
			tagFilter === "ALL" ||
			(Array.isArray(item.tags) && item.tags.map((tag) => String(tag)).includes(tagFilter));

		return matchesSearch && matchesCategory && matchesModule && matchesStatus && matchesOwner && matchesTag;
	});

	const owners = [...new Set(documents.map((item) => item.owner).filter(Boolean))];

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" fontWeight="bold" gutterBottom>

			</Typography>

			<DocumentDashboard data={dashboard} />

			<Grid container spacing={3} sx={{ mt: 1 }}>
				<Grid xs={12} md={5}>
					<DocumentUpload
						onCreate={createDocument}
						categories={categories}
						integrationSources={sources}
						canUpload={permissions.canUpload}
						canManageCategories={permissions.canManageCategories}
						onAddCategory={addCategory}
					/>

					<Paper sx={{ p: 3, mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Audit Log
						</Typography>
						<Button
							variant="outlined"
							disabled={!permissions.canAuditView}
							onClick={async () => {
								setSelectedDocument(null);
								setAuditRows(await DocumentService.getAuditLog());
								setAuditOpen(true);
							}}
						>
							View Global Audit Log
						</Button>
					</Paper>
				</Grid>

				<Grid xs={12} md={7}>
					<Paper sx={{ p: 2, mb: 3 }}>
						<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
							Search and Filters
						</Typography>
						<Grid container spacing={2}>
							<Grid xs={12} md={4}>
								<TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
							</Grid>
							<Grid xs={12} md={4}>
								<TextField fullWidth select label="Category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									{categories.map((category) => (
										<MenuItem key={category} value={category}>{category}</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid xs={12} md={4}>
								<TextField fullWidth select label="Module" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									<MenuItem value="Membership">Membership</MenuItem>
									<MenuItem value="Legal">Legal</MenuItem>
									<MenuItem value="Finance">Finance</MenuItem>
									<MenuItem value="Token">Token</MenuItem>
									<MenuItem value="General">General</MenuItem>
								</TextField>
							</Grid>
							<Grid xs={12} md={4}>
								<TextField fullWidth select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									<MenuItem value="Active">Active</MenuItem>
									<MenuItem value="Draft">Draft</MenuItem>
									<MenuItem value="Archived">Archived</MenuItem>
								</TextField>
							</Grid>
							<Grid xs={12} md={4}>
								<TextField fullWidth select label="Owner" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									{owners.map((owner) => (
										<MenuItem key={owner} value={owner}>{owner}</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid xs={12} md={4}>
								<TextField fullWidth select label="Tag" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
									<MenuItem value="ALL">All</MenuItem>
									{tags.map((tag) => (
										<MenuItem key={tag} value={tag}>{tag}</MenuItem>
									))}
								</TextField>
							</Grid>
						</Grid>
						<Button variant="outlined" sx={{ mt: 2 }} onClick={exportDocuments} disabled={!permissions.canExport}>
							Export Documents
						</Button>
					</Paper>

					<DocumentTable
						rows={filteredDocuments}
						onPreview={openPreview}
						onDownload={downloadDocument}
						onOpenVersions={openVersions}
						onOpenAudit={openAudit}
						onDelete={deleteDocument}
						canDelete={permissions.canDelete}
						canVersion={permissions.canVersion}
					/>
				</Grid>
			</Grid>

			<DocumentPreviewDialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				documentItem={selectedDocument}
				previewUrl={previewUrl}
			/>

			<DocumentVersionDialog
				open={versionOpen}
				onClose={() => setVersionOpen(false)}
				documentItem={selectedDocument}
				versions={versions}
				canUploadVersion={permissions.canVersion}
				onUploadVersion={uploadVersion}
			/>

			<DocumentAuditDialog
				open={auditOpen}
				onClose={() => setAuditOpen(false)}
				documentItem={selectedDocument}
				rows={auditRows}
			/>
		</Box>
	);
}

