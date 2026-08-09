import fs from "fs";
import path from "path";

const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>ICJ Enterprise Platform - Executive Decisions & Module Documentation</title>
<style>
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1e293b;
    margin: 40px;
  }
  h1 {
    color: #0f172a;
    font-size: 22pt;
    border-bottom: 3px solid #1e3a8a;
    padding-bottom: 8px;
    margin-bottom: 20px;
  }
  h2 {
    color: #1e3a8a;
    font-size: 15pt;
    border-bottom: 1.5px solid #93c5fd;
    padding-bottom: 4px;
    margin-top: 25px;
  }
  h3 {
    color: #0f172a;
    font-size: 12pt;
    margin-top: 15px;
  }
  .highlight-box {
    background-color: #f8fafc;
    border-left: 4px solid #2563eb;
    padding: 12px 16px;
    margin: 15px 0;
    border-radius: 4px;
  }
  .alert-danger {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 12px 16px;
    margin: 15px 0;
    color: #991b1b;
  }
  .alert-success {
    background-color: #f0fdf4;
    border-left: 4px solid #10b981;
    padding: 12px 16px;
    margin: 15px 0;
    color: #065f46;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  th {
    background-color: #0f172a;
    color: #ffffff;
    padding: 8px 12px;
    text-align: left;
    font-size: 10pt;
  }
  td {
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    font-size: 10pt;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 9pt;
    font-weight: bold;
    border-radius: 12px;
    color: #fff;
  }
  .badge-success { background-color: #10b981; }
  .badge-warning { background-color: #f59e0b; }
  .badge-danger { background-color: #ef4444; }
  .badge-info { background-color: #2563eb; }
</style>
</head>
<body>

<h1>⚖️ ICJ Enterprise Platform — कार्यपालक निर्णय व मॉड्यूल्स का संपूर्ण सारांश</h1>

<div class="highlight-box">
  <b>दस्तावेज़ का उद्देश्य:</b> यह आधिकारिक वर्ड डॉक्यूमेंट (Word File) उन सभी निर्णयों, लीगल आर्किटेक्चर, टोकन नियमों, सुरक्षा प्रोटोकॉल्स और ग्रुप B मॉड्यूल्स के अनफ़्रीज़ होने के विवरण का एक संपूर्ण संकलन है, जो कंप्यूटर फ्रीज कराने से लेकर अनफ़्रीज़ कराने के बीच में लिए गए हैं। इसका उपयोग आप अपने आर्टिकल्स, नोट्स और प्रेजेंटेशन बनाने हेतु सीधे कर सकते हैं।
</div>

<hr/>

<h2>1. 🪙 ICJ टोकन बार्टर सिस्टम व सोशल ऑब्लिगेशन चार्टर</h2>
<p><b>मुख्य सिद्धांत (Core Philosophy):</b> ICJ टोकन एक <i>सामाजिक प्रतिज्ञा (Social Pledge)</i> है, कोई कानूनी देनदारी या प्रतिभूति (Security) नहीं। यह 'इंडियन ट्रस्ट्स एक्ट 1882' के तहत संचालित होता है।</p>
<ul>
  <li><b>20% सर्विस चार्ज व 80G टैक्स छूट:</b> प्रत्येक टोकन विनिमय व केस फीस पर 20% सर्विस चार्ज ICJ चैरिटेबल ट्रस्ट खजाने में जाता है जो GST नोटिफिकेशन 12/2017-CT(Rate) के तहत टैक्स मुक्त है।</li>
  <li><b>TUA-v1.0 आईटी एक्ट 2000 धारा 79 मध्यस्थ प्रतिरक्षा:</b> ट्रस्ट केवल दोनों पक्षों का मीडिएटर और निष्पादक है। दो पक्षों के बीच किसी भी विवाद पर ट्रस्ट पर कोई क्रिमिनल या सिविल केस नहीं किया जा सकता।</li>
  <li><b>पब्लिक टोकन एक्सचेंज व मैनुअल:</b> <code>/token-exchange</code> और <code>/token-governance-manual</code> लाइव पोर्टल पर 16 मास्टर FAQs के साथ उपलब्ध है।</li>
</ul>

<h2>2. 🚨 चलते हुए कोर्ट केस के पीड़ितों हेतु "Advocate Rescue Engine"</h2>
<p>भारत में 80% से अधिक पीड़ित वे होते हैं जिनका केस अदालतों में सालों से चल रहा है और वे पुराने वकील की लापरवाही से परेशान हैं। उनके लिए <code>ClientPortal.jsx</code> के भीतर 5-स्तरीय व्यवस्था लागू की गई है:</p>
<ol>
  <li><b>5-सेकंड में केस का एक्स-रे ऑडिट:</b> केस नंबर/CNR डालते ही AI पुराने वकील की कमियों और वर्तमान केस स्टेज का एक्स-रे कर देता है।</li>
  <li><b>Zero-NOC Succession Protocol:</b> पुराने वकील से फाइल या NOC मांगने की कोई आवश्यकता नहीं। ICJ का एम्पेनल्ड वकील e-Courts से सीधे डिजिटल फाइल डाउनलोड करके नया वकालतनामा लगा देता है।</li>
  <li><b>24x7 व्हाट्सएप व एसएमएस साथी:</b> हर तारीख और अदालती आदेश की लाइव अपडेट्स क्लाइंट के फोन पर पहुंचती है।</li>
  <li><b>ICJ एस्क्रो सुरक्षा:</b> वकील का भुगतान केवल काम पूरा होने पर ही रिलीज होता है।</li>
  <li><b>"अपनी वकालत खुद करें" बचत:</b> केवल तारीख पढ़वाने वाली रूटीन तारीखों पर क्लाइंट खुद पेश होकर वकील का भारी खर्चा बचाता है।</li>
</ol>

<h2>3. 📜 4 साल पुराने डमी केस का 360° संपूर्ण शोकेस</h2>
<p>सिस्टम में <b>श्री रमेश कुमार (Litigant ID: MEM-LKO-9812)</b> का 4 साल पुराना केस दर्ज है:</p>
<table>
  <thead>
    <tr>
      <th>फ़ील्ड (Param)</th>
      <th>विवरण (Details)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>केस का नाम व नंबर</b></td>
      <td>Sh. Ramesh Kumar vs State of UP & Ors (Case #UPHC-01-004812-2022)</td>
    </tr>
    <tr>
      <td><b>अदालत</b></td>
      <td>जिला एवं सत्र न्यायालय, लखनऊ</td>
    </tr>
    <tr>
      <td><b>समय सीमा</b></td>
      <td>4 साल अदालत में चला (12-Apr-2022) | 1 साल पहले ICJ में आया (10-Aug-2025)</td>
    </tr>
    <tr>
      <td><b>वकील बदलने का रिकॉर्ड</b></td>
      <td>❌ Adv. P.K. Verma (बर्खास्त) ➔ ✅ Adv. Rajesh Sharma (ICJ एम्पेनल्ड)</td>
    </tr>
    <tr>
      <td><b>फीस व एस्क्रो हिसाब</b></td>
      <td>₹65,000 कुल ➔ ₹50,000 जमा ➔ ₹35,000 वकील को रिलीज (70%) ➔ ₹15,000 ट्रस्ट 30% अंशदान (80G रसीद) ➔ 🔒 ₹15,000 एस्क्रो में सेफ</td>
    </tr>
    <tr>
      <td><b>तारीखों का हिसाब (12 Dates)</b></td>
      <td>5 मुख्य तारीखों में वकील गया | 7 रूटीन तारीखों में क्लाइंट खुद गया (<b>₹24,500 की सीधी बचत!</b>)</td>
    </tr>
  </tbody>
</table>

<h2>4. 🔒 Zero-Trust DRM व OTP दस्तावेज़ सुरक्षा</h2>
<p>किसी भी पक्ष या क्लाइंट के निजी कागजातों (आधार कार्ड, पैन कार्ड, सेल डीड, एफआईआर) के दुरुपयोग को रोकने के लिए Zero-Trust DRM सिस्टम लागू किया गया है:</p>
<ul>
  <li><b>प्रिंट लॉक (Print Lock):</b> बिना दस्तावेज़ मालिक या सुपर एडमिन के ओटीपी (OTP) सत्यापन के कोई भी प्रिंट नहीं निकाल सकता।</li>
  <li><b>Dynamic Watermarked Print:</b> प्रिंट निकलने पर लाल अक्षरों में डायनामिक वाटरमार्क छपेगा: <i>"CONFIDENTIAL ICJ DRM - FOR OFFICIAL COURT USE ONLY"</i>.</li>
  <li><b>सीडेड 4 सैंपल डॉक्स:</b> आधार कार्ड, पैन कार्ड, सर्टिफाइड एफआईआर कॉपी, और रजिस्टर्ड सेल डीड वॉल्ट में सुरक्षित सीडेड हैं।</li>
</ul>

<h2>5. 🔓 Unfrozen Group B Infrastructure मॉड्यूल्स की स्थिति</h2>
<p>Group B के सभी 14 तकनीकी मॉड्यूल्स को fully active व अनफ़्रीज़ कर दिया गया है:</p>
<table>
  <thead>
    <tr>
      <th>मॉड्यूल नाम</th>
      <th>रूट (Route)</th>
      <th>स्थिति (Status)</th>
      <th>प्रयोजन</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Trust Executive</td><td>/trust-dashboard</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>ट्रस्ट बोर्ड निर्णय व एस्क्रो निगरानी</td></tr>
    <tr><td>AI Assistant</td><td>/ai</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>AI कानूनी सहायक व इंटेलिजेंस</td></tr>
    <tr><td>Research Engine</td><td>/research</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>केस लॉ अनुसंधान व खोज</td></tr>
    <tr><td>Administration Desk</td><td>/administration</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>सुपर एडमिन गवर्नेंस व पासवर्ड नीति</td></tr>
    <tr><td>Governance Center</td><td>/governance-center</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>आईटी एक्ट धारा 79 सेफगार्ड्स</td></tr>
    <tr><td>Location Master</td><td>/location-master</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>अदालत व राज्य लोकेशन मास्टर</td></tr>
    <tr><td>Database Config</td><td>/database-config</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>डेटाबेस कनेक्शन व स्कीमा</td></tr>
    <tr><td>API Gateway & Config</td><td>/api-config</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>API एंडपॉइंट्स व गेटवे</td></tr>
    <tr><td>Deployment Center</td><td>/deployment-center</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>वर्जन कंट्रोल व डिप्लॉयमेंट</td></tr>
    <tr><td>System Health & Metrics</td><td>/system-health</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>अपटाइम व लैटेंसी मॉनिटरिंग</td></tr>
    <tr><td>Reports Registry</td><td>/reports</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>ऑडिट रिपोर्ट व एनालिसिस</td></tr>
    <tr><td>Activity & Audit Log</td><td>/activity-log</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>यूज़र एक्टिविटीज ऑडिट लॉग</td></tr>
    <tr><td>System Settings</td><td>/settings</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>ग्लोबल सिस्टम सेटिंग्स</td></tr>
    <tr><td>Notifications</td><td>/notifications</td><td><span class="badge badge-success">UNFROZEN 🔓</span></td><td>अलर्ट व नोटिफिकेशन सेंटर</td></tr>
  </tbody>
</table>

<h2>6. 🔑 टेस्ट यूज़र क्रेडेंशियल्स व डायरेक्ट लिंक्स</h2>
<ul>
  <li><b>क्लाइंट पोर्टल (Shri Ramesh Kumar):</b> <a href="http://localhost:5173/client-portal">http://localhost:5173/client-portal</a></li>
  <li><b>लॉगिन आईडी:</b> <code>ramesh.kumar@icj.org</code> (या <code>MEM-LKO-9812</code>)</li>
  <li><b>पासवर्ड:</b> <code>Ramesh@1234</code></li>
  <li><b>पब्लिक टोकन एक्सचेंज:</b> <a href="http://localhost:5173/token-exchange">http://localhost:5173/token-exchange</a></li>
  <li><b>टोकन मैनुअल व FAQ:</b> <a href="http://localhost:5173/token-governance-manual">http://localhost:5173/token-governance-manual</a></li>
</ul>

<hr/>
<p style="text-align: center; color: #64748b; font-size: 9pt;">
  ICJ Enterprise Platform — Generated for Official Executive Reference & Notes Drafting | Date: August 2026
</p>

</body>
</html>
`;

const desktopPath = "C:\\Users\\Pawan\\Desktop\\ICJ_Executive_Decisions_Summary.doc";
const workspacePath = path.join(process.cwd(), "ICJ_Executive_Decisions_Summary.doc");

fs.writeFileSync(workspacePath, docContent, "utf-8");
console.log("Created Word Doc at workspace:", workspacePath);

try {
  fs.writeFileSync(desktopPath, docContent, "utf-8");
  console.log("Created Word Doc at Desktop:", desktopPath);
} catch (err) {
  console.log("Could not write directly to Desktop, workspace copy is ready.");
}
