import ServicesLayout from "./Layout";

export default function SOCPage() {
  const heroData = {
    title: "Cloud Security",
    desc: "Cloud Security involves the protection of data, workloads, and applications hosted on cloud platforms such as AWS, Azure, and Google Cloud. It ensures that cloud environments are configured securely, access is properly controlled, and data remains protected from unauthorized access or breaches. Cloud security covers governance, compliance, identity management, and defence against both external and insider threats.",
    videoPath: "/Services/CS.mp4",
  };

  const methodologyData = [
    {
      title: "Cloud Architecture & IAM Review",
      desc: "Evaluate identity and access management (IAM), roles, policies, and cloud configurations.",
      imagePath: "/Services/Cloud1.png",
    },
    {
      title: "Security Benchmarking",
      desc: "Assess environments against frameworks (CIS Benchmarks, NIST, ISO, CSA).",
      imagePath: "/Services/Cloud2.png",
    },
    {
      title: "Threat Modeling",
      desc: "Identify cloud-specific risks (misconfigured storage, insecure APIs, excessive permissions).",
      imagePath: "/Services/Cloud3.png",
    },
    {
      title: "Vulnerability & Compliance Assessment",
      desc: "Scan for security misconfigurations, exposed services, and compliance gaps (GDPR, HIPAA,  SOC 2, PCI DSS).",
      imagePath: "/Services/Cloud4.png",
    },
    {
      title: "Continuous Monitoring & Automation",
      desc: "Deploy CSPM (Cloud Security Posture Management), CWPP (Cloud Workload Protection), and SIEM solutions.",
      imagePath: "/Services/Cloud5.png",
    },
    {
      title: "Remediation Guidance",
      desc: "Provide clear steps to fix misconfigurations, enforce least privilege, encrypt workloads, and enable logging.",
      imagePath: "/Services/Cloud6.png",
    },
  ];

  const keyaspectsData = {
    title: "Cloud Security Process",
    desc: "Our key aspects :-",
    image: "/Services/CS1.png",
  };

  return (
    <div className="w-full">
      {/* ✅ Hero Section Responsive */}
      <section className="flex flex-col md:flex-row items-center gap-6 px-4 md:px-12 py-12">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold">{heroData.title}</h1>
          <p className="mt-4 text-base md:text-lg text-gray-700">{heroData.desc}</p>
        </div>
        <video
          src={heroData.videoPath}
          className="w-full md:w-1/2 rounded-lg shadow-lg"
          autoPlay
          loop
          muted
        />
      </section>

      {/* ✅ Methodology Section Responsive */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-12 py-12">
        {methodologyData.map((item, index) => (
          <div
            key={index}
            className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition"
          >
            <img
              src={item.imagePath}
              alt={item.title}
              className="w-full h-40 object-contain mb-4"
            />
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ✅ Key Aspects Responsive */}
      <section className="flex flex-col md:flex-row items-center gap-6 px-4 md:px-12 py-12">
        <img
          src={keyaspectsData.image}
          alt={keyaspectsData.title}
          className="w-full md:w-1/2 rounded-lg shadow-md"
        />
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-bold">{keyaspectsData.title}</h2>
          <p className="mt-4 text-base md:text-lg text-gray-700">{keyaspectsData.desc}</p>
        </div>
      </section>
    </div>
  );
}
