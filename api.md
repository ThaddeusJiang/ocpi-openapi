# OCPI TypeScript SDK API

This file is generated from the EMS OpenAPI document. Do not edit it directly.

The root `@thaddeusjiang/ocpi` package exports 23 EMSP-side request methods.

| HTTP | Path | SDK method | OpenAPI operationId | Summary |
| --- | --- | --- | --- | --- |
| `GET` | `/versions` | `getVersions` | `getVersions` | Fetch information about supported OCPI versions |
| `GET` | `/{version}` | `getVersionDetails` | `getVersionDetails` | Fetch endpoint details for an OCPI version |
| `DELETE` | `/credentials` | `deleteCredentials` | `deleteCredentials` | Invalidate credentials |
| `GET` | `/credentials` | `getCredentials` | `getCredentials` | Retrieve credentials |
| `POST` | `/credentials` | `postCredentials` | `postCredentials` | Register credentials |
| `PUT` | `/credentials` | `putCredentials` | `putCredentials` | Update credentials |
| `GET` | `/locations` | `getLocations` | `getLocations` | Fetch Locations |
| `GET` | `/locations/{location_id}` | `getLocation` | `getLocation` | Fetch a Location |
| `GET` | `/locations/{location_id}/{evse_uid}` | `getEvse` | `getEVSE` | Fetch an EVSE |
| `GET` | `/locations/{location_id}/{evse_uid}/{connector_id}` | `getConnector` | `getConnector` | Fetch a Connector |
| `GET` | `/sessions` | `getSessions` | `getSessions` | Fetch Sessions |
| `GET` | `/sessions/{country_code}/{party_id}/{session_id}` | `getSessionById` | `getSessionById` | Retrieve a Session |
| `PUT` | `/sessions/{session_id}/charging_preferences` | `setChargingPreferences` | `setChargingPreferences` | Set charging preferences for a Session |
| `GET` | `/cdrs` | `getCdrs` | `getCdrs` | Fetch CDRs |
| `GET` | `/cdrs/{cdr_id}` | `getCdrById` | `getCdrById` | Retrieve a CDR |
| `GET` | `/tariffs` | `getTariffs` | `getTariffs` | Fetch Tariffs |
| `GET` | `/tariffs/{country_code}/{party_id}/{tariff_id}` | `getTariffById` | `getTariffById` | Retrieve a Tariff |
| `PUT` | `/tokens/{country_code}/{party_id}/{token_uid}` | `putToken` | `putToken` | Push a new or updated Token |
| `PATCH` | `/tokens/{country_code}/{party_id}/{token_uid}` | `patchToken` | `patchToken` | Partially update a Token |
| `POST` | `/commands/{command}` | `sendCommand` | `sendCommand` | Send a command request |
| `DELETE` | `/chargingprofiles/{session_id}` | `deleteChargingProfile` | `deleteChargingProfile` | Clear a ChargingProfile for a Session |
| `GET` | `/chargingprofiles/{session_id}` | `getActiveChargingProfile` | `getActiveChargingProfile` | Request the ActiveChargingProfile for a Session |
| `PUT` | `/chargingprofiles/{session_id}` | `putChargingProfile` | `putChargingProfile` | Set or update a ChargingProfile for a Session |

The complete protocol document is available from `@thaddeusjiang/ocpi/openapi.yaml`; the SDK input subset is available from `@thaddeusjiang/ocpi/openapi.ems.yaml`.
