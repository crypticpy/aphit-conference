import type { TileStory } from "../types";

export const dashboardsStory: TileStory = {
  id: "dashboards",
  title: "Dashboards & Data",
  tagline: "Consolidating health data into governed, shared views",
  icon: "BarChart3",
  accentColor: "--aph-sky-blue",
  heroStat: "7",
  heroStatLabel: "Data modernization pillars",
  sections: [
    {
      title: "Opioid Intelligence & Equity",
      body: "The Opioid Hub pulls together EMS, emergency department, and program data into unified PowerBI dashboards — giving decision-makers a single place to understand the crisis. The Health Equity Scorecard goes even further, combining indicators across exposure, access, and outcomes, all stratified by race, ethnicity, geography, and language. No more fragmented spreadsheets passed around by email; this is shared, governed data that everyone trusts.",
      stat: "3",
      statLabel: "Data sources integrated",
    },
    {
      title: "Environmental Health & Reporting",
      body: "The EHS Data Warehouse consolidates inspection, compliance, and environmental health data into a structured store — turning scattered records into something teams can actually query and act on. Language Access Team reporting now tracks translation, interpretation, and communication needs across programs in one place. And Mission Essential Functions dashboards give leadership a live view of critical service performance and operational health.",
      stat: "7",
      statLabel: "DMI focus areas",
    },
  ],
};
