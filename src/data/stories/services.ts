import type { TileStory } from "../types";

export const servicesStory: TileStory = {
  id: "services",
  title: "Digital Services",
  tagline: "Reducing barriers to health services for residents",
  icon: "Users",
  accentColor: "--aph-gold",
  heroStat: "14",
  heroStatLabel: "Languages supported",
  sections: [
    {
      title: "WIC Virtual Visits & Contact Center",
      body: "WIC virtual visits let families receive nutrition counseling and benefit support without having to come in person every single time — removing real barriers like transportation and childcare that kept people from getting help. The Public Health Customer Contact Center pilot takes it a step further, creating a single human-centered entry point so residents never have to guess which number to call or figure out which program owns their problem.",
    },
    {
      title: "Language Access & Web Refresh",
      body: "The Language Access Team built PowerApps tools that streamline translation requests and track interpreter services across 14 languages — making multilingual support a system, not an afterthought. A full website refresh reorganized and rewrote content so people can actually find services using plain language instead of government jargon. And eCW workflow improvements reduce the burden on clinical staff while making the whole service experience smoother for everyone involved.",
      stat: "14",
      statLabel: "Languages served",
    },
  ],
};
