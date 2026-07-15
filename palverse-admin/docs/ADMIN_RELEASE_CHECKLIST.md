# Palverse Admin Release Checklist

Before marking the Palverse Admin Dashboard v1.0.0 as final and deploying to production, perform the following verification steps.

## Pre-Deployment Verification

### 1. Environment Configuration
- [ ] Ensure `.env.local` or production environment contains `NEXT_PUBLIC_API_BASE_URL`.
- [ ] Ensure `NEXT_PUBLIC_API_VERSION` matches backend.
- [ ] Verify frontend domain is allowed in backend CORS configuration (`config/cors.php`).

### 2. Authentication & Authorization
- [ ] Can an admin log in successfully?
- [ ] Does the JWT token attach properly to protected requests?
- [ ] Are 401 Unauthorized responses correctly clearing the session and redirecting to login?
- [ ] Can a non-admin account (store owner) be blocked from accessing the admin dashboard?

### 3. Modules & CRUD
- [ ] **Dashboard:** Do the analytics cards and charts display correct values?
- [ ] **Reports:** Do all 4 sections (Stores, Subscriptions, Offers, Users) load metrics?
- [ ] **Users:** Can you list, view, and edit a user?
- [ ] **Stores:** Does the store approval workflow function correctly?
- [ ] **Categories:** Is tree/nested viewing working correctly?
- [ ] **Cities & Zones:** Can regions be mapped and searched?
- [ ] **Offers:** Do lists match backend schema?
- [ ] **Subscriptions:** Do assigning and canceling subscriptions function?
- [ ] **Settings:** Can system configuration be updated?
- [ ] **Static Pages / FAQs:** Does the Markdown/HTML logic persist correctly?
- [ ] **Audit Logs:** Are actions recording properly without crashing?

### 4. UI/UX & Responsive
- [ ] Are dark mode colors accessible without default blue/purple clashes?
- [ ] Does the sidebar correctly collapse on mobile devices (320px - 768px)?
- [ ] Do data tables overflow horizontally instead of breaking layout boundaries?
- [ ] Are Arabic fonts (`Cairo`) rendering without clipping?

### 5. Final Release
- [ ] Have all Type errors and ESLint warnings been resolved natively?
- [ ] Did `npm run build` succeed and generate static pages properly?
- [ ] Tag the release `v1.0.0` in the repository.
