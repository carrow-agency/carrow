export function sanitizeText(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, '');
}
