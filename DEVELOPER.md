<!-- prettier-ignore-start -->
# 🛠️ Platform Developer Documentation & Architecture Guide

Welcome to the **Security Platform** Developer Documentation. This guide provides a full architectural analysis of the project, a complete file tree breakdown with status/purpose flags, and tree structure.

---

## 🌳 Project Directory Tree Structure Overview (Please Add any new folder or file in the Directory tree structure before you commit)

```text
security-platform/
├── analyzer/                     # Standalone AST JavaScript Code Scanner
│   └── jsScanner.js              # Custom AST Code Scanner Script
├── frontend-design/              # [WASTE] Legacy Vite + React Duplicate Export
│   ├── src/                      # Duplicate Frontend Source Components
│   ├── Home/                     # Duplicate Home Page Components
│   ├── Services/                 # Duplicate Services Page Components
│   ├── Tool/                     # Duplicate Tool Page Components
│   ├── package.json              # Duplicate Package Config
│   └── vite.config.js            # Legacy Vite Bundler Config
├── public/                       # Static Public Assets
│   ├── about-us/                 # About Page Graphical Assets
│   ├── blogs/                    # Blog Visual Assets
│   ├── BlueTeam/                 # Blue Team Tool Thumbnail Assets
│   ├── GreenTeam/                # Green Team Tool Thumbnail Assets
│   ├── OurCoreServices/          # Service Category Icons
│   ├── RedTeam/                  # Red Team Tool Thumbnail Assets
│   └── favicon.ico               # Website Favicon
├── rules/                        # AST Security Rule Definitions
│   ├── no-document-write.js      # Rule checking document.write usage
│   ├── no-eval.js                # Rule checking eval() invocation
│   ├── no-innerHTML.js           # Rule checking dangerous innerHTML assignment
│   └── no-sql-injection.js       # Rule checking unsanitized SQL queries
├── samples/                      # Scanner Test Samples
│   └── sample.js                 # Sample JavaScript file for AST scanner testing
├── security-platform/            # [WASTE] Empty Nested Root Folder
├── src/                          # Application Source Code (Next.js 16 App Router)
│   ├── app/                      # Next.js App Router (Pages & API Routes)
│   │   ├── (marketing)/          # Landing & Marketing Pages
│   │   │   ├── about/            # About Us Page (`page.jsx`)
│   │   │   ├── connect/          # Enterprise Contact Page (`page.jsx`)
│   │   │   ├── credits/          # Scan Credits Dashboard (`page.jsx`)
│   │   │   ├── gain-access/      # Authentication Portal (`page.jsx`)
│   │   │   ├── login/            # Dedicated Login Page (`page.jsx`)
│   │   │   ├── subscription/     # Subscription & Invoicing Page (`page.jsx`)
│   │   │   └── page.jsx          # Platform Main Landing Page
│   │   ├── api/                  # Backend API Handlers
│   │   │   └── image-proxy/      # CORS Image Proxy API Handler (`route.jsx`)
│   │   ├── services/             # Service Overview Pages
│   │   │   ├── cloud-security/   # Cloud Security Service (`page.jsx`)
│   │   │   ├── network-security/     # Network Security Service (`page.jsx`)
│   │   │   ├── penetration-testing/  # VAPT Pentesting Service (`page.jsx`)
│   │   │   └── page.jsx              # Services Catalog Page
│   │   ├── tools/                    # Security Tool Scanners (50+ Route Pages)
│   │   │   ├── apiForm/              # API Security Tester (`page.jsx`)
│   │   │   ├── bruteForce/           # Brute Force Audit (`page.jsx`)
│   │   │   ├── csrfChecker/          # CSRF Protection Checker (`page.jsx`)
│   │   │   ├── firewallDashboard/    # Firewall Monitoring Dashboard (`page.jsx`)
│   │   │   ├── JWTSignatureValidator/# JWT Inspector (`page.jsx`)
│   │   │   ├── password-checker/     # Password Strength Analyzer (`page.jsx`)
│   │   │   ├── vuln-scanner/         # Web Vulnerability Scanner (`page.jsx`)
│   │   │   ├── layout.jsx            # Security Tools Shared Sub-Layout
│   │   │   └── page.jsx          # Security Tools Directory & Catalog Matrix
│   │   ├── globals.css           # Global Styling, Tailwind Directives & Animations
│   │   └── layout.jsx            # Platform Root Layout (AuthProvider & Toaster)
│   ├── components/               # React UI Components
│   │   ├── AboutUs/              # Company About & Branches Components
│   │   ├── Auth/                 # Google Authentication Components
│   │   ├── Home/                 # Landing Page Hero, Services, Blogs & Certifications
│   │   ├── layout/               # Shared Global Navigation Bar & Footer
│   │   ├── marketing/            # Hero Graphics, Brand Marks & Orbit Radar
│   │   ├── Tool/                 # Categorized Tool Templates (Red/Blue/Green/Purple)
│   │   ├── tool-guidance/        # Tool Tooltips, Pre-Scan Checklists & Help Panels
│   │   ├── [toolComponents]/     # Scanner UI Components & PDF Generators (`generate*PDF.js`)
│   │   ├── GainAcess.jsx           # Authentication Modal Dialog Component
│   │   ├── ProtectedWrapper.jsx    # Client-side Route Auth Protection HOC Guard
│   │   └── withProtectedAction.jsx # HOC Enforcing Auth/Credits on Action Buttons
│   ├── context/                    # Global State Management
│   │   └── AuthContext.jsx         # User Session, LocalStorage Tokens & Idle Logout
│   ├── lib/                      # Helper Utilities & Registry
│   │   ├── tool-guidance/        # Guidance Validators & Schema Registry
│   │   ├── fetchMeta.js          # Domain Metadata Fetching Utility
│   │   ├── tools.js              # Master Security Tool Registry & Cost Metadata
│   │   └── utils.js              # Class Name Merger Helper (`clsx` + `tailwind-merge`)
│   └── utils/                    # Core Analytical Engines
│       ├── codeAnalyzer.js       # Static AST Security Code Analysis Engine
│       └── pdfFramework.js       # Report PDF Generation Framework Wrapper
├── .env.example                  # Environment Variables Template
├── .gitignore                    # Git Exclusion Rules
├── components.json               # Shadcn UI Configuration
├── convert-es6.js                # CommonJS to ES6 Migration Script
├── diagnose.js                   # Module Import Diagnostic Helper Script
├── eslint.config.mjs             # ESLint Linter Rules Config
├── index.js                      # Root Analysis Execution Entrypoint
├── jest.config.js                # Jest Testing Framework Config
├── jsconfig.json                 # Path Alias Mapping (`@/*` -> `./src/*`)
├── log.txt                       # [WASTE] Temporary Build/Execution Log Output
├── next.config.mjs               # Next.js Framework & Asset Proxy Configuration
├── package.json                  # Dependencies & Script Definitions
├── package-lock.json             # Deterministic Dependency Lockfile
├── postcss.config.mjs            # PostCSS & Tailwind Compiler Config
├── README.md                     # Project Public Overview
└── DEVELOPER.md                  # Primary Developer Architecture Guide
```

---

## 📁 Part 1: Full Project File Tree & Component Audit

Below is the complete file directory tree of the repository. Each entry includes its functional purpose and usage status (`[ACTIVE]`, `[WASTE/REDUNDANT]`, `[STANDALONE/SCRIPT]`, `[BUILD ARTIFACT]`).

### 1️⃣ Root Configuration & Setup Files
- **`package.json`**: `[ACTIVE]` Core Node.js configuration file defining dependencies (Next.js 16, React 19, TailwindCSS, jsPDF, Lucide icons, JWT utilities) and npm scripts (`dev`, `build`, `start`, `lint`, `test`).
- **`package-lock.json`**: `[ACTIVE]` Lockfile ensuring deterministic dependency installations across environments.
- **`next.config.mjs`**: `[ACTIVE]` Next.js framework configuration (defines CORS headers, asset prefixes, redirects, SVG/Web Worker rules).
- **`postcss.config.mjs`**: `[ACTIVE]` PostCSS configuration enabling Tailwind CSS build processing.
- **`eslint.config.mjs`**: `[ACTIVE]` ESLint configuration enforcing code quality and linting standards.
- **`components.json`**: `[ACTIVE]` Configuration file for Shadcn UI component aliases and styling presets.
- **`jsconfig.json`**: `[ACTIVE]` JavaScript compiler options setting up alias root paths (`@/*` mapping to `./src/*`).
- **`jest.config.js`**: `[ACTIVE]` Unit test runner configuration for Jest and testing-library.
- **`.env.example`**: `[ACTIVE]` Template environment variables file (contains backend API URLs, timeout thresholds, API keys).
- **`.gitignore`**: `[ACTIVE]` Git ignore rules excluding `node_modules`, `.next`, environment secrets, logs, and coverage reports.
- **`README.md`**: `[ACTIVE]` Public-facing project introduction and basic installation guide.
- **`DEVELOPER.md`**: `[ACTIVE]` Primary developer reference, architecture catalog, file status audit, and integration blueprint.

### 2️⃣ Auxiliary Scripts & Waste Files (Root Level)
- **`index.js`**: `[STANDALONE/SCRIPT]` Node script that runs the AST analyzer script (`npm run analyze`).
- **`convert-es6.js`**: `[STANDALONE/SCRIPT]` Migration helper script used to bulk-convert legacy CommonJS require syntax to ES6 import/export modules.
- **`diagnose.js`**: `[STANDALONE/SCRIPT]` Development utility script to diagnose broken imports or module paths.
- **`log.txt`**: `[WASTE/BUILD ARTIFACT]` Log file generated during diagnostic or build execution. Safe to delete or ignore.

### 3️⃣ Core Next.js Application (`src/app/`)
- **`src/app/layout.jsx`**: `[ACTIVE]` Root layout wrapper containing global HTML structure, fonts, Toast notification provider, and `AuthProvider`.
- **`src/app/globals.css`**: `[ACTIVE]` Global CSS styles, Tailwind directives, dark mode tokens, and custom UI animations.
- **`src/app/page.jsx`**: `[ACTIVE]` Main platform landing page rendering Hero, Services overview, Tools grid, Certifications, and CTA sections.
- **`src/app/about/page.jsx`**: `[ACTIVE]` About Us page showcasing company details, branch locations, and specializations.
- **`src/app/connect/page.jsx`**: `[ACTIVE]` Contact and inquiry page for enterprise client outreach.
- **`src/app/credits/page.jsx`**: `[ACTIVE]` User scanning credits dashboard and usage quota manager.
- **`src/app/gain-access/page.jsx`**: `[ACTIVE]` Primary authentication portal (Login & Sign-up modal interface).
- **`src/app/login/page.jsx`**: `[ACTIVE]` Dedicated login entry route.
- **`src/app/subscription/page.jsx`**: `[ACTIVE]` Billing and subscription page (pricing tiers, upgrade handlers, invoice log table).
- **`src/app/join-the-network/page.jsx`**: `[ACTIVE]` Network partner/contributor onboard page.
- **`src/app/scanner.js`**: `[STANDALONE/SCRIPT]` Security scanning utility function referenced by specific tool wrappers.
- **`src/app/api/image-proxy/route.jsx`**: `[ACTIVE]` Next.js API route proxying external images to bypass CORS restrictions in PDF generation.

#### 📁 Services Routes (`src/app/services/`)
- **`src/app/services/page.jsx`**: `[ACTIVE]` Services hub listing security service packages.
- **`src/app/services/cloud-security/page.jsx`**: `[ACTIVE]` Cloud security assessment service landing page.
- **`src/app/services/cybersecurity-consultancy/page.jsx`**: `[ACTIVE]` Security consultancy advisory page.
- **`src/app/services/network-security/page.jsx`**: `[ACTIVE]` Network security auditing service page.
- **`src/app/services/penetration-testing/page.jsx`**: `[ACTIVE]` Pentesting (VAPT) service overview.
- **`src/app/services/security-operations-center/page.jsx`**: `[ACTIVE]` SOC monitoring & response service page.
- **`src/app/services/vulnerability-assessment/page.jsx`**: `[ACTIVE]` VA assessment service page.

#### 📁 Security Tools Routes (`src/app/tools/`)
- **`src/app/tools/page.jsx`**: `[ACTIVE]` Catalog matrix listing all security scanning tools categorized into Red, Blue, Green, Purple teams.
- **`src/app/tools/layout.jsx`**: `[ACTIVE]` Sub-layout wrapper for tool routes featuring guidance tooltips and navbar consistency.
- **`src/app/tools/[tool-name]/page.jsx`**: `[ACTIVE]` 50+ individual tool route pages:
  - **Red Team (Offensive Scanners)**: `apiForm`, `broken-link-dead-page-scanner`, `brokenAccessPage`, `brokenStreamForm`, `bruteForce`, `clickjackingTester`, `codeAnalysis`, `codeForm`, `csrfChecker`, `DbSecurityChecker`, `nexpose-scan`, `openRedirectTester`, `portScannerForm`, `secret-key-scanner`, `secretKeyScanner`, `sessionFixationChecker`, `ssrfScannerForm`, `subdomainEnumeration`, `vuln-scanner`, `waf_form`, `web-app-audit`, `webrecon`, `whoisLookup`, `wordpressForm`, `xssTester`, `zapForm`.
  - **Blue Team (Defensive & Inspection)**: `active-directory-scan`, `blue-team`, `config-audit`, `credential-path-audit`, `firewallDashboard`, `JWTSignatureValidator`, `mdr-monitor`, `network-port-activity-scanner`, `OAuthTokenInspector`, `obfuscationChecker`, `regexDetector`, `reverseDNSLookup`, `system-hardening`, `third-party-permission-scanner`.
  - **Green Team (Utilities & OSINT)**: `asnLookup`, `basic-network-scan`, `check-link`, `cyber-fraud-identifier`, `dependency-check`, `domain-to-ip`, `email-attachment-analyzer`, `fake-qr-code-detector`, `fake-software-detector`, `file-metadata-analyzer`, `fileScan`, `fingerPrint`, `folder-threat-scanner`, `green-team`, `httpsCheckerForm`, `ip-address-info-finder`, `ipGeo`, `keyword-checker`, `KeywordGenerator`, `meta-tag`, `osint`, `page-speed`, `password-checker`, `purple-team`, `red-team`, `report-generator`, `resultspage`, `securecrypt`, `sensitiveFileScanner`, `seo-score-analyzer-tool`, `sharepointForm`, `sitemapForm`, `social-media-privacy-analyzer`, `sonarForm`, `Source-Code`, `techDetect`, `url-shortener`, `website-optimization-tool`, `whatsapp-privacy-inspector`.
- **`src/app/tools/url-shortener/generateURLShortenerPDF.js`**: `[ACTIVE]` Tool-specific PDF generator helper.
- **`src/app/tools/active-directory-scan/generateActiveDirectoryScanPDF.js`**: `[ACTIVE]` Tool-specific PDF generator helper.

### 4️⃣ React Components (`src/components/`)
- **`src/components/ProtectedWrapper.jsx`**: `[ACTIVE]` Higher-order authentication guard protecting client-side pages and redirecting unauthenticated users.
- **`src/components/ProtectedWrapper.jsx 10-49-22-646.jsx`**: `[WASTE/DUPLICATE]` Backup copy of `ProtectedWrapper.jsx` created by editor/tool. Safe to delete.
- **`src/components/withProtectedAction.jsx`**: `[ACTIVE]` Higher-order component wrapping actionable scan buttons with auth check.
- **`src/components/UseProtectedAction/UseProtectedAction.jsx`**: `[ACTIVE]` Hook/Component enforcing credit or authentication requirements before tool execution.
- **`src/components/GainAcess.jsx`**: `[ACTIVE]` Modal dialog for login and user registration.
- **`src/components/JoinNetwork.jsx`**: `[ACTIVE]` Network request submission component.
- **`src/components/Home/`**: `[ACTIVE]` Landing page components (`Hero.jsx`, `Blogs.jsx`, `Services.jsx`, `ToolsCard.jsx`, `WhyUs.jsx`, `Certifications.jsx`).
- **`src/components/layout/`**: `[ACTIVE]` Core layout navigation bars (`navbar.jsx`) and footers (`footer.jsx`).
- **`src/components/marketing/`**: `[ACTIVE]` Promotional and hero graphics components (`BrandMark.jsx`, `OrbitRadar.jsx`, `SectionIntro.jsx`).
- **`src/components/Tool/`**: `[ACTIVE]` Tool dashboard layout templates (`Tool.jsx`, `BlueTool.jsx`, `RedTool.jsx`, `GreenTool.jsx`, `PurpleTool.jsx`, `PlatformOverview.jsx`, `catalog.js`).
- **`src/components/Tool/Layout.jsx.new`**: `[WASTE/DUPLICATE]` Staged draft/new version of Tool layout. Safe to remove after audit.
- **`src/components/GreenTeam/layout.jsx`**: `[WASTE/REDUNDANT]` Unused legacy component layout file for Green Team tools.
- **`src/components/tool-guidance/`**: `[ACTIVE]` Interactive tool guidance framework (`GuidanceTooltip.jsx`, `ToolHelpPanel.jsx`, `PreScanChecklist.jsx`, etc.).
- **Tool UI & PDF Generator Pairs (`src/components/[toolName]/`)**: `[ACTIVE]` Components rendering security scanner UI controls and exporting PDF reports (`generate*PDF.js`).

### 5️⃣ Context & State Management (`src/context/`)
- **`src/context/AuthContext.jsx`**: `[ACTIVE]` Central React Context managing user authentication token storage (`localStorage`), idle timeout auto-logout, token payload decoding, silent token refresh workers, and user profile state.

### 6️⃣ Utilities & Helper Libraries (`src/lib/` & `src/utils/`)
- **`src/lib/tools.js`**: `[ACTIVE]` Registry array of all security tools, metadata, categories, routes, and credit costs.
- **`src/lib/utils.js`**: `[ACTIVE]` Tailwind class merger helper (`clsx` + `tailwind-merge`).
- **`src/lib/fetchMeta.js`**: `[ACTIVE]` Metadata fetcher utility for external domain scanning.
- **`src/lib/tool-guidance/registry.js` & `validators.js`**: `[ACTIVE]` Schema registry and validation rules for input parameters across tools.
- **`src/utils/codeAnalyzer.js`**: `[ACTIVE]` Code analysis engine for AST scanning.
- **`src/utils/pdfFramework.js`**: `[ACTIVE]` Standardized engine for building executive PDF vulnerability reports.

### 7️⃣ Secondary Folders & Waste Repositories
- **`analyzer/jsScanner.js`**: `[STANDALONE/SCRIPT]` Custom AST static analysis scanner script.
- **`rules/`**: `[ACTIVE]` Custom static code security rules (`no-document-write.js`, `no-eval.js`, `no-innerHTML.js`, `no-sql-injection.js`). Used by `analyzer/jsScanner.js`.
- **`samples/sample.js`**: `[STANDALONE/SCRIPT]` Sample JavaScript file used to test AST security scanner rules.
- **`frontend-design/`**: `[WASTE/REDUNDANT]` Complete legacy Vite + React project codebase duplicated in repository root. Contains redundant `vite.config.js`, duplicate `Home`, `Services`, and `Tool` components. It is not loaded or executed by the Next.js runtime. Can be archived or removed.
- **`security-platform/`**: `[WASTE/EMPTY]` Empty nested directory in root. Safe to remove.
- **`public/`**: `[ACTIVE]` Public static asset directory (images, videos, certification icons, logos, `coverage/` test reports).

---
<!-- prettier-ignore-end -->
