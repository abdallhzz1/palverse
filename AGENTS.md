# Palverse Development Instructions

Palverse is a bilingual Palestinian business directory platform.

## Project Structure

- palverse-api: Laravel REST API
- palverse-web: Next.js public website and dashboards
- palverse-mobile: Flutter Android and iOS application
- documentation: project documentation

## Core Technologies

- Laravel
- MySQL
- Laravel Sanctum
- Next.js with TypeScript
- Flutter
- Riverpod
- Dio
- GoRouter
- Firebase Cloud Messaging
- Google Maps

## General Rules

- Read the documentation before modifying code.
- Do not guess business requirements.
- Do not implement Phase 2 features unless explicitly requested.
- Write clean and production-ready code.
- Do not hardcode configurable business values.
- Validate all input.
- Enforce authorization on protected operations.
- Do not expose secrets or sensitive fields.
- Do not modify unrelated files.
- Add tests for implemented features.
- Update documentation when behavior changes.

## Backend Rules

- Use API routes under /api/v1.
- Use Laravel Sanctum.
- Use Form Requests for validation.
- Use API Resources for responses.
- Use Policies for authorization.
- Use Enums for roles and statuses.
- Use pagination for lists.
- Use Laravel Storage for uploaded files.
- Use soft deletes for important records.

## Web Rules

- Use Next.js App Router.
- Use TypeScript.
- Support Arabic RTL and English LTR.
- Separate public pages from dashboard pages.
- Use role-based access control.
- Ensure responsive design.

## Flutter Rules

- Use feature-first structure.
- Use Riverpod.
- Use Dio.
- Use GoRouter.
- Support Arabic RTL and English LTR.
- Handle loading, empty, success, and error states.

## Required Workflow

Before making changes:

1. Read AGENTS.md.
2. Read the relevant documentation.
3. Inspect existing code.
4. State the implementation plan.
5. List files that will change.
6. Implement only the requested scope.
7. Run formatting, linting, and tests.
8. Summarize changes and risks.