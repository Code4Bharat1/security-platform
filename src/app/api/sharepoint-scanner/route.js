// File: /app/api/sharepoint-scanner/route.js
import { NextResponse } from 'next/server';


/**
 * Handles SharePoint security scanning requests
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - JSON response with SharePoint scan results
 */
export async function POST(request) {
  try {
    const { url } = await request.json();
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Scan the SharePoint site
    const scanResults = await scanSharePointSite(fullUrl);
    
    return NextResponse.json(scanResults);
  } catch (error) {
    console.error('SharePoint scanner error:', error);
    return NextResponse.json({ error: 'Failed to scan SharePoint site' }, { status: 500 });
  }
}

/**
 * Scans a SharePoint site for security vulnerabilities and issues
 * @param {string} url - The URL to scan
 * @returns {Object} - SharePoint scan results
 */
async function scanSharePointSite(url) {
  try {
    // In a real implementation, we would make requests to the SharePoint site
    // and analyze the responses. For this demo, we'll simulate the scan results.
    
    // Check if the URL looks like a SharePoint site
    if (!isSharePointUrl(url)) {
      return {
        error: 'The provided URL does not appear to be a SharePoint site',
      };
    }
    
    // Simulate a delay for the scanning process
//await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate simulated scan results based on the URL
    return generateSharePointScanResults(url);
  } catch (error) {
    console.error('Scan error:', error);
    throw new Error('Failed to scan SharePoint site');
  }
}

/**
 * Checks if a URL appears to be a SharePoint site
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL appears to be a SharePoint site
 */
function isSharePointUrl(url) {
  // Check for common SharePoint URL patterns
  return (
    url.includes('.sharepoint.com') || 
    url.includes('/sites/') || 
    url.includes('/teams/') ||
    url.includes('/_layouts/') ||
    url.toLowerCase().includes('sharepoint')
  );
}

/**
 * Generates simulated SharePoint scan results
 * @param {string} url - The SharePoint URL
 * @returns {Object} - Simulated scan results
 */
function generateSharePointScanResults(url) {
  // Determine SharePoint version based on URL patterns
  let version = determineSharePointVersion(url);
  
  // Determine if the version is still supported
  const versionSupported = isVersionSupported(version);
  
  // Determine authentication type based on URL patterns
  const authInfo = determineAuthenticationType(url);
  
  // Determine external sharing settings
  const externalSharing = determineExternalSharing(url);
  
  // Generate random permission issues count (0-5)
  const permissionIssues = Math.floor(Math.random() * 6);
  
  // Determine security patch status
  const securityPatches = determineSecurityPatches(version);
  
  // Generate random vulnerabilities based on the version and other factors
  const vulnerabilities = generateVulnerabilities(version, authInfo, externalSharing);
  
  // Calculate security score
  const securityScore = calculateSecurityScore({
    versionSupported,
    authenticationSecure: authInfo.secure,
    externalSharing,
    permissionIssues,
    securityPatches,
    vulnerabilitiesCount: vulnerabilities.length
  });
  
  return {
    version,
    versionSupported,
    authenticationType: authInfo.type,
    authenticationSecure: authInfo.secure,
    externalSharing,
    permissionIssues,
    securityPatches,
    vulnerabilities,
    securityScore
  };
}

/**
 * Determines the SharePoint version based on URL patterns
 * @param {string} url - The SharePoint URL
 * @returns {string} - SharePoint version
 */
function determineSharePointVersion(url) {
  // For demonstration purposes, we'll assign versions based on URL patterns
  if (url.includes('modern')) {
    return 'SharePoint Online (Modern)';
  } else if (url.includes('online')) {
    return 'SharePoint Online';
  } else if (url.includes('2019')) {
    return 'SharePoint 2019';
  } else if (url.includes('2016')) {
    return 'SharePoint 2016';
  } else if (url.includes('2013')) {
    return 'SharePoint 2013';
  } else {
    const versions = [
      'SharePoint Online (Modern)',
      'SharePoint Online',
      'SharePoint 2019',
      'SharePoint 2016',
      'SharePoint 2013'
    ];
    return versions[Math.floor(Math.random() * versions.length)];
  }
}

/**
 * Checks if a SharePoint version is still supported
 * @param {string} version - SharePoint version
 * @returns {boolean} - True if the version is still supported
 */
function isVersionSupported(version) {
  // For demonstration purposes, we'll consider older versions unsupported
  return !(
    version.includes('2013') || 
    version.includes('2010') || 
    version.includes('2007')
  );
}

/**
 * Determines the authentication type based on URL patterns
 * @param {string} url - The SharePoint URL
 * @returns {Object} - Authentication type and security status
 */
