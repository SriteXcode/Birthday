export const birthdayDate = new Date("2026-01-31");

export function isBirthdayUnlocked() {
  const now = new Date();
  return now >= birthdayDate;
}
