import { defineArrayMember, defineField, defineType } from "sanity";

export const release = defineType({
  name: "release",
  title: "Release",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "releaseDate",
      title: "Release date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "Single", value: "single" },
          { title: "EP", value: "ep" },
          { title: "Album", value: "album" },
        ],
        layout: "radio",
      },
      initialValue: "single",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artwork",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "description",
      type: "array",
      of: [{ type: "block" }],
      description: "Short editorial blurb shown on release pages.",
    }),
    defineField({
      name: "tracks",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "track" }],
          options: { disableNew: false },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "credits",
      type: "array",
      of: [{ type: "block" }],
      description: "Release-level credits (art direction, label, etc.).",
    }),
    defineField({
      name: "streamingLinks",
      title: "Streaming links",
      type: "object",
      fields: [
        defineField({ name: "spotify", title: "Spotify", type: "url" }),
        defineField({ name: "appleMusic", title: "Apple Music", type: "url" }),
        defineField({ name: "youtubeMusic", title: "YouTube Music", type: "url" }),
        defineField({ name: "tidal", title: "Tidal", type: "url" }),
        defineField({
          name: "smartlink",
          title: "Smartlink (everywhere else)",
          type: "url",
          description: "linkfire / songfinch / linktree-equivalent.",
        }),
      ],
      options: { collapsible: true, collapsed: false },
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      releaseDate: "releaseDate",
      media: "artwork",
    },
    prepare: ({ title, type, releaseDate, media }) => ({
      title,
      subtitle: [type?.toUpperCase(), releaseDate].filter(Boolean).join(" · "),
      media,
    }),
  },
  orderings: [
    {
      title: "Release date, newest",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
  ],
});
