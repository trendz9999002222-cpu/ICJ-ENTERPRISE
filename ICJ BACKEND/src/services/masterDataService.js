import AuditLogService from "./auditLogService";
import { hasPermission } from "../core/permissions";
import { normalizeRoleCode } from "../core/roles";

const STORAGE_KEY = "icj_master_data_v1";

const MASTER_MODULES = {
    india_location_master: { key: "india_location_master", label: "India Location Master" },
    global_location_master: { key: "global_location_master", label: "Global Location Master" },
    country_master: { key: "country_master", label: "ISO Country Master" },
    india_court_master: { key: "india_court_master", label: "India Court Master" },
    india_tribunal_master: { key: "india_tribunal_master", label: "India Tribunal Master" },
    india_revenue_master: { key: "india_revenue_master", label: "India Revenue Master" },
    india_bar_council_master: { key: "india_bar_council_master", label: "India Bar Council Master" },
    india_bar_association_master: { key: "india_bar_association_master", label: "India Bar Association Master" },
    india_government_department_master: { key: "india_government_department_master", label: "India Government Department Master" },
    india_authority_master: { key: "india_authority_master", label: "India Authority Master" },
    india_service_category_master: { key: "india_service_category_master", label: "India Service Category Master" },
    india_case_category_master: { key: "india_case_category_master", label: "India Case Category Master" },
    india_profession_master: { key: "india_profession_master", label: "India Profession Master" },
    india_member_type_master: { key: "india_member_type_master", label: "India Member Type Master" },
    india_document_type_master: { key: "india_document_type_master", label: "India Document Type Master" },
};

const READ_PERMISSION = "membership.view";
const WRITE_PERMISSION = "membership.configure";

const toId = () => `md-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

const normalizeText = (value = "") => String(value || "").trim();

const normalizeRole = (context = {}) =>
    normalizeRoleCode(context.roleCode || context.role || context.actorRole || "member");

const getActor = (context = {}) => ({
    actorRole: context.actorRole || context.role || context.roleCode || null,
    actorName: context.actorName || null,
    actorUuid: context.actorUuid || context.userId || null,
});

const ensurePermission = (context = {}, permission, message) => {
    const roleCode = normalizeRole(context);
    if (!hasPermission(roleCode, permission)) {
        throw new Error(message);
    }
};

const readStore = () => {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const writeStore = (value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const ensureModuleKey = (moduleKey) => {
    const key = normalizeText(moduleKey).toLowerCase();
    if (!MASTER_MODULES[key]) {
        throw new Error("Invalid master module.");
    }
    return key;
};

const readRows = (moduleKey) => {
    const store = readStore();
    const rows = store[moduleKey];
    return Array.isArray(rows) ? rows : [];
};

const saveRows = (moduleKey, rows) => {
    const store = readStore();
    store[moduleKey] = Array.isArray(rows) ? rows : [];
    writeStore(store);
};

const normalizeRow = (values = {}, context = {}, existing = null) => {
    const now = new Date().toISOString();
    const role = normalizeRole(context);

    return {
        id: existing?.id || values.id || toId(),
        code: normalizeText(values.code || existing?.code || ""),
        name: normalizeText(values.name || existing?.name || ""),
        state: normalizeText(values.state || existing?.state || ""),
        country: normalizeText(values.country || existing?.country || "India") || "India",
        district: normalizeText(values.district || existing?.district || ""),
        sub_division: normalizeText(values.sub_division || values.subDivision || existing?.sub_division || ""),
        tehsil: normalizeText(values.tehsil || existing?.tehsil || ""),
        city: normalizeText(values.city || existing?.city || ""),
        post_office: normalizeText(values.post_office || values.postOffice || existing?.post_office || ""),
        pincode: normalizeText(values.pincode || values.pin_code || existing?.pincode || ""),
        court_type: normalizeText(values.court_type || values.courtType || existing?.court_type || ""),
        court: normalizeText(values.court || existing?.court || ""),
        bench: normalizeText(values.bench || existing?.bench || ""),
        jurisdiction: normalizeText(values.jurisdiction || existing?.jurisdiction || ""),
        bar_council: normalizeText(values.bar_council || values.barCouncil || existing?.bar_council || ""),
        bar_association: normalizeText(values.bar_association || values.barAssociation || existing?.bar_association || ""),
        enrollment_no: normalizeText(values.enrollment_no || values.enrollmentNo || existing?.enrollment_no || ""),
        status: normalizeText(values.status || existing?.status || "Active") || "Active",
        is_active: String(values.is_active ?? existing?.is_active ?? true) !== "false",
        metadata: values.metadata && typeof values.metadata === "object" ? values.metadata : (existing?.metadata || {}),
        created_at: existing?.created_at || now,
        updated_at: now,
        created_by: existing?.created_by || role,
        updated_by: role,
    };
};

const safeAudit = async (action, moduleKey, payload = {}, context = {}) => {
    try {
        const actor = getActor(context);
        await AuditLogService.logBusinessEvent({
            action,
            source: "web",
            module: "master_data",
            entity: moduleKey,
            entityUuid: payload.id || null,
            actorRole: actor.actorRole,
            actorName: actor.actorName,
            actorUuid: actor.actorUuid,
            previousState: payload.previousState,
            newState: payload.newState,
            result: "success",
            metadata: {
                module_key: moduleKey,
                module_label: MASTER_MODULES[moduleKey]?.label || moduleKey,
                message: payload.message || "",
            },
        });
    } catch {
        // Keep master operations non-blocking when audit fails.
    }
};

const toExcelHtml = (rows = []) => {
    const columns = [
        "code",
        "name",
        "state",
        "country",
        "district",
        "sub_division",
        "tehsil",
        "city",
        "post_office",
        "pincode",
        "court_type",
        "court",
        "bench",
        "jurisdiction",
        "bar_council",
        "bar_association",
        "enrollment_no",
        "status",
        "is_active",
        "updated_at",
    ];

    const head = columns.map((key) => `<th>${key}</th>`).join("");
    const body = rows
        .map((row) => `<tr>${columns.map((key) => `<td>${String(row?.[key] ?? "")}</td>`).join("")}</tr>`)
        .join("");

    return `<!doctype html><html><head><meta charset="UTF-8" /></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
};

