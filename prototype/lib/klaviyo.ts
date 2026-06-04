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
 * @param email     Validated email address.
 * @param source    Form identifier surfaced as Klaviyo `custom_source` on the
 *                  consent record — visible in the Klaviyo UI per-profile.
 */
export async function subscribeToList(
  email: string,
  source: string,
): Promise<SubscribeResult> {
  if (!isKlaviyoConfigured) {
    return { status: "skipped", reason: "unconfigured" };
  }

  try {
    await getProfilesApi().bulkSubscribeProfiles({
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
