import sanitizeHtml from "sanitize-html";

/**
 * Sanitises admin-authored product descriptions before they are rendered.
 *
 * The description is written in the admin panel and rendered with
 * dangerouslySetInnerHTML, so anything that survives here runs on every
 * visitor's product page. Only presentational markup is allowed: no script,
 * style, iframe, event handlers, or javascript: URLs.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li",
  "h2", "h3", "h4",
  "blockquote", "a", "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function sanitizeDescription(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      // `class` only, so admins cannot smuggle inline styles or handlers.
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Outbound links must not hand the opener window to another site.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.target ? { target: "_blank" } : {}),
        },
      }),
    },
    disallowedTagsMode: "discard",
  });
}

/** True when the value contains markup rather than plain text. */
export function looksLikeHtml(input: string | null | undefined): boolean {
  return !!input && /<[a-z][\s\S]*>/i.test(input);
}
