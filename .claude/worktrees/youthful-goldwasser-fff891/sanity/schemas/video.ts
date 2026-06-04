import { defineField, defineType } from "sanity";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube ID",
      type: "string",
      description:
        "Just the 11-character ID — e.g. dQw4w9WgXcQ — not the full URL.",
      validation: (r) =>
        r
          .required()
          .regex(/^[A-Za-z0-9_-]{11}$/, { name: "youtube-id", invert: false })
          .error("YouTube IDs are exactly 11 chars (A-Z, a-z, 0-9, _ or -)."),
    }),
    defineField({
      name: "date",
      title: "Published",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Music video", value: "musicVideo" },
          { title: "Visualizer", value: "visualizer" },
          { title: "Behind the scenes", value: "bts" },
        ],
        layout: "radio",
      },
      initialValue: "musicVideo",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "releaseRef",
      title: "Associated release",
      type: "reference",
      to: [{ type: "release" }],
      description: "Optional — links the video back to a release page.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      date: "date",
      releaseTitle: "releaseRef.title",
    },
    prepare: ({ title, type, date, releaseTitle }) => ({
      title,
      subtitle: [type, releaseTitle, date].filter(Boolean).join(" · "),
    }),
  },
  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
