import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, studioBasePath } from "./env";
import { schemaTypes } from "./schemas";

/**
 * Sanity Studio config — mounted at `/studio` inside the Next.js app.
 * projectId + dataset come from env (see sanity/env.ts).
 */
export default defineConfig({
  name: "malicantsing",
  title: "MALI — content",
  basePath: studioBasePath,
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Singleton: site-wide settings (one document only).
            S.listItem()
              .title("Settings")
              .id("settings")
              .child(
                S.document().schemaType("settings").documentId("settings"),
              ),
            // Singleton: store lookbook.
            S.listItem()
              .title("Lookbook")
              .id("lookbook")
              .child(
                S.document().schemaType("lookbook").documentId("lookbook"),
              ),
            S.divider(),
            S.documentTypeListItem("release").title("Releases"),
            S.documentTypeListItem("track").title("Tracks"),
            S.documentTypeListItem("video").title("Videos"),
            S.documentTypeListItem("show").title("Shows"),
            S.documentTypeListItem("press").title("Press mentions"),
            S.divider(),
            S.documentTypeListItem("page").title("Pages"),
          ]),
    }),
  ],
  // Hide the singleton's document type from "Create new" menus.
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((t) => t.templateId !== "settings")
        : prev,
    actions: (prev, { schemaType }) =>
      schemaType === "settings" || schemaType === "lookbook"
        ? prev.filter(
            (a) =>
              !["unpublish", "duplicate", "delete"].includes(a.action ?? ""),
          )
        : prev,
  },
});
