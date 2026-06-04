import { defineField, defineType } from "sanity";

export const press = defineType({
  name: "press",
  title: "Press mention",
  type: "document",
  fields: [
    defineField({
      name: "publication",
      title: "Publication",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "articleTitle",
      title: "Article title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Published",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quote",
      type: "array",
      of: [{ type: "block" }],
      description: "Pull-quote shown on the /press page.",
    }),
    defineField({
      name: "logo",
      title: "Publication logo",
      type: "image",
      options: { hotspot: false },
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
    select: {
      publication: "publication",
      articleTitle: "articleTitle",
      date: "date",
      media: "logo",
    },
    prepare: ({ publication, articleTitle, date, media }) => ({
      title: publication,
      subtitle: [articleTitle, date].filter(Boolean).join(" · "),
      media,
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
