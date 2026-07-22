# Palverse Web v1.0.0 Release Checklist

## 1. Environment Configuration
- [x] `.env.example` updated with default v1.0.0 variables
- [x] `NEXT_PUBLIC_WEB_VERSION` set to `1.0.0`
- [x] `NEXT_PUBLIC_API_VERSION` set to `1.0.0`

## 2. Dependencies and Security
- [x] Removed unused dependencies
- [x] Ran `npm audit` and reviewed production vulnerabilities
- [x] Secret tokens/keys are not committed (checked `.gitignore`)

## 3. Code Quality
- [x] `npm run lint` passes without errors
- [x] `tsc --noEmit` passes cleanly (strict TypeScript verification)
- [x] Removed unnecessary `console.log` statements

## 4. Feature Completeness
- [x] Public Homepage & Categories
- [x] Stores Listing & Details
- [x] Search & Filtering
- [x] Merchant Onboarding
- [x] Merchant Dashboard & Store Management
- [x] Multipart Image Uploads
- [x] Offers Management
- [x] Authentication (Register, Login, Token lifecycle)

## 5. UI/UX
- [x] Palverse design system verified
- [x] Tailwind generic colors purged and replaced with semantic brand tokens
- [x] Responsive layout verified (mobile, tablet, desktop)
- [x] Dark/Light theme verified

## 6. Build
- [ ] `npm run build` succeeds without warning
- [ ] Production bundle optimized
