import {
    addFinanceAccount,
    addFinanceLedger,
    addFinanceSettings,
    addFinanceTransaction,
    deleteFinanceLedger,
    getFinanceAccounts,
    getFinanceLedgers,
    getFinanceSettings,
    getFinanceTransactions,
    getWallets,
    updateFinanceAccount,
    updateFinanceSettings,
    updateWallet,
} from "./database";
import { hasPermission } from "../core/permissions";
import AuditLogService from "./auditLogService";
import TokenService from "./tokenService";
import DonationService from "./donationService";
import { optionalString, requirePositiveNumber, requireString } from "../utils/validation";

const DEFAULT_FINANCE_SETTINGS = {
    scope_type: "system",
    scope_id: "global",
    base_currency: "INR",
    allowed_currencies: ["INR"],
    wallet_enabled: true,
    double_entry_required: true,
    metadata: {},
};

const DEFAULT_CHART_OF_ACCOUNTS = [
    { id: "ACC-CASH", code: "CASH", name: "Cash", group: "ASSET", category: "CURRENT_ASSET", account_type: "CONTROL", status: "ACTIVE" },
    { id: "ACC-BANK", code: "BANK", name: "Bank", group: "ASSET", category: "CURRENT_ASSET", account_type: "CONTROL", status: "ACTIVE" },
    { id: "ACC-WALLET", code: "WALLET", name: "Wallet Control", group: "ASSET", category: "CURRENT_ASSET", account_type: "CONTROL", status: "ACTIVE" },
    { id: "ACC-AR", code: "RECEIVABLE", name: "Receivables", group: "ASSET", category: "CURRENT_ASSET", account_type: "CONTROL", status: "ACTIVE" },
    { id: "ACC-AP", code: "PAYABLE", name: "Payables", group: "LIABILITY", category: "CURRENT_LIABILITY", account_type: "CONTROL", status: "ACTIVE" },
    { id: "ACC-DON", code: "DONATION_INCOME", name: "Donation Income", group: "INCOME", category: "OPERATING_INCOME", account_type: "REVENUE", status: "ACTIVE" },
    { id: "ACC-MEM", code: "MEMBERSHIP_INCOME", name: "Membership Income", group: "INCOME", category: "OPERATING_INCOME", account_type: "REVENUE", status: "ACTIVE" },
    { id: "ACC-EXP", code: "OPERATING_EXPENSE", name: "Operating Expense", group: "EXPENSE", category: "OPERATING_EXPENSE", account_type: "EXPENSE", status: "ACTIVE" },
    { id: "ACC-EQUITY", code: "EQUITY", name: "Equity", group: "EQUITY", category: "CAPITAL", account_type: "EQUITY", status: "ACTIVE" },
    { id: "ACC-SUSPENSE", code: "SUSPENSE", name: "Suspense", group: "LIABILITY", category: "CLEARING", account_type: "CLEARING", status: "ACTIVE" },
];

const nextId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const nowIso = () => new Date().toISOString();
const toAmount = (value, fieldName = "Amount") => requirePositiveNumber(value, fieldName);

const normalizeRole = (role) => String(role || "member").toLowerCase();

const sortByCreatedAtDesc = (rows = []) =>
    [...rows].sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());

const makePermissionState = (role = "member") => ({
    canViewAll: hasPermission(role, "finance.view.all") || hasPermission(role, "wallet.view") || hasPermission(role, "payments.view"),
    canCreateWallet: hasPermission(role, "wallet.credit") || hasPermission(role, "wallet.debit") || hasPermission(role, "wallet.transfer"),
    canPostWalletEntries: hasPermission(role, "wallet.credit") || hasPermission(role, "wallet.debit") || hasPermission(role, "wallet.transfer"),
    canPostFinanceEntries: hasPermission(role, "finance.entry.post") || hasPermission(role, "payments.create"),
    canManageAccountHeads: hasPermission(role, "finance.accounts.manage"),
    canManageVouchers: hasPermission(role, "finance.vouchers.manage") || hasPermission(role, "payments.create"),
    canExport: hasPermission(role, "finance.export") || hasPermission(role, "reports.export") || hasPermission(role, "payments.export"),
    canDeleteEntries: hasPermission(role, "finance.entry.delete"),
    canManageSettings: hasPermission(role, "finance.settings.manage"),
});

export const getWalletId = (wallet) => wallet.id;
export const getWalletMemberId = (wallet) => wallet.memberId || wallet.member_id;

