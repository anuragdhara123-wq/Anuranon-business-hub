# Anuranon Creations Business Hub

A mobile-first Progressive Web App starter for managing a photography business.

## Demo access
- Initial PIN: `2580`
- Change the PIN in Settings after first login.

## Included modules
- Dashboard
- Client management
- Bookings and calendar records
- Payments
- Packages and pricing
- Income and expenses
- Team management
- Instagram lead tracking
- JSON data export
- Basic offline app-shell caching

## Publish with GitHub Pages (Android-friendly)
1. Create a **public** GitHub repository.
2. Upload the contents of this folder to the repository root (not the containing folder).
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then Save.
6. Wait for GitHub Pages to publish. Open the HTTPS URL in Chrome on Android.
7. Use Chrome menu → **Install app** or **Add to Home screen**.

## Important limitations
This is a local-first prototype. Records are stored in browser `localStorage` on the current device and browser profile. They do not sync or automatically back up. Export a JSON backup regularly from Settings.

The PIN is a convenience lock, not strong authentication. This prototype does not include a cloud database, server-side authentication, encrypted storage, PDF invoice generation, or direct Instagram integration. Do not store sensitive client information until these are added.

Google Fonts are loaded from the internet; the app's core files are cached for basic offline use after first successful load.
