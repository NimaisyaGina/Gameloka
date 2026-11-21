import React from 'react';
import { createRoot } from 'react-dom/client';
import VABubble from './components/VABubble';

/**
 * Mount VA Bubble ke halaman Django
 * Ini adalah entry point untuk merender VABubble sebagai widget
 */
export function mountVABubble(config: { isAuthenticated: boolean }) {
  const container = document.getElementById('bang-buay-va-container');
  
  if (!container) {
    console.warn('VA Bubble: Container #bang-buay-va-container tidak ditemukan');
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <VABubble isAuthenticated={config.isAuthenticated} />
    </React.StrictMode>
  );
}

// Export agar bisa diakses dari window
if (typeof window !== 'undefined') {
  (window as any).mountVABubble = mountVABubble;
}

export default VABubble;