const normalizeAccount = (account = {}) => ({
    ...account,
    id: String(account.id || nextId("ACC")).trim(),
    code: String(account.code || account.name || "ACCOUNT").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "_"),
    name: requireString(account.name, "Account name"),
    group: requireString(account.group || "ASSET", "Account group").toUpperCase(),
    category: String(account.category || account.group || "GENERAL").trim().toUpperCase(),
    account_type: String(account.account_type || account.accountType || "GENERAL").trim().toUpperCase(),
    parent_account_id: account.parent_account_id || account.parentAccountId || null,
    currency: String(account.currency || "INR").trim().toUpperCase(),
    organization_id: account.organization_id || account.organizationId || null,
    person_id: account.person_id || account.personId || null,
    member_id: account.member_id || account.memberId || null,
    status: String(account.status || "ACTIVE").trim().toUpperCase(),
    metadata: account.metadata && typeof account.metadata === "object" ? account.metadata : {},
    created_at: account.created_at || account.createdAt || nowIso(),
    updated_at: nowIso(),
});

const normalizeTransaction = (row = {}) => ({
    ...row,
    id: String(row.id || nextId("FTX")).trim(),
    transaction_no: row.transaction_no || row.transactionNo || `TRX-${Date.now()}`,
    transaction_type: String(row.transaction_type || row.transactionType || "GENERAL").trim().toUpperCase(),
    amount: Number(row.amount || 0),
    currency: String(row.currency || "INR").trim().toUpperCase(),
    exchange_rate: Number(row.exchange_rate || row.exchangeRate || 1),
    base_amount: Number(row.base_amount || row.baseAmount || row.amount || 0),
    base_currency: String(row.base_currency || row.baseCurrency || row.currency || "INR").trim().toUpperCase(),
    organization_id: row.organization_id || row.organizationId || null,
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    wallet_id: row.wallet_id || row.walletId || null,
    counterparty_wallet_id: row.counterparty_wallet_id || row.counterpartyWalletId || null,
    debit_account_id: row.debit_account_id || row.debitAccountId || null,
    credit_account_id: row.credit_account_id || row.creditAccountId || null,
    debit_account_code: row.debit_account_code || row.debitAccountCode || null,
    credit_account_code: row.credit_account_code || row.creditAccountCode || null,
    reference_no: row.reference_no || row.referenceNo || null,
    voucher_no: row.voucher_no || row.voucherNo || `VCH-${Date.now()}`,
    narration: optionalString(row.narration),
    source_module: row.source_module || row.sourceModule || "finance",
    status: String(row.status || "POSTED").trim().toUpperCase(),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: nowIso(),
});

const normalizeLedgerEntry = (row = {}) => ({
    ...row,
    id: String(row.id || nextId("FLG")).trim(),
    ledger_no: row.ledger_no || row.ledgerNo || `LED-${Date.now()}`,
    transaction_id: row.transaction_id || row.transactionId || null,
    entry_type: String(row.entry_type || row.entryType || "GENERAL").trim().toUpperCase(),
    account_id: row.account_id || row.accountId || null,
    account_code: row.account_code || row.accountCode || null,
    account_name: row.account_name || row.accountName || null,
    debit_amount: Number(row.debit_amount || row.debitAmount || 0),
    credit_amount: Number(row.credit_amount || row.creditAmount || 0),
    amount: Number(row.amount || 0),
    currency: String(row.currency || "INR").trim().toUpperCase(),
    exchange_rate: Number(row.exchange_rate || row.exchangeRate || 1),
    wallet_id: row.wallet_id || row.walletId || null,
    source_wallet_id: row.source_wallet_id || row.sourceWalletId || null,
    target_wallet_id: row.target_wallet_id || row.targetWalletId || null,
    organization_id: row.organization_id || row.organizationId || null,
    person_id: row.person_id || row.personId || null,
    member_id: row.member_id || row.memberId || null,
    reference_no: row.reference_no || row.referenceNo || null,
    voucher_no: row.voucher_no || row.voucherNo || null,
    narration: optionalString(row.narration),
    source_module: row.source_module || row.sourceModule || "finance",
    status: String(row.status || "POSTED").trim().toUpperCase(),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    created_at: row.created_at || row.createdAt || nowIso(),
    updated_at: nowIso(),
});

const normalizeScope = (filters = {}) => ({
    organizationId: filters.organizationId || filters.organization_id || null,
    personId: filters.personId || filters.person_id || null,
    memberId: filters.memberId || filters.member_id || null,
});

