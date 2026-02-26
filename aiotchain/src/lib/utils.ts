/**
 * Formats HTML content from the editor for display.
 * Resolves relative image paths and wraps YouTube iframes in responsive containers.
 */
export const formatContent = (content: string) => {
  if (!content) return "";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  
  // 1. Replace relative /uploads/ paths with absolute ones
  let formatted = content.replace(/src="\/uploads\//g, `src="${baseUrl}/uploads/`);
  
  // 2. Fix YouTube iframes
  // Refined regex: matches iframe tags that have a youtube embed src
  // It handles any attribute order and different quote types.
  const youtubeRegex = /<iframe(?:[^>]*?)\s+src=["']https:\/\/(?:www\.)?(youtube(?:-nocookie)?\.com)\/embed\/([^?"'>\s]+)([^"'>\s]*)?["'](?:[^>]*?)><\/iframe>/gi;
  
  formatted = formatted.replace(youtubeRegex, (match, domain, videoId, query = "", offset) => {
    // Check if it's already wrapped to avoid double wrapping
    // We check the content immediately preceding the match for the wrapper class
    const prevContent = formatted.substring(Math.max(0, offset - 60), offset);
    if (prevContent.includes('class="youtube-wrapper"') || match.includes('class="youtube-wrapper"')) {
      return match;
    }
    
    // Construct the optimized iframe with modern recommended attributes
    return `<div class="youtube-wrapper"><iframe 
      src="https://www.${domain}/embed/${videoId}${query}" 
      title="YouTube video player"
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe></div>`;
  });

  return formatted;
};
