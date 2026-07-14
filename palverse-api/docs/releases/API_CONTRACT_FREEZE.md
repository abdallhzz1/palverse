# Palverse API Contract Freeze Policy

This document defines the rules for evolving the Palverse API v1 after the v1.0.0 release. Palverse API v1 is considered a **frozen contract**. This means no breaking changes are allowed to existing endpoints without an explicit version upgrade strategy.

## Allowed Changes (Non-Breaking)

The following changes are permitted and do not require a major version change:

- **Additive optional response fields**: Adding new data points to a response JSON object.
- **New optional query parameters**: Adding parameters that default to the original behavior if omitted.
- **New endpoints**: Expanding the API surface area.
- **New non-breaking error details**: Appending additional metadata to errors without changing the core HTTP status or fundamental error code.
- **Internal performance improvements**: Code refactoring, query optimization, or caching improvements that preserve the exact JSON contract.
- **Bug fixes preserving contract**: Fixing logic bugs without altering the expected success/error shape.

## Disallowed Changes (Breaking)

The following changes are strictly prohibited in the v1 series unless accompanied by a versioning strategy:

- **Renaming response fields**: E.g., changing `is_active` to `active`.
- **Removing fields**: Removing any field from a successful response, even if undocumented.
- **Changing field types**: E.g., changing an integer `id` to a string `uuid`.
- **Changing endpoint paths**: Renaming or moving existing endpoints.
- **Changing required request fields**: Making an optional field mandatory, or adding a new required field.
- **Changing success status codes unexpectedly**: E.g., changing a `200 OK` to a `201 Created` for an existing endpoint.
- **Changing pagination shape**: Altering the meta/links structure of paginated responses.
- **Reusing error codes for different meanings**: Overloading existing error constants.
- **Exposing numeric IDs**: Reverting from `public_id` back to internal database numeric IDs.

## Deprecation Policy

If an endpoint or field must be replaced:
1. **Mark as deprecated**: Annotate the OpenAPI specification using `deprecated: true`.
2. **Retain functionality**: The endpoint must continue to work during a documented transition period.
3. **Provide a replacement**: A clear alternative endpoint must be available.
4. **Announce in CHANGELOG**: Explicitly note the deprecation schedule in the release notes.
