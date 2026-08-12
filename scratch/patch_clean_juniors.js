import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parentDir = path.resolve(__dirname, '..');

// Helper to patch a file
const patchFile = (filePath, target, replacement) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched successfully: ${filePath}`);
    } else {
      console.log(`Target not found in: ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
};

// 1. Clean juniors list default values in virtualOfficeService.js
const juniorsTarget = `        juniorsList: [
          { id: "JR-01", memberId: "26ICJ08AA0001", name: "Pooja Verma", designation: "Junior Associate", role: "staff", status: "Active", permissions: ["View Client", "View Case", "Upload", "Draft"], assignedOffice: "High Court of Judicature Chamber", barId: "UP/2022/8812", mobile: "+91 9839012345", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
          { id: "JR-02", memberId: "26ICJ08AA0002", name: "Siddharth Mehta", designation: "Legal Intern", role: "staff", status: "Active", permissions: ["View Case", "Upload"], assignedOffice: "Supreme Court Practice Office", barId: "DL/2024/1102", mobile: "+91 9123456789", photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" },
        ],`;

const juniorsReplacement = `        juniorsList: [],`;

patchFile(path.join(parentDir, 'src/services/virtualOfficeService.js'), juniorsTarget, juniorsReplacement);
patchFile(path.join(parentDir, 'ICJ BACKEND/ICJ BACKEND/src/services/virtualOfficeService.js'), juniorsTarget, juniorsReplacement);

// 2. Add Wallet & Passbook button to Tab 5 Payments in ClientPortal.jsx
const paymentsTarget = `        {/* TAB 5: PAYMENTS */}
        <TabPanel value={tabIndex} index={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Legal Fee Payments & Invoice Ledger
            </Typography>`;

const paymentsReplacement = `        {/* TAB 5: PAYMENTS */}
        <TabPanel value={tabIndex} index={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Legal Fee Payments & Invoice Ledger
              </Typography>
              <Button variant="outlined" color="success" onClick={() => navigate("/member-wallet")}>
                View Wallet &amp; Ledger Passbook
              </Button>
            </Stack>`;

patchFile(path.join(parentDir, 'src/pages/ClientPortal.jsx'), paymentsTarget, paymentsReplacement);
patchFile(path.join(parentDir, 'ICJ BACKEND/ICJ BACKEND/src/pages/ClientPortal.jsx'), paymentsTarget, paymentsReplacement);

console.log('Clean juniors & wallet button patch completed!');
