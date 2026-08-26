// ICJ ENTERPRISE — REPEALED VS ACTIVE ACTS TRANSITION & CONCORDANCE ENGINE
// Provides Section-by-Section Cross-Mapping between Old/Repealed Statutes and Modern Codes

export const REPEALED_ACT_PAIRS = [
  {
    pair_id: "TRANSITION_IPC_BNS",
    old_act_id: "ACT_IPC_1860",
    old_act_name: "Indian Penal Code, 1860 (Repealed)",
    new_act_id: "ACT_BNS_2023",
    new_act_name: "Bharatiya Nyaya Sanhita, 2023",
    effective_date: "2024-07-01",
    summary: "Complete overhaul of substantive criminal law: Sedition replaced with Treason (S.152), Mob Lynching added (S.103(2)), Snatching introduced (S.304), Community Service punishment introduced for petty theft.",
    mappings: [
      {
        old_section: "302",
        old_title: "Punishment for Murder",
        new_section: "103(1)",
        new_title: "Punishment for Murder",
        substantive_change: "Punishment remains Death or Life Imprisonment + fine. S.103(2) introduces specific death/life penalty for mob lynching based on race, caste, community.",
      },
      {
        old_section: "304",
        old_title: "Culpable Homicide not amounting to murder",
        new_section: "105",
        new_title: "Culpable Homicide not amounting to murder",
        substantive_change: "Re-numbered and structured with life imprisonment or up to 10 years + fine.",
      },
      {
        old_section: "304A",
        old_title: "Causing death by negligence (Hit & Run)",
        new_section: "106",
        new_title: "Causing death by negligence",
        substantive_change: "Clause (1) provides up to 5 years for rash driving; Clause (2) provides up to 10 years + fine for escaping without reporting to police/magistrate.",
      },
      {
        old_section: "307",
        old_title: "Attempt to Murder",
        new_section: "109",
        new_title: "Attempt to Murder",
        substantive_change: "Re-numbered as Section 109 with up to 10 years or Life Imprisonment if hurt caused.",
      },
      {
        old_section: "376",
        old_title: "Punishment for Rape",
        new_section: "64",
        new_title: "Punishment for Rape",
        substantive_change: "Minimum rigorous imprisonment increased from 7 to 10 years, extending to Life Imprisonment + fine.",
      },
      {
        old_section: "376D",
        old_title: "Gang Rape",
        new_section: "70(1)",
        new_title: "Gang Rape",
        substantive_change: "Minimum 20 years extending to remainder of natural life. S.70(2) mandates Death / Life for gang rape of minor girl under 18 years.",
      },
      {
        old_section: "420",
        old_title: "Cheating and dishonestly inducing delivery of property",
        new_section: "318(4)",
        new_title: "Cheating",
        substantive_change: "Re-classified under Chapter XVII (Offences against Property) under Section 318(4) with up to 7 years + fine.",
      },
      {
        old_section: "406",
        old_title: "Punishment for Criminal Breach of Trust",
        new_section: "316(2)",
        new_title: "Criminal Breach of Trust",
        substantive_change: "Re-numbered under Section 316(2) with up to 5 years imprisonment.",
      },
      {
        old_section: "498A",
        old_title: "Husband or relative of husband subjecting woman to cruelty",
        new_section: "85 & 86",
        new_title: "Cruelty by Husband or relatives",
        substantive_change: "Section 85 prescribes 3 years punishment; Section 86 defines cruelty comprehensively.",
      },
      {
        old_section: "124A",
        old_title: "Sedition (Rajdroh)",
        new_section: "152",
        new_title: "Act endangering sovereignty, unity and integrity of India (Deshdroh)",
        substantive_change: "Sedition repealed. Section 152 penalizes acts endangering India's sovereignty, unity, and armed rebellion with 7 years to Life.",
      },
      {
        old_section: "377",
        old_title: "Unnatural Offences",
        new_section: "OMITTED",
        new_title: "Omitted in BNS 2023",
        substantive_change: "Section 377 IPC omitted entirely in BNS. Non-consensual bestiality/acts against male victims governed under general assault provisions.",
      },
      {
        old_section: "506",
        old_title: "Punishment for Criminal Intimidation",
        new_section: "351",
        new_title: "Criminal Intimidation",
        substantive_change: "Re-numbered as Section 351 with 2 years or 7 years if threat is to cause death/grievous hurt.",
      },
    ],
  },
  {
    pair_id: "TRANSITION_CRPC_BNSS",
    old_act_id: "ACT_CRPC_1973",
    old_act_name: "Code of Criminal Procedure, 1973 (Repealed)",
    new_act_id: "ACT_BNSS_2023",
    new_act_name: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    effective_date: "2024-07-01",
    summary: "Re-engineered procedural code introducing Zero FIR (S.173), Electronic Summons (S.64/70), Audio-Video Recording of search/seizure (S.105), Mandatory Forensics (S.176), and Timeline for Judgment (S.392).",
    mappings: [
      {
        old_section: "154",
        old_title: "Information in cognizable cases (FIR)",
        new_section: "173",
        new_title: "Information in cognizable cases (FIR & Zero FIR)",
        substantive_change: "Expressly codifies Zero FIR and electronic submission of information with digital signature verification within 3 days.",
      },
      {
        old_section: "167(2)",
        old_title: "Procedure when investigation cannot be completed in 24 hours (Default Bail)",
        new_section: "187(2) & 187(3)",
        new_title: "Remand & Statutory Default Bail",
        substantive_change: "Police custody of 15 days can now be taken in parts across the initial 40/60 days. Default bail maintained at 60/90 days.",
      },
      {
        old_section: "173(2)",
        old_title: "Report of police officer on completion of investigation (Chargesheet)",
        new_section: "193(3)",
        new_title: "Police Report (Chargesheet)",
        substantive_change: "Mandatory timeline: Investigation in rape cases to be completed within 2 months; police report to be supplied electronically.",
      },
      {
        old_section: "437",
        old_title: "When bail may be taken in case of non-bailable offence (Magistrate Bail)",
        new_section: "480",
        new_title: "Bail in Non-Bailable Cases by Magistrate",
        substantive_change: "Re-numbered as Section 480 BNSS with updated provisions for women, sick, and infirm persons.",
      },
      {
        old_section: "438",
        old_title: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        new_section: "482",
        new_title: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        substantive_change: "Re-numbered as Section 482 BNSS. Powers remain with Sessions Court and High Court.",
      },
      {
        old_section: "439",
        old_title: "Special powers of High Court or Court of Session regarding bail (Regular Bail)",
        new_section: "483",
        new_title: "Special powers of High Court or Court of Session regarding bail",
        substantive_change: "Re-numbered as Section 483 BNSS with explicit victim notice rules in POCSO and serious assault cases.",
      },
      {
        old_section: "482",
        old_title: "Saving of inherent powers of High Court (Quashing of FIR / Proceedings)",
        new_section: "528",
        new_title: "Saving of inherent powers of High Court",
        substantive_change: "High Court's celebrated inherent quashing powers under Section 482 CrPC are now codified as Section 528 BNSS.",
      },
      {
        old_section: "125",
        old_title: "Order for maintenance of wives, children and parents",
        new_section: "144",
        new_title: "Order for maintenance of wives, children and parents",
        substantive_change: "Re-numbered as Section 144 BNSS with time-bound 60-day disposal target for interim maintenance applications.",
      },
      {
        old_section: "107 / 116 / 151",
        old_title: "Security for keeping peace & Preventive arrest",
        new_section: "126 / 135 / 170",
        new_title: "Preventive action of police & Executive Magistrate proceedings",
        substantive_change: "Preventive detentions modernized with strict executive magistrate review.",
      },
    ],
  },
  {
    pair_id: "TRANSITION_IEA_BSA",
    old_act_id: "ACT_IEA_1872",
    old_act_name: "Indian Evidence Act, 1872 (Repealed)",
    new_act_id: "ACT_BSA_2023",
    new_act_name: "Bharatiya Sakshya Adhiniyam, 2023",
    effective_date: "2024-07-01",
    summary: "Replaces colonial evidence statute with digital-first evidence rules: Electronic records treated as primary documents (S.61), Section 65B certificate replaced with Section 63 certificate.",
    mappings: [
      {
        old_section: "65B",
        old_title: "Admissibility of electronic records (Certificate)",
        new_section: "63",
        new_title: "Admissibility of electronic records and Certificate format",
        substantive_change: "Section 63 BSA incorporates the mandatory certificate format directly into the Schedule of the Adhiniyam.",
      },
      {
        old_section: "32(1)",
        old_title: "Cases in which statement of relevant fact by person who is dead is relevant (Dying Declaration)",
        new_section: "26(a)",
        new_title: "Dying Declaration",
        substantive_change: "Preserved and codified under Section 26(a) BSA.",
      },
      {
        old_section: "27",
        old_title: "How much of information received from accused may be proved (Recovery Memo / Section 27 Discovery)",
        new_section: "23",
        new_title: "Confession and discovery of fact by accused",
        substantive_change: "Re-numbered as Section 23 BSA governing discovery memos and weapons/articles recovery.",
      },
      {
        old_section: "114A",
        old_title: "Presumption as to absence of consent in certain prosecutions for rape",
        new_section: "119",
        new_title: "Presumption as to absence of consent in rape cases",
        substantive_change: "Re-numbered as Section 119 BSA with statutory presumption favoring victim.",
      },
      {
        old_section: "137 & 138",
        old_title: "Examination-in-chief, Cross-examination and Re-examination",
        new_section: "142 & 143",
        new_title: "Order of examinations of witnesses",
        substantive_change: "Order of witness examination codified under Section 142-143 with electronic video conferencing rules.",
      },
    ],
  },
];

