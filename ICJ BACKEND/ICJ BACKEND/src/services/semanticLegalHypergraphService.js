/**
 * ICJ ENTERPRISE SEMANTIC LEGAL HYPERGRAPH & CROSS-REFERENCING SERVICE (WESTLAW / LEXISNEXIS GRADE)
 * Deep multi-directional knowledge graph linking 1836 First Act of India to 2026 New Statutes,
 * with clickable cross-statutory citations, sticky table of contents, and contextual drawers.
 */

export const FIRST_ACT_OF_INDIA = {
  id: "ACT_1836_21",
  year: 1836,
  actNo: "Act No. XXI of 1836",
  title: "बंगाल जिला अधिनियम 1836 (The Bengal Districts Act, 1836)",
  enactedDate: "19 सितंबर 1836 (गवर्नर जनरल इन काउंसिल)",
  totalSections: 2,
  status: "HISTORIC_FIRST_ACT",
  historicalSignificance: "🇮🇳 स्वतंत्र भारत के 'India Code' रिपॉजिटरी में दर्ज देश का सबसे पहला संहिताबद्ध केंद्रीय अधिनियम (First Codified Central Act of India in India Code Archives)।",
  description: "भारत में न्यायिक एवं प्रशासनिक जिलों के परिसीमन (Delimitation of Judicial Districts) और मजिस्ट्रेट क्षेत्राधिकार का पहला औपचारिक विधान।",
  sections: [
    {
      sectionNum: "धारा 1",
      heading: "जिलों का सृजन एवं परिसीमन (Creation and Alteration of Districts)",
      bodyText: "गवर्नर जनरल अथवा प्रांतीय सरकार को यह अधिकार होगा कि वह न्यायिक प्रशासन, दीवानी मुकदमों और राजस्व संग्रहण हेतु किसी भी जिले की सीमाओं को बढ़ा, घटा या नए जिलों का सृजन कर सके।",
      crossLinks: [
        { term: "न्यायिक प्रशासन", targetAct: "CPC 1908 धारा 9", targetId: "ACT_1908_05", desc: "दीवानी अदालतों का स्थानीय क्षेत्राधिकार" },
        { term: "मजिस्ट्रेट क्षेत्राधिकार", targetAct: "BNSS 2023 धारा 9 व 14", targetId: "ACT_2023_46", desc: "न्यायिक मजिस्ट्रेटों के स्थानीय अधिकार क्षेत्र" },
      ],
    },
    {
      sectionNum: "धारा 2",
      heading: "अदालतों के अधिकार क्षेत्र की निरंतरता",
      bodyText: "जब तक किसी जिले की सीमाओं में परिवर्तन के बाद नई अदालत स्थापित न हो, पुरानी जिला अदालत को उस क्षेत्र के मुकदमों की सुनवाई का पूर्ण विधिक अधिकार होगा।",
      crossLinks: [
        { term: "प्रांग्न्याय (Res Judicata)", targetAct: "CPC 1908 धारा 11", targetId: "ACT_1908_05", desc: "सक्षम क्षेत्राधिकार वाली अदालत का निर्णय अंतिम" },
      ],
    },
  ],
};

