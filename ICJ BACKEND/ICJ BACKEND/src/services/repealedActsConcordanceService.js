/**
 * ICJ ENTERPRISE REPEALED ACTS & OLD-VS-NEW CONCORDANCE BRIDGE SERVICE
 * Authoritative mapping from Repealed Indian Acts (IPC 1860, CrPC 1973, Evidence Act 1872)
 * to New Enacted Statutes (BNS 2023, BNSS 2023, BSA 2023) with transitional savings clauses.
 */

export const CONCORDANCE_DATA = [
  // IPC 1860 TO BNS 2023
  {
    category: "CRIMINAL_SUBSTANTIVE",
    oldAct: "भारतीय दंड संहिता 1860 (IPC 1860)",
    oldSection: "धारा 420",
    oldTitle: "धोखाधड़ी और बेईमानी से संपत्ति परिदान करने हेतु उत्प्रेरित करना",
    oldText: "जो कोई किसी व्यक्ति को धोखा देकर बेईमानी से उत्प्रेरित करेगा कि वह कोई संपत्ति किसी व्यक्ति को परिदत्त करे...",
    newAct: "भारतीय न्याय संहिता 2023 (BNS 2023)",
    newSection: "धारा 318(4)",
    newTitle: "धोखाधड़ी एवं संपत्ति परिदान (Cheating and Dishonestly Inducing Delivery)",
    newText: "जो कोई किसी व्यक्ति को धोखा देकर बेईमानी से उत्प्रेरित करेगा कि वह कोई संपत्ति किसी व्यक्ति को परिदत्त करे, वह 7 वर्ष तक के कारावास और जुर्माने से दंडित होगा।",
    repealDate: "1 जुलाई 2024 (गजट अधिसूचना S.O. 848(E))",
    repealStatute: "BNS 2023 की धारा 358 द्वारा IPC 1860 का पूर्ण निरसन",
    keyChangesHighlight: "इलेक्ट्रॉनिक रिकॉर्ड, डिजिटल लेनदेन, और ऑनलाइन धोखाधड़ी को स्पष्ट रूप से अपराध के दायरे में शामिल किया गया।",
    savingsClause: "1 जुलाई 2024 से पूर्व घटित अपराधों पर पुरानी IPC 1860 धारा 420 ही लागू रहेगी।",
  },
  {
    category: "CRIMINAL_SUBSTANTIVE",
    oldAct: "भारतीय दंड संहिता 1860 (IPC 1860)",
    oldSection: "धारा 302",
    oldTitle: "हत्या के लिए दंड (Punishment for Murder)",
    oldText: "जो कोई हत्या करेगा वह मृत्यु या आजीवन कारावास से दंडित किया जाएगा और जुर्माने से भी दंडनीय होगा।",
    newAct: "भारतीय न्याय संहिता 2023 (BNS 2023)",
    newSection: "धारा 103(1)",
    newTitle: "हत्या के लिए दंड (Murder Defined & Punished)",
    newText: "जो कोई हत्या करेगा वह मृत्यु या आजीवन कारावास से दंडित किया जाएगा और जुर्माने का भी दायी होगा।",
    repealDate: "1 जुलाई 2024",
    repealStatute: "BNS 2023 की धारा 358 द्वारा निरसित",
    keyChangesHighlight: "धारा 103(2) में 5 या अधिक व्यक्तियों द्वारा जाति, समुदाय या लिंग के आधार पर की गई 'मॉब लिंचिंग' (Mob Lynching) के लिए अलग से मृत्युदंड का प्रावधान जोड़ा गया।",
    savingsClause: "पुराने लंबित मर्डर ट्रायल पुरानी IPC 302 के तहत ही चलेंगे।",
  },
  {
    category: "CRIMINAL_SUBSTANTIVE",
    oldAct: "भारतीय दंड संहिता 1860 (IPC 1860)",
    oldSection: "धारा 124A",
    oldTitle: "राजद्रोह (Sedition)",
    oldText: "जो कोई शब्दों द्वारा या अन्यथा भारत में विधि द्वारा स्थापित सरकार के प्रति घृणा या अवमान पैदा करेगा...",
    newAct: "भारतीय न्याय संहिता 2023 (BNS 2023)",
    newSection: "धारा 152",
    newTitle: "भारत की संप्रभुता, एकता और अखंडता को खतरे में डालने वाले कृत्य",
    newText: "जो कोई जानबूझकर या जानते हुए, अलगाव या सशस्त्र विद्रोह या विध्वंसक गतिविधियों को उत्तेजित करता है या भारत की संप्रभुता को खतरे में डालता है...",
    repealDate: "1 जुलाई 2024",
    repealStatute: "औपनिवेशिक राजद्रोह शब्द को हटाया गया",
    keyChangesHighlight: "'राजद्रोह' (Sedition / सरकार का विरोध) शब्द को पूरी तरह खत्म कर दिया गया; केवल 'देशद्रोह' (भारत की संप्रभुता और एकता को तोड़ने का कृत्य) को अपराध बनाया गया।",
    savingsClause: "सुप्रीम कोर्ट के 'एस.जी. वोम्बटकेरे' फैसले के अनुसार पुरानी 124A की कार्यवाहियां स्थगित रहेंगी।",
  },

  // CRPC 1973 TO BNSS 2023
  {
    category: "CRIMINAL_PROCEDURE",
    oldAct: "दंड प्रक्रिया संहिता 1973 (CrPC 1973)",
    oldSection: "धारा 154",
    oldTitle: "संज्ञेय मामलों में सूचना (Information in Cognizable Cases - FIR)",
    oldText: "संज्ञेय अपराध किए जाने से संबंधित प्रत्येक सूचना, यदि भारसाधक अधिकारी को मौखिक दी गई है, तो उसके द्वारा लेखबद्ध की जाएगी...",
    newAct: "भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS 2023)",
    newSection: "धारा 173",
    newTitle: "प्रथम सूचना रिपोर्ट एवं ई-एफआईआर (FIR & Electronic FIR)",
    newText: "संज्ञेय अपराध की सूचना मौखिक, लिखित अथवा इलेक्ट्रॉनिक साधन (e-FIR) द्वारा दी जा सकेगी। Zero FIR किसी भी थाने में दर्ज की जा सकेगी।",
    repealDate: "1 जुलाई 2024",
    repealStatute: "BNSS 2023 की धारा 531 द्वारा CrPC 1973 का निरसन",
    keyChangesHighlight: "Zero FIR (क्षेत्राधिकार से बाहर भी FIR दर्ज करना अनिवार्य) और e-FIR (इलेक्ट्रॉनिक रिपोर्ट जिस पर 3 दिन में हस्ताक्षर किए जाएं) को कानूनी अधिकार बनाया गया।",
    savingsClause: "1 जुलाई 2024 से पहले दर्ज FIR पर पुरानी CrPC लागू रहेगी।",
  },
  {
    category: "CRIMINAL_PROCEDURE",
    oldAct: "दंड प्रक्रिया संहिता 1973 (CrPC 1973)",
    oldSection: "धारा 156(3)",
    oldTitle: "मजिस्ट्रेट द्वारा अन्वेषण का आदेश (Magistrate's Power to Order Investigation)",
    oldText: "धारा 190 के अधीन सशक्त कोई मजिस्ट्रेट ऐसे अन्वेषण का आदेश दे सकता है...",
    newAct: "भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS 2023)",
    newSection: "धारा 175(3)",
    newTitle: "मजिस्ट्रेट द्वारा विवेचना व FIR का आदेश",
    newText: "मजिस्ट्रेट को परिवाद दिए जाने पर यदि संज्ञेय अपराध प्रकट होता है और पुलिस ने कार्रवाई नहीं की है, तो मजिस्ट्रेट अन्वेषण का आदेश दे सकता है। शपथ पत्र संलग्न करना अनिवार्य है।",
    repealDate: "1 जुलाई 2024",
    repealStatute: "BNSS 2023 की धारा 531",
    keyChangesHighlight: "अर्जी के साथ वादी का शपथ पत्र (Affidavit) अनिवार्य किया गया ताकि झूठी व दुर्भावनापूर्ण अर्जियों को रोका जा सके।",
    savingsClause: "पुरानी अर्जियां CrPC 156(3) में निस्तारित होंगी।",
  },
  {
    category: "CRIMINAL_PROCEDURE",
    oldAct: "दंड प्रक्रिया संहिता 1973 (CrPC 1973)",
    oldSection: "धारा 438",
    oldTitle: "अग्रिम जमानत का निदेश (Anticipatory Bail)",
    oldText: "जब किसी व्यक्ति को यह विश्वास करने का कारण है कि उसे गैर-जमानती अपराध के अभियोग में गिरफ्तार किया जा सकता है...",
    newAct: "भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS 2023)",
    newSection: "धारा 482",
    newTitle: "गिरफ्तारी की आशंका वाले व्यक्ति की अग्रिम जमानत",
    newText: "सत्र न्यायालय या उच्च न्यायालय किसी गैर-जमानती अपराध के आरोप में गिरफ्तारी की आशंका वाले व्यक्ति को अग्रिम जमानत पर रिहा करने का निर्देश दे सकते हैं।",
    repealDate: "1 जुलाई 2024",
    repealStatute: "BNSS 2023 की धारा 531",
    keyChangesHighlight: "अग्रिम जमानत की शर्तें स्पष्ट की गईं और नोटिस के बिना गिरफ्तारी पर रोक को मजबूत किया गया।",
    savingsClause: "धारा 482 BNSS सीधे लागू है।",
  },

  // EVIDENCE ACT 1872 TO BSA 2023
  {
    category: "EVIDENCE_LAW",
    oldAct: "भारतीय साक्ष्य अधिनियम 1872 (Indian Evidence Act 1872)",
    oldSection: "धारा 65B",
    oldTitle: "इलेक्ट्रॉनिक अभिलेखों की ग्राह्यता (Admissibility of Electronic Records)",
    oldText: "धारा 65B के अंतर्गत इलेक्ट्रॉनिक साक्ष्य पेश करते समय कंप्यूटर आउटपुट का प्रमाण पत्र प्रस्तुत करना अनिवार्य...",
    newAct: "भारतीय साक्ष्य संहिता 2023 (BSA 2023)",
    newSection: "धारा 63",
    newTitle: "इलेक्ट्रॉनिक या डिजिटल अभिलेखों की ग्राह्यता (Admissibility of Digital Records)",
    newText: "कंप्यूटर, मोबाइल, सर्वर, क्लाउड, सेमी-कंडक्टर मेमोरी और डिजिटल डिवाइस में संग्रहीत डेटा प्राथमिक साक्ष्य की तरह ग्राह्य होगा जब उसके साथ धारा 63 का प्रमाण पत्र संलग्न हो।",
    repealDate: "1 जुलाई 2024",
    repealStatute: "BSA 2023 की धारा 170 द्वारा IEA 1872 का निरसन",
    keyChangesHighlight: "क्लाउड स्टोरेज, व्हाट्सएप मैसेज, ईमेल और डिजिटल हस्ताक्षर को स्पष्ट रूप से साक्ष्य की कानूनी मान्यता दी गई।",
    savingsClause: "1 जुलाई 2024 के बाद पेश होने वाले सभी इलेक्ट्रॉनिक साक्ष्यों पर BSA धारा 63 सर्टिफिकेट लगेगा।",
  },
];

