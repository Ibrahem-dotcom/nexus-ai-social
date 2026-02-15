export async function shareContent(opts: { title: string; text: string; url: string }) {
  if (navigator.share) {
    try {
      await navigator.share(opts);
      return true;
    } catch (e: any) {
      if (e.name === "AbortError") return false;
    }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(opts.url);
    return "copied";
  } catch {
    return false;
  }
}
