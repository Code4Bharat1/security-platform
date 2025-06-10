import { NextResponse } from 'next/server';

const wordlist = [
  "/admin", "/admin/", "/admin/login", "/admin.php",
  "/login", "/login.php", "/dashboard", "/dashboard.php",
  "/config", "/config.php", "/.git", "/.env", "/.htaccess",
  "/uploads", "/uploads/", "/images", "/images/",
  "/css", "/js", "/api", "/server-status", "/backup", "/db",
  "/test", "/test/", "/old", "/old_site", "/dev", "/private",
  "/cgi-bin", "/cgi-bin/", "/scripts", "/scripts/", "/phpmyadmin",
  "/webadmin", "/wp-admin", "/wp-login", "/cpanel", "/user", "/users",
  "/static", "/assets", "/logs", "/log", "/temp", "/tmp", "/bin"
];

export async function POST(req) {
  const { target } = await req.json();
  const results = [];

  for (const path of wordlist) {
    const fullUrl = `${target}${path}`;
    try {
      const res = await fetch(fullUrl, { method: 'GET', redirect: 'manual' });
      const status = res.status;

      let statusResult = "❌ Not Found";
      if (status === 200) {
        statusResult = "✅ Accessible";
      } else if (status === 403 || (status >= 300 && status < 400)) {
        statusResult = `⚠️ Possible - Status ${status}`;
      }

      results.push({ path, status, result: statusResult });
    } catch (err) {
      results.push({ path, status: "Error", result: "⚠️ Request Failed" });
    }
  }

  return NextResponse.json({ results });
}
