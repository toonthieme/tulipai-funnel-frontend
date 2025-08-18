async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    // Add protocol if missing
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Use a CORS proxy for development
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(corsProxy + encodeURIComponent(fullUrl));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content from HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.getElementsByTagName('script');
    const styles = doc.getElementsByTagName('style');
    Array.from(scripts).forEach(script => script.remove());
    Array.from(styles).forEach(style => style.remove());
    
    // Get text from meta tags
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    
    // Get text from important elements
    const title = doc.title;
    const h1s = Array.from(doc.getElementsByTagName('h1')).map(h => h.textContent).join(' ');
    const h2s = Array.from(doc.getElementsByTagName('h2')).map(h => h.textContent).join(' ');
    const paragraphs = Array.from(doc.getElementsByTagName('p')).map(p => p.textContent).join(' ');
    
    return `
Website Title: ${title}
Meta Description: ${metaDescription}
Meta Keywords: ${metaKeywords}
Main Headings: ${h1s}
Subheadings: ${h2s}
Content: ${paragraphs}
    `.trim();
    
  } catch (error) {
    console.error('Error fetching website:', error);
    throw error;
  }
}

export { fetchWebsiteContent };