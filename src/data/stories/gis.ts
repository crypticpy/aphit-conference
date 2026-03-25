import type { TileStory } from "../types";

export const gisStory: TileStory = {
  id: "gis",
  title: "GIS & Geospatial",
  tagline: "Mapping health equity and preparedness across Austin",
  icon: "Globe",
  accentColor: "--aph-green",
  heroStat: "6",
  heroStatLabel: "GIS applications deployed",
  sections: [
    {
      title: "Mapping Health & Equity",
      body: "Our Your Health Our Work StoryMap makes geographic care gaps visible — showing the real impact of federal funding cuts on refugee clinic service areas and STI/STD visit patterns. Evolving Health IT maps every APH facility layered with CapMetro transit stops and 2020 Census demographics, so you can see who has access and who doesn't at a glance. And CASPER community resilience surveys replaced old paper-based methods with real-time mobile data collection across Austin's Eastern Crescent.",
      stat: "5+",
      statLabel: "Esri platform tools in production",
    },
    {
      title: "Disease Surveillance & Preparedness",
      body: "When West Nile Virus threatened Austin, CHW Strike Teams used GIS spatial targeting to focus outreach where it mattered most, surveying 52 community members in both English and Spanish. Harm Reduction Network Mapping evaluates naloxone distribution and access gaps — work that contributed to a 22.22% decrease in opioid overdose deaths by 2024. Meanwhile, Mapping Care Deserts identifies health service deserts and optimizes Point of Dispensing placement for Medical Countermeasures across all-hazard scenarios. Two of these projects were selected for Esri UC 2026.",
      stat: "2",
      statLabel: "Projects selected for Esri UC 2026",
    },
  ],
};
