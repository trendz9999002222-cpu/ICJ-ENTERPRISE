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
    id: "ICJ-DOC-2026-9801",
    documentNo: "ICJ-DOC-2026-9801",
    title: "Aadhaar Card - Ramesh Kumar (Litigant ID Proof)",
    fileType: "PDF",
    category: "Identity / Personal Documents",
    department: "Litigant KYC Vault",
    owner: "Sh. Ramesh Kumar (Litigant)",
    workflow: "Approved & Locked",
    hash: "SHA256-AADHAAR-9812-ENCRYPTED",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ICJ-DOC-2026-9802",
    documentNo: "ICJ-DOC-2026-9802",
    title: "PAN Card - Ramesh Kumar (Tax ID: ABCPK9812K)",
    fileType: "Images",
    category: "Financial / Tax Records",
    department: "Treasury Compliance",
    owner: "Sh. Ramesh Kumar (Litigant)",
    workflow: "Approved & Locked",
    hash: "SHA256-PAN-4412-ENCRYPTED",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ICJ-DOC-2026-9803",
    documentNo: "ICJ-DOC-2026-9803",
    title: "Certified Police FIR Copy - PS Gomti Nagar (Crime #412/2026)",
    fileType: "PDF",
    category: "Criminal Case Pleadings",
    department: "Legal Affairs",
    owner: "Adv. Rajesh Sharma",
    workflow: "Reviewed",
    hash: "SHA256-FIR-8812-ENCRYPTED",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ICJ-DOC-2026-9804",
    documentNo: "ICJ-DOC-2026-9804",
    title: "Registered Sale Deed & Khatauni - Disputed Plot #42 Lucknow",
    fileType: "PDF",
    category: "Civil Property Title",
    department: "Revenue Division",
    owner: "Smt. Sunita Devi (Co-owner)",
    workflow: "Signed & Sealed",
    hash: "SHA256-DEED-3329-ENCRYPTED",
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