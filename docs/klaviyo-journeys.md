# Klaviyo — sources, properties & journeys

Every email capture on the site POSTs to `/api/subscribe`, which subscribes the
profile to the single configured list (`KLAVIYO_LIST_ID`) and stamps **filterable
profile properties**. The flows themselves live in the Klaviyo dashboard; this
file is the contract between the code and those flows so segments branch on
stable keys.

## What the code sends

`subscribeToList(email, source, props?)` (see `lib/klaviyo.ts`) sets:

| Property            | Value                              | Use in Klaviyo |
| ------------------- | ---------------------------------- | -------------- |
| `signup_source`     | the latest `source` (string)       | "their most recent entry point" |
| `source_<source>`   | `true` (boolean, one per source)   | "ever signed up via X" — survives later signups |
| `custom_source`     | `source` (consent-level metadata)  | shown per-profile in the consent record |
| …`props`            | optional context (string→string)   | RSVP show, release slug, etc. |

`source` is validated to `^[a-z0-9][a-z0-9-]*$`. `props` keys are snake_case
(`^[a-z][a-z0-9_]{0,39}$`), values ≤120 chars, ≤8 pairs.

## Canonical sources (entry points)

| `source`     | Where                                   | Extra `props` |
| ------------ | --------------------------------------- | ------------- |
| `home`       | `components/home/EmailCapture.tsx`      | — |
| `shows`      | `/shows` empty-state `NotifyForm`       | — |
| `show-rsvp`  | `/shows` per-show RSVP                   | `rsvp_show_id`, `rsvp_show_city`, `rsvp_show_date` |
| `payphone`   | The Payphone "leave your number"        | — |

Add a new entry point by passing a new `source` — no API change needed. Keep the
value in `kebab-case` and add a row here.

## Journeys to build in Klaviyo (dashboard)

Create one **Flow** per source, triggered by "added to list" and filtered on the
property above. Recommended set:

1. **Home → welcome** — trigger: list add, filter `signup_source = home`.
   Intro to the world + latest release + "follow on Spotify".
2. **Shows → first-to-know** — filter `signup_source = shows`.
   Confirm they're on the list; nudge to follow for on-sale alerts.
3. **Show RSVP → see-you-there** — filter `signup_source = show-rsvp`.
   Use `rsvp_show_city` / `rsvp_show_date` in the email; day-before reminder.
4. **Payphone → the line** — filter `signup_source = payphone`.
   In-character follow-up that matches the booth's voice.

Cross-source segments (build as **Segments**, not flows):

- **Superfans** — `source_payphone = true` AND `source_home = true` (multi-touch).
- **Live audience** — `source_shows = true` OR `source_show-rsvp = true`.

> Note: properties only flow once `KLAVIYO_PRIVATE_API_KEY` + `KLAVIYO_LIST_ID`
> are set. Without them, `/api/subscribe` returns success and logs a
> non-identifying breadcrumb (no PII) so forms still work in dev.
