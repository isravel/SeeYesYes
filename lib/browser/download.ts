/** Save text as a local file. Returns an error message instead of throwing, so callers can show failure feedback. */
export function downloadText(name: string, content: string, type = 'application/json'): string | null {
  try {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    return null;
  } catch {
    return 'The file could not be saved. Check your browser download settings and try again.';
  }
}
