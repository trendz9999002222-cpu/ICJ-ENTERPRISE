/**
 * SmartCitationSelectorService — ICJ Enterprise Platform
 * Provides 4 to 6 relevant Supreme Court & High Court Landmark Rulings
 * matching case facts, allowing 1-click merge into drafts without typing!
 */

export const SmartCitationSelectorService = {
  /**
   * Get 4-6 relevant precedents for case category / facts
   */
  getPrecedentsForCase(caseCategory = "civil") {
    const cat = caseCategory.toLowerCase();

    if (cat.includes("criminal") || cat.includes("bail") || cat.includes("fir")) {
      return [
        {
          id: "CIT_01",
          citation: "State of Haryana v. Bhajan Lal, 1992 Supp (1) SCC 335",
          ratio: "Principles for quashing malicious FIRs under Sec 482 / BNSS 528.",
          mergeSnippet: "\n• Reliance is placed on State of Haryana v. Bhajan Lal, 1992 Supp (1) SCC 335, wherein the Hon'ble Supreme Court held that where criminal proceedings are maliciously instituted with an ulterior motive, the High Court must quash the same.",
        },
        {
          id: "CIT_02",
          citation: "Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273",
          ratio: "Mandatory guidelines against routine arrest in offences under 7 years.",
          mergeSnippet: "\n• Reliance is placed on Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273, mandating strict compliance before making routine arrests.",
        },
        {
          id: "CIT_03",
          citation: "Dataram Singh v. State of Uttar Pradesh, (2018) 3 SCC 22",
          ratio: "Bail is the rule and jail is an exception.",
          mergeSnippet: "\n• Relied upon Dataram Singh v. State of U.P., (2018) 3 SCC 22: 'Bail is a rule and jail is an exception.'",
        },
        {
          id: "CIT_04",
          citation: "Satender Kumar Antil v. CBI, (2022) 10 SCC 51",
          ratio: "Category-wise bail guidelines and strict enforcement of personal liberty.",
          mergeSnippet: "\n• Relied upon Satender Kumar Antil v. CBI, (2022) 10 SCC 51, holding that delay in trial entitles accused to bail.",
        },
      ];
    }

    // Default Civil / Property Citations
    return [
      {
        id: "CIT_05",
        citation: "Anathula Sudhakar v. P. Buchi Reddy, (2008) 4 SCC 594",
        ratio: "Principles governing suits for permanent injunction vs declaration of title.",
        mergeSnippet: "\n• Relied upon Anathula Sudhakar v. P. Buchi Reddy, (2008) 4 SCC 594: Where title is under cloud, suit for declaration is mandatory.",
      },
      {
        id: "CIT_06",
        citation: "Morgan Stanley Mutual Fund v. Kartick Das, (1994) 4 SCC 225",
        ratio: "Strict principles for granting ex-parte interim injunctions under Order 39.",
        mergeSnippet: "\n• Relied upon Morgan Stanley v. Kartick Das, (1994) 4 SCC 225: Ex-parte injunction must be granted only in exceptional urgency.",
      },
      {
        id: "CIT_07",
        citation: "Dalpat Kumar v. Prahlad Singh, (1992) 1 SCC 719",
        ratio: "Three essential pillars: Prima facie case, balance of convenience, irreparable loss.",
        mergeSnippet: "\n• Relied upon Dalpat Kumar v. Prahlad Singh, (1992) 1 SCC 719: Injunction requires satisfaction of all 3 mandatory pillars.",
      },
      {
        id: "CIT_08",
        citation: "Collector Land Acquisition v. Mst. Katiji, (1987) 2 SCC 107",
        ratio: "Substantive justice over technicalities in Section 5 Limitation Act delay condonation.",
        mergeSnippet: "\n• Relied upon Collector v. Katiji, (1987) 2 SCC 107: Substantive justice must prevail over procedural delay under Sec 5 Limitation Act.",
      },
    ];
  },
};

export default SmartCitationSelectorService;
