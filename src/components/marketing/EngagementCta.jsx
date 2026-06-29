"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import SectionIntro from "./SectionIntro";

export default function EngagementCta({
  title = "Ready to harden your security perimeter?",
  description = "Talk to a senior consultant. Scoping in one business day, NDA on request.",
  primaryHref = "/connect",
  primaryLabel = "Request Assessment",
  secondaryHref = "/connect",
  secondaryLabel = "Talk To A Consultant",
}) {
  const handleScroll = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="border-t border-white/6 bg-[#050505]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_auto] lg:items-center lg:px-8">
        <SectionIntro
          eyebrow="// Engagement"
          title={title}
          description={description}
          accentWords={["security", "perimeter"]}
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href={primaryHref}
            onClick={(e) => handleScroll(e, primaryHref)}
            className="gold-button"
          >
            <span>{primaryLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={secondaryHref}
            onClick={(e) => handleScroll(e, secondaryHref)}
            className="ghost-button"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
