/* ------------------------------------------------------------------ */
/* Behavioral data tracking — fires on every click, site-wide           */
/*                                                                      */
/* A few fields in the payload aren't fully specified by the sample, so */
/* documenting the assumptions made here:                              */
/*   - Event / EventType: fixed at "PageView" (confirmed), even though  */
/*     this call fires per click rather than per page load.             */
/*   - PageType: fixed at "Loan" (confirmed), used as a flat default       */
/*     across every page for now, since no other values were specified.   */
/*   - InterestedIn: left blank in the sample, but populated here with */
/*     a short label describing what was actually clicked (its visible */
/*     text, falling back to its id/class) — otherwise every single    */
/*     event would be identical and useless for behavioral modeling.   */
/*   - InterestLevel / PageViewActiveTime: no reasonable way to derive */
/*     these from a bare click, so left blank, matching the sample.    */
/* ------------------------------------------------------------------ */
const BEHAVIORAL_DATA_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/BehavioralData/01.01/Insert";

// Site-wide on/off switch for the BehavioralData call below — flip to false
// to stop sending it entirely without removing the click listener itself.
const BEHAVIORAL_DATA_ENABLED = true;

// Robert (PRIYA_CUSTOMER_ID) is disabled for now — explicit, scoped
// request, not a permanent exclusion. Remove his id here to re-enable.
const BEHAVIORAL_DATA_DISABLED_CUSTOMER_IDS = [PRIYA_CUSTOMER_ID];

function describeClickedElement(el) {
  // Prefer a short, specific label over a long blob of combined text:
  // 1. The nearest interactive ancestor (button/link) — usually short and
  //    exactly describes the action taken.
  // 2. A heading-style element inside whatever card/container was clicked
  //    (e.g. clicking anywhere on a card, including its description text,
  //    should report the card's own title, not whatever paragraph happened
  //    to be directly under the cursor).
  // 3. The clicked element's own direct text, if it has any without
  //    descending into children.
  // 4. Full text of the first ancestor that has any, truncated, as a last
  //    resort so nothing ever reports completely blank.
  const interactive = el.closest("button, a");
  if (interactive) {
    const text = (interactive.textContent || "").trim().replace(/\s+/g, " ");
    if (text) return text.slice(0, 80);
  }

  let node = el;
  for (let i = 0; i < 3 && node; i++) {
    const heading = node.querySelector && node.querySelector(".bnk-display, h1, h2, h3, .bnk-form-label");
    if (heading) {
      const text = (heading.textContent || "").trim().replace(/\s+/g, " ");
      if (text) return text.slice(0, 80);
    }
    node = node.parentElement;
  }

  const ownText = Array.from(el.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => n.textContent.trim())
    .join(" ").trim();
  if (ownText) return ownText.slice(0, 80);

  node = el;
  for (let i = 0; i < 3 && node; i++) {
    const text = (node.textContent || "").trim().replace(/\s+/g, " ");
    if (text) return text.slice(0, 80);
    node = node.parentElement;
  }
  return el.id || el.className || el.tagName || "unknown";
}

function sendBehavioralData(interestedIn) {
  if (!BEHAVIORAL_DATA_ENABLED) return;

  let customerId = "";
  try {
    const session = loadSession();
    const customer = getCustomerFromSession(session);
    if (customer) customerId = customer.id;
  } catch (err) {
    // Not logged in, or session helpers unavailable on this page — CustomerID stays blank.
  }

  if (BEHAVIORAL_DATA_DISABLED_CUSTOMER_IDS.includes(customerId)) return;

  const payload = {
    CustomerID: customerId,
    InterestedIn: interestedIn,
    InterestLevel: "",
    Event: "PageView",
    EventType: "PageView",
    PageType: "Loan",
    DeviceType: "Web",
    PageViewActiveTime: "",
    CookieID: getOrCreateAnonymousCookieId(),
  };

  // Deliberately not logged to the API debug panel — that panel is scoped
  // specifically to the container/capture_response Pega calls, and
  // BehavioralData, despite also being a Pega endpoint, isn't one of them.
  fetch(BEHAVIORAL_DATA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(err => console.error("BehavioralData call failed:", err.message));
}

// Delegated listener — covers every click anywhere on the page, present or
// future, without needing to annotate individual buttons/links by hand.
document.addEventListener("click", event => {
  const label = describeClickedElement(event.target);
  sendBehavioralData(label);
});