export const RepealedActsConcordanceService = {
  getAllConcordance() {
    return CONCORDANCE_DATA;
  },

  searchConcordance(query = "") {
    if (!query || query.trim() === "") return CONCORDANCE_DATA;
    const q = query.toLowerCase().trim();

    return CONCORDANCE_DATA.filter((item) => {
      const matchOld = item.oldAct.toLowerCase().includes(q) || item.oldSection.toLowerCase().includes(q) || item.oldTitle.toLowerCase().includes(q);
      const matchNew = item.newAct.toLowerCase().includes(q) || item.newSection.toLowerCase().includes(q) || item.newTitle.toLowerCase().includes(q);
      const matchChanges = item.keyChangesHighlight.toLowerCase().includes(q);
      return matchOld || matchNew || matchChanges;
    });
  },

  getRepealGazetteDetails() {
    return {
      repealDate: "1 जुलाई 2024 (July 01, 2024)",
      centralGazetteNotification: "Ministry of Home Affairs Notification S.O. 848(E), 849(E), 850(E)",
      repealedActs: [
        { name: "भारतीय दंड संहिता 1860 (IPC 1860)", replacedBy: "भारतीय न्याय संहिता 2023 (BNS 2023)", sectionsCount: "511 से घटकर 358 धाराएं" },
        { name: "दंड प्रक्रिया संहिता 1973 (CrPC 1973)", replacedBy: "भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS 2023)", sectionsCount: "484 से बढ़कर 531 धाराएं" },
        { name: "भारतीय साक्ष्य अधिनियम 1872 (IEA 1872)", replacedBy: "भारतीय साक्ष्य संहिता 2023 (BSA 2023)", sectionsCount: "167 से बढ़कर 170 धाराएं" },
      ],
      officialDataSource: "India Code (indiacode.nic.in) एवं भारत का राजपत्र (egazette.gov.in)",
    };
  },
};

export default RepealedActsConcordanceService;
