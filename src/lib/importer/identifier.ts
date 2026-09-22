/**
 * Stable internal identifiers for the permanent directory.
 *
 * Temple identifiers follow TEMPLE-IND-<STATE>-<DISTRICT>-<SEQ> (spec §13),
 * e.g. TEMPLE-IND-KA-MYS-000123. The mnemonic is derived from the district
 * name at import time; it is an internal reference, not an official code.
 * Sequence numbers are zero-padded to six digits and assigned per district.
 */

export const IDFromText = (s: string): string => {
  return s
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^(AND|THE|SRI|SHREE)/, "");
};

/** District mnemonic, e.g. "Mysuru" -> "MYS", "Sri Potti Sriramulu" -> "POT". */
export function districtMnemonic(districtName: string): string {
  const clean = IDFromText(districtName);
  if (!clean) return "XXX";
  const letters = clean.replace(/[0-9]/g, "");
  if (letters.length >= 3) return letters.slice(0, 3);
  return (letters + "XXX").slice(0, 3);
}

export function templeIdentifier(stateCode: string, districtMnemonicCode: string, seq: number): string {
  const seqStr = String(seq).padStart(6, "0");
  return `TEMPLE-IND-${stateCode.toUpperCase()}-${districtMnemonicCode}-${seqStr}`;
}

export function identifierFromSeed(
  stateCode: string,
  districtName: string,
  seqByDistrict: (mnemonic: string) => number,
): string {
  const m = districtMnemonic(districtName);
  return templeIdentifier(stateCode, m, seqByDistrict(m));
}