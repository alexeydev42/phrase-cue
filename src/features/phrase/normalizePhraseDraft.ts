export const normalizePhraseDraft = (text: string): string =>
  text.replace(/\r\n|\n|\r/g, ' ').replace(/ {2,}/g, ' ')
