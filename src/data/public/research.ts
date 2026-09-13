import type { AcademyCourse, ResearchPaper, TrainingEvent } from "@/types/public";

export const mockResearchPapers: ResearchPaper[] = [
  {
    id: "res-1",
    title: "Access to Justice in the Digital Era: A Socio-Legal Analysis of E-Courts and ODR Mechanisms",
    category: "Research Paper",
    authors: ["Dr. Meenakshi Sundaram", "Prof. Rajesh V. Sharma"],
    abstract:
      "This paper evaluates the efficacy of digital dispute resolution platforms and e-filing systems across district courts in India, identifying infrastructural bottlenecks and proposing hybrid legal aid paradigms.",
    publishedYear: 2026,
    publishedDate: "2026-02-15",
    tags: ["E-Courts", "ODR", "Legal Aid", "Digital Justice"],
    readTimeMinutes: 18,
  },
  {
    id: "res-2",
    title: "Reforming Pre-Litigation Mediation Frameworks under the Mediation Act, 2023",
    category: "Policy Paper",
    authors: ["Adv. Tariq Ahmad Khan", "ICJ ADR Working Group"],
    abstract:
      "A comprehensive review of institutional mediation standards, community dispute resolution centers, and enforcement procedures of negotiated settlement agreements.",
    publishedYear: 2025,
    publishedDate: "2025-11-20",
    tags: ["Mediation", "ADR", "Policy Reform", "Commercial Law"],
    readTimeMinutes: 24,
  },
  {
    id: "res-3",
    title: "Data Protection Compliance in Healthcare and Telemedicine under DPDP Act",
    category: "White Paper",
    authors: ["Adv. Priya S. Kulkarni"],
    abstract:
      "Operational guidelines for health data fiduciaries, consent management architectures, and cross-border data transfer compliance for medical legal entities.",
    publishedYear: 2025,
    publishedDate: "2025-08-10",
    tags: ["Data Privacy", "DPDP Act", "Healthcare", "Compliance"],
    readTimeMinutes: 15,
  },
  {
    id: "res-4",
    title: "Consumer Rights Protection Against Deceptive Design and Dark Patterns in E-Commerce",
    category: "Case Study",
    authors: ["Adv. Sunita Banerjee", "Legal Research Cell"],
    abstract:
      "Empirical analysis of 120 consumer disputes involving drip pricing, false urgency, and hidden subscriptions with recommended regulatory enforcement measures.",
    publishedYear: 2025,
    publishedDate: "2025-05-14",
    tags: ["Consumer Law", "E-Commerce", "Dark Patterns", "Consumer Forums"],
    readTimeMinutes: 12,
  },
];

export const mockAcademyCourses: AcademyCourse[] = [
  {
    id: "acad-1",
    title: "Certificate in Institutional Mediation & Commercial Negotiation",
    level: "Professional",
    duration: "6 Weeks (40 Hours)",
    mode: "Hybrid",
    instructor: "Dr. Meenakshi Sundaram",
    instructorTitle: "Senior Accredited Mediator & ADR Specialist",
    description:
      "Comprehensive training on non-adversarial dispute resolution, negotiation psychology, drafting settlement deeds, and institutional mediation conduct under Indian and international rules.",
    modulesCount: 8,
    certificateProvided: true,
    upcomingBatchDate: "2026-10-15",
    featured: true,
  },
  {
    id: "acad-2",
    title: "Digital Personal Data Protection (DPDP) Act: Compliance & Advisory",
    level: "Intermediate",
    duration: "4 Weeks (24 Hours)",
    mode: "Online",
    instructor: "Adv. Priya S. Kulkarni",
    instructorTitle: "Cyber & Privacy Law Counsel",
    description:
      "Practical course designed for corporate lawyers, CAs, and compliance officers on DPIA assessments, notice requirements, penalty avoidance, and data principal rights management.",
    modulesCount: 6,
    certificateProvided: true,
    upcomingBatchDate: "2026-11-01",
    featured: true,
  },
  {
    id: "acad-3",
    title: "Criminal Trial Practice & Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    level: "Advanced",
    duration: "8 Weeks (60 Hours)",
    mode: "Hybrid",
    instructor: "Adv. Rajesh V. Sharma",
    instructorTitle: "Senior Criminal Defense Practitioner",
    description:
      "In-depth analysis of newly codified criminal procedural laws, electronic evidence appreciation, bail litigation, and cross-examination mastery.",
    modulesCount: 10,
    certificateProvided: true,
    upcomingBatchDate: "2026-10-25",
  },
];

export const mockTrainingEvents: TrainingEvent[] = [
  {
    id: "event-1",
    title: "National Symposium on Alternative Dispute Resolution & Judicial Ease",
    eventType: "Symposium",
    eventDate: "2026-10-28",
    timeString: "10:00 AM - 04:30 PM IST",
    locationOrPlatform: "ICJ National Convention Hall & Live Webcast",
    speaker: "Hon'ble Justice (Retd.) Panel",
    speakerDesignation: "Chaired by Former High Court Judges and Senior Counsel",
    description:
      "A flagship conference examining the role of institutional arbitration and pre-litigation mediation in reducing docket backlog across Indian courts.",
    registrationOpen: true,
  },
  {
    id: "event-2",
    title: "Masterclass: Effective RTI Drafting & Appellate Strategies",
    eventType: "Workshop",
    eventDate: "2026-11-12",
    timeString: "02:00 PM - 05:00 PM IST",
    locationOrPlatform: "Live Interactive Webinar",
    speaker: "Shri Alok Vardhan",
    speakerDesignation: "Former State Information Commissioner",
    description:
      "Practical workshop for citizen advocates, law students, and researchers on drafting precise RTI queries and prosecuting appeals before State/Central Commissions.",
    registrationOpen: true,
  },
];
