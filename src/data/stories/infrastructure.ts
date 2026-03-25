import type { TileStory } from "../types";

export const infrastructureStory: TileStory = {
  id: "infrastructure",
  title: "Devices & Infrastructure",
  tagline: "Central operations supporting clinical and field systems",
  icon: "Server",
  accentColor: "--aph-teal",
  heroStat: "600+",
  heroStatLabel: "Employees supported daily",
  sections: [
    {
      title: "Operations Center",
      body: "The HIT Operations Center serves as our central nerve center — monitoring system health, performance, and incidents across the department in real time. It supports critical clinical systems including eClinicalWorks, WIC, environmental health inspections, vital records, and community service platforms. The goal is straightforward: detect issues and coordinate a technical response before users even notice something's wrong.",
      stat: "600+",
      statLabel: "Staff depend on HIT daily",
    },
    {
      title: "Device Readiness & Continuity",
      body: "Standardized device provisioning means every laptop, tablet, and workstation follows a consistent pattern for configuration, deployment, and maintenance — dramatically reducing the time from new hire or new site to working tools. COOP and Disaster Recovery run books lay out clear procedures for maintaining or restoring critical systems when disruptions hit. The result: frontline teams always have secure, ready-to-go devices, even during emergencies.",
    },
  ],
};
