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
  heroStat?: string;
  heroStatLabel?: string;
  sections: StorySection[];
}

export interface AttractStat {
  value: string;
  label: string;
}
