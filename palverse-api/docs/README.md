# Palverse API Documentation

Welcome to the Palverse API Documentation directory. This folder contains all the technical and operational documentation necessary for consuming and maintaining the Palverse backend.

## Structure

### OpenAPI Specification
- **[OpenAPI 3.1 YAML](openapi/palverse-api-v1.yaml)**: The complete OpenAPI specification file for the Palverse API v1. This file accurately documents all public, merchant, and admin endpoints, including query parameters, path variables, request bodies, and standardized response envelopes.

### Postman Resources
- **[Postman Collection](postman/palverse-api-v1.json)**: An imported Postman Collection v2.1.0 generated from the OpenAPI specification, grouping the 145+ endpoints logically by tags.
- **[Postman Environment](postman/palverse-api-v1-env.json)**: A local environment configuration with placeholder tokens and variables to jumpstart local testing.

### Operations
- **[CLI Commands](operations/commands.md)**: A guide covering available Artisan console commands for cron jobs and operational maintenance (e.g., subscription management).

## Usage

You can import both the Postman collection and the environment directly into Postman to start querying the API locally. Make sure you set the `baseUrl` properly and insert valid Sanctum tokens in the respective token variables (`merchantToken`, `adminToken`).

For developers intending to update the OpenAPI specification, please make sure to follow the established standard for API responses when updating the YAML file, and utilize tools like `openapi-to-postmanv2` to regenerate the postman collection.