export const MASTER_WESTLAW_ACTS = [
  FIRST_ACT_OF_INDIA,
  {
    id: "ACT_1882_04_WESTLAW",
    year: 1882,
    actNo: "Act No. 4 of 1882",
    title: "संपत्ति अंतरण अधिनियम 1882 (Transfer of Property Act, 1882)",
    enactedDate: "17 फरवरी 1882",
    totalSections: 137,
    status: "ACTIVE_IN_FORCE",
    historicalSignificance: "अचल संपत्ति के अंतरण (विक्रय, बंधक, पट्टा, दान) का 144 वर्ष पुराना आधार स्तंभ।",
    sections: [
      {
        sectionNum: "धारा 54",
        heading: "विक्रय की परिभाषा एवं अनिवार्य पंजीकरण (Sale Defined & Registration)",
        bodyText: "विक्रय का अर्थ है किसी मूल्य के बदले में स्वामित्व का अंतरण। ₹100 या उससे अधिक मूल्य की किसी भी मूर्त अचल संपत्ति का अंतरण केवल एक पंजीकृत दस्तावेज (Registered Instrument) द्वारा ही किया जा सकता है। मौखिक विक्रय पूर्णतः शून्य होगा।",
        crossLinks: [
          { term: "पंजीकृत दस्तावेज", targetAct: "रजिस्ट्रेशन अधिनियम 1908 धारा 17", targetId: "ACT_1908_16", desc: "₹100 से अधिक संपत्ति का अनिवार्य निबंधन" },
          { term: "प्रतिफल (Consideration)", targetAct: "भारतीय संविदा अधिनियम 1872 धारा 25", targetId: "ACT_1872_09", desc: "प्रतिफल रहित करार शून्य होता है" },
          { term: "कपटपूर्ण अंतरण", targetAct: "BNS 2023 धारा 318(4)", targetId: "ACT_2023_45", desc: "फर्जी बैनामा या धोखाधड़ी पर 7 वर्ष जेल" },
          { term: "सूरज लैंप नज़ीर", targetAct: "सुप्रीम कोर्ट (2012) 1 SCC 656", targetId: "SC_SURAJ_LAMP", desc: "GPA / पॉवर ऑफ अटॉर्नी से बिक्री अवैध" },
        ],
      },
      {
        sectionNum: "धारा 58",
        heading: "बंधक (Mortgage) के प्रकार एवं अधिकार",
        bodyText: "बंधक का अर्थ है किसी वर्तमान या भावी ऋण के भुगतान की प्रतिभूति के रूप में किसी विनिर्दिष्ट अचल संपत्ति में किसी हित का अंतरण। इसमें सादा बंधक, सशर्त विक्रय बंधक, और इक्विटेबल बंधक शामिल हैं।",
        crossLinks: [
          { term: "ऋण वसूली", targetAct: "SARFAESI Act 2002 धारा 13", targetId: "ACT_2002_54", desc: "बैंक द्वारा बिना कोर्ट गए संपत्ति जब्ती" },
          { term: "इक्विटेबल बंधक", targetAct: "स्टाम्प अधिनियम 1899", targetId: "ACT_1899_02", desc: "टाइटल डीड जमा कर बंधक" },
        ],
      },
    ],
  },
  {
    id: "ACT_2023_46_WESTLAW",
    year: 2023,
    actNo: "Act No. 46 of 2023",
    title: "भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS 2023)",
    enactedDate: "25 दिसंबर 2023 (लागू: 1 जुलाई 2024)",
    totalSections: 531,
    status: "NEW_CRIMINAL_CODE",
    historicalSignificance: "CrPC 1973 का स्थान लेने वाली भारत की आधुनिकतम आपराधिक प्रक्रिया संहिता।",
    sections: [
      {
        sectionNum: "धारा 173",
        heading: "प्रथम सूचना रिपोर्ट एवं अनिवार्य Zero FIR (Information in Cognizable Offence)",
        bodyText: "संज्ञेय अपराध की सूचना मिलने पर पुलिस अधिकारी के लिए FIR दर्ज करना अनिवार्य होगा। घटना किसी भी थाना क्षेत्र में हुई हो, 'Zero FIR' दर्ज करके संबंधित थाने को भेजी जाएगी। ई-एफआईआर (e-FIR) दर्ज होने पर 3 दिनों के भीतर वादी द्वारा हस्ताक्षर किए जाएंगे।",
        crossLinks: [
          { term: "ललिता कुमारी नज़ीर", targetAct: "सुप्रीम कोर्ट (2014) 2 SCC 1", targetId: "SC_LALITA_KUMARI", desc: "FIR दर्ज न करने पर पुलिस पर मुकदमा" },
          { term: "संज्ञेय अपराध", targetAct: "BNS 2023 धारा 103, 318", targetId: "ACT_2023_45", desc: "गंभीर अपराध जिनमें बिना वारंट गिरफ्तारी" },
          { term: "डिजिटल साक्ष्य", targetAct: "BSA 2023 धारा 63", targetId: "ACT_2023_47", desc: "ई-एफआईआर का इलेक्ट्रॉनिक प्रमाणपत्र" },
        ],
      },
      {
        sectionNum: "धारा 175(3)",
        heading: "मजिस्ट्रेट द्वारा अन्वेषण व FIR का आदेश (पूर्व 156(3) CrPC)",
        bodyText: "यदि थानेदार FIR दर्ज न करे, तो नागरिक शपथ पत्र के साथ मजिस्ट्रेट के समक्ष आवेदन कर सकता है। मजिस्ट्रेट पुलिस को FIR दर्ज कर निष्पक्ष विवेचना का निर्देश दे सकता है।",
        crossLinks: [
          { term: "शपथ पत्र (Affidavit)", targetAct: "BSA 2023 धारा 61", targetId: "ACT_2023_47", desc: "शपथ पत्र पर गलत बयान देने पर BNS 227 के तहत सजा" },
          { term: "हाई कोर्ट रिट", targetAct: "संविधान अनुच्छेद 226", targetId: "ACT_1950_CONST", desc: "परमादेश रिट (Writ of Mandamus)" },
        ],
      },
    ],
  },
];

export const SemanticLegalHypergraphService = {
  getFirstActOfIndia() {
    return FIRST_ACT_OF_INDIA;
  },

  getAllWestlawActs() {
    return MASTER_WESTLAW_ACTS;
  },

  getActById(id) {
    return MASTER_WESTLAW_ACTS.find((a) => a.id === id) || FIRST_ACT_OF_INDIA;
  },
};

export default SemanticLegalHypergraphService;