const downloadBlob = (content, type, fileName) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const unique = (values = []) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
const normalizeCompare = (value) => String(value ?? "").trim().toLowerCase();
const matchesValue = (rowValue, filterValue) => {
    if (filterValue === undefined || filterValue === null || String(filterValue).trim() === "") return true;
    return normalizeCompare(rowValue) === normalizeCompare(filterValue);
};

const toTitleCaseCountry = (value = "") => String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

let isoCountryCache = null;
const getIsoCountryMaster = () => {
    if (isoCountryCache) return isoCountryCache;
    try {
        const displayNames = typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
            ? new Intl.DisplayNames(["en"], { type: "region" })
            : null;
        let supportedValues = [];
        if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
            try {
                supportedValues = Intl.supportedValuesOf("region");
            } catch {
                supportedValues = [];
            }
        }

        // Fallback: derive ISO-like country codes using DisplayNames when supportedValuesOf("region") is unavailable.
        if (!Array.isArray(supportedValues) || supportedValues.length === 0) {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const generated = [];
            for (let i = 0; i < letters.length; i += 1) {
                for (let j = 0; j < letters.length; j += 1) {
                    generated.push(`${letters[i]}${letters[j]}`);
                }
            }
            supportedValues = generated;
        }

        const countries = supportedValues
            .map((code) => {
                const countryCode = String(code || "").trim().toUpperCase();
                const name = displayNames ? displayNames.of(countryCode) : countryCode;
                return {
                    id: `iso-${countryCode}`,
                    code: countryCode,
                    country_code: countryCode,
                    name: String(name || countryCode),
                    country: String(name || countryCode),
                    is_active: true,
                };
            })
            .filter((row) => row.country_code && row.country && row.country !== row.country_code && !row.country.toLowerCase().includes("unknown region"));

        isoCountryCache = countries;
        return isoCountryCache;
    } catch {
        isoCountryCache = [];
        return isoCountryCache;
    }
};

const resolveCountryName = (row = {}) => {
    const explicit = normalizeText(row.country || row.country_name || row.name || "");
    if (explicit) return explicit;

    const countryCode = normalizeText(row.country_code || row.code || "").toUpperCase();
    if (!countryCode) return "";

    const isoMatch = getIsoCountryMaster().find((item) => item.country_code === countryCode);
    return isoMatch?.country || "";
};

