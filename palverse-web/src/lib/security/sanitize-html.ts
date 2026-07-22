const BLOCKED_TAGS = /<(script|iframe|object|embed|form|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi;
const SELF_CLOSING_BLOCKED = /<(script|iframe|object|embed|link|meta)\b[^>]*\/?>/gi;
const EVENT_HANDLERS = /\son\w+\s*=\s*(['"]).*?\1/gi;
const JS_PROTOCOL = /javascript:/gi;

export function sanitizeHtmlContent(html: string): string {
  return html
    .replace(BLOCKED_TAGS, "")
    .replace(SELF_CLOSING_BLOCKED, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_PROTOCOL, "");
}
