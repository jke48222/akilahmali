import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Lookbook — singleton document containing an ordered array of styled shots
 * for the store home strip (`/shop`). Surfaced as one editable doc in the
 * Studio so MALI's team can reorder / swap images without a developer.
 */
export const lookbook = defineType({
  name: "lookbook",
  title: "Lookbook",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "Lookbook — Chapter I",
      description: "Internal label. Not surfaced on the site.",
    }),
    defineField({
      name: "shots",
      title: "Shots",
      type: "array",
      validation: (r) => r.min(1).max(12),
      of: [
        defineArrayMember({
          type: "object",
          name: "lookbookShot",
          fields: [
            defineField({
              name: "image",
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
              name: "label",
              type: "string",
              description: 'e.g. "01 — early light"',
            }),
            defineField({
              name: "tag",
              type: "string",
              description: 'e.g. "tee · worn"',
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "tag",
              media: "image",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Lookbook" }),
  },
});
