import ToolLayout from "./Layout";
export default function GreenTool() {
    const toolList = [// Non-Tech
        {
            name: "Broken link Checker",
            image: "/tools/card-images/brokenlink1.png",
            description: "Scans web pages for dead or broken links, helping maintain SEO integrity",
            slug: "brokenStreamForm",
            buttonLabel: "Scan for Vulnerabilities",
            type: "non-tech"
        },
        {
            name: "Sitemap Generator",
            image: "/tools/card-images/sitemap1.png",
            description: "Creates an XML sitemap to help search engines index a website efficiently",
            slug: "sitemapForm",
            buttonLabel: "Generate Sitemap",
            type: "non-tech"
        },
        {
            name: "Meta Tag Analyzer",
            image: "/tools/card-images/meta_tag.png",
            description: "Analyze meta tags like title, description, and keywords.",
            slug: "meta-tag",
            buttonLabel: "Analyze Meta Tags",
            type: "non-tech"
        },
        {
            name: "Keyword Density Checker",
            image: "/tools/card-images/keyword_checker.png",
            description: "Analyze keyword frequency for SEO structuring on website.",
            slug: "keyword-checker",
            buttonLabel: "Check Keyword Density",
            type: "non-tech"
        },
        {
            name: "Link Detector",
            image: "/tools/card-images/link_dec.png",
            description: "This tool helps detect malicious, suspicious, or unsafe links.",
            slug: "check-link",
            buttonLabel: "Check Link",
            type: "non-tech"
        },
        {
            name: "SecureCrypt",
            image: "/tools/card-images/dycrypt.png",
            description: "Encrypts and decrypts text using secure algorithms.",
            slug: "securecrypt",
            buttonLabel: "Encrypt Now",
            type: "non-tech"
        },
        {
            name: "File Scanner",
            image: "/tools/card-images/folder-scan.png",
            description: "Scans files for malware or suspicious files.",
            slug: "folder-threat-scanner",
            buttonLabel: "Scan File",
            type: "non-tech"
        },
        {
            name: "WhatsApp Privacy Inspector",
            image: "/tools/card-images/wp.png",
            description: "Checks WhatsApp settings for potential privacy risks.",
            slug: "whatsapp-privacy-inspector",
            buttonLabel: "Inspect Now",
            type: "non-tech"
        },
        {
            name: "Email Attachment Analyzer",
            image: "/tools/card-images/email.png",
            description: "Scans email attachments for malware or hidden threats.",
            slug: "email-attachment-analyzer",
            buttonLabel: "Analyze File",
            type: "non-tech"
        },
        {
            name: "IP Address Info Finder",
            image: "/tools/card-images/ip.png",
            description: "Fetches location and network details of an IP address.",
            slug: "ip-address-info-finder",
            buttonLabel: "Find Info",
            type: "non-tech"
        },
        {
            name: "QR Tool",
            image: "/tools/card-images/QR.png",
            description: "Unsafe QR & QR Generater.",
            slug: "fake-qr-code-detector",
            buttonLabel: "Scan QR",
            type: "non-tech"
        },
        {
            name: "Website Optimization Tool",
            image: "/tools/card-images/optimization.png",
            description: "Detects deployment issues like unused code, large assets, and slow-loading elements.",
            slug: "website-optimization-tool",
            buttonLabel: "Check Optimization",
            type: "non-tech"
        },
        {
            name: "SEO Score Analyzer Tool",
            image: "/tools/card-images/seo-score.png",
            description: "Analyzes website SEO and provides improvement tips.",
            slug: "seo-score-analyzer-tool",
            buttonLabel: "Analyze SEO",
            type: "non-tech"
        },
        {
            name: "Keyword Generator",
            image: "/tools/card-images/keyword-generate.png",
            description: "Extract SEO-Friendly Keyword Suggestions.",
            slug: "KeywordGenerator",
            buttonLabel: "Generate Keyword",
            type: "non-tech"
        },
        {
            name: "Data Breach",
            image: "/tools/card-images/DataBreach1.png",
            description: "Find Where Your Email , Phone No. Or Username is Exposed",
            slug: "osint",
            buttonLabel: "Check Info",
            type: "non-tech"
        },
        {
            name: "URL Shortener",
            image: "/tools/card-images/shorted-url.png",
            description: "Make Links Short and Simple.",
            slug: "url-shortener",
            buttonLabel: "Shorten URL",
            type: "non-tech"
        },
        {
            name: "PDF",
            image: "PDF.png",
            description: "Create Your PDF.",
            slug: "PDF",
            buttonLabel: "Create PDF",
            type: "non-tech"
        },
        {
            name: "Chrome Extention",
            image: "chrome.png",
            description: "Description Chrome Extention ....",
            slug: "Chrome-Extention",
            buttonLabel: "Use Chrome Extention",
            type: "non-tech"
        },
        {
            name: "Password Strength Checker",
            image: "password-checker.png",
            description: "Description Passsword Strenght Checker....",
            slug: "Passsword-Checker",
            buttonLabel: "Check Your Password",
            type: "non-tech"
        }
    ]
    return (<ToolLayout team="green" toolList={toolList}></ToolLayout>)
}