const DEFAULT_INDIA_LOCATION_SEED = [
    // Maharashtra
    { state: "Maharashtra", district: "Mumbai City", tehsil: "Mumbai South", city: "Mumbai", post_office: "Mumbai GPO", pincode: "400001" },
    { state: "Maharashtra", district: "Mumbai City", tehsil: "Fort", city: "Fort", post_office: "Fort SO", pincode: "400001" },
    { state: "Maharashtra", district: "Mumbai Suburban", tehsil: "Andheri", city: "Andheri East", post_office: "Andheri East SO", pincode: "400069" },
    { state: "Maharashtra", district: "Mumbai Suburban", tehsil: "Andheri", city: "Andheri West", post_office: "Andheri West SO", pincode: "400058" },
    { state: "Maharashtra", district: "Mumbai Suburban", tehsil: "Bandra", city: "Bandra West", post_office: "Bandra West SO", pincode: "400050" },
    { state: "Maharashtra", district: "Pune", tehsil: "Haveli", city: "Pune", post_office: "Pune GPO", pincode: "411001" },
    { state: "Maharashtra", district: "Pune", tehsil: "Haveli", city: "Pimpri-Chinchwad", post_office: "Pimpri SO", pincode: "411018" },
    { state: "Maharashtra", district: "Nagpur", tehsil: "Nagpur Urban", city: "Nagpur", post_office: "Nagpur GPO", pincode: "440001" },
    { state: "Maharashtra", district: "Thane", tehsil: "Thane", city: "Thane", post_office: "Thane HO", pincode: "400601" },
    { state: "Maharashtra", district: "Thane", tehsil: "Thane", city: "Navi Mumbai", post_office: "Vashi SO", pincode: "400703" },
    { state: "Maharashtra", district: "Nashik", tehsil: "Nashik", city: "Nashik", post_office: "Nashik HO", pincode: "422001" },
    { state: "Maharashtra", district: "Aurangabad", tehsil: "Aurangabad", city: "Chhatrapati Sambhajinagar", post_office: "Aurangabad HO", pincode: "431001" },
    // Delhi
    { state: "Delhi", district: "New Delhi", tehsil: "Chanakyapuri", city: "New Delhi", post_office: "Connaught Place SO", pincode: "110001" },
    { state: "Delhi", district: "Central Delhi", tehsil: "Daryaganj", city: "Delhi", post_office: "Delhi GPO", pincode: "110006" },
    { state: "Delhi", district: "South Delhi", tehsil: "Hauz Khas", city: "New Delhi", post_office: "Hauz Khas SO", pincode: "110016" },
    { state: "Delhi", district: "South Delhi", tehsil: "Saket", city: "New Delhi", post_office: "Saket SO", pincode: "110017" },
    { state: "Delhi", district: "North Delhi", tehsil: "Sadar Bazar", city: "Delhi", post_office: "Sadar Bazar SO", pincode: "110006" },
    // Uttar Pradesh
    { state: "Uttar Pradesh", district: "Lucknow", tehsil: "Lucknow", city: "Lucknow", post_office: "Lucknow GPO", pincode: "226001" },
    { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", tehsil: "Dadri", city: "Noida", post_office: "Noida Main SO", pincode: "201301" },
    { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", tehsil: "Dadri", city: "Greater Noida", post_office: "Alpha Greater Noida SO", pincode: "201310" },
    { state: "Uttar Pradesh", district: "Kanpur Nagar", tehsil: "Kanpur", city: "Kanpur", post_office: "Kanpur HO", pincode: "208001" },
    { state: "Uttar Pradesh", district: "Varanasi", tehsil: "Varanasi", city: "Varanasi", post_office: "Varanasi HO", pincode: "221001" },
    { state: "Uttar Pradesh", district: "Prayagraj", tehsil: "Sadar", city: "Prayagraj", post_office: "Prayagraj HO", pincode: "211001" },
    { state: "Uttar Pradesh", district: "Agra", tehsil: "Agra", city: "Agra", post_office: "Agra Fort HO", pincode: "282001" },
    // Karnataka
    { state: "Karnataka", district: "Bengaluru Urban", tehsil: "Bengaluru North", city: "Bengaluru", post_office: "Bengaluru GPO", pincode: "560001" },
    { state: "Karnataka", district: "Bengaluru Urban", tehsil: "Bengaluru South", city: "Bengaluru", post_office: "Jayanagar SO", pincode: "560041" },
    { state: "Karnataka", district: "Mysuru", tehsil: "Mysuru", city: "Mysuru", post_office: "Mysuru HO", pincode: "570001" },
    { state: "Karnataka", district: "Dakshina Kannada", tehsil: "Mangaluru", city: "Mangaluru", post_office: "Mangaluru HO", pincode: "575001" },
    // Tamil Nadu
    { state: "Tamil Nadu", district: "Chennai", tehsil: "Egmore-Nungambakkam", city: "Chennai", post_office: "Chennai GPO", pincode: "600001" },
    { state: "Tamil Nadu", district: "Coimbatore", tehsil: "Coimbatore South", city: "Coimbatore", post_office: "Coimbatore HO", pincode: "641001" },
    { state: "Tamil Nadu", district: "Madurai", tehsil: "Madurai South", city: "Madurai", post_office: "Madurai HO", pincode: "625001" },
    // Gujarat
    { state: "Gujarat", district: "Ahmedabad", tehsil: "Ahmedabad City", city: "Ahmedabad", post_office: "Ahmedabad GPO", pincode: "380001" },
    { state: "Gujarat", district: "Surat", tehsil: "Surat City", city: "Surat", post_office: "Surat HO", pincode: "395003" },
    { state: "Gujarat", district: "Vadodara", tehsil: "Vadodara", city: "Vadodara", post_office: "Vadodara HO", pincode: "390001" },
    // West Bengal
    { state: "West Bengal", district: "Kolkata", tehsil: "Kolkata", city: "Kolkata", post_office: "Kolkata GPO", pincode: "700001" },
    { state: "West Bengal", district: "North 24 Parganas", tehsil: "Bidhannagar", city: "Salt Lake", post_office: "Bidhannagar CC", pincode: "700091" },
    { state: "West Bengal", district: "Howrah", tehsil: "Howrah", city: "Howrah", post_office: "Howrah HO", pincode: "711101" },
    // Telangana
    { state: "Telangana", district: "Hyderabad", tehsil: "Secunderabad", city: "Hyderabad", post_office: "Hyderabad GPO", pincode: "500001" },
    // Andhra Pradesh
    { state: "Andhra Pradesh", district: "Visakhapatnam", tehsil: "Visakhapatnam Urban", city: "Visakhapatnam", post_office: "Visakhapatnam HO", pincode: "530001" },
    { state: "Andhra Pradesh", district: "NTR", tehsil: "Vijayawada", city: "Vijayawada", post_office: "Vijayawada HO", pincode: "520001" },
    // Rajasthan
    { state: "Rajasthan", district: "Jaipur", tehsil: "Jaipur", city: "Jaipur", post_office: "Jaipur GPO", pincode: "302001" },
    { state: "Rajasthan", district: "Jodhpur", tehsil: "Jodhpur", city: "Jodhpur", post_office: "Jodhpur HO", pincode: "342001" },
    // Madhya Pradesh
    { state: "Madhya Pradesh", district: "Bhopal", tehsil: "Huzur", city: "Bhopal", post_office: "Bhopal GPO", pincode: "462001" },
    { state: "Madhya Pradesh", district: "Indore", tehsil: "Indore", city: "Indore", post_office: "Indore GPO", pincode: "452001" },
    // Kerala
    { state: "Kerala", district: "Thiruvananthapuram", tehsil: "Thiruvananthapuram", city: "Thiruvananthapuram", post_office: "Thiruvananthapuram GPO", pincode: "695001" },
    { state: "Kerala", district: "Ernakulam", tehsil: "Kanayannur", city: "Kochi", post_office: "Ernakulam HO", pincode: "682011" },
    // Punjab & Haryana & UTs
    { state: "Punjab", district: "Ludhiana", tehsil: "Ludhiana", city: "Ludhiana", post_office: "Ludhiana HO", pincode: "141001" },
    { state: "Haryana", district: "Gurugram", tehsil: "Gurugram", city: "Gurugram", post_office: "Gurugram HO", pincode: "122001" },
    { state: "Chandigarh", district: "Chandigarh", tehsil: "Chandigarh", city: "Chandigarh", post_office: "Chandigarh GPO", pincode: "160017" },
    { state: "Bihar", district: "Patna", tehsil: "Patna Sadar", city: "Patna", post_office: "Patna GPO", pincode: "800001" },
    { state: "Odisha", district: "Khurda", tehsil: "Bhubaneswar", city: "Bhubaneswar", post_office: "Bhubaneswar GPO", pincode: "751001" },
    { state: "Assam", district: "Kamrup Metropolitan", tehsil: "Guwahati", city: "Guwahati", post_office: "Guwahati GPO", pincode: "781001" },
    { state: "Jharkhand", district: "Ranchi", tehsil: "Ranchi", city: "Ranchi", post_office: "Ranchi GPO", pincode: "834001" },
    { state: "Chhattisgarh", district: "Raipur", tehsil: "Raipur", city: "Raipur", post_office: "Raipur GPO", pincode: "492001" },
    { state: "Uttarakhand", district: "Dehradun", tehsil: "Dehradun", city: "Dehradun", post_office: "Dehradun GPO", pincode: "248001" },
    { state: "Himachal Pradesh", district: "Shimla", tehsil: "Shimla", city: "Shimla", post_office: "Shimla GPO", pincode: "171001" },
    { state: "Goa", district: "North Goa", tehsil: "Tiswadi", city: "Panaji", post_office: "Panaji HO", pincode: "403001" },
    { state: "Jammu and Kashmir", district: "Srinagar", tehsil: "Srinagar", city: "Srinagar", post_office: "Srinagar GPO", pincode: "190001" },
    { state: "Jammu and Kashmir", district: "Jammu", tehsil: "Jammu", city: "Jammu", post_office: "Jammu HO", pincode: "180001" },
    { state: "Ladakh", district: "Leh", tehsil: "Leh", city: "Leh", post_office: "Leh Head Post Office", pincode: "194101" },
    { state: "Puducherry", district: "Puducherry", tehsil: "Puducherry", city: "Puducherry", post_office: "Puducherry HO", pincode: "605001" },
];

const normalizeAddressRow = (row = {}) => {
    let country = resolveCountryName(row);
    if (!country || country.toUpperCase() === "IN") {
        country = "India";
    }
    const state = normalizeText(row.state || row.province || row.region || "");
    const district = normalizeText(row.district || row.county || row.prefecture || "");
    const subDivision = normalizeText(row.sub_division || row.subDivision || row.sub_district || row.subDistrict || "");
    const tehsil = normalizeText(row.tehsil || row.taluka || row.mandal || "");
    const city = normalizeText(row.city || row.town || row.municipality || "");
    const locality = normalizeText(row.locality || row.village || "");
    const postOffice = normalizeText(row.post_office || row.postOffice || row.postal_office || "");
    const postalCode = normalizeText(row.postal_code || row.zip_code || row.zip || row.pincode || row.pin_code || "");

    return {
        country,
        countryCode: normalizeText(row.country_code || row.code || "").toUpperCase() || (country === "India" ? "IN" : ""),
        state,
        district,
        subDivision,
        tehsil,
        city,
        locality,
        postOffice,
        postalCode,
        metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    };
};

const getGlobalAddressRows = () => {
    const globalRows = filterRows(readRows("global_location_master"), { includeInactive: false })
        .map((row) => normalizeAddressRow(row, "global_location_master"));
    const userIndiaRows = filterRows(readRows("india_location_master"), { includeInactive: false })
        .map((row) => normalizeAddressRow(row, "india_location_master"));
    const seedIndiaRows = DEFAULT_INDIA_LOCATION_SEED
        .map((row) => normalizeAddressRow(row, "india_location_master"));

    const rows = [...globalRows, ...userIndiaRows, ...seedIndiaRows];

    return rows.filter((row) => row.country || row.state || row.city || row.postalCode);
};

const resolveAddressFieldConfig = (selectedCountry = "", countryRows = []) => {
    const countryMasterRows = readRows("country_master");
    const configRow = countryMasterRows
        .map((row) => ({
            country: resolveCountryName(row),
            metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
            row,
        }))
        .find((item) => matchesValue(item.country, selectedCountry));

    const metadata = configRow?.metadata || {};
    const labels = metadata.labels && typeof metadata.labels === "object" ? metadata.labels : {};

    const isNonIndia = Boolean(selectedCountry && selectedCountry !== "India");
    const hasValue = (field) => countryRows.some((row) => normalizeText(row?.[field] || ""));

    return {
        visibility: {
            state: metadata.visibility?.state !== false,
            district: isNonIndia ? false : (metadata.visibility?.district ?? hasValue("district") ?? true),
            city: metadata.visibility?.city !== false,
            locality: isNonIndia ? false : (metadata.visibility?.locality ?? hasValue("locality")),
            postOffice: isNonIndia ? false : (metadata.visibility?.postOffice ?? hasValue("postOffice") ?? true),
            postalCode: metadata.visibility?.postalCode !== false,
        },
        labels: {
            state: labels.state || (isNonIndia ? "State / Province / Region" : "State"),
            district: labels.district || "District",
            city: labels.city || (isNonIndia ? "City / Town / Municipality" : "City / Town / Village"),
            locality: labels.locality || "Locality / Village",
            postOffice: labels.postOffice || "Post Office",
            postalCode: labels.postalCode || (isNonIndia ? "Postal Code / ZIP Code" : "PIN Code"),
        },
    };
};

const filterRows = (rows = [], options = {}) => {
    const keyword = normalizeText(options.search || "").toLowerCase();
    const filters = options.filters && typeof options.filters === "object" ? options.filters : {};
    const includeInactive = Boolean(options.includeInactive);

    return rows.filter((row) => {
        if (!includeInactive && !row.is_active) return false;

        const matchesSearch =
            !keyword ||
            [row.code, row.name, row.country, row.state, row.district, row.city, row.post_office, row.pincode, row.court, row.bar_association]
                .map((value) => String(value || "").toLowerCase())
                .some((value) => value.includes(keyword));

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null || String(value) === "" || String(value).toUpperCase() === "ALL") {
                return true;
            }
            return String(row?.[key] ?? "").toLowerCase() === String(value).toLowerCase();
        });

        return matchesSearch && matchesFilters;
    });
};

const MasterDataService = {
    getModules() {
        return Object.values(MASTER_MODULES);
    },

    async list(moduleKey, options = {}, context = {}) {
        ensurePermission(context, READ_PERMISSION, "You do not have permission to view master data.");
        const key = ensureModuleKey(moduleKey);
        const rows = readRows(key);
        return filterRows(rows, options);
    },

    async create(moduleKey, values = {}, context = {}) {
        ensurePermission(context, WRITE_PERMISSION, "You do not have permission to create master data.");
        const key = ensureModuleKey(moduleKey);
        const rows = readRows(key);
        const next = normalizeRow(values, context);
        rows.unshift(next);
        saveRows(key, rows);
        await safeAudit("master_record_created", key, { id: next.id, newState: next }, context);
        return next;
    },

    async update(moduleKey, id, values = {}, context = {}) {
        ensurePermission(context, WRITE_PERMISSION, "You do not have permission to update master data.");
        const key = ensureModuleKey(moduleKey);
        const rows = readRows(key);
        const index = rows.findIndex((row) => String(row.id) === String(id));
        if (index < 0) throw new Error("Master record not found.");

        const previous = rows[index];
        const next = normalizeRow({ ...previous, ...values }, context, previous);
        rows[index] = next;
        saveRows(key, rows);
        await safeAudit("master_record_updated", key, {
            id: next.id,
            previousState: previous,
            newState: next,
        }, context);
        return next;
    },

    async remove(moduleKey, id, context = {}) {
        ensurePermission(context, WRITE_PERMISSION, "You do not have permission to delete master data.");
        const key = ensureModuleKey(moduleKey);
        const rows = readRows(key);
        const previous = rows.find((row) => String(row.id) === String(id));
        if (!previous) throw new Error("Master record not found.");

        const nextRows = rows.filter((row) => String(row.id) !== String(id));
        saveRows(key, nextRows);
        await safeAudit("master_record_deleted", key, { id, previousState: previous, newState: null }, context);
        return true;
    },

    async activate(moduleKey, id, context = {}) {
        return this.update(moduleKey, id, { is_active: true, status: "Active" }, context);
    },

    async deactivate(moduleKey, id, context = {}) {
        return this.update(moduleKey, id, { is_active: false, status: "Inactive" }, context);
    },

    async search(moduleKey, keyword = "", context = {}) {
        return this.list(moduleKey, { search: keyword }, context);
    },

    async filter(moduleKey, filters = {}, context = {}) {
        return this.list(moduleKey, { filters }, context);
    },

    async importExcel(moduleKey, rows = [], context = {}) {
        ensurePermission(context, WRITE_PERMISSION, "You do not have permission to import master data.");
        const key = ensureModuleKey(moduleKey);
        const current = readRows(key);
        const incoming = Array.isArray(rows) ? rows : [];

        incoming.forEach((entry) => {
            const code = normalizeText(entry?.code || "");
            const name = normalizeText(entry?.name || "");
            const existingIndex = current.findIndex((row) =>
                (code && String(row.code) === code) || (!code && name && String(row.name) === name)
            );

            if (existingIndex >= 0) {
                current[existingIndex] = normalizeRow({ ...current[existingIndex], ...entry }, context, current[existingIndex]);
            } else {
                current.unshift(normalizeRow(entry, context));
            }
        });

        saveRows(key, current);
        await safeAudit("master_records_imported", key, {
            message: `${incoming.length} rows imported`,
            newState: { count: incoming.length },
        }, context);

        return { imported: incoming.length, total: current.length };
    },

    async exportExcel(moduleKey, options = {}, context = {}) {
        ensurePermission(context, READ_PERMISSION, "You do not have permission to export master data.");
        const key = ensureModuleKey(moduleKey);
        const rows = await this.list(key, options, context);
        const html = toExcelHtml(rows);
        const fileName = `${key}-${new Date().toISOString().slice(0, 10)}.xls`;
        downloadBlob(html, "application/vnd.ms-excel;charset=utf-8;", fileName);
        await safeAudit("master_records_exported", key, {
            message: `${rows.length} rows exported`,
            newState: { count: rows.length },
        }, context);
        return { count: rows.length, fileName };
    },

    getCountryMaster() {
        const managed = filterRows(readRows("country_master"), { includeInactive: false })
            .map((row) => ({
                id: row.id || `country-${normalizeText(row.country_code || row.code || row.country || row.name || "")}`,
                country_code: normalizeText(row.country_code || row.code || "").toUpperCase(),
                country: resolveCountryName(row),
            }))
            .filter((row) => row.country);

        const iso = getIsoCountryMaster().map((row) => ({
            id: row.id,
            country_code: row.country_code,
            country: row.country,
        }));

        const merged = [...managed, ...iso]
            .filter((row) => row.country)
            .reduce((acc, row) => {
                const key = normalizeCompare(row.country_code || row.country);
                if (!acc.has(key)) {
                    acc.set(key, {
                        id: row.id || `country-${key}`,
                        country_code: row.country_code || "",
                        country: toTitleCaseCountry(row.country),
                    });
                }
                return acc;
            }, new Map());

        return Array.from(merged.values()).sort((a, b) => a.country.localeCompare(b.country));
    },

    getAddressHierarchy(filters = {}) {
        const rawCountry = normalizeText(filters.country || "");
        const countryFilter = rawCountry || "India";
        const stateFilter = normalizeText(filters.state || "");
        const districtFilter = normalizeText(filters.district || "");
        const subDivisionFilter = normalizeText(filters.sub_division || filters.subDivision || "");
        const tehsilFilter = normalizeText(filters.tehsil || "");
        const cityFilter = normalizeText(filters.city || "");
        const localityFilter = normalizeText(filters.locality || "");
        const postOfficeFilter = normalizeText(filters.post_office || filters.postOffice || "");

        const rows = getGlobalAddressRows();
        const masterCountries = this.getCountryMaster().map((row) => row.country);
        const countries = unique(masterCountries.concat(rows.map((row) => row.country)));

        const byCountry = rows.filter((row) => matchesValue(row.country, countryFilter));
        const byState = byCountry.filter((row) => matchesValue(row.state, stateFilter));
        const byDistrict = byState.filter((row) => matchesValue(row.district, districtFilter));
        const bySubDivision = byDistrict.filter((row) => matchesValue(row.subDivision, subDivisionFilter));
        const byTehsil = bySubDivision.filter((row) => matchesValue(row.tehsil, tehsilFilter));
        const byCity = byTehsil.filter((row) => matchesValue(row.city, cityFilter));
        const byLocality = byCity.filter((row) => matchesValue(row.locality, localityFilter));

        const fieldConfig = resolveAddressFieldConfig(countryFilter, byCountry);

        const subDivisions = unique(byDistrict.map((row) => row.subDivision));
        const tehsils = unique(byDistrict.map((row) => row.tehsil));
        const cities = unique((byTehsil.length > 0 ? byTehsil : byDistrict).map((row) => row.city));
        const localities = unique((byCity.length > 0 ? byCity : byDistrict).map((row) => row.locality));

        const postOfficeScope = byCity.length > 0 ? byCity : (byTehsil.length > 0 ? byTehsil : byDistrict);
        const postOffices = unique(postOfficeScope
            .filter((row) => matchesValue(row.postOffice, postOfficeFilter) || !postOfficeFilter)
            .map((row) => row.postOffice));

        const pinCodeScope = byLocality.length > 0 ? byLocality : postOfficeScope;
        const postalCodes = unique(pinCodeScope
            .filter((row) => postOfficeFilter ? matchesValue(row.postOffice, postOfficeFilter) : true)
            .map((row) => row.postalCode));

        return {
            countries,
            states: unique(byCountry.map((row) => row.state)),
            districts: unique(byState.map((row) => row.district)),
            subDivisions,
            tehsils,
            cities,
            localities,
            postOffices,
            postalCodes,
            fields: fieldConfig,
            pinCodes: postalCodes,
        };
    },

    getLocationHierarchy(filters = {}, context = {}) {
        const hierarchy = this.getAddressHierarchy(filters, context);
        return {
            countries: hierarchy.countries,
            states: hierarchy.states,
            districts: hierarchy.districts,
            subDivisions: hierarchy.subDivisions,
            tehsils: hierarchy.tehsils,
            cities: hierarchy.cities,
            localities: hierarchy.localities,
            postOffices: hierarchy.postOffices,
            pinCodes: hierarchy.postalCodes,
            postalCodes: hierarchy.postalCodes,
            fields: hierarchy.fields,
        };
    },

    getCourtHierarchy(filters = {}) {
        const rows = filterRows(readRows("india_court_master"), { filters, includeInactive: false });
        return {
            states: unique(rows.map((row) => row.state)),
            courtTypes: unique(rows.filter((row) => !filters.state || row.state === filters.state).map((row) => row.court_type)),
            courts: unique(rows
                .filter((row) => (!filters.state || row.state === filters.state) && (!filters.court_type || row.court_type === filters.court_type))
                .map((row) => row.court)),
            benches: unique(rows
                .filter((row) => (!filters.state || row.state === filters.state) && (!filters.court_type || row.court_type === filters.court_type) && (!filters.court || row.court === filters.court))
                .map((row) => row.bench)),
            jurisdictions: unique(rows
                .filter((row) => (!filters.state || row.state === filters.state) && (!filters.court_type || row.court_type === filters.court_type) && (!filters.court || row.court === filters.court) && (!filters.bench || row.bench === filters.bench))
                .map((row) => row.jurisdiction)),
        };
    },

    getAdvocateHierarchy(filters = {}) {
        const councilRows = filterRows(readRows("india_bar_council_master"), { includeInactive: false });
        const associationRows = filterRows(readRows("india_bar_association_master"), { includeInactive: false });

        const stateBarCouncils = councilRows.filter((row) => !filters.state || row.state === filters.state);
        const barAssociations = associationRows.filter(
            (row) =>
                (!filters.state || row.state === filters.state) &&
                (!filters.bar_council || row.bar_council === filters.bar_council)
        );

        return {
            states: unique(councilRows.concat(associationRows).map((row) => row.state)),
            stateBarCouncils: unique(stateBarCouncils.map((row) => row.name || row.bar_council)),
            barAssociations: unique(barAssociations.map((row) => row.name || row.bar_association)),
            enrollments: unique(barAssociations.map((row) => row.enrollment_no)),
            courts: unique(barAssociations.map((row) => row.court)),
        };
    },

    getProfessions() {
        const rows = filterRows(readRows("india_profession_master"), { includeInactive: false });
        const masterList = unique(rows.map((row) => row.name || row.profession || row.code));
        const defaultProfessions = [
            // LEGAL
            "Advocate", "Senior Advocate", "Junior Advocate", "Law Student", "Legal Consultant",
            "Legal Researcher", "Retired Judge", "Retired Judicial Officer", "Retired Legal Officer",
            "Notary", "Oath Commissioner", "Commissioner", "Court Clerk", "Junior Clerk", "Senior Clerk",
            "Court Reader", "Bench Clerk", "Stenographer", "Typist", "Documentation Expert",
            "Document Writer", "Petition Writer", "Deed Writer", "Stamp Vendor", "License Writer",
            "Drafting Expert", "Legal Translator", "Court Translator", "Interpreter", "Arbitrator",
            "Mediator", "Conciliator",
            // REVENUE & PROPERTY
            "Revenue Practitioner", "Revenue Consultant", "Property Consultant", "Surveyor",
            "Licensed Surveyor", "GIS Survey Expert", "Property Valuer", "Architect", "Map Designer", "Site Plan Expert",
            // FINANCE
            "Chartered Accountant", "Cost Accountant", "Company Secretary", "GST Consultant",
            "Tax Consultant", "Auditor", "Banking Consultant",
            // GOVERNMENT
            "Government Employee", "Retired Government Officer", "Police Officer", "Retired Police Officer", "Public Prosecutor",
            // EDUCATION
            "Professor", "Teacher", "Lecturer", "Research Scholar", "Student",
            // MEDICAL
            "Doctor", "Pharmacist",
            // ENGINEERING
            "Engineer", "Software Engineer", "System Architect",
            // BUSINESS
            "Businessman", "Industrialist", "Trader", "Book Seller", "Publisher", "Printing Press", "Service Provider",
            // OTHER
            "Freelancer", "Consultant", "Other",
        ];
        return unique([...defaultProfessions, ...masterList]);
    },
};

export default MasterDataService;
