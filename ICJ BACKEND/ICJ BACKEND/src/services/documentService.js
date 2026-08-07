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

const DocumentService = {

  async getAll() {
    return await getDocuments();
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

};

export default DocumentService;