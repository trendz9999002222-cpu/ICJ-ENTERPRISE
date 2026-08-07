import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import useAuth from "../../hooks/useAuth";

const DEMO_ROUTES = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Membership", path: "/membership" },
    { label: "Documents", path: "/documents" },
    { label: "Member Certificates", path: "/member-certificates" },
    { label: "Member Card", path: "/member-card" },
    { label: "Member Identity", path: "/member-identity" },
    { label: "Reports", path: "/reports" },
];

const DEMO_ROLE_CONFIG = [
    { label: "Super Admin", email: "super.admin@icj.test", roleCode: "super_admin", defaultRoute: "/membership" },
    { label: "System Admin", email: "system.admin@icj.test", roleCode: "system_admin", defaultRoute: "/administration" },
    { label: "National Admin", email: "national.admin@icj.test", roleCode: "national_executive", defaultRoute: "/dashboard" },
    { label: "State Admin", email: "state.admin@icj.test", roleCode: "state_president", defaultRoute: "/dashboard" },
    { label: "District Admin", email: "district.admin@icj.test", roleCode: "district_president", defaultRoute: "/dashboard" },
    { label: "Branch Admin", email: "branch.admin@icj.test", roleCode: "operator", defaultRoute: "/membership" },
    { label: "Organization Admin", email: "institution.admin@icj.test", roleCode: "organization_admin", defaultRoute: "/membership" },
    { label: "Member", email: "member.role@icj.test", roleCode: "member", defaultRoute: "/dashboard" },
];

const PUBLIC_FLOW = {
    label: "Public User",
    route: "/register",
    description: "Open the shared registration form and execute the public onboarding flow.",
};

