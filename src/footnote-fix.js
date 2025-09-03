/**
 * Fix for paged.js footnote numbering issue where multiple footnotes 
 * on the same page get the same number at the bottom.
 */

// Track footnote counter globally
let globalFootnoteCounter = 0;

class FootnoteFix extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
    this.footnoteMap = new Map();
  }

  // Before rendering, collect all footnotes and assign numbers
  beforeParsed(content) {
    const allFootnotes = content.querySelectorAll('.footnote');
    allFootnotes.forEach((footnote, index) => {
      const id = 'footnote-' + (index + 1);
      footnote.setAttribute('data-footnote-number', index + 1);
      this.footnoteMap.set(footnote, index + 1);
    });
    globalFootnoteCounter = allFootnotes.length;
  }

  // After each chunk is rendered
  afterRendered(pages) {
    // Process each page
    pages.forEach(page => {
      const pageEl = page.element;
      
      // Find footnote calls in the main content
      const footnoteCalls = pageEl.querySelectorAll('.pagedjs_footnote_call');
      const footnoteRefs = [];
      
      footnoteCalls.forEach(call => {
        const ref = call.getAttribute('data-ref');
        const number = call.textContent.replace(/[\[\]]/g, '').trim();
        footnoteRefs.push({ref, number});
      });
      
      // Find the footnote area
      const footnoteArea = pageEl.querySelector('.pagedjs_footnote_area');
      if (!footnoteArea) return;
      
      // Find all footnotes in the footer
      const footnotes = footnoteArea.querySelectorAll('.footnote[data-ref]');
      
      footnotes.forEach((footnote, index) => {
        const ref = footnote.getAttribute('data-ref');
        
        // Find the matching call
        const matchingCall = footnoteRefs.find(r => r.ref === ref);
        if (matchingCall) {
          // Add the number to the beginning of the footnote
          const marker = document.createElement('span');
          marker.className = 'pagedjs_footnote_marker';
          marker.style.fontWeight = 'bold';
          marker.textContent = matchingCall.number + '. ';
          
          // Insert at the beginning
          footnote.insertBefore(marker, footnote.firstChild);
        }
      });
    });
  }
}

// Register the handler
Paged.registerHandlers(FootnoteFix);

// Also add a fallback that runs after everything is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Wait for paged.js to finish
  setTimeout(() => {
    // Find all footnote areas
    document.querySelectorAll('.pagedjs_footnote_area').forEach(area => {
      const footnotes = area.querySelectorAll('.footnote[data-ref]');
      
      footnotes.forEach(footnote => {
        // Check if we already added a marker
        if (footnote.querySelector('.pagedjs_footnote_marker')) return;
        
        const ref = footnote.getAttribute('data-ref');
        
        // Find the corresponding call
        const call = document.querySelector(`.pagedjs_footnote_call[data-ref="${ref}"]`);
        if (call) {
          const number = call.textContent.replace(/[\[\]]/g, '').trim();
          
          const marker = document.createElement('span');
          marker.className = 'pagedjs_footnote_marker';
          marker.style.fontWeight = 'bold';
          marker.textContent = number + '. ';
          
          footnote.insertBefore(marker, footnote.firstChild);
        }
      });
    });
  }, 500);
});
