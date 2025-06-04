// File: /app/api/portScan/route.js
import { NextResponse } from 'next/server';
import net from 'net';

// Common port definitions for better reporting
const commonPorts = {
  20: { service: "FTP-Data", description: "File Transfer Protocol (data)", risk: "Medium" },
  21: { service: "FTP", description: "File Transfer Protocol (control)", risk: "Medium" },
  22: { service: "SSH", description: "Secure Shell", risk: "Low" },
  23: { service: "Telnet", description: "Unencrypted text communications", risk: "High" },
  25: { service: "SMTP", description: "Simple Mail Transfer Protocol", risk: "Medium" },
  53: { service: "DNS", description: "Domain Name System", risk: "Medium" },
  80: { service: "HTTP", description: "Hypertext Transfer Protocol", risk: "Medium" },
  110: { service: "POP3", description: "Post Office Protocol v3", risk: "Medium" },
  143: { service: "IMAP", description: "Internet Message Access Protocol", risk: "Medium" },
  443: { service: "HTTPS", description: "HTTP Secure", risk: "Low" },
  993: { service: "IMAPS", description: "IMAP Secure", risk: "Low" },
  995: { service: "POP3S", description: "POP3 Secure", risk: "Low" },
  1433: { service: "MSSQL", description: "Microsoft SQL Server", risk: "High" },
  3306: { service: "MySQL", description: "MySQL Database", risk: "High" },
  3389: { service: "RDP", description: "Remote Desktop Protocol", risk: "High" },
  5432: { service: "PostgreSQL", description: "PostgreSQL Database", risk: "High" },
  5900: { service: "VNC", description: "Virtual Network Computing", risk: "High" },
  8080: { service: "HTTP-Alternate", description: "Alternative HTTP port", risk: "Medium" },
  8443: { service: "HTTPS-Alternate", description: "Alternative HTTPS port", risk: "Medium" }
};

const scanPort = (host, port, timeout = 3000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.connect({ port, host }, () => {
      socket.destroy();
      resolve({ open: true });
    });

    socket.on('error', () => resolve({ open: false }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ open: false });
    });
  });
};

const getPortInfo = (port, isOpen) => {
  const info = commonPorts[port];
  return info
    ? {
        open: isOpen,
        service: info.service,
        description: info.description,
        risk: isOpen ? info.risk : "None"
      }
    : {
        open: isOpen,
        service: isOpen ? "Unknown" : "-",
        description: isOpen ? "Unidentified service" : "-",
        risk: isOpen ? "Medium" : "None"
      };
};

const calculateRiskLevel = (openPorts) => {
  if (openPorts.length === 0) return "Low";
  const highRisk = openPorts.filter(port => commonPorts[port]?.risk === "High");
  if (highRisk.length > 0) return "High";
  if (openPorts.length > 5) return "Medium";
  return "Low";
};

function generateRecommendations(openPorts) {
  const recs = [];

  if (openPorts.length === 0) {
    recs.push("No open ports detected. Continue regular security monitoring.");
    return recs;
  }

  recs.push("Close unnecessary ports to reduce attack surface.");

  if (openPorts.includes(21) || openPorts.includes(20))
    recs.push("FTP uses unencrypted connections. Use SFTP instead.");
  if (openPorts.includes(23))
    recs.push("Telnet sends data in plaintext. Use SSH instead.");
  if ([3306, 1433, 5432].some(p => openPorts.includes(p)))
    recs.push("Database ports should not be exposed. Use VPN or SSH tunnel.");
  if (openPorts.includes(3389))
    recs.push("RDP should be IP-restricted and require strong auth.");
  if (openPorts.includes(80) && !openPorts.includes(443))
    recs.push("Enable HTTPS (TLS/SSL) for secure communication.");

  return recs;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get('host');
  let startPort = parseInt(searchParams.get('startPort'), 10) || 1;
  let endPort = parseInt(searchParams.get('endPort'), 10) || startPort;

  if (!host) {
    return NextResponse.json({ error: "Host parameter is required" }, { status: 400 });
  }

  if (endPort - startPort > 100) {
    return NextResponse.json({
      error: "Port range too large. Maximum scan range is 100 ports."
    }, { status: 400 });
  }

  try {
    const scanPromises = [];

    for (let port = startPort; port <= endPort; port++) {
      scanPromises.push(
        scanPort(host, port).then(result => ({
          port,
          info: getPortInfo(port, result.open)
        }))
      );
    }

    const resolved = await Promise.all(scanPromises);
    const scanResults = {};
    resolved.forEach(({ port, info }) => {
      scanResults[port] = info;
    });

    const openPorts = Object.keys(scanResults)
      .filter(port => scanResults[port].open)
      .map(Number);

    const response = {
      host,
      scanTime: new Date().toISOString(),
      ports: scanResults,
      summary: {
        total: Object.keys(scanResults).length,
        open: openPorts.length,
        closed: Object.keys(scanResults).length - openPorts.length,
        riskAssessment: calculateRiskLevel(openPorts)
      },
      recommendations: generateRecommendations(openPorts)
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Port scan error:", err);
    return NextResponse.json({ error: "Failed to complete port scan" }, { status: 500 });
  }
}
