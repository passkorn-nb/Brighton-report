# Receipt Logo

Drop the KCIS horse-rider logo as `kcis-logo.png` in this folder. The receipt builder loads it at runtime via `fs.readFileSync` and embeds it as base64 in the PDF header. If the file is missing, the receipt PDF still renders — just without a logo.
