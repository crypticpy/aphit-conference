export interface StorySection {
  title: string;
  body: string;
  stat?: string;
  statLabel?: string;
}

export interface TileStory {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  accentColor: string;
  heroStat: string;
  heroStatLabel: string;
  sections: StorySection[];
}

export const stories: TileStory[] = [
  {
    id: 'ai',
    title: 'AI & Analytics',
    tagline: "Building Austin's first public health AI strategy",
    icon: 'Sparkles',
    accentColor: '--aph-purple',
    heroStat: '6',
    heroStatLabel: 'AI-powered tools in development',
    sections: [
      {
        title: 'A Strategy for Responsible AI',
        body: "Austin Public Health established a dedicated AI Strategy Group to guide the ethical adoption of artificial intelligence across public health operations. This cross-functional team evaluates emerging technologies, assesses risks, and ensures every AI initiative aligns with equity and community trust. The result is a governance framework that positions APH as a national model for responsible AI in local government.",
      },
      {
        title: 'Agentic Applications',
        body: "The HIT team developed custom AI-powered tools that actively assist staff in their daily work. DoJo helps teams navigate complex policy documents and surface relevant guidance in seconds. Project Helper streamlines project management by generating status updates, identifying risks, and recommending next steps\u2014freeing staff to focus on the work that matters most.",
        stat: '2',
        statLabel: 'Agentic apps deployed',
      },
      {
        title: 'The Digital Twin Platform',
        body: "The \u201CTwin\u201D suite represents a new paradigm in public health technology. TwinCare models patient pathways, TwinCast forecasts disease trends, TwinSight provides real-time operational intelligence, and TwinStart accelerates onboarding for new programs. Together they create a digital mirror of APH operations that enables faster, data-driven decisions.",
        stat: '4',
        statLabel: 'Digital twin tools',
      },
      {
        title: 'Predictive Analytics & GrantScope',
        body: "GrantScope V2 uses machine learning to match APH programs with funding opportunities, analyzing thousands of grants to surface the most relevant matches. Beyond grants, the analytics team builds predictive models that anticipate disease outbreaks, identify at-risk populations, and optimize resource allocation across the department.",
      },
    ],
  },
  {
    id: 'gis',
    title: 'GIS & Geospatial',
    tagline: 'Mapping health equity across every neighborhood',
    icon: 'Globe',
    accentColor: '--aph-green',
    heroStat: '200+',
    heroStatLabel: 'Census tracts mapped',
    sections: [
      {
        title: 'Heat Vulnerability Index',
        body: "When temperatures soar, not every Austin neighborhood faces the same risk. The HIT team built an interactive Heat Vulnerability Index that overlays temperature data with social determinants\u2014income, age, housing quality, and access to transportation. This map doesn\u2019t just show where it\u2019s hot; it shows where people are most likely to suffer, guiding outreach teams to the doorsteps that need help first.",
        stat: '200+',
        statLabel: 'Census tracts analyzed',
      },
      {
        title: 'Cooling Centers & Real-Time Response',
        body: "The Cooling Centers Map gives residents and caseworkers a live view of available relief locations during extreme heat events. Integrated with real-time capacity data and transit routes, it helps residents like James\u2014an elderly Austinite without reliable transportation\u2014find the nearest safe haven. This tool transforms raw data into life-saving action.",
      },
      {
        title: 'Disease Mapping & Surveillance',
        body: "From MPOX outbreak tracking to the Vector Hub monitoring mosquito-borne illness, GIS capabilities give epidemiologists a spatial lens on disease. Youth Risk Zone mapping identifies neighborhoods where adolescents face compounding health risks, enabling targeted prevention programs before crises emerge.",
        stat: '5+',
        statLabel: 'Active surveillance maps',
      },
      {
        title: 'Harm Reduction StoryMap',
        body: "The Opioid Harm Reduction StoryMap combines narrative, data, and geography into an immersive experience that communicates the scope of the opioid crisis in Austin. It guides policymakers and community members through the data behind naloxone distribution, overdose hotspots, and treatment access gaps\u2014turning complex epidemiological data into a compelling call to action.",
      },
    ],
  },
  {
    id: 'dashboards',
    title: 'Dashboards & Data',
    tagline: 'Turning raw data into public health decisions',
    icon: 'BarChart3',
    accentColor: '--aph-sky-blue',
    heroStat: '30+',
    heroStatLabel: 'Dashboards in production',
    sections: [
      {
        title: 'The Opioid Intelligence Hub',
        body: "The Opioid Hub aggregates data from EMS, hospital systems, community organizations, and law enforcement into a single PowerBI dashboard. Decision-makers can track overdose trends in real time, monitor naloxone distribution, and evaluate the effectiveness of harm reduction programs. It replaced a fragmented patchwork of spreadsheets with a unified source of truth.",
        stat: '4',
        statLabel: 'Data sources integrated',
      },
      {
        title: 'Health Equity Scorecard',
        body: "Equity isn\u2019t an abstract goal\u2014it\u2019s measurable. The Health Equity Scorecard tracks disparities across APH programs by race, income, geography, and language. Program managers use it to identify gaps, reallocate resources, and report progress to city leadership. Every decision has a data point behind it.",
      },
      {
        title: 'Environmental Health Data Warehouse',
        body: "The EHS Data Warehouse consolidates inspection records, complaint data, and environmental monitoring into a queryable system that powers dashboards for food safety, pool inspections, and pollution tracking. Inspectors working with restaurant owners like Carlos can access historical data instantly, transforming months-long investigations into targeted interventions.",
        stat: '10K+',
        statLabel: 'Records consolidated',
      },
      {
        title: 'Data Pipeline Architecture',
        body: "Behind every dashboard is a robust data pipeline. The HIT team built automated ETL processes that cleanse, transform, and load data from dozens of source systems nightly. Data quality checks flag anomalies before they reach decision-makers, ensuring that the numbers behind every policy choice are reliable.",
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Devices & Infrastructure',
    tagline: 'The digital backbone of public health operations',
    icon: 'Server',
    accentColor: '--aph-teal',
    heroStat: '80+',
    heroStatLabel: 'Applications managed',
    sections: [
      {
        title: 'Scale of Operations',
        body: "Health IT supports over 1,200 users across more than 80 specialized applications\u2014from electronic health records to environmental inspection systems, from WIC management to disease surveillance platforms. Each application has unique security, compliance, and integration requirements that generic enterprise IT cannot address.",
        stat: '1,200+',
        statLabel: 'Users supported daily',
      },
      {
        title: 'HIT Operations Center',
        body: "The HIT Operations Center serves as the nerve center for monitoring system health, tracking incidents, and coordinating responses. Real-time dashboards display application uptime, ticket queues, and performance metrics. When a system goes down, the team doesn\u2019t wait for a help desk call\u2014they\u2019re already mobilizing.",
      },
      {
        title: 'Device Readiness & Standardization',
        body: "From clinic laptops to field tablets used by inspectors and outreach workers, every device must be configured for HIPAA compliance, VPN access, and application-specific requirements. The Standardized Device Readiness program ensures that when a new employee starts or a device is replaced, they\u2019re productive within hours, not days.",
        stat: '500+',
        statLabel: 'Managed endpoints',
      },
      {
        title: 'Continuity & Disaster Recovery',
        body: "COOP/DR Run Books document step-by-step recovery procedures for every critical system. During past emergency events, these plans meant APH services recovered faster than peer agencies. The infrastructure team conducts regular tabletop exercises and failover tests so that resilience isn\u2019t theoretical\u2014it\u2019s proven.",
      },
    ],
  },
  {
    id: 'security',
    title: 'Cybersecurity & Privacy',
    tagline: 'Protecting half a million health records',
    icon: 'ShieldCheck',
    accentColor: '--aph-coral',
    heroStat: '500K+',
    heroStatLabel: 'Health records protected',
    sections: [
      {
        title: 'City-Wide HIPAA Leadership',
        body: "APH Health IT authored the City of Austin\u2019s HIPAA policies\u2014not just for the health department, but for every city department that handles protected health information. This framework governs how data is stored, transmitted, and accessed, setting a compliance standard that protects residents across the entire municipal government.",
      },
      {
        title: 'Security Awareness Campaign',
        body: "Technology alone doesn\u2019t prevent breaches\u2014people do. The HIPAA Security Awareness Campaign trains every APH employee on phishing recognition, data handling procedures, and incident reporting. Regular simulated phishing exercises keep vigilance high, and completion rates consistently exceed city-wide averages.",
        stat: '100%',
        statLabel: 'Staff training target',
      },
      {
        title: 'Governance, Risk & Compliance',
        body: "The GRC platform in ServiceNow centralizes risk assessments, audit findings, and compliance tracking into a single system. Every new application undergoes a security review before deployment. Every vendor signs a Business Associate Agreement. Every access request is logged, reviewed, and justified.",
        stat: '0',
        statLabel: 'Major breaches',
      },
      {
        title: 'The Stakes of Health Data',
        body: "Public health data is uniquely sensitive\u2014HIV status, substance use history, mental health records, immigration-adjacent information. A breach doesn\u2019t just violate privacy; it can endanger lives and destroy the community trust that public health depends on. This is why embedded, specialized security expertise matters.",
      },
    ],
  },
  {
    id: 'services',
    title: 'Digital Services',
    tagline: 'Meeting residents where they are',
    icon: 'Users',
    accentColor: '--aph-gold',
    heroStat: '15+',
    heroStatLabel: 'Languages supported',
    sections: [
      {
        title: 'WIC Virtual Visits',
        body: "For Maria, a WIC participant juggling two bus transfers and a toddler, an in-person appointment meant a full day lost. Virtual visits changed that equation entirely. The HIT team built a HIPAA-compliant telehealth system that lets nutritionists conduct certifications, counseling sessions, and benefit issuance remotely\u2014maintaining the human connection while eliminating the access barrier.",
        stat: '40%',
        statLabel: 'Reduction in no-shows',
      },
      {
        title: 'Public Health Contact Center',
        body: "The Customer Contact Center pilot consolidated fragmented phone trees and email inboxes into a unified, intelligent routing system. Residents calling about immunizations, food safety complaints, or vital records reach the right specialist faster. The system tracks every interaction, enabling APH to identify service gaps and improve response quality over time.",
      },
      {
        title: 'Language Access Tools',
        body: "Austin\u2019s diversity is its strength, but it also means health services must work in many languages. The Language Access Team built PowerApps-based tools that streamline translation requests, track interpreter availability, and ensure every resident-facing document meets accessibility standards. No one should face a health barrier because of the language they speak.",
        stat: '15+',
        statLabel: 'Languages served',
      },
      {
        title: 'Website & Service Redesign',
        body: "The Health IT Website Refresh went beyond a visual update. The team restructured information architecture around resident needs rather than departmental org charts, implemented plain-language standards, and ensured WCAG 2.1 AA compliance. Combined with eCW workflow improvements for clinical staff, the result is a service experience that respects both the resident\u2019s time and the provider\u2019s expertise.",
      },
    ],
  },
];

export const attractFacts: string[] = [
  'Supporting 1,200+ users across 80+ applications',
  'Mapping heat vulnerability across 200+ census tracts',
  'Protecting 500,000+ health records with HIPAA compliance',
  'Powering data-driven decisions with 30+ dashboards',
  "Building Austin's first public health AI strategy",
  'Connecting communities through 15+ language access tools',
  'Zero major data breaches across all systems',
  'Monitoring real-time disease surveillance city-wide',
  'Enabling virtual visits for WIC families across Austin',
  'Consolidating 10,000+ environmental health inspection records',
  'Training 100% of staff on cybersecurity awareness',
  'Developing 6 AI-powered tools for public health',
  'Authoring city-wide HIPAA policies for all departments',
  'Tracking health equity across every APH program',
];
