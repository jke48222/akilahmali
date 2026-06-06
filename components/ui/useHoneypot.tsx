"use client";

import { useRef } from "react";

/**
 * Client side of the honeypot (see lib/honeypot.ts). Render `field` inside the
 * <form> and spread `values()` into the JSON body on submit:
 *
 *   const { field, values } = useHoneypot();
 *   ...
 *   <form>{field} … </form>
 *   body: JSON.stringify({ email, ...values() })
 *
 * The input is uncontrolled and read by ref so a DOM-walking bot that sets
 * `.value` directly is still caught.
 */
export function useHoneypot() {
  const mountedAt = useRef(Date.now());
  const ref = useRef<HTMLInputElement>(null);

  const field = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      {/* Name + autocomplete chosen to bait form-fillers; humans never see it. */}
      <label>
        Leave this field empty
        <input
          ref={ref}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );

  const values = () => ({ hp: ref.current?.value ?? "", t: mountedAt.current });

  return { field, values };
}