const matchesScope = (row = {}, filters = {}) => {
    const scope = normalizeScope(filters);
    if (scope.organizationId && String(row.organization_id || row.organizationId || "") !== String(scope.organizationId)) return false;
    if (scope.personId && String(row.person_id || row.personId || "") !== String(scope.personId)) return false;
    if (scope.memberId && String(row.member_id || row.memberId || "") !== String(scope.memberId)) return false;
    return true;
};

const toCsv = (rows, columns) => {
    const headers = columns.map((col) => col.label).join(",");
    const body = rows
        .map((row) =>
            columns
                .map((col) => {
                    const raw = row[col.key] ?? "";
                    const value = String(raw).replace(/"/g, '""');
                    return `"${value}"`;
                })
                .join(",")
        )
        .join("\n");
    return `${headers}\n${body}`;
};

const ensureAudit = async (event) => {
    try {
        await AuditLogService.logAuthEvent(event);
    } catch {
        // Keep finance workflow non-blocking when audit write fails.
    }
};

const resolveActorMemberId = (actorProfile = null) => actorProfile?.member_id || actorProfile?.memberId || actorProfile?.id || null;

const updateWalletBalance = async (wallet, delta) => {
    const walletId = getWalletId(wallet);
    const current = Number(wallet.balance || 0);
    const next = current + Number(delta || 0);
    if (next < 0) {
        throw new Error("Insufficient wallet balance for this transaction.");
    }
    await updateWallet(walletId, { ...wallet, balance: next, updated_at: nowIso() });
    return next;
};

const buildVoucherRows = (transactions = []) => {
    const grouped = new Map();
    transactions.forEach((item) => {
        const key = item.voucher_no || item.voucherNo || item.transaction_no || item.id;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(item);
    });

    return sortByCreatedAtDesc(
        [...grouped.entries()].map(([voucherNo, rows]) => ({
            id: rows[0]?.id || voucherNo,
            voucherNo,
            category: rows[0]?.transaction_type || rows[0]?.transactionType || "GENERAL",
            amount: rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
            status: rows[0]?.status || "POSTED",
            linkedEntryIds: rows.map((row) => row.id),
            createdAt: rows[0]?.created_at || rows[0]?.createdAt || nowIso(),
            createdByRole: rows[0]?.metadata?.role || "system",
            narration: rows[0]?.narration || "",
        }))
    );
};

const buildDoubleEntryRows = ({
    transactionId,
    transactionType,
    amount,
    currency,
    exchangeRate,
    debitAccount,
    creditAccount,
    walletId = null,
    sourceWalletId = null,
    targetWalletId = null,
    organizationId = null,
    personId = null,
    memberId = null,
    referenceNo = null,
    voucherNo = null,
    narration = "",
    sourceModule = "finance",
    metadata = {},
}) => {
    const common = {
        transaction_id: transactionId,
        entry_type: transactionType,
        amount,
        currency,
        exchange_rate: exchangeRate,
        wallet_id: walletId,
        source_wallet_id: sourceWalletId,
        target_wallet_id: targetWalletId,
        organization_id: organizationId,
        person_id: personId,
        member_id: memberId,
        reference_no: referenceNo,
        voucher_no: voucherNo,
        narration,
        source_module: sourceModule,
        status: "POSTED",
        metadata,
    };

    return [
        normalizeLedgerEntry({
            ...common,
            account_id: debitAccount?.id || null,
            account_code: debitAccount?.code || null,
            account_name: debitAccount?.name || null,
            debit_amount: amount,
            credit_amount: 0,
        }),
        normalizeLedgerEntry({
            ...common,
            account_id: creditAccount?.id || null,
            account_code: creditAccount?.code || null,
            account_name: creditAccount?.name || null,
            debit_amount: 0,
            credit_amount: amount,
        }),
    ];
};

const getOrSeedChartOfAccounts = async () => {
    const existing = Array.isArray(await getFinanceAccounts()) ? await getFinanceAccounts() : [];
    if (existing.length > 0) {
        return existing.map((row) => normalizeAccount(row));
    }

    const seeded = [];
    for (const row of DEFAULT_CHART_OF_ACCOUNTS) {
        const normalized = normalizeAccount(row);
        const saved = await addFinanceAccount(normalized);
        seeded.push(normalizeAccount(saved || normalized));
    }
    return seeded;
};

const getFinanceConfig = async (scope = {}) => {
    const rows = Array.isArray(await getFinanceSettings()) ? await getFinanceSettings() : [];
    const scopeType = scope.scopeType || scope.scope_type || "system";
    const scopeId = scope.scopeId || scope.scope_id || "global";
    const current = rows.find((row) => String(row.scope_type || "") === String(scopeType) && String(row.scope_id || "") === String(scopeId));
    if (current) {
        return {
            ...DEFAULT_FINANCE_SETTINGS,
            ...current,
            allowed_currencies: Array.isArray(current.allowed_currencies) ? current.allowed_currencies : DEFAULT_FINANCE_SETTINGS.allowed_currencies,
        };
    }

    const created = {
        id: `FIN-SET-${scopeType}-${scopeId}`,
        ...DEFAULT_FINANCE_SETTINGS,
        scope_type: scopeType,
        scope_id: scopeId,
        created_at: nowIso(),
        updated_at: nowIso(),
    };
    await addFinanceSettings(created);
    return created;
};

const filterLedgerForActor = (rows, permissions, actorProfile = null) => {
    if (permissions.canViewAll) return rows;
    const actorMemberId = resolveActorMemberId(actorProfile);
    return rows.filter((row) => String(row.member_id || row.memberId || "") === String(actorMemberId || ""));
};

const getAccountByCode = (accounts, code) => {
    const normalizedCode = String(code || "").trim().toUpperCase();
    return accounts.find((item) => String(item.code || "").trim().toUpperCase() === normalizedCode) || null;
};

const FinanceService = {
    getPermissions(role) {
        return makePermissionState(normalizeRole(role));
    },

    async getFinanceSettings(scope = {}) {
        return getFinanceConfig(scope);
    },

    async saveFinanceSettings(settings = {}, role = "member", scope = {}) {
        const permissions = makePermissionState(role);
        if (!permissions.canManageSettings) {
            throw new Error("You do not have permission to update finance settings.");
        }

        const current = await getFinanceConfig(scope);
        const next = {
            ...current,
            ...settings,
            allowed_currencies: Array.isArray(settings.allowed_currencies || settings.allowedCurrencies)
                ? (settings.allowed_currencies || settings.allowedCurrencies).map((item) => String(item).toUpperCase())
                : current.allowed_currencies,
            updated_at: nowIso(),
        };

        await updateFinanceSettings(current.id, next);
        await ensureAudit({
            action: "finance_settings_updated",
            source: "admin",
            metadata: { scope_type: next.scope_type, scope_id: next.scope_id },
        });
        return next;
    },

    async getChartOfAccounts(filters = {}) {
        const accounts = await getOrSeedChartOfAccounts();
        const scope = normalizeScope(filters);
        return sortByCreatedAtDesc(
            accounts.filter((row) => {
                if (!matchesScope(row, filters)) {
                    return !row.organization_id && !row.person_id && !row.member_id && Boolean(scope.organizationId || scope.personId || scope.memberId);
                }
                return true;
            })
        );
    },

    async getAccountHeads(filters = {}) {
        return this.getChartOfAccounts(filters);
    },

    async createAccountHead(payload, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canManageAccountHeads) {
            throw new Error("You do not have permission to create account heads.");
        }

        const item = normalizeAccount(payload);
        const saved = await addFinanceAccount(item);
        await ensureAudit({
            action: "finance_account_created",
            source: "admin",
            metadata: { account_id: item.id, account_code: item.code, role: normalizeRole(role) },
        });
        return normalizeAccount(saved || item);
    },

    async updateAccountHead(id, values, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canManageAccountHeads) {
            throw new Error("You do not have permission to update account heads.");
        }

        const accounts = await this.getChartOfAccounts();
        const current = accounts.find((row) => String(row.id) === String(id));
        if (!current) {
            throw new Error("Account head not found.");
        }

        const next = normalizeAccount({ ...current, ...values, id });
        await updateFinanceAccount(id, next);
        await ensureAudit({
            action: "finance_account_updated",
            source: "admin",
            metadata: { account_id: id, account_code: next.code, role: normalizeRole(role) },
        });
        return next;
    },

    async removeAccountHead(id, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canManageAccountHeads) {
            throw new Error("You do not have permission to remove account heads.");
        }

        await updateFinanceAccount(id, { id, status: "INACTIVE", updated_at: nowIso() });
    },

    async getTransactions(filters = {}, role = "member", actorProfile = null) {
        const rows = Array.isArray(await getFinanceTransactions()) ? await getFinanceTransactions() : [];
        const scoped = rows.filter((row) => matchesScope(row, filters));
        const permissions = makePermissionState(role);
        return sortByCreatedAtDesc(filterLedgerForActor(scoped, permissions, actorProfile));
    },

    async getFinanceEntries(filters = {}, role = "member", actorProfile = null) {
        const rows = Array.isArray(await getFinanceLedgers()) ? await getFinanceLedgers() : [];
        const scoped = rows.filter((row) => matchesScope(row, filters));
        const permissions = makePermissionState(role);
        return sortByCreatedAtDesc(filterLedgerForActor(scoped, permissions, actorProfile));
    },

    async getLedgerFoundation(filters = {}, role = "member", actorProfile = null) {
        return this.getFinanceEntries(filters, role, actorProfile);
    },

    async getWalletFoundation(filters = {}) {
        const rows = Array.isArray(await getWallets()) ? await getWallets() : [];
        return rows.filter((row) => matchesScope(row, filters));
    },

    async getWalletLedger(walletId, role = "member", actorProfile = null, filters = {}) {
        const ledger = await this.getFinanceEntries(filters, role, actorProfile);
        return ledger.filter((entry) => String(entry.wallet_id || entry.walletId || "") === String(walletId));
    },

    async createWalletEntry(payload, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canPostWalletEntries) {
            throw new Error("You do not have permission to post wallet transactions.");
        }

        const wallets = Array.isArray(await getWallets()) ? await getWallets() : [];
        const settings = await this.getFinanceSettings({ scopeType: payload?.organizationId ? "organization" : "system", scopeId: payload?.organizationId || "global" });
        const accounts = await getOrSeedChartOfAccounts();
        const walletAccount = getAccountByCode(accounts, "WALLET");
        const cashAccount = getAccountByCode(accounts, payload?.mode === "Bank" ? "BANK" : "CASH");

        const type = requireString(payload?.type, "Transaction type").toUpperCase();
        const amount = toAmount(payload?.amount);
        const walletId = requireString(payload?.walletId, "Wallet");
        const sourceWallet = wallets.find((wallet) => String(getWalletId(wallet)) === String(walletId));
        if (!sourceWallet) {
            throw new Error("Selected wallet not found.");
        }

        const currency = String(payload?.currency || sourceWallet.currency || settings.base_currency || "INR").toUpperCase();
        const exchangeRate = Number(payload?.exchangeRate || 1);
        const voucherNo = payload?.voucherNo || `VCH-${Date.now()}`;
        const transactionType = type === "TRANSFER" ? "WALLET_TRANSFER" : `WALLET_${type}`;
        const commonMeta = {
            role: normalizeRole(role),
            wallet_type: type,
        };

        const transaction = normalizeTransaction({
            transaction_type: transactionType,
            amount,
            currency,
            exchange_rate: exchangeRate,
            base_amount: amount * exchangeRate,
            base_currency: settings.base_currency,
            organization_id: payload?.organizationId || payload?.organization_id || sourceWallet.organization_id || null,
            person_id: payload?.personId || payload?.person_id || sourceWallet.person_id || null,
            member_id: payload?.memberId || payload?.member_id || sourceWallet.member_id || null,
            wallet_id: walletId,
            counterparty_wallet_id: payload?.targetWalletId || null,
            debit_account_id: walletAccount?.id || null,
            credit_account_id: cashAccount?.id || null,
            debit_account_code: walletAccount?.code || null,
            credit_account_code: cashAccount?.code || null,
            reference_no: optionalString(payload?.referenceNo),
            voucher_no: voucherNo,
            narration: optionalString(payload?.narration),
            source_module: "wallet",
            metadata: commonMeta,
        });

        await addFinanceTransaction(transaction);

        let ledgerRows;
        if (type === "CREDIT") {
            await updateWalletBalance(sourceWallet, amount);
            ledgerRows = buildDoubleEntryRows({
                transactionId: transaction.id,
                transactionType,
                amount,
                currency,
                exchangeRate,
                debitAccount: walletAccount,
                creditAccount: cashAccount,
                walletId,
                organizationId: transaction.organization_id,
                personId: transaction.person_id,
                memberId: transaction.member_id,
                referenceNo: transaction.reference_no,
                voucherNo,
                narration: transaction.narration,
                sourceModule: "wallet",
                metadata: commonMeta,
            });
        } else if (type === "DEBIT") {
            await updateWalletBalance(sourceWallet, -amount);
            ledgerRows = buildDoubleEntryRows({
                transactionId: transaction.id,
                transactionType,
                amount,
                currency,
                exchangeRate,
                debitAccount: cashAccount,
                creditAccount: walletAccount,
                walletId,
                organizationId: transaction.organization_id,
                personId: transaction.person_id,
                memberId: transaction.member_id,
                referenceNo: transaction.reference_no,
                voucherNo,
                narration: transaction.narration,
                sourceModule: "wallet",
                metadata: commonMeta,
            });
        } else if (type === "TRANSFER") {
            const targetWalletId = requireString(payload?.targetWalletId, "Target wallet");
            const targetWallet = wallets.find((wallet) => String(getWalletId(wallet)) === String(targetWalletId));
            if (!targetWallet) {
                throw new Error("Target wallet not found.");
            }
            if (String(targetWalletId) === String(walletId)) {
                throw new Error("Source and target wallet cannot be the same for transfer.");
            }

            await updateWalletBalance(sourceWallet, -amount);
            await updateWalletBalance(targetWallet, amount);
            ledgerRows = buildDoubleEntryRows({
                transactionId: transaction.id,
                transactionType,
                amount,
                currency,
                exchangeRate,
                debitAccount: walletAccount,
                creditAccount: walletAccount,
                walletId,
                sourceWalletId: walletId,
                targetWalletId,
                organizationId: transaction.organization_id,
                personId: transaction.person_id,
                memberId: transaction.member_id,
                referenceNo: transaction.reference_no,
                voucherNo,
                narration: transaction.narration,
                sourceModule: "wallet",
                metadata: { ...commonMeta, target_wallet_id: targetWalletId },
            });
        } else {
            throw new Error("Unsupported wallet transaction type.");
        }

        for (const row of ledgerRows) {
            await addFinanceLedger(row);
        }

        await ensureAudit({
            action: "finance_wallet_transaction_posted",
            source: "admin",
            metadata: { transaction_id: transaction.id, wallet_id: walletId, type, amount, currency },
        });

        return ledgerRows;
    },

    async createFinanceEntry(payload, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canPostFinanceEntries) {
            throw new Error("You do not have permission to post finance entries.");
        }

        const type = requireString(payload?.type, "Entry type").toUpperCase();
        const allowed = ["INCOME", "EXPENSE", "RECEIPT", "PAYMENT"];
        if (!allowed.includes(type)) {
            throw new Error("Unsupported finance entry type.");
        }

        const settings = await this.getFinanceSettings({ scopeType: payload?.organizationId ? "organization" : "system", scopeId: payload?.organizationId || "global" });
        const accounts = await getOrSeedChartOfAccounts();
        const amount = toAmount(payload?.amount);
        const mode = requireString(payload?.mode || "Cash", "Mode");
        const currency = String(payload?.currency || settings.base_currency || "INR").toUpperCase();
        const exchangeRate = Number(payload?.exchangeRate || 1);
        const accountHead = payload?.accountHeadId
            ? accounts.find((item) => String(item.id) === String(payload.accountHeadId))
            : null;
        const bankOrCashAccount = getAccountByCode(accounts, mode.toLowerCase() === "bank" ? "BANK" : "CASH");
        const fallbackIncome = getAccountByCode(accounts, "DONATION_INCOME");
        const fallbackExpense = getAccountByCode(accounts, "OPERATING_EXPENSE");

        let debitAccount = bankOrCashAccount;
        let creditAccount = accountHead || fallbackIncome;

        if (type === "EXPENSE" || type === "PAYMENT") {
            debitAccount = accountHead || fallbackExpense;
            creditAccount = bankOrCashAccount;
        }

        const transaction = normalizeTransaction({
            transaction_type: type,
            amount,
            currency,
            exchange_rate: exchangeRate,
            base_amount: amount * exchangeRate,
            base_currency: settings.base_currency,
            organization_id: payload?.organizationId || payload?.organization_id || null,
            person_id: payload?.personId || payload?.person_id || null,
            member_id: payload?.memberId || payload?.member_id || null,
            wallet_id: payload?.walletId || payload?.wallet_id || null,
            debit_account_id: debitAccount?.id || null,
            credit_account_id: creditAccount?.id || null,
            debit_account_code: debitAccount?.code || null,
            credit_account_code: creditAccount?.code || null,
            reference_no: optionalString(payload?.referenceNo),
            voucher_no: payload?.voucherNo || `VCH-${Date.now()}`,
            narration: optionalString(payload?.narration),
            source_module: payload?.sourceModule || "finance",
            metadata: { role: normalizeRole(role) },
        });

        await addFinanceTransaction(transaction);

        const ledgerRows = buildDoubleEntryRows({
            transactionId: transaction.id,
            transactionType: type,
            amount,
            currency,
            exchangeRate,
            debitAccount,
            creditAccount,
            walletId: transaction.wallet_id,
            organizationId: transaction.organization_id,
            personId: transaction.person_id,
            memberId: transaction.member_id,
            referenceNo: transaction.reference_no,
            voucherNo: transaction.voucher_no,
            narration: transaction.narration,
            sourceModule: transaction.source_module,
            metadata: transaction.metadata,
        });

        for (const row of ledgerRows) {
            await addFinanceLedger(row);
        }

        if (transaction.wallet_id) {
            const wallets = Array.isArray(await getWallets()) ? await getWallets() : [];
            const wallet = wallets.find((item) => String(getWalletId(item)) === String(transaction.wallet_id));
            if (wallet) {
                const delta = type === "INCOME" || type === "RECEIPT" ? amount : -amount;
                await updateWalletBalance(wallet, delta);
            }
        }

        await ensureAudit({
            action: "finance_transaction_posted",
            source: "admin",
            metadata: { transaction_id: transaction.id, type, amount, currency },
        });

        return {
            ...transaction,
            direction: type === "INCOME" || type === "RECEIPT" ? "IN" : "OUT",
            mode,
            accountHeadId: accountHead?.id || "",
            accountHeadName: accountHead?.name || "",
            referenceNo: transaction.reference_no,
            voucherNo: transaction.voucher_no,
            createdAt: transaction.created_at,
        };
    },

    async deleteEntry(id, role = "member") {
        const permissions = makePermissionState(role);
        if (!permissions.canDeleteEntries) {
            throw new Error("You do not have permission to delete ledger entries.");
        }

        const rows = Array.isArray(await getFinanceLedgers()) ? await getFinanceLedgers() : [];
        const current = rows.find((entry) => String(entry.id) === String(id));
        if (!current) return;

        await deleteFinanceLedger(id);
        await ensureAudit({
            action: "finance_entry_deleted",
            source: "admin",
            metadata: { ledger_entry_id: id },
        });
    },

    async getVouchers(filters = {}, role = "member", actorProfile = null) {
        const transactions = await this.getTransactions(filters, role, actorProfile);
        return buildVoucherRows(transactions);
    },

    async getBooks(filters = {}, role = "member", actorProfile = null) {
        const ledger = await this.getFinanceEntries(filters, role, actorProfile);
        return {
            cashBook: ledger.filter((entry) => String(entry.account_code || "").toUpperCase() === "CASH"),
            bankBook: ledger.filter((entry) => String(entry.account_code || "").toUpperCase() === "BANK"),
            receipts: ledger.filter((entry) => Number(entry.debit_amount || 0) > 0 && ["INCOME", "RECEIPT", "WALLET_CREDIT"].includes(String(entry.entry_type || "").toUpperCase())),
            payments: ledger.filter((entry) => Number(entry.credit_amount || 0) > 0 && ["EXPENSE", "PAYMENT", "WALLET_DEBIT"].includes(String(entry.entry_type || "").toUpperCase())),
            income: ledger.filter((entry) => String(entry.entry_type || "").toUpperCase() === "INCOME"),
            expenses: ledger.filter((entry) => String(entry.entry_type || "").toUpperCase() === "EXPENSE"),
        };
    },

    async getTransactionHistory(filters = {}, role = "member", actorProfile = null) {
        const [tokens, donations, financeEntries] = await Promise.all([
            TokenService.getAll(),
            DonationService.getAll(),
            this.getFinanceEntries(filters, role, actorProfile),
        ]);

        const tokenRows = (Array.isArray(tokens) ? tokens : []).map((item) => ({
            id: `tok-${item.id}`,
            source: "Token",
            type: "TOKEN",
            reference: item.tokenNo || `TOK-${item.id}`,
            amount: Number(item.amount || 0),
            direction: "IN",
            mode: "Token",
            voucherNo: "-",
            status: item.status || "Issued",
            createdAt: item.createdAt || item.created_at || "",
        }));

        const donationRows = (Array.isArray(donations) ? donations : []).map((item) => ({
            id: `don-${item.id}`,
            source: "Donation",
            type: "DONATION",
            reference: item.receiptNo || `DON-${item.id}`,
            amount: Number(item.amount || 0),
            direction: "IN",
            mode: item.paymentMode || "Cash",
            voucherNo: "-",
            status: item.status || "Received",
            createdAt: item.createdAt || item.created_at || "",
        }));

        const ledgerRows = financeEntries.map((entry) => ({
            id: entry.id,
            source: "Finance",
            type: entry.entry_type || entry.type,
            reference: entry.reference_no || entry.referenceNo || entry.id,
            amount: Number(entry.amount || 0),
            direction: Number(entry.debit_amount || 0) > 0 ? "IN" : "OUT",
            mode: entry.account_code || "-",
            voucherNo: entry.voucher_no || entry.voucherNo || "-",
            status: entry.status || "Posted",
            createdAt: entry.created_at || entry.createdAt || "",
            accountHeadName: entry.account_name || entry.accountHeadName || "-",
            narration: entry.narration || "",
            walletId: entry.wallet_id || entry.walletId || "",
        }));

        return sortByCreatedAtDesc([...ledgerRows, ...tokenRows, ...donationRows]);
    },

    buildExport(rows, type = "transactions") {
        const columns = [
            { key: "createdAt", label: "Date" },
            { key: "source", label: "Source" },
            { key: "type", label: "Type" },
            { key: "direction", label: "Direction" },
            { key: "amount", label: "Amount" },
            { key: "mode", label: "Mode" },
            { key: "reference", label: "Reference" },
            { key: "voucherNo", label: "Voucher" },
            { key: "accountHeadName", label: "Account Head" },
            { key: "status", label: "Status" },
            { key: "narration", label: "Narration" },
        ];

        return {
            fileName: `${type}-${new Date().toISOString().slice(0, 10)}.csv`,
            csv: toCsv(rows, columns),
        };
    },

    async getDashboard(filters = {}, role = "member", actorProfile = null) {
        const [wallets, transactions, ledger, chart] = await Promise.all([
            this.getWalletFoundation(filters),
            this.getTransactions(filters, role, actorProfile),
            this.getFinanceEntries(filters, role, actorProfile),
            this.getChartOfAccounts(filters),
        ]);

        const walletBalance = wallets.reduce((sum, item) => sum + Number(item.balance || 0), 0);
        const debits = ledger.reduce((sum, item) => sum + Number(item.debit_amount || 0), 0);
        const credits = ledger.reduce((sum, item) => sum + Number(item.credit_amount || 0), 0);

        return {
            totalWallets: wallets.length,
            walletBalance,
            totalTransactions: transactions.length,
            totalAccounts: chart.length,
            totalLedgerEntries: ledger.length,
            totalDebits: debits,
            totalCredits: credits,
            balanced: Number(debits.toFixed(2)) === Number(credits.toFixed(2)),
            currencies: [...new Set(transactions.map((row) => row.currency || row.base_currency || "INR"))],
            recentTransactions: transactions.slice(0, 10),
            updatedAt: nowIso(),
        };
    },

    async getOverview(filters = {}, role = "member", actorProfile = null) {
        const [wallets, tokens, donations, ledger, dashboard] = await Promise.all([
            this.getWalletFoundation(filters),
            TokenService.getAll(),
            DonationService.getAll(),
            this.getFinanceEntries(filters, role, actorProfile),
            this.getDashboard(filters, role, actorProfile),
        ]);

        const walletRows = Array.isArray(wallets) ? wallets : [];
        const tokenRows = Array.isArray(tokens) ? tokens : [];
        const donationRows = Array.isArray(donations) ? donations : [];
        const walletBalance = walletRows.reduce((sum, item) => sum + Number(item.balance || 0), 0);
        const tokenValue = tokenRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const donationValue = donationRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const income = ledger.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0);
        const expenses = ledger.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0);

        return {
            wallets: walletRows,
            tokens: tokenRows,
            donations: donationRows,
            walletBalance,
            tokenValue,
            donationValue,
            totalTransactions: dashboard.totalTransactions,
            transactions: dashboard.recentTransactions,
            income,
            expenses,
            receipts: income,
            payments: expenses,
            financeDashboard: dashboard,
        };
    },
};

export default FinanceService;
