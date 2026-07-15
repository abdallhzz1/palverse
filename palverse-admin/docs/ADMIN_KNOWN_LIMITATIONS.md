# Palverse Admin v1.0.0 Known Limitations

While Palverse Admin Dashboard v1.0.0 is robust and production-ready, there are a few intentional limitations designed to respect the backend API contract and preserve frontend performance.

## 1. Analytics & Reporting Data
- **Historical Comparisons:** The dashboard displays current statistics (e.g., total active stores) but does not calculate percentage growth (e.g., "+12% from last month"). The API v1.0.0 currently does not aggregate historical comparative sets.
- **Export Capabilities:** Exporting tables and reports to CSV, Excel, or PDF is not implemented on the frontend because no bulk-export endpoints exist in the v1.0.0 API.

## 2. Real-time Synchronization
- **Notifications:** Notifications are fetched on page load and navigation. WebSockets / Server-Sent Events (SSE) for instant push notifications are not currently implemented in the frontend.

## 3. UI/UX Limitations
- **Bulk Actions:** Bulk editing or bulk deleting (e.g., selecting 50 users and deleting them) is unsupported to prevent accidental catastrophic data loss and because bulk endpoints are missing from the backend.
- **Dark Mode Support on Legacy Emails:** Content entered via the rich text editor for static pages may contain hardcoded styles that do not invert perfectly in Dark Mode.

## Future Roadmap (Phase 2 Candidates)
To address these limitations safely, the backend API must be expanded first. Anticipated features include:
- `GET /api/v1/admin/export/{module}` endpoints for CSV generation.
- Firebase Cloud Messaging integration for real-time admin browser alerts.
- Dedicated `/compare` analytical endpoints for trend indicator overlays.
