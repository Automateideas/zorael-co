/**
 * Renders a JSON-LD <script>. The payload is serialized with `<`, `>` and `&`
 * escaped to their unicode forms so a stray character in any field (a product
 * name, a description) can never break out of the script tag or inject markup.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
