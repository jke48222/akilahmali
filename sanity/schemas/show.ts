import { defineField, defineType } from "sanity";

export const show = defineType({
  name: "show",
  title: "Show",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Show date & time",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "venue",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "city",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "country",
      type: "string",
      initialValue: "USA",
    }),
    defineField({
      name: "billing",
      title: "Billing / event title",
      type: "string",
      description: "Optional — e.g. 'opening for X', 'sofar sounds', etc.",
    }),
    defineField({
      name: "ticketUrl",
      title: "Ticket URL",
      type: "url",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Announced", value: "announced" },
          { title: "On sale", value: "onSale" },
          { title: "Sold out", value: "soldOut" },
          { title: "Cancelled", value: "cancelled" },
          { title: "TBA", value: "tba" },
        ],
        layout: "radio",
      },
      initialValue: "announced",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      date: "date",
      venue: "venue",
      city: "city",
      status: "status",
    },
    prepare: ({ date, venue, city, status }) => ({
      title: [venue, city].filter(Boolean).join(" — "),
      subtitle: [date?.slice(0, 10), status].filter(Boolean).join(" · "),
    }),
  },
  orderings: [
    {
      title: "Soonest",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
});
