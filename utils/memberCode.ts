export const MEMBER_CODE_LENGTH = 6;

/** Keeps digits only, capped at the code length ("482 913" -> "482913"). */
export function normalizeMemberCode(input: string): string {
  return (input ?? '').replace(/\D/g, '').slice(0, MEMBER_CODE_LENGTH);
}

/** Groups the code for display: "482913" -> "482 913". Partial codes are grouped too. */
export function formatMemberCode(code: string | null | undefined): string {
  const digits = normalizeMemberCode(code ?? '');
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}
