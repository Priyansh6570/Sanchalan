export default function Page() {
  return (
    <div style={{padding:"2rem",maxWidth:"800px",margin:"0 auto",fontFamily:"sans-serif",lineHeight:"1.6"}}>
      <h1>Privacy Policy</h1>

      <p>Last updated: {new Date().toISOString().split("T")[0]}</p>

      <h2>Overview</h2>
      <p>This website is created solely for internal use by the owner and authorized government personnel to monitor the Veer Bharat YouTube channel performance, schedule, analytics, and related operational data.</p>

      <h2>Data Access</h2>
      <p>This site uses Google OAuth to access Veer Bharat YouTube and YouTube Analytics data. Only explicitly authorized accounts can log in. No public users can register or access any part of the system.</p>

      <h2>Data Collected</h2>
      <ul>
        <li>Google account basic profile info for login</li>
        <li>YouTube channel analytics</li>
        <li>Video schedule and performance statistics</li>
      </ul>

      <h2>How Data Is Used</h2>
      <p>All collected data is used only to:</p>
      <ul>
        <li>Monitor channel growth</li>
        <li>Track video performance</li>
        <li>Manage upload schedules</li>
        <li>Assist authorized personnel in operational decision making</li>
      </ul>

      <h2>Data Sharing</h2>
      <p>No collected data is shared with external parties. Data is strictly internal to the owner and authorized government personnel.</p>

      <h2>Data Storage</h2>
      <p>All data is stored securely within the project’s backend and is never sold, rented, or publicly exposed.</p>

      <h2>Google OAuth Disclosure</h2>
      <p>This site uses Google OAuth to request access to YouTube Analytics and YouTube Data API scopes. This access is used solely for reading analytics and channel performance data of Veer Bharat. No modifications or uploads are performed without explicit user action.</p>

      <h2>User Rights</h2>
      <p>Since the website is private, access is restricted. Any authorized user may request removal of their OAuth access data at any time.</p>

      <h2>Policy Updates</h2>
      <p>Policy may be updated when required. Continued internal use constitutes acceptance of these changes.</p>

      <h2>Contact</h2>
      <p>For questions, contact: priyanshmishra20052003@gmail.com</p>
    </div>
  )
}
