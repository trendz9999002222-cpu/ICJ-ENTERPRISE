import fs from "fs";
import path from "path";

// Define paths
const seedPath = "C:/Users/Pawan/OneDrive/Desktop/ICJ DEVELOPMENT/src/data/seedUsers.js";

// Read file
let content = fs.readFileSync(seedPath, "utf-8");

// We need to parse the array. Since it is exported as a JS module, we can extract the JSON part or parse it.
// To keep it simple, let's extract the array text between "export const ENTERPRISE_SEED_USERS = [" and "];" at the end.
const startIndex = content.indexOf("export const ENTERPRISE_SEED_USERS = [");
if (startIndex === -1) {
  console.error("Could not find start of array");
  process.exit(1);
}

const arrayStart = startIndex + "export const ENTERPRISE_SEED_USERS = [".length;
const arrayEnd = content.lastIndexOf("];");

const arrayContent = content.substring(arrayStart - 1, arrayEnd + 1);

let users;
try {
  users = JSON.parse(arrayContent);
} catch (err) {
  console.error("JSON parse failed. Let's do regex-based load or eval.");
  // Alternate: eval since it's just JS
  const sandbox = {};
  const evalStr = `var users = ${arrayContent}; users;`;
  users = eval(evalStr);
}

console.log(`Successfully read ${users.length} seed users.`);

const PROBLEM_CATEGORIES = [
  "Legal Dispute",
  "Criminal Matter",
  "Harassment / Domestic Violence",
  "Property / Real Estate / Land Dispute",
  "Consumer Complaint / Exploitation",
  "Labour / Employment Issue",
  "Family Law / Divorce / Matrimonial Dispute",
  "Cyber Crime / Online Fraud",
  "Cheque Bounce / Debt Recovery",
  "Human Rights / Public Interest Issue",
  "Accident Claims / Compensation",
  "Taxation & Revenue Disputes"
];

const INTAKE_SERVICES = [
  "Notary / नोटरी",
  "Drafting / ड्राफ्टिंग",
  "Writer/Typist / लिखने वाला",
  "Court Representation / कोर्ट पैरवी",
  "Legal Consultation"
];

