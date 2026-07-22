# Map Provider Decision

## Summary
For Phase 6, we evaluated multiple map providers to deliver geographic pinning and viewing capabilities for Palverse Stores.

## Evaluated Options

### 1. Google Maps Platform
- **Pros**: Industry standard, highest quality POI data, rich ecosystem.
- **Cons**: Requires active billing account with credit card attached. Restrictive API quotas can lead to surprise costs. Violates the user's constraints regarding avoiding complex third-party API configurations or keys for standard MVP operations.

### 2. Mapbox
- **Pros**: Beautiful vector tiles, highly customizable.
- **Cons**: Also requires API keys, tokens, and billing integration eventually. Strict rate limits for free tier.

### 3. Leaflet + OpenStreetMap (Chosen)
- **Pros**: 100% free, open-source, and requires zero API keys or billing setup. `react-leaflet` integrates seamlessly with Next.js (when dynamically imported).
- **Cons**: Lower quality POI data, but since we are manually dropping pins by coordinates, POI quality is irrelevant. 

## Implementation Details
We chose `react-leaflet` pointing to default OSM (`openstreetmap.org`) tile layers. 
- Map views are locked on the Public Dashboard for display only.
- Form inputs dynamically update React state.
- For routing/directions, we do not perform client-side rendering. Instead, we offload to native apps by rendering a universal `google.com/maps/dir` anchor link that bridges to the user's installed Google Maps app on mobile natively.
