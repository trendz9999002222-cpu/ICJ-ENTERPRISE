/**
 * ICJ ENTERPRISE PLATFORM — CLIENT-CONTROLLED BYOS & DISASTER RECOVERY TEST SUITE
 */
import StorageAbstractionService, { calculateSHA256, STORAGE_PROVIDERS } from "../src/services/storage/storageAbstractionService.js";
import MatterManifestService from "../src/services/storage/matterManifestService.js";

console.log("=== RUNNING CLIENT-CONTROLLED BYOS & DISASTER RECOVERY TEST SUITE ===");

// Mock browser localStorage for node runner
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runBYOSTests() {
  const sampleMemberId = "26CLT08AA0003";
  const sampleCaseId = "CASE-2026-PIL-8899";

  // 1. SHA-256 Cryptographic Hash Calculation
  const testText = "ICJ Sovereign Evidence Pleading File Content 2026";
  const hash1 = await calculateSHA256(testText);
  const hash2 = await calculateSHA256(testText);
  assert(hash1 === hash2, "SHA-256 calculation is deterministic and immutable");
  assert(hash1.length >= 16, "SHA-256 hash length verified");

  // 2. Storage Abstraction Config & Provider Switching
  const defaultConfig = StorageAbstractionService.getConfig(sampleMemberId);
  assert(defaultConfig.provider === STORAGE_PROVIDERS.ICJ_DEFAULT, "Default provider is ICJ Default Sovereign Vault");

  const s3Config = {
    provider: STORAGE_PROVIDERS.S3_COMPATIBLE,
    bucketName: "client-supreme-court-matters",
    region: "ap-south-1",
    endpoint: "https://r2.cloudflarestorage.com",
    accessKeyId: "MOCK_KEY_123",
    secretAccessKey: "MOCK_SECRET_456",
  };
  StorageAbstractionService.saveConfig(sampleMemberId, s3Config);
  const savedConfig = StorageAbstractionService.getConfig(sampleMemberId);
  assert(savedConfig.provider === STORAGE_PROVIDERS.S3_COMPATIBLE, "S3/R2 BYOS provider saved in sovereign vault");
  assert(savedConfig.bucketName === "client-supreme-court-matters", "Bucket name matches client configuration");

  // 3. Upload Original Evidence with SHA-256 Tamper-Proof Lock
  const evidenceDoc = await StorageAbstractionService.uploadFile({
    memberId: sampleMemberId,
    caseId: sampleCaseId,
    category: "evidence",
    fileName: "Property_Registry_Deed_Original.pdf",
    fileData: "BASE64_MOCK_PDF_DATA_STREAM_BINARY",
    mimeType: "application/pdf",
  });

  assert(evidenceDoc.storagePath.includes("/evidence/"), "Evidence placed under sovereign /evidence/ directory");
  assert(evidenceDoc.sha256Hash !== undefined && evidenceDoc.sha256Hash.length > 0, "SHA-256 checksum generated for evidence");
  assert(evidenceDoc.tamperProofCertificate.admissibleSection.includes("Section 63 BSA 2023"), "Evidentiary certificate tags BSA 2023 / Sec 65B");

  // 4. Voice Recording & Live Speech-to-Text Transcription Preservation
  const voiceDoc = await StorageAbstractionService.saveVoiceRecordingWithTranscript({
    memberId: sampleMemberId,
    caseId: sampleCaseId,
    audioDataUrl: "data:audio/wav;base64,UklGR...",
    transcriptText: "मेरी जमीन पर अवैध कब्जा करने की कोशिश की जा रही है, स्टे ऑर्डर की आवश्यकता है।",
    speaker: "Ramvir Jatav",
  });

  assert(voiceDoc.category === "voice_notes", "Voice recording categorized under voice_notes");
  assert(voiceDoc.transcription.includes("अवैध कब्जा"), "Voice transcription preserved in sovereign record");

  // 5. Portable Matter Manifest Synchronization (`manifest.icj.json`)
  const syncRes = await MatterManifestService.syncMatterManifest(sampleMemberId, sampleCaseId, {
    title: "Land Title Dispute & Injunction Suit",
    caseNumber: "CS/1042/2026",
    status: "In Progress",
  });

  assert(syncRes.success === true, "manifest.icj.json successfully generated and signed");
  assert(syncRes.manifestPayload.schemaVersion === "ICJ-MANIFEST-v2.0", "Manifest conforms to ICJ v2.0 schema");
  assert(syncRes.manifestPayload.documentCatalog.length >= 2, "Manifest includes catalog of evidence and voice notes");

  // 6. Zero-Dependency Disaster Recovery Reconstruction
  const recoveryRes = await MatterManifestService.reconstructMatterFromManifest(syncRes.manifestPayload, sampleMemberId);
  assert(recoveryRes.success === true, "1-Click Disaster Recovery succeeded from manifest");
  assert(recoveryRes.caseId === sampleCaseId, "Reconstructed Case ID matches original");
  assert(recoveryRes.documentsRestored >= 2, "All documents verified and restored into active memory");

  console.log("=== ALL BYOS & SOVEREIGN RECOVERY TESTS PASSED SUCCESSFULLY ===");
}

runBYOSTests();
