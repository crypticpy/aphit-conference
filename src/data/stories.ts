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
        title: 'Agentic Applications',
        body: "• Established an AI Strategy Group governing ethical adoption across all APH operations\n• Deployed DoJo for policy navigation and Project Helper for automated project management\n• Built a governance framework positioning APH as a national model for responsible AI",
        stat: '2',
        statLabel: 'Agentic apps deployed',
      },
      {
        title: 'The Digital Twin Platform',
        body: "• Four Twin tools model patient pathways, forecast disease, and deliver real-time operational intelligence\n• GrantScope V2 uses machine learning to match programs with thousands of funding opportunities\n• Predictive models anticipate outbreaks, identify at-risk populations, and optimize resource allocation",
        stat: '4',
        statLabel: 'Digital twin tools',
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
        body: "• Overlays temperature data with social determinants like income, age, and housing quality\n• Live Cooling Centers Map shows available relief locations with capacity and transit routes\n• Guides outreach teams directly to neighborhoods where residents face the greatest heat risk",
        stat: '200+',
        statLabel: 'Census tracts analyzed',
      },
      {
        title: 'Disease Mapping & Surveillance',
        body: "• Tracks MPOX outbreaks and mosquito-borne illness through the Vector Hub spatial platform\n• Youth Risk Zone mapping targets prevention programs to high-risk adolescent neighborhoods\n• Opioid Harm Reduction StoryMap visualizes naloxone distribution, overdose hotspots, and treatment gaps",
        stat: '5+',
        statLabel: 'Active surveillance maps',
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
        body: "• Aggregates EMS, hospital, community, and law enforcement data into one PowerBI dashboard\n• Health Equity Scorecard tracks disparities by race, income, geography, and language\n• Replaced fragmented spreadsheets with a unified source of truth for real-time decisions",
        stat: '4',
        statLabel: 'Data sources integrated',
      },
      {
        title: 'Environmental Health Data Warehouse',
        body: "• Consolidates inspection records, complaints, and environmental monitoring into one queryable system\n• Automated ETL pipelines cleanse and load data from dozens of source systems nightly\n• Data quality checks flag anomalies before they reach decision-makers",
        stat: '10K+',
        statLabel: 'Records consolidated',
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
        body: "• Supports 1,200+ users across 80+ specialized apps including EHR, WIC, and surveillance\n• Operations Center monitors system health with real-time uptime and performance dashboards\n• Proactive incident response mobilizes before help desk calls arrive",
        stat: '1,200+',
        statLabel: 'Users supported daily',
      },
      {
        title: 'Device Readiness & Standardization',
        body: "• Every device configured for HIPAA compliance, VPN access, and app-specific requirements\n• New employees are productive within hours through standardized device provisioning\n• COOP/DR Run Books ensure faster recovery than peer agencies during emergencies",
        stat: '500+',
        statLabel: 'Managed endpoints',
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
        title: 'Security Awareness Campaign',
        body: "• Authored the City of Austin's HIPAA policies for every department handling health data\n• Trains all APH employees on phishing recognition, data handling, and incident reporting\n• Regular simulated phishing exercises keep completion rates above city-wide averages",
        stat: '100%',
        statLabel: 'Staff training target',
      },
      {
        title: 'Governance, Risk & Compliance',
        body: "• GRC platform centralizes risk assessments, audits, and compliance tracking in ServiceNow\n• Every new application, vendor agreement, and access request is reviewed before approval\n• Protects uniquely sensitive data including HIV status, substance use, and mental health records",
        stat: '0',
        statLabel: 'Major breaches',
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
        body: "• Built HIPAA-compliant telehealth for WIC certifications, counseling, and benefit issuance\n• Contact Center pilot unified fragmented phone trees into intelligent specialist routing\n• Tracks every resident interaction to identify service gaps and improve response quality",
        stat: '40%',
        statLabel: 'Reduction in no-shows',
      },
      {
        title: 'Language Access Tools',
        body: "• PowerApps tools streamline translation requests and track interpreter availability across 15+ languages\n• Website redesign restructured around resident needs with plain-language and WCAG 2.1 AA compliance\n• eCW workflow improvements reduced clinical staff burden while improving the service experience",
        stat: '15+',
        statLabel: 'Languages served',
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
