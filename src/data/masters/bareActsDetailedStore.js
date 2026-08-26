// ICJ ENTERPRISE — DETAILED BARE ACTS STORE (HIGH-FREQUENCY PRACTICE STATUTES)
// Contains fully structured Chapters, Sections, Subsections, Explanations, Illustrations & Cross References

export const BARE_ACTS_DETAILED_STORE = {
  // =========================================================================
  // 1. BHARATIYA NYAYA SANHITA, 2023 (ACT_BNS_2023)
  // =========================================================================
  ACT_BNS_2023: {
    act_id: "ACT_BNS_2023",
    short_title_en: "Bharatiya Nyaya Sanhita, 2023",
    short_title_hi: "भारतीय न्याय संहिता, 2023",
    act_number: 45,
    enactment_year: 2023,
    enforcement_date: "2024-07-01",
    total_chapters: 20,
    total_sections: 358,
    chapters: [
      {
        chapter_number: "CHAPTER I",
        chapter_title: "PRELIMINARY",
        sections: [
          {
            section_number: "1",
            section_title: "Short title, commencement and application",
            section_body: "(1) This Act may be called the Bharatiya Nyaya Sanhita, 2023.\n(2) It shall come into force on the 1st day of July, 2024.\n(3) Every person shall be liable to punishment under this Sanhita and not otherwise for every act or omission contrary to the provisions thereof, of which he shall be guilty within India.",
            cross_references: [
              { label: "Constitution of India, Art. 20", target_act_id: "ACT_CONSTITUTION_1950", section_number: "20" },
            ],
            defined_terms: ["India", "Person"],
            order_index: 1,
          },
          {
            section_number: "2",
            section_title: "Definitions",
            section_body: "In this Sanhita, unless the context otherwise requires,—\n(1) 'act' denotes as well a series of acts as a single act;\n(2) 'animal' denotes any living creature, other than a human being;\n(3) 'child' means any person below the age of eighteen years;\n(4) 'court' means a Judge who is empowered by law to act judicially alone;\n(28) 'public servant' denotes a person falling under any of the descriptions mentioned in this clause...",
            cross_references: [],
            defined_terms: ["public servant", "child", "court", "act"],
            order_index: 2,
          },
        ],
      },
      {
        chapter_number: "CHAPTER IV",
        chapter_title: "OF GENERAL EXCEPTIONS & RIGHT OF PRIVATE DEFENCE",
        sections: [
          {
            section_number: "14",
            section_title: "Act done by a person bound, or by mistake of fact believing himself bound, by law",
            section_body: "Nothing is an offence which is done by a person who is, or who by reason of a mistake of fact and not by reason of a mistake of law in good faith believes himself to be, bound by law to do it.\n\nIllustration:\nA, an officer of the Court of Justice, being ordered by that Court to arrest Y, and after due enquiry, believing Z to be Y, arrests Z. A has committed no offence.",
            cross_references: [
              { label: "Section 218 BNSS (Sanction)", target_act_id: "ACT_BNSS_2023", section_number: "218" },
            ],
            defined_terms: ["mens rea", "good faith", "public servant"],
            order_index: 14,
          },
          {
            section_number: "34",
            section_title: "Things done in private defence",
            section_body: "Nothing is an offence which is done in the exercise of the right of private defence. Every person has a right, subject to the restrictions, to defend his own body and the body of any other person, against any offence affecting the human body; and the property of himself or of any other person.",
            cross_references: [
              { label: "Article 21 Constitution", target_act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
            ],
            defined_terms: ["private defence", "grievous hurt"],
            order_index: 34,
          },
        ],
      },
      {
        chapter_number: "CHAPTER VI",
        chapter_title: "OF OFFENCES AFFECTING THE HUMAN BODY (MURDER & ASSAULT)",
        sections: [
          {
            section_number: "103",
            section_title: "Punishment for murder",
            section_body: "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.\n\n(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.",
            cross_references: [
              { label: "Section 105 (Culpable Homicide)", target_act_id: "ACT_BNS_2023", section_number: "105" },
              { label: "Section 173 BNSS (FIR)", target_act_id: "ACT_BNSS_2023", section_number: "173" },
              { label: "Section 480 BNSS (Bail Restriction)", target_act_id: "ACT_BNSS_2023", section_number: "480" },
              { label: "Old IPC Sec. 302", target_act_id: "ACT_IPC_1860", section_number: "302" },
            ],
            defined_terms: ["cognizable offence", "non-bailable offence", "mens rea"],
            order_index: 103,
          },
          {
            section_number: "106",
            section_title: "Causing death by negligence (Hit and Run)",
            section_body: "(1) Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine.\n\n(2) Whoever causes the death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description of a term which may extend to ten years, and shall also be liable to fine.",
            cross_references: [
              { label: "Section 134 Motor Vehicles Act", target_act_id: "ACT_MOTOR_VEHICLES_1988", section_number: "134" },
              { label: "Old IPC Sec. 304A", target_act_id: "ACT_IPC_1860", section_number: "304A" },
            ],
            defined_terms: ["rash driving", "culpable homicide"],
            order_index: 106,
          },
          {
            section_number: "109",
            section_title: "Attempt to murder",
            section_body: "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine; and if hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned.",
            cross_references: [
              { label: "Old IPC Sec. 307", target_act_id: "ACT_IPC_1860", section_number: "307" },
            ],
            defined_terms: ["attempt", "hurt", "mens rea"],
            order_index: 109,
          },
        ],
      },
      {
        chapter_number: "CHAPTER XVII",
        chapter_title: "OF OFFENCES AGAINST PROPERTY (THEFT, EXTORTION & CHEATING)",
        sections: [
          {
            section_number: "303",
            section_title: "Theft",
            section_body: "(1) Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.\n(2) Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both; and in case of second conviction, with rigorous imprisonment up to five years.\nProvided that where the value of stolen property is less than five thousand rupees, and a person is convicted for the first time, he shall be punished with community service.",
            cross_references: [
              { label: "Section 23 BSA (Recovery Memo)", target_act_id: "ACT_BSA_2023", section_number: "23" },
              { label: "Old IPC Sec. 379", target_act_id: "ACT_IPC_1860", section_number: "379" },
            ],
            defined_terms: ["theft", "community service", "dishonestly"],
            order_index: 303,
          },
          {
            section_number: "318",
            section_title: "Cheating and dishonestly inducing delivery of property",
            section_body: "(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property... commits cheating.\n\n(4) Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
            cross_references: [
              { label: "Section 138 NI Act", target_act_id: "ACT_NI_1881", section_number: "138" },
              { label: "Old IPC Sec. 420", target_act_id: "ACT_IPC_1860", section_number: "420" },
            ],
            defined_terms: ["cheating", "fraudulently", "valuable security"],
            order_index: 318,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (ACT_BNSS_2023)
  // =========================================================================
  ACT_BNSS_2023: {
    act_id: "ACT_BNSS_2023",
    short_title_en: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    short_title_hi: "भारतीय नागरिक सुरक्षा संहिता, 2023",
    act_number: 46,
    enactment_year: 2023,
    enforcement_date: "2024-07-01",
    total_chapters: 39,
    total_sections: 531,
    chapters: [
      {
        chapter_number: "CHAPTER XII",
        chapter_title: "INFORMATION TO THE POLICE AND THEIR POWERS TO INVESTIGATE",
        sections: [
          {
            section_number: "173",
            section_title: "Information in cognizable cases (Registration of FIR & Zero FIR)",
            section_body: "(1) Every information relating to the commission of a cognizable offence, irrespective of the area where the offence is committed, may be given orally or by electronic communication to an officer in charge of a police station (Zero FIR).\n\nProvided that if information is given electronically, it shall be taken on record on being signed within three days by the person giving it.\n\n(3) Without prejudice to sub-section (1), on receipt of information relating to commission of a cognizable offence punishable with imprisonment for three years or more but less than seven years, the officer in charge of a police station may, with prior permission of Deputy Superintendent of Police, conduct preliminary enquiry within fourteen days.",
            cross_references: [
              { label: "Section 176 BNSS (Forensics)", target_act_id: "ACT_BNSS_2023", section_number: "176" },
              { label: "Section 193 BNSS (Chargesheet)", target_act_id: "ACT_BNSS_2023", section_number: "193" },
              { label: "Old CrPC Sec. 154", target_act_id: "ACT_CRPC_1973", section_number: "154" },
            ],
            defined_terms: ["zero fir", "cognizable offence", "electronic record"],
            order_index: 173,
          },
          {
            section_number: "187",
            section_title: "Procedure when investigation cannot be completed in twenty-four hours (Remand & Statutory Default Bail)",
            section_body: "(2) The Magistrate may authorize the detention of the accused person, otherwise than in custody of the police, beyond the period of fifteen days; but the total period of police custody of fifteen days may be taken in whole or in parts during the initial period of forty days or sixty days of detention.\n\n(3) The Magistrate shall release the accused on bail on expiry of:\n(a) ninety days, where investigation relates to an offence punishable with death, imprisonment for life or imprisonment for not less than ten years;\n(b) sixty days, where investigation relates to any other offence, if the accused is prepared to and does furnish bail.",
            cross_references: [
              { label: "Article 21 Constitution", target_act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
              { label: "Section 480 BNSS (Bail)", target_act_id: "ACT_BNSS_2023", section_number: "480" },
              { label: "Old CrPC Sec. 167(2)", target_act_id: "ACT_CRPC_1973", section_number: "167" },
            ],
            defined_terms: ["default bail", "remand", "police custody"],
            order_index: 187,
          },
        ],
      },
      {
        chapter_number: "CHAPTER XXXV",
        chapter_title: "PROVISIONS AS TO BAIL AND BONDS",
        sections: [
          {
            section_number: "478",
            section_title: "In what cases bail to be taken (Bailable Offences)",
            section_body: "When any person other than a person accused of a non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court, and is prepared at any time while in the custody of such officer or at any stage of the proceeding before such Court to give bail, such person shall be released on bail.",
            cross_references: [
              { label: "Old CrPC Sec. 436", target_act_id: "ACT_CRPC_1973", section_number: "436" },
            ],
            defined_terms: ["bailable offence", "surety bond"],
            order_index: 478,
          },
          {
            section_number: "480",
            section_title: "When bail may be taken in case of non-bailable offence (Magistrate Bail)",
            section_body: "(1) When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant, he may be released on bail, but he shall not be so released if there appear reasonable grounds for believing that he has been guilty of an offence punishable with death or imprisonment for life:\n\nProvided that the Court may direct that any person under the age of sixteen years or any woman or any sick or infirm person be released on bail.",
            cross_references: [
              { label: "Section 482 BNSS (Anticipatory Bail)", target_act_id: "ACT_BNSS_2023", section_number: "482" },
              { label: "Old CrPC Sec. 437", target_act_id: "ACT_CRPC_1973", section_number: "437" },
            ],
            defined_terms: ["non-bailable offence", "magistrate"],
            order_index: 480,
          },
          {
            section_number: "482",
            section_title: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
            section_body: "(1) Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest he shall be released on bail; and that Court may, after taking into consideration:\n(i) the nature and gravity of accusation;\n(ii) the antecedents of applicant including criminal history;\n(iii) the possibility of fleeing from justice; either reject or grant interim bail.",
            cross_references: [
              { label: "Article 21 Constitution", target_act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
              { label: "Section 483 BNSS (Regular Bail)", target_act_id: "ACT_BNSS_2023", section_number: "483" },
              { label: "Old CrPC Sec. 438", target_act_id: "ACT_CRPC_1973", section_number: "438" },
            ],
            defined_terms: ["anticipatory bail", "non-bailable offence"],
            order_index: 482,
          },
          {
            section_number: "528",
            section_title: "Saving of inherent powers of High Court (Quashing)",
            section_body: "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
            cross_references: [
              { label: "Article 226 Constitution", target_act_id: "ACT_CONSTITUTION_1950", section_number: "226" },
              { label: "Old CrPC Sec. 482", target_act_id: "ACT_CRPC_1973", section_number: "482" },
            ],
            defined_terms: ["inherent powers", "quashing"],
            order_index: 528,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. NEGOTIABLE INSTRUMENTS ACT, 1881 (ACT_NI_1881)
  // =========================================================================
  ACT_NI_1881: {
    act_id: "ACT_NI_1881",
    short_title_en: "Negotiable Instruments Act, 1881",
    short_title_hi: "परक्राम्य लिखत अधिनियम, 1881",
    act_number: 26,
    enactment_year: 1881,
    enforcement_date: "1882-03-01",
    total_chapters: 17,
    total_sections: 148,
    chapters: [
      {
        chapter_number: "CHAPTER XVII",
        chapter_title: "OF PENALTIES IN CASE OF DISHONOUR OF CERTAIN CHEQUES",
        sections: [
          {
            section_number: "138",
            section_title: "Dishonour of cheque for insufficiency, etc., of funds in the account",
            section_body: "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both:\n\nProvided that nothing contained in this section shall apply unless—\n(a) the cheque has been presented to the bank within a period of three months from the date on which it is drawn or within the period of its validity;\n(b) the payee or holder in due course makes a demand for the payment of the said amount by giving a notice in writing, within thirty days of the receipt of information from the bank regarding the return of the cheque;\n(c) the drawer of such cheque fails to make the payment to the payee within fifteen days of the receipt of the said notice.",
            cross_references: [
              { label: "Section 139 (Presumption in favour of holder)", target_act_id: "ACT_NI_1881", section_number: "139" },
              { label: "Section 142 (Cognizance of offences)", target_act_id: "ACT_NI_1881", section_number: "142" },
              { label: "Section 143A (Power to direct interim compensation)", target_act_id: "ACT_NI_1881", section_number: "143A" },
              { label: "Section 148 (Power of Appellate Court)", target_act_id: "ACT_NI_1881", section_number: "148" },
              { label: "Section 318 BNS (Cheating)", target_act_id: "ACT_BNS_2023", section_number: "318" },
            ],
            defined_terms: ["cheque dishonour", "consideration", "holder in due course"],
            order_index: 138,
          },
          {
            section_number: "139",
            section_title: "Presumption in favour of holder",
            section_body: "It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque of the nature referred to in section 138 for the discharge, in whole or in part, of any debt or other liability.",
            cross_references: [
              { label: "Section 118 (Presumptions as to negotiable instruments)", target_act_id: "ACT_NI_1881", section_number: "118" },
              { label: "Section 119 BSA (Presumption)", target_act_id: "ACT_BSA_2023", section_number: "119" },
            ],
            defined_terms: ["presumption", "debt or liability"],
            order_index: 139,
          },
          {
            section_number: "143A",
            section_title: "Power to direct interim compensation",
            section_body: "(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant—\n(a) in a summary trial or a summons case, where he pleads not guilty to the accusation;\n(b) in any other case, upon framing of charge.\n(2) The interim compensation shall not exceed twenty per cent of the amount of the cheque.",
            cross_references: [
              { label: "Section 148 NI Act (Appellate Deposit)", target_act_id: "ACT_NI_1881", section_number: "148" },
            ],
            defined_terms: ["interim compensation", "summary trial"],
            order_index: 143,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. CONSTITUTION OF INDIA, 1950 (ACT_CONSTITUTION_1950)
  // =========================================================================
  ACT_CONSTITUTION_1950: {
    act_id: "ACT_CONSTITUTION_1950",
    short_title_en: "Constitution of India, 1950",
    short_title_hi: "भारत का संविधान, 1950",
    act_number: 0,
    enactment_year: 1950,
    enforcement_date: "1950-01-26",
    total_chapters: 22,
    total_sections: 395,
    chapters: [
      {
        chapter_number: "PART III",
        chapter_title: "FUNDAMENTAL RIGHTS",
        sections: [
          {
            section_number: "14",
            section_title: "Equality before law",
            section_body: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
            cross_references: [
              { label: "Article 21 (Life & Liberty)", target_act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
              { label: "Article 226 (High Court Writs)", target_act_id: "ACT_CONSTITUTION_1950", section_number: "226" },
            ],
            defined_terms: ["fundamental rights", "equality before law"],
            order_index: 14,
          },
          {
            section_number: "21",
            section_title: "Protection of life and personal liberty",
            section_body: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
            cross_references: [
              { label: "Article 32 (Supreme Court Remedies)", target_act_id: "ACT_CONSTITUTION_1950", section_number: "32" },
              { label: "Section 482 BNSS (Anticipatory Bail)", target_act_id: "ACT_BNSS_2023", section_number: "482" },
            ],
            defined_terms: ["fundamental rights", "personal liberty", "due process"],
            order_index: 21,
          },
          {
            section_number: "32",
            section_title: "Remedies for enforcement of rights conferred by this Part (Supreme Court Writs)",
            section_body: "(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.\n(2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, whichever may be appropriate...",
            cross_references: [
              { label: "Article 226 (High Court Powers)", target_act_id: "ACT_CONSTITUTION_1950", section_number: "226" },
            ],
            defined_terms: ["fundamental rights", "habeas corpus", "mandamus", "certiorari"],
            order_index: 32,
          },
          {
            section_number: "226",
            section_title: "Power of High Courts to issue certain writs",
            section_body: "(1) Notwithstanding anything in Article 32, every High Court shall have power, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, directions, orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, or any of them, for the enforcement of any of the rights conferred by Part III and for any other purpose.",
            cross_references: [
              { label: "Article 32 (Supreme Court Writs)", target_act_id: "ACT_CONSTITUTION_1950", section_number: "32" },
              { label: "Section 528 BNSS (Inherent Quashing)", target_act_id: "ACT_BNSS_2023", section_number: "528" },
            ],
            defined_terms: ["writ petition", "mandamus", "certiorari", "habeas corpus"],
            order_index: 226,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. CODE OF CIVIL PROCEDURE, 1908 (ACT_CPC_1908)
  // =========================================================================
  ACT_CPC_1908: {
    act_id: "ACT_CPC_1908",
    short_title_en: "Code of Civil Procedure, 1908",
    short_title_hi: "सिविल प्रक्रिया संहिता, 1908",
    act_number: 5,
    enactment_year: 1908,
    enforcement_date: "1909-01-01",
    total_chapters: 11,
    total_sections: 158,
    chapters: [
      {
        chapter_number: "PART I",
        chapter_title: "SUITS IN GENERAL & JURISDICTION",
        sections: [
          {
            section_number: "9",
            section_title: "Courts to try all civil suits unless barred",
            section_body: "The Courts shall (subject to the provisions herein contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.",
            cross_references: [
              { label: "Section 11 (Res Judicata)", target_act_id: "ACT_CPC_1908", section_number: "11" },
            ],
            defined_terms: ["civil suit", "jurisdiction"],
            order_index: 9,
          },
          {
            section_number: "11",
            section_title: "Res Judicata",
            section_body: "No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties, or between parties under whom they or any of them claim, litigating under the same title, in a Court competent to try such subsequent suit or the suit in which such issue has been subsequently raised, and has been heard and finally decided by such Court.",
            cross_references: [
              { label: "Order 2 Rule 2 CPC", target_act_id: "ACT_CPC_1908", section_number: "Order 2" },
            ],
            defined_terms: ["res judicata", "decree", "judgment"],
            order_index: 11,
          },
          {
            section_number: "148A",
            section_title: "Right to lodge a caveat",
            section_body: "(1) Where an application is expected to be made, or has been made, in a suit or proceeding instituted, or about to be instituted, in a Court, any person claiming a right to appear before the Court on the hearing of such application may lodge a caveat in respect thereof.\n(5) Where a caveat has been lodged under sub-section (1), such caveat shall not remain in force after the expiry of ninety days from the date on which it was lodged, unless the application referred to in sub-section (1) has been made before the expiry of the said period.",
            cross_references: [
              { label: "Order 39 CPC (Injunction)", target_act_id: "ACT_CPC_1908", section_number: "Order 39" },
            ],
            defined_terms: ["caveat", "temporary injunction"],
            order_index: 148,
          },
          {
            section_number: "151",
            section_title: "Saving of inherent powers of Court",
            section_body: "Nothing in this Code shall be deemed to limit or otherwise affect the inherent power of the Court to make such orders as may be necessary for the ends of justice or to prevent abuse of the process of the Court.",
            cross_references: [
              { label: "Section 528 BNSS (Inherent Criminal)", target_act_id: "ACT_BNSS_2023", section_number: "528" },
            ],
            defined_terms: ["inherent powers", "ends of justice"],
            order_index: 151,
          },
        ],
      },
    ],
  },
};

export const getBareActDetail = (actId) => {
  return BARE_ACTS_DETAILED_STORE[actId] || null;
};

export default {
  BARE_ACTS_DETAILED_STORE,
  getBareActDetail,
};
