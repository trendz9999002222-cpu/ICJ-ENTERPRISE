export default function AdminDashboard() {
  const cards = [
    { title: "Members", value: "1250", color: "#2563eb" },
    { title: "Wallet Balance", value: "₹5,25,000", color: "#16a34a" },
    { title: "Donations", value: "₹12,80,000", color: "#dc2626" },
    { title: "Cases", value: "348", color: "#9333ea" },
    { title: "Documents", value: "920", color: "#ea580c" },
    { title: "Reports", value: "85", color: "#0891b2" },
  ];

  return (
    <div
      style={{
        padding: "30px",
        background: "#f3f4f6",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        <h1>ICJ Enterprise Platform</h1>
        <p>International Consortium of Jurists</p>
        <h3>Administrator Dashboard</h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: card.color,
              color: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,.2)",
            }}
          >
            <h2>{card.value}</h2>
            <p>{card.title}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Quick Actions</h2>

        <ul>
          <li>👤 Member Management</li>
          <li>💰 Wallet Management</li>
          <li>🎁 Donation Management</li>
          <li>⚖️ Legal Case Management</li>
          <li>📄 Document Center</li>
          <li>📊 Reports & Analytics</li>
          <li>🤖 AI Assistant</li>
          <li>⚙️ System Settings</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Module Status</h2>

        <table width="100%" cellPadding="10">
          <thead>
            <tr>
              <th align="left">Module</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr><td>Login</td><td>✅ Active</td></tr>
            <tr><td>Membership</td><td>✅ Active</td></tr>
            <tr><td>Wallet</td><td>✅ Active</td></tr>
            <tr><td>Token</td><td>✅ Active</td></tr>
            <tr><td>Documents</td><td>✅ Active</td></tr>
            <tr><td>Reports</td><td>✅ Active</td></tr>
            <tr><td>Legal</td><td>✅ Active</td></tr>
            <tr><td>Payment Gateway</td><td>⏳ Pending</td></tr>
            <tr><td>AI Chat</td><td>⏳ Pending</td></tr>
            <tr><td>Mobile App</td><td>⏳ Pending</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}