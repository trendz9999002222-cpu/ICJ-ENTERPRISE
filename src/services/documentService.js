import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from "./database";
import { supabase } from "./supabase";
import StorageAbstractionService, { calculateSHA256 } from "./storage/storageAbstractionService.js";

const canUseStorage =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DocumentService = {
  async getAll() {
    const list = await getDocuments();
    if (Array.isArray(list)) return list;
    return [];
  },

  async create(documentData = {}) {
    const { file, ...safeData } = documentData;
    let fileUrl = documentData.fileUrl || "";
    let filePath = "";
    const fileName = documentData.fileName || file?.name || `Document_${Date.now()}.pdf`;
    const memberId = documentData.memberId || documentData.owner || "26CLT08AA0001";
    const caseId = documentData.caseId || `CASE-${Date.now()}`;
    const category = documentData.category || "evidence";

    let fileContent = fileUrl;
    if (file instanceof File) {
      fileContent = await fileToDataUrl(file);
    }

    // 1. Calculate Cryptographic SHA-256 for Evidentiary Compliance
    const sha256Hash = await calculateSHA256(fileContent || fileName + Date.now());

    // 2. Upload through Storage Abstraction Layer (SAL)
    let sovereignRecord = null;
    try {
      sovereignRecord = await StorageAbstractionService.uploadFile({
        memberId,
        caseId,
        category,
        fileName,
        fileData: fileContent,
        mimeType: documentData.fileType || "application/pdf",
        transcription: documentData.transcription || "",
      });
      fileUrl = sovereignRecord.fileUrl;
      filePath = sovereignRecord.storagePath;
    } catch (e) {
      console.warn("StorageAbstractionService fallback:", e);
    }

    // 3. Fallback to Supabase if configured and requested
    if (file instanceof File && canUseStorage && !filePath) {
      const uploadName = `${Date.now()}-${file.name}`;
      try {
        const { error } = await supabase.storage
          .from("documents")
          .upload(uploadName, file, { upsert: true });

        if (!error) {
          const { data } = supabase.storage
            .from("documents")
            .getPublicUrl(uploadName);
          fileUrl = data?.publicUrl || "";
          filePath = uploadName;
        }
      } catch {}
    }

    const document = {
      id: Date.now(),
      documentNo: "DOC-" + Date.now(),
      title: documentData.title || fileName,
      category,
      owner: memberId,
      memberId,
      caseId,
      fileName,
      fileType: documentData.fileType || "application/pdf",
      filePath,
      fileUrl,
      sha256Hash,
      tamperProofCertificate: sovereignRecord?.tamperProofCertificate || {
        algorithm: "SHA-256",
        checksum: sha256Hash,
        timestamp: new Date().toISOString(),
        admissibleSection: "Section 63 BSA 2023 / Section 65B Indian Evidence Act",
      },
      status: documentData.status || "Active",
      createdAt: new Date().toISOString(),
      ...safeData,
    };

    return await addDocument(document);
  },

  async update(id, values) {
    await updateDocument(id, values);
  },

  async remove(id) {
    await deleteDocument(id);
  },

  async getDownloadUrl(document) {
    if (document.fileUrl) return document.fileUrl;
    if (!document.filePath || !canUseStorage) return "";

    try {
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(document.filePath);
      return data?.publicUrl || "";
    } catch {
      return "";
    }
  },

  async getCategories() {
    return [
      "Evidence & FIR",
      "Pleadings & Petitions",
      "Court Orders & Stays",
      "Financial Records",
      "Identity & KYC",
      "Voice Transcriptions",
    ];
  },
};

export default DocumentService;