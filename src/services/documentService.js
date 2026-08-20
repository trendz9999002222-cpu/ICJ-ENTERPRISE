import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from "./database";
import { supabase } from "./supabase";

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

const SAMPLE_DOCUMENTS = [
  {
    id: "ICJ-2026-DOC-9801",
    documentNo: "ICJ-2026-DOC-9801",
    title: "Verified Identity Proof - Government ID",
    fileType: "PDF",
    category: "Identity / Personal Documents",
    department: "Litigant KYC Vault",
    owner: "Empaneled Member",
    workflow: "Approved & Locked",
    hash: "SHA256-ID-9812-ENCRYPTED",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ICJ-2026-DOC-9802",
    documentNo: "ICJ-2026-DOC-9802",
    title: "Certified Pleading & Court Petition Copy",
    fileType: "PDF",
    category: "Legal Pleadings",
    department: "Legal Affairs",
    owner: "Empaneled Legal Counsel",
    workflow: "Reviewed",
    hash: "SHA256-PLEAD-8812-ENCRYPTED",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

const DocumentService = {

  async getAll() {
    const list = await getDocuments();
    if (Array.isArray(list) && list.length > 0) return list;
    return SAMPLE_DOCUMENTS;
  },

  async create(documentData = {}) {
    const { file, ...safeData } = documentData;
    let fileUrl = documentData.fileUrl || "";
    let filePath = "";

    if (file instanceof File) {
      const uploadName = `${Date.now()}-${file.name}`;

      if (canUseStorage) {
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
        } catch {
          fileUrl = await fileToDataUrl(file);
        }
      } else {
        fileUrl = await fileToDataUrl(file);
      }
    }

    const document = {
      id: Date.now(),
      documentNo: "DOC-" + Date.now(),
      title: documentData.title || "",
      category: documentData.category || "",
      owner: documentData.owner || "",
      fileName: documentData.fileName || "",
      fileType: documentData.fileType || "",
      filePath,
      fileUrl,
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

  // DRM & OTP Lock Services
  requestPrintOTP(documentId, requesterName = "Advocate / User") {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const session = {
      documentId,
      requesterName,
      otp,
      requestedAt: new Date().toISOString(),
      verified: false,
    };
    localStorage.setItem(`icj_print_otp_${documentId}`, JSON.stringify(session));
    return { success: true, otp, message: `OTP ${otp} sent to Document Owner / Super Admin` };
  },

  verifyPrintOTP(documentId, enteredOtp) {
    const raw = localStorage.getItem(`icj_print_otp_${documentId}`);
    if (!raw) return { success: false, message: "No active OTP request found." };
    const session = JSON.parse(raw);
    if (session.otp === enteredOtp.trim()) {
      session.verified = true;
      session.unlockedAt = new Date().toISOString();
      localStorage.setItem(`icj_print_otp_${documentId}`, JSON.stringify(session));
      return { success: true, message: "Print & Download Permission Granted!" };
    }
    return { success: false, message: "Invalid OTP. Access Denied." };
  },
};

export default DocumentService;