const DEMO_ACCOUNT_SEED = [
    { name: "Super Admin QA User", email: "super.admin@icj.test", password: "Test@12345A", role: "super_admin", role_code: "super_admin", role_category: "administration", legacy_role: "admin", member_id: "ICJ-2026-008000", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333351465" },
    { name: "System Admin QA User", email: "system.admin@icj.test", password: "Test@12345A", role: "system_admin", role_code: "system_admin", role_category: "administration", legacy_role: "admin", member_id: "ICJ-2026-009001", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333351999" },
    { name: "National Admin QA User", email: "national.admin@icj.test", password: "Test@12345A", role: "national_executive", role_code: "national_executive", role_category: "leadership", legacy_role: "admin", member_id: "ICJ-2026-008002", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333351427" },
    { name: "State Admin QA User", email: "state.admin@icj.test", password: "Test@12345A", role: "state_president", role_code: "state_president", role_category: "leadership", legacy_role: "admin", member_id: "ICJ-2026-008003", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333351367" },
    { name: "District Admin QA User", email: "district.admin@icj.test", password: "Test@12345A", role: "district_president", role_code: "district_president", role_category: "leadership", legacy_role: "admin", member_id: "ICJ-2026-008004", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333394603" },
    { name: "Branch Admin QA User", email: "branch.admin@icj.test", password: "Test@12345A", role: "operator", role_code: "operator", role_category: "administration", legacy_role: "operator", member_id: "ICJ-2026-008005", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333341130" },
    { name: "Institutional Admin QA User", email: "institution.admin@icj.test", password: "Test@12345A", role: "organization_admin", role_code: "organization_admin", role_category: "legacy", legacy_role: "admin", member_id: "ICJ-2026-008006", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333351932" },
    { name: "Member QA User", email: "member.role@icj.test", password: "Test@12345A", role: "member", role_code: "member", role_category: "community", legacy_role: "member", member_id: "ICJ-2026-008007", member_type: "Individual", member_level: "BASIC", verification_status: "Verified", status: "Approved", mobile: "9333335807" },
];

const OUTPUT_TARGETS = [
    "Certificate",
    "ID Card",
    "QR Verification",
    "Reports",
    "PDF",
    "Print",
    "Excel",
    "CSV",
    "Documents",
];

const readDemoMembers = () => {
    if (typeof window === "undefined") return [];
    try {
        const rows = JSON.parse(window.localStorage.getItem("icj_members") || "[]");
        return Array.isArray(rows) ? rows : [];
    } catch {
        return [];
    }
};

const writeDemoMembers = (nextMembers) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("icj_members", JSON.stringify(nextMembers));
};

const ensureDemoAccounts = () => {
    const members = readDemoMembers();
    const normalizedMembers = Array.isArray(members) ? [...members] : [];
    let changed = false;

    DEMO_ACCOUNT_SEED.forEach((seed) => {
        const matchIndex = normalizedMembers.findIndex((member) => String(member.email || "").toLowerCase() === String(seed.email).toLowerCase());
        const nextMember = {
            id: seed.member_id,
            user_id: seed.member_id,
            full_name: seed.name,
            name: seed.name,
            email: seed.email,
            password: seed.password,
            role: seed.role,
            role_code: seed.role_code,
            role_category: seed.role_category,
            legacy_role: seed.legacy_role,
            member_id: seed.member_id,
            member_type: seed.member_type,
            member_level: seed.member_level,
            verification_status: seed.verification_status,
            status: seed.status,
            mobile: seed.mobile,
            mobile_verified: false,
            email_verified: false,
            is_mobile_verified: false,
            is_email_verified: false,
            profile_photo: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (matchIndex >= 0) {
            normalizedMembers[matchIndex] = { ...normalizedMembers[matchIndex], ...nextMember };
            changed = true;
            return;
        }

        normalizedMembers.push(nextMember);
        changed = true;
    });

    if (changed) {
        writeDemoMembers(normalizedMembers);
    }

    return normalizedMembers;
};

export default function MembershipGuide() {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const [busyRole, setBusyRole] = useState("");
    const [demoMembers] = useState(() => ensureDemoAccounts());

    const getDemoAccount = (roleCode, fallbackEmail) => {
        const byEmail = demoMembers.find((member) => String(member.email || "").toLowerCase() === String(fallbackEmail).toLowerCase());
        if (byEmail) {
            return byEmail;
        }
        const exact = demoMembers.find((member) => String(member.role_code || member.role || "").toLowerCase() === String(roleCode).toLowerCase());
        if (exact) {
            return exact;
        }
        return null;
    };

    const launchRoleDemo = async (config) => {
        const account = getDemoAccount(config.roleCode, config.email);
        if (!account?.email || !account?.password) {
            window.alert(`Demo account not available for ${config.label}.`);
            return;
        }

        setBusyRole(config.label);
        try {
            await logout().catch(() => undefined);
            await login({ email: account.email, password: account.password });
            navigate(config.defaultRoute, { replace: true });
        } catch (error) {
            window.alert(error?.message || `Unable to launch ${config.label} demo.`);
        } finally {
            setBusyRole("");
        }
    };

    return (
        <Paper sx={{ mt: 4, p: 3, borderRadius: 3 }} variant="outlined">
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Membership Live Demo Launcher
                    </Typography>
                    <Typography color="text.secondary">
                        Use real demo accounts to open the live Membership workflows, then continue into Documents, Certificates, ID Card, QR, and Reports.
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Live Demo Roles
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Role</TableCell>
                                <TableCell>User ID / Email</TableCell>
                                <TableCell>Password</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {DEMO_ROLE_CONFIG.map((item) => {
                                const account = getDemoAccount(item.roleCode, item.email);
                                return (
                                    <TableRow key={item.label}>
                                        <TableCell>{item.label}</TableCell>
                                        <TableCell>{account?.email || item.email}</TableCell>
                                        <TableCell>{account?.password || "Unavailable"}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                disabled={busyRole === item.label || !account?.email || !account?.password}
                                                onClick={() => void launchRoleDemo(item)}
                                            >
                                                {busyRole === item.label ? "Launching..." : "Launch Demo"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            <TableRow>
                                <TableCell>{PUBLIC_FLOW.label}</TableCell>
                                <TableCell>Open public registration</TableCell>
                                <TableCell>None</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" onClick={() => navigate(PUBLIC_FLOW.route)}>
                                        Open Registration
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Real Workflow Shortcuts
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {DEMO_ROUTES.map((item) => (
                            <Button key={item.path} size="small" variant="outlined" onClick={() => navigate(item.path)}>
                                Open {item.label}
                            </Button>
                        ))}
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Output Targets
                    </Typography>
                    <Alert severity="info" variant="outlined">
                        Generate and verify each output from the live pages after launching a role demo: {OUTPUT_TARGETS.join(", ")}.
                    </Alert>
                </Box>

                <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Demo Scope
                    </Typography>
                    <Typography color="text.secondary">
                        This launcher uses the real app, real routing, and the existing demo accounts stored in the current workspace session.
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}