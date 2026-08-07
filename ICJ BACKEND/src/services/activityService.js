import { getMembers } from "./database";

const ACTIVITY_KEY = "icj_activity_events";

const readEvents = () => {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(ACTIVITY_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
};

const writeEvents = (events) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events));
};

const ActivityService = {
	async getAll() {
		const [members, events] = await Promise.all([getMembers(), Promise.resolve(readEvents())]);

		const memberEvents = (members || []).map((member) => ({
			id: `member-${member.members || member.id || member.uuid}`,
			title: `${member.name || "Member"} record available`,
			type: "membership",
			timestamp: member.registration_date || member.created_at || new Date().toISOString(),
			meta: {
				verification_status: member.verification_status || "Pending",
			},
		}));

		return [...events, ...memberEvents].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	},

	create(event = {}) {
		const events = readEvents();
		const next = {
			id: `activity-${Date.now()}`,
			title: event.title || "Activity Recorded",
			type: event.type || "system",
			timestamp: new Date().toISOString(),
			...event,
		};

		writeEvents([next, ...events]);
		return next;
	},
};

export default ActivityService;
