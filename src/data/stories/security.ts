import type { TileStory } from "../types";

export const securityStory: TileStory = {
  id: "security",
  title: "Cybersecurity & Privacy",
  tagline: "HIPAA governance and risk management across APH",
  icon: "ShieldCheck",
  accentColor: "--aph-coral",
  heroStat: "14",
  heroStatLabel: "Certified HIPAA professionals",
  sections: [
    {
      title: "Security Awareness & HIPAA",
      body: "City-wide HIPAA policies establish a common standard for how protected health information is collected, stored, shared, and accessed across every department — no ambiguity, no guesswork. Every APH employee goes through real-world scenario-based training on phishing recognition, data handling, and incident reporting, because the best security infrastructure in the world doesn't help if people don't know how to use it.",
    },
    {
      title: "Governance, Risk & Compliance",
      body: "Our GRC platform in ServiceNow centralizes risk assessments, audits, incidents, and compliance tracking into a single system of record. Every new application, vendor agreement, and access request goes through a structured review — nothing slips through the cracks. This matters especially because APH handles some of the most sensitive data imaginable: HIV status, substance use, immigration-related risk, domestic violence records, and mental health information.",
    },
  ],
};
