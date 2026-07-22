# Store Location Architecture

## Overview
Palverse stores geographic coordinates dynamically as decimal values. 
No custom PostGIS or MySQL Spatial types are utilized to keep the architecture generic and compatible with basic ORM layers.

## Backend Storage
- `stores` table: Uses `decimal(10, 8)` for `latitude` and `decimal(11, 8)` for `longitude`.
- `store_registration_requests` table: Uses `decimal(10, 7)` for both latitude and longitude.
- Constraints: The `StoreMerchantStoreRequest` and `UpdateMerchantStoreRequest` enforce `required_with:longitude` and `required_with:latitude` respectively. Null is permitted. Valid ranges (-90 to 90, -180 to 180) are strictly validated.

## Frontend Usage
The `LocationPicker` client-side component utilizes Leaflet to drop markers and parse geographic coordinates.
During request approval (`StoreRegistrationRequestService`), coordinates are directly mapped from the request into the newly provisioned active store model.