function determineAuthenticationType(url) {
  // For demonstration purposes, we'll assign auth types based on URL patterns
  if (url.includes('adfs') || url.includes('saml')) {
    return { type: 'ADFS/SAML', secure: true };
  } else if (url.includes('azuread')) {
    return { type: 'Azure AD', secure: true };
  } else if (url.includes('modern')) {
    return { type: 'Modern Authentication', secure: true };
  } else if (url.includes('ntlm') || url.includes('basic')) {
    return { type: 'NTLM/Basic', secure: false };
  } else {
    // Randomly pick an authentication type
    const authTypes = [
      { type: 'Azure AD', secure: true },
      { type: 'Modern Authentication', secure: true },
      { type: 'ADFS', secure: true },
      { type: 'NTLM', secure: false },
      { type: 'Forms Based Authentication', secure: false }
    ];
    return authTypes[Math.floor(Math.random() * authTypes.length)];
  }
}

/**
 * Determines external sharing settings
 * @param {string} url - The SharePoint URL
 * @returns {string} - External sharing status
 */
function determineExternalSharing(url) {
  // For demonstration purposes, we'll assign external sharing settings based on URL patterns
  if (url.includes('external') || url.includes('public')) {
    return "Unrestricted";
  } else if (url.includes('private') || url.includes('internal')) {
    return "Disabled";
  } else {
    // Randomly pick an external sharing setting
    const sharingOptions = ["Disabled", "Limited", "Unrestricted"];
    return sharingOptions[Math.floor(Math.random() * sharingOptions.length)];
  }
}

/**
 * Determines security patch status
 * @param {string} version - SharePoint version
 * @returns {string} - Security patch status
 */
function determineSecurityPatches(version) {
  // For demonstration purposes, we'll assign patch status based on version
  if (version.includes('Online')) {
    return "Up to date";
  } else if (version.includes('2019')) {
    return Math.random() > 0.3 ? "Up to date" : "Missing patches";
  } else if (version.includes('2016')) {
    return Math.random() > 0.5 ? "Up to date" : "Missing patches";
  } else {
    return Math.random() > 0.7 ? "Up to date" : "Missing patches";
  }
}

/**
 * Generates vulnerabilities based on SharePoint configuration
 * @param {string} version - SharePoint version
 * @param {Object} authInfo - Authentication information
 * @param {string} externalSharing - External sharing status
 * @returns {Array} - List of vulnerabilities
 */
function generateVulnerabilities(version, authInfo, externalSharing) {
  const vulnerabilities = [];
  
  // Add vulnerabilities based on version
  if (version.includes('2013')) {
    vulnerabilities.push("Using unsupported SharePoint version (2013)");
  }
  
  // Add vulnerabilities based on authentication
  if (!authInfo.secure) {
    vulnerabilities.push("Insecure authentication method in use");
    vulnerabilities.push("Modern authentication not enabled");
  }
  
  // Add vulnerabilities based on external sharing
  if (externalSharing === "Unrestricted") {
    vulnerabilities.push("Unrestricted external sharing poses security risk");
  }
  
  // Add random common vulnerabilities
  const commonVulnerabilities = [
    "Anonymous access enabled for some content",
    "Administrator accounts with weak passwords",
    "Excessive permissions granted to standard users",
    "Missing critical security patches",
    "Guest access not properly monitored",
    "Missing audit logs configuration",
    "Sensitive content without information protection",
    "Default permission inheritance broken in multiple locations"
  ];
  
  // Add 0-3 random common vulnerabilities
  const vulnCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < vulnCount; i++) {
    const randomVuln = commonVulnerabilities[Math.floor(Math.random() * commonVulnerabilities.length)];
    if (!vulnerabilities.includes(randomVuln)) {
      vulnerabilities.push(randomVuln);
    }
  }
  
  return vulnerabilities;
}

/**
 * Calculates overall security score
 * @param {Object} scanData - Scan results data
 * @returns {number} - Security score between 0-100
 */
function calculateSecurityScore(scanData) {
  let score = 100;
  
  // Deduct for unsupported version
  if (!scanData.versionSupported) {
    score -= 25;
  }
  
  // Deduct for insecure authentication
  if (!scanData.authenticationSecure) {
    score -= 20;
  }
  
  // Deduct for external sharing
  if (scanData.externalSharing === "Unrestricted") {
    score -= 15;
  } else if (scanData.externalSharing === "Limited") {
    score -= 5;
  }
  
  // Deduct for permission issues
  score -= scanData.permissionIssues * 5;
  
  // Deduct for security patches
  if (scanData.securityPatches === "Missing patches") {
    score -= 15;
  }
  
  // Deduct for each vulnerability
  score -= scanData.vulnerabilitiesCount * 7;
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

