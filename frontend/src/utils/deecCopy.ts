const LEFTOVER =
  /trans-net|tnsds|enterprise software|custom development|product demo|solutions consultant|engagement models|engineers, designers|global headquarters|\+1-800-trans-net/i;

/** Use CMS copy unless it is leftover TransNet / TNSDS agency text. */
export function deecCopy(value: string | undefined, fallback: string) {
  const text = (value ?? '').trim();
  if (!text || LEFTOVER.test(text)) return fallback;
  return text;
}
