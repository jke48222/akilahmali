import type { SchemaTypeDefinition } from "sanity";

import { lookbook } from "./lookbook";
import { page } from "./page";
import { press } from "./press";
import { release } from "./release";
import { settings } from "./settings";
import { show } from "./show";
import { track } from "./track";
import { video } from "./video";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons first.
  settings,
  lookbook,
  // Music
  release,
  track,
  video,
  // Live + editorial
  show,
  press,
  // Editable static-route copy
  page,
];

export { lookbook, page, press, release, settings, show, track, video };
