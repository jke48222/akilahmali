import { defineField, defineType } from "sanity";

/**
 * Singleton — site-wide settings, surfaced as the single "Settings" item
 * in the Studio structure (see sanity/config.ts).
 */
export const settings = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      initialValue: "MALI — malicantsing",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer tagline",
      type: "string",
      description: "e.g. 'akilah mali · b. 2001 · est. 2025'",
    }),
    defineField({
      name: "shortBio",
      title: "Short bio (≤60 words)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "mediumBio",
      title: "Medium bio (≤150 words)",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "longBio",
      title: "Long bio (rich text)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "listenLinks",
      title: "Listen links",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "spotify", title: "Spotify", type: "url" }),
        defineField({ name: "appleMusic", title: "Apple Music", type: "url" }),
        defineField({ name: "youtubeMusic", title: "YouTube Music", type: "url" }),
        defineField({ name: "tidal", title: "Tidal", type: "url" }),
        defineField({
          name: "smartlink",
          title: "Smartlink (linkfire / linktree)",
          type: "url",
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "tiktok", title: "TikTok", type: "url" }),
        defineField({ name: "youtube", title: "YouTube", type: "url" }),
        defineField({ name: "twitter", title: "Twitter / X", type: "url" }),
      ],
    }),
    defineField({
      name: "contactEmails",
      title: "Contact routing",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "general",
          title: "General / fan mail",
          type: "string",
          validation: (r) => r.email(),
        }),
        defineField({
          name: "booking",
          title: "Booking",
          type: "string",
          validation: (r) => r.email(),
        }),
        defineField({
          name: "sync",
          title: "Sync / licensing",
          type: "string",
          validation: (r) => r.email(),
        }),
        defineField({
          name: "press",
          title: "Press",
          type: "string",
          validation: (r) => r.email(),
        }),
      ],
    }),
    defineField({
      name: "pressKit",
      title: "Press kit downloads",
      type: "array",
      description: "Files surfaced on /press for editorial download.",
      of: [
        {
          type: "object",
          name: "pressAsset",
          fields: [
            defineField({
              name: "name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              type: "string",
            }),
            defineField({
              name: "file",
              type: "file",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "fileType",
              title: "File type label",
              type: "string",
              description: "e.g. zip, pdf, svg",
            }),
            defineField({
              name: "fileSize",
              title: "Human-readable size",
              type: "string",
              description: "e.g. 24 mb, 1 page, 6 kb",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "fileType" },
          },
        },
      ],
    }),
    defineField({
      name: "pressBundle",
      title: "Press kit — entire bundle (.zip)",
      type: "file",
      description: "Optional all-in-one download.",
    }),
    defineField({
      name: "aboutPullQuote",
      title: "About page pull quote",
      type: "object",
      description: "Lyric-derived quote shown between bio and gallery.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "line1", type: "string" }),
        defineField({ name: "line2", type: "string" }),
        defineField({
          name: "attribution",
          type: "string",
          description: "e.g. 'been there once · who really won?, 2025'",
        }),
      ],
    }),
    defineField({
      name: "ogImage",
      title: "Default OG image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
