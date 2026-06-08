import { ApiKeySession, ProfilesApi } from "klaviyo-api";

const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY ?? "";
const listId = process.env.KLAVIYO_LIST_ID ?? "";

export const isKlaviyoConfigured = apiKey.length > 0 && listId.length > 0;

/** Lazily-constructed ProfilesApi — built only when env is set. */
let _profiles: ProfilesApi | null = null;
function getProfilesApi(): ProfilesApi {
  if (!isKlaviyoConfigured) {
    throw new Error(
      "Klaviyo unconfigured — set KLAVIYO_PRIVATE_API_KEY + KLAVIYO_LIST_ID.",
    );
  }
  if (!_profiles) _profiles = new ProfilesApi(new ApiKeySession(apiKey));
  return _profiles;
}

export type SubscribeResult =
  | { status: "ok" }
  | { status: "already-subscribed" }
  | { status: "skipped"; reason: "unconfigured" }
  | { status: "error"; message: string; code?: number };

/**
 * Subscribe an email to the configured Klaviyo list.
 *
 * Klaviyo's bulkSubscribeProfiles endpoint is idempotent — if the profile
 * already exists and is already SUBSCRIBED on this list, it returns 202 with
 * no error. We never get a deterministic "already subscribed" signal back, so
 * we treat any 2xx as success. If the upstream returns 409 or a duplicate-y
 * error code, we surface it as `already-subscribed` for client-side copy.
 *
 * Beyond the consent-level `custom_source`, we also stamp filterable PROFILE
 * properties so Klaviyo segments + flows can branch per entry point (the
 * source-specific welcome journeys). See docs/klaviyo-journeys.md for the
 * canonical source list and the flows each one triggers.
 *
 * @param email     Validated email address.
 * @param source    Form identifier surfaced as Klaviyo `custom_source` on the
 *                  consent record AND as the `signup_source` profile property.
 * @param props     Optional extra profile properties for context-aware
 *                  segmentation (e.g. `{ rsvp_show_id, rsvp_show_city }` from a
 *                  show RSVP, or `{ release_slug }` from a release capture).
 *                  String values only; keys become Klaviyo custom properties.
 */
export async function subscribeToList(
  email: string,
  source: string,
  props?: Record<string, string>,
): Promise<SubscribeResult> {
  if (!isKlaviyoConfigured) {
    return { status: "skipped", reason: "unconfigured" };
  }

  // Filterable profile properties → these are what segments/flows branch on.
  // `signup_source` = the latest entry point; `source_<name>` booleans let a
  // segment say "anyone who ever signed up via the booth" even after a later
  // signup overwrites `signup_source`.
  const properties: Record<string, string | boolean> = {
    signup_source: source,
    [`source_${source}`]: true,
    ...props,
  };

  try {
    const api = getProfilesApi();

    // 1) Upsert the profile FIRST to merge the segmentation properties. The
    //    bulk-subscribe job only carries consent (its profile attributes don't
    //    accept custom properties), so we set properties via createOrUpdate —
    //    keyed by email, it creates or merges onto an existing profile.
    await api.createOrUpdateProfile({
      data: { type: "profile", attributes: { email, properties } },
    });

    // 2) Subscribe → set marketing consent on the configured list.
    await api.bulkSubscribeProfiles({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          customSource: source,
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: { data: { type: "list", id: listId } },
        },
      },
    });
    return { status: "ok" };
  } catch (err) {
    const status = extractStatus(err);
    if (status === 409) {
      return { status: "already-subscribed" };
    }
    const message =
      err instanceof Error ? err.message : "Subscribe call failed.";
    console.error("[klaviyo] subscribe failed", { status, message });
    return { status: "error", code: status, message };
  }
}

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  // klaviyo-api wraps axios; both shapes turn up.
  const e = err as { response?: { status?: number }; status?: number };
  return e.response?.status ?? e.status;
}
