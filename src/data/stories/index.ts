import { aiStory } from "./ai";
import { gisStory } from "./gis";
import { dashboardsStory } from "./dashboards";
import { infrastructureStory } from "./infrastructure";
import { securityStory } from "./security";
import { servicesStory } from "./services";
import type { TileStory } from "../types";

export const stories: TileStory[] = [
  aiStory,
  gisStory,
  dashboardsStory,
  infrastructureStory,
  securityStory,
  servicesStory,
];
