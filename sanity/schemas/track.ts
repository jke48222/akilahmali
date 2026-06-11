import { defineField, defineType } from "sanity";

export const track = defineType({
  name: "track",
  title: "Track",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "trackNumber",
      title: "Track number",
      type: "number",
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "duration",
      title: "Duration (mm:ss)",
      type: "string",
      description: "e.g. 3:42",
      validation: (r) =>
        r
          .required()
          .regex(/^\d{1,2}:\d{2}$/, {
            name: "mm:ss",
            invert: false,
          })
          .error("Use mm:ss — e.g. 3:42"),
    }),
    defineField({
      name: "isrc",
      title: "ISRC",
      type: "string",
      description:
        "International Standard Recording Code from the distributor, e.g. USABC2500001. Feeds the MusicRecording structured data.",
      validation: (r) =>
        r
          .regex(/^[A-Z]{2}-?[A-Z0-9]{3}-?\d{2}-?\d{5}$/i, { name: "ISRC" })
          .warning("Expected format: CC-XXX-YY-NNNNN (dashes optional)"),
    }),
    defineField({
      name: "lyrics",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "credits",
      type: "array",
      of: [{ type: "block" }],
      description: "Writers, producers, mix/master engineers.",
    }),
  ],
  preview: {
    select: { title: "title", trackNumber: "trackNumber", duration: "duration" },
    prepare: ({ title, trackNumber, duration }) => ({
      title: `${String(trackNumber ?? "?").padStart(2, "0")} · ${title ?? "Untitled"}`,
      subtitle: duration ?? "",
    }),
  },
  orderings: [
    {
      title: "Track number",
      name: "trackNumberAsc",
      by: [{ field: "trackNumber", direction: "asc" }],
    },
  ],
});