export const findTransitionForSection = (actId, sectionNumber) => {
  if (!actId || !sectionNumber) return null;
  const secClean = String(sectionNumber).trim().toLowerCase();
  const secNumericOnly = secClean.replace(/[^0-9a-z]/g, "");

  for (const pair of REPEALED_ACT_PAIRS) {
    if (pair.old_act_id === actId) {
      const match = pair.mappings.find((m) => {
        const oldClean = m.old_section.toLowerCase();
        const oldNumeric = oldClean.replace(/[^0-9a-z]/g, "");
        return (
          oldClean === secClean ||
          oldClean.startsWith(secClean) ||
          secClean.startsWith(oldClean) ||
          oldNumeric === secNumericOnly
        );
      });
      if (match) {
        return {
          type: "OLD_TO_NEW",
          pair,
          match,
          target_act_id: pair.new_act_id,
          target_act_name: pair.new_act_name,
          target_section: match.new_section,
          target_title: match.new_title,
          note: match.substantive_change,
        };
      }
    } else if (pair.new_act_id === actId) {
      const match = pair.mappings.find((m) => {
        const newClean = m.new_section.toLowerCase();
        const newNumeric = newClean.replace(/[^0-9a-z]/g, "");
        return (
          newClean === secClean ||
          newClean.startsWith(secClean) ||
          secClean.startsWith(newClean) ||
          newNumeric === secNumericOnly
        );
      });
      if (match) {
        return {
          type: "NEW_TO_OLD",
          pair,
          match,
          target_act_id: pair.old_act_id,
          target_act_name: pair.old_act_name,
          target_section: match.old_section,
          target_title: match.old_title,
          note: match.substantive_change,
        };
      }
    }
  }
  return null;
};

export default {
  REPEALED_ACT_PAIRS,
  findTransitionForSection,
};
