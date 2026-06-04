import { defineField, defineType } from "sanity";

/**
 * Editable copy for the static-feeling routes: /about, /press, /contact.
 * One Page document per route; slug.current is the route key.
 */
export const page = defineType({
  name: "page",
  title: "Page",
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
      options: {
        source: "title",
        maxLength: 64,
      },
      description: "Route key — use 'about', 'press', or 'contact'.",
      validation: (r) =>
        r.required().custom((slug) => {
          const allowed = ["about", "press", "contact", "shows"];
          if (!slug?.current) return "Slug is required.";
          return allowed.includes(slug.current)
            ? true
            : `Slug must be one of: ${allowed.join(", ")}`;
        }),
    }),
    defineField({
      name: "intro",
      type: "array",
      of: [{ type: "block" }],
      description: "Short lead paragraph at the top of the page.",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "caption",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "meta",
      title: "SEO",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", title: "Meta title", type: "string" }),
        defineField({
          name: "description",
          title: "Meta description",
          type: "text",
          rows: 2,
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({
      title,
      subtitle: slug ? `/${slug}` : "—",
    }),
  },
});