const STATES = ["Delhi", "Uttar Pradesh", "Punjab", "Haryana"];
const DISTRICTS = {
  "Delhi": ["North Delhi", "South Delhi", "West Delhi", "East Delhi"],
  "Uttar Pradesh": ["Noida / Gautam Buddha Nagar", "Lucknow", "Meerut", "Ghaziabad"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Haryana": ["Gurugram", "Faridabad", "Karnal", "Panipat"]
};
const CITIES = {
  "North Delhi": "Rohini", "South Delhi": "Saket", "West Delhi": "Rajouri Garden", "East Delhi": "Laxmi Nagar",
  "Noida / Gautam Buddha Nagar": "Noida", "Lucknow": "Lucknow", "Meerut": "Meerut", "Ghaziabad": "Ghaziabad",
  "Amritsar": "Amritsar", "Ludhiana": "Ludhiana", "Jalandhar": "Jalandhar", "Patiala": "Patiala",
  "Gurugram": "Gurugram", "Faridabad": "Faridabad", "Karnal": "Karnal", "Panipat": "Panipat"
};
const POLICE_STATIONS = {
  "Rohini": "Rohini Sec-7 PS", "Saket": "Saket Cyber PS", "Rajouri Garden": "Rajouri Garden PS", "Laxmi Nagar": "Shakarpur PS",
  "Noida": "Noida Sector-20 PS", "Lucknow": "Hazratganj PS", "Meerut": "Civil Lines Meerut PS", "Ghaziabad": "Kavi Nagar PS",
  "Amritsar": "Civil Lines Amritsar PS", "Ludhiana": "Division 5 PS", "Jalandhar": "Jalandhar Cantt PS", "Patiala": "Kotwali PS",
  "Gurugram": "DLF Phase 3 PS", "Faridabad": "Faridabad Central PS", "Karnal": "Civil Lines Karnal PS", "Panipat": "Model Town PS"
};

const PROBLEMS = {
  "Legal Dispute": "किराएदार मकान खाली नहीं कर रहा है और न ही किराया दे रहा है। बेदखली (Eviction Suit) का मुकदमा दर्ज कराना है।",
  "Criminal Matter": "पड़ोसियों ने मिलकर मारपीट की और झूठा मुकदमा दर्ज कराने की धमकी दे रहे हैं। क्रॉस FIR और बेल एप्लीकेशन दाखिल करनी है।",
  "Harassment / Domestic Violence": "पति और ससुराल वाले पिछले 3 साल से दहेज के लिए मानसिक और शारीरिक प्रताड़ना कर रहे हैं। कानूनी कार्रवाई चाहिए।",
  "Property / Real Estate / Land Dispute": "पूर्वजों की जमीन पर भू-माफिया ने अवैध कब्जा कर लिया है। स्टे आर्डर लेने और कब्जा वापस पाने के लिए कोर्ट जाना है।",
  "Consumer Complaint / Exploitation": "एक ऑनलाइन शॉपिंग पोर्टल से ₹50,000 का मोबाइल खरीदा था, जो डिफेक्टिव निकला। रिप्लेसमेंट या रिफंड नहीं मिल रहा है।",
  "Labour / Employment Issue": "कंपनी ने बिना कोई नोटिस दिए और बिना 3 महीने के बकाया वेतन के गैर-कानूनी ढंग से नौकरी से निकाल दिया है।",
  "Family Law / Divorce / Matrimonial Dispute": "पति के साथ आपसी सहमति से तलाक (Mutual Consent Divorce) फाइल करना है और बच्चे की कस्टडी का सेटलमेंट करना है।",
  "Cyber Crime / Online Fraud": "फिशिंग कॉल के जरिए बैंक खाते से ₹1,20,000 की अवैध निकासी हो गई है। साइबर सेल में शिकायत दर्ज करानी है।",
  "Cheque Bounce / Debt Recovery": "पार्टी ने व्यापारिक भुगतान के लिए ₹3 लाख का चेक दिया था जो बैंक में बाउंस हो गया। लीगल नोटिस भेजना है।",
  "Human Rights / Public Interest Issue": "इलाके में अवैध फैक्ट्री से प्रदूषण फैल रहा है। एनजीटी (NGT) में जनहित याचिका (PIL) दायर करनी है।",
  "Accident Claims / Compensation": "सड़क हादसे में गंभीर चोट आने पर बीमा कंपनी और वाहन मालिक से क्लेम लेने हेतु MACT कोर्ट में दावा पेश करना है।",
  "Taxation & Revenue Disputes": "जीएसटी डिपार्टमेंट से पुराना टैक्स ऑडिट नोटिस मिला है। इसका रिप्लाई तैयार करना है और अपील फाइल करनी है।"
};

// Find existing members that don't have problem details and modify 20 of them
let count = 0;
for (let i = 0; i < users.length; i++) {
  const u = users[i];
  // Target normal members/clients
  if ((u.role === "member" || u.user_type === "client" || u.user_type === "member") && !u.problemCategory && count < 20) {
    const category = PROBLEM_CATEGORIES[count % PROBLEM_CATEGORIES.length];
    const state = STATES[count % STATES.length];
    const district = DISTRICTS[state][count % DISTRICTS[state].length];
    const city = CITIES[district];
    const ps = POLICE_STATIONS[city];
    const pin = String(110001 + (count * 1234) % 899999).slice(0, 6);
    
    u.purposeCode = "PROBLEM";
    u.purpose = "Your Problem, Our Solution.";
    u.problemCategories = [category];
    u.problemCategory = category;
    u.problemState = state;
    u.problemDistrict = district;
    u.problemCity = city;
    u.problemPincode = pin;
    u.problemPoliceStation = ps;
    u.problemDescription = PROBLEMS[category];
    u.intakeServices = [
      INTAKE_SERVICES[count % INTAKE_SERVICES.length],
      INTAKE_SERVICES[(count + 1) % INTAKE_SERVICES.length]
    ];
    
    count++;
  }
}

console.log(`Updated ${count} members to have active lead data.`);

// Write back to file
const updatedContent = "export const ENTERPRISE_SEED_USERS = " + JSON.stringify(users, null, 2) + ";\n";
fs.writeFileSync(seedPath, updatedContent, "utf-8");
console.log("Successfully wrote seed file!");
