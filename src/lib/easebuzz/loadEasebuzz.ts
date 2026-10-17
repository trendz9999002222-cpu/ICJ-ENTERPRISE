declare global {
  interface Window {
    EasebuzzCheckout?: any;
  }
}

let loadPromise: Promise<void> | null = null;

export function loadEasebuzzCheckout(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.EasebuzzCheckout) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="easebuzz-checkout.js"]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/easebuzz-checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Easebuzz checkout script."));
    document.body.appendChild(script);
  });
  return loadPromise;
}
