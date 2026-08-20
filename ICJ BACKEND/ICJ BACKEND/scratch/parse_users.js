import fs from 'fs';

const path1 = "C:/Users/Pawan/OneDrive/Desktop/ICJ DEVELOPMENT/src/data/seedUsers.js";
const path2 = "c:/Users/Pawan/OneDrive/Desktop/ICJ DEVELOPMENT/ICJ BACKEND/ICJ BACKEND/src/data/seedUsers.js";

[path1, path2].forEach((p, idx) => {
  if (fs.existsSync(p)) {
    const text = fs.readFileSync(p, 'utf8');
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    const arrayStr = text.slice(start, end + 1);
    try {
      const users = eval(arrayStr);
      console.log(`\n=== FILE ${idx + 1}: ${p} (Count: ${users.length}) ===`);
      users.forEach((u, i) => {
        console.log(`${i+1}. ID: ${u.id || u.member_id} | Name: ${u.fullName || u.name} | Role: ${u.role || u.user_type} | Category/Prof: ${u.problemCategory || u.profession || 'N/A'} | State: ${u.problemState || u.state || 'N/A'} | Parent/Link: ${u.parentMemberId || u.advocateId || 'None'}`);
      });
    } catch(err) {
      console.log(`Error parsing ${p}:`, err.message);
    }
  }
});
