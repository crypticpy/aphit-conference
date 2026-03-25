import type { TileStory } from "../types";

export const aiStory: TileStory = {
  id: "ai",
  title: "AI & Analytics",
  tagline: "Governing ethical AI adoption across APH",
  icon: "Sparkles",
  accentColor: "--aph-purple",
  heroStat: "17",
  heroStatLabel: "AI pilot projects evaluated",
  sections: [
    {
      title: "AI Strategy & Governance",
      body: "The AI Strategy Group sets the guardrails for how APH adopts AI — with clear principles around fairness, transparency, privacy, and safety baked in from the start. Internal copilots like DoJo and Project Helper already help staff draft documents, summarize meetings, analyze data, and manage projects, with more agentic apps in the pipeline. It's responsible AI adoption at scale, not just experimentation.",
      stat: "7",
      statLabel: "Pilots ready to scale",
    },
    {
      title: "The Pilot Portfolio",
      body: "We've evaluated 17 strategic pilots for real-world impact and scalability, and 7 are already ready to scale — including Foresight for AI-powered early warnings, GrantScope 2 for federal grant discovery, PurchasePro for streamlining purchase requests, Austin RTASS for radio transcription, Third Spaces Gallery for community engagement, COA AI Template as a city-wide AI starter kit, and DIVE for data literacy with over 100 training videos. Another 6 pilots are approaching production readiness, among them Meeting Transcriber, PolicyPulse, and AI Project Advisor.",
      stat: "6",
      statLabel: "Pilots approaching production",
    },
  ],
};
