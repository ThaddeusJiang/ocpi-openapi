# OCPI 2.2.1-d2 OpenAPI Coverage

This folder contains the OpenAPI 3.1 definition for OCPI 2.2.1-d2.

The checklist follows the module and definition structure in `OCPI-2.2.1-d2.pdf`. Checked items are represented in `openapi/openapi.yaml` and the referenced files under `paths/` and `components/`.

## 4. Transport and Format

- [x] Token authentication security scheme
- [x] OCPI response envelope (`BaseResponse`)
- [x] Pagination query parameters (`date_from`, `date_to`, `offset`, `limit`)
- [x] Pagination headers (`Link`, `X-Total-Count`, `X-Limit`)
- [x] Common OCPI error responses

## 6. Versions Module

- [x] Version information endpoint (`GET /versions`)
- [x] Version details endpoint (`GET /{version}`)
- [x] `Version`
- [x] `VersionDetail`
- [x] `Endpoint`
- [x] `InterfaceRole`
- [x] `ModuleID`
- [x] `VersionNumber`

## 7. Credentials Module

- [x] Credentials endpoint (`GET`, `POST`, `PUT`, `DELETE /credentials`)
- [x] `Credentials`
- [x] `CredentialsRole`

## 8. Locations Module

- [x] Sender list endpoint (`GET /locations`)
- [x] Sender object endpoints (`GET /locations/{location_id}[/{evse_uid}[/{connector_id}]]`)
- [x] Receiver object endpoints (`GET`, `PUT`, `PATCH /locations/{country_code}/{party_id}/{location_id}[/{evse_uid}[/{connector_id}]]`)
- [x] `Location`
- [x] `EVSE`
- [x] `Connector`
- [x] `AdditionalGeoLocation`
- [x] `BusinessDetails`
- [x] `Capability`
- [x] `ConnectorFormat`
- [x] `ConnectorType`
- [x] `EnergyMix`
- [x] `EnergySource`
- [x] `EnergySourceCategory`
- [x] `EnvironmentalImpact`
- [x] `EnvironmentalImpactCategory`
- [x] `ExceptionalPeriod`
- [x] `Facility`
- [x] `GeoLocation`
- [x] `Hours`
- [x] `Image`
- [x] `ImageCategory`
- [x] `ParkingRestriction`
- [x] `ParkingType`
- [x] `PowerType`
- [x] `PublishTokenType`
- [x] `RegularHours`
- [x] `Status`
- [x] `StatusSchedule`

## 9. Sessions Module

- [x] Sender list endpoint (`GET /sessions`)
- [x] Receiver object endpoint (`GET`, `PUT`, `PATCH /sessions/{country_code}/{party_id}/{session_id}`)
- [x] Charging preferences endpoint (`PUT /sessions/{session_id}/charging_preferences`)
- [x] `Session`
- [x] `SessionPatch`
- [x] `ChargingPreferences`
- [x] `ChargingPreferencesResponse`
- [x] `ProfileType`
- [x] `SessionStatus`

## 10. CDRs Module

- [x] Sender list endpoint (`GET /cdrs`)
- [x] Receiver create endpoint (`POST /cdrs`)
- [x] Receiver object endpoint (`GET /cdrs/{cdr_id}`)
- [x] `CDR`
- [x] `AuthMethod`
- [x] `CdrDimension`
- [x] `CdrDimensionType`
- [x] `CdrLocation`
- [x] `CdrToken`
- [x] `ChargingPeriod`
- [x] `SignedData`
- [x] `SignedValue`

## 11. Tariffs Module

- [x] Sender list endpoint (`GET /tariffs`)
- [x] Receiver object endpoint (`GET`, `PUT`, `DELETE /tariffs/{country_code}/{party_id}/{tariff_id}`)
- [x] `Tariff`
- [x] `DayOfWeek`
- [x] `PriceComponent`
- [x] `ReservationRestrictionType`
- [x] `TariffElement`
- [x] `TariffDimensionType`
- [x] `TariffRestrictions`
- [x] `TariffType`

## 12. Tokens Module

- [x] Sender list endpoint (`GET /tokens`)
- [x] Receiver object endpoint (`GET`, `PUT`, `PATCH /tokens/{country_code}/{party_id}/{token_uid}`)
- [x] Real-time authorization endpoint (`POST /tokens/{token_uid}/authorize`)
- [x] `AuthorizationInfo`
- [x] `Token`
- [x] `TokenPatch`
- [x] `AllowedType`
- [x] `EnergyContract`
- [x] `LocationReferences`
- [x] `TokenType`
- [x] `WhitelistType`

## 13. Commands Module

- [x] Receiver command endpoint (`POST /commands/{command}`)
- [x] Sender asynchronous result endpoint (`POST /commands/{command}/{uid}`)
- [x] `CancelReservation`
- [x] `CommandResponse`
- [x] `CommandResult`
- [x] `ReserveNow`
- [x] `StartSession`
- [x] `StopSession`
- [x] `UnlockConnector`
- [x] `CommandResponseType`
- [x] `CommandResultType`
- [x] `CommandType`

## 14. ChargingProfiles Module

- [x] Receiver endpoint (`GET`, `PUT`, `DELETE /chargingprofiles/{session_id}`)
- [x] Sender asynchronous result body (`ActiveChargingProfileResult`, `ChargingProfileResult`, `ClearProfileResult`)
- [x] Sender active profile update body (`ActiveChargingProfile`)
- [x] `ChargingProfileResponse`
- [x] `ActiveChargingProfileResult`
- [x] `ChargingProfileResult`
- [x] `ClearProfileResult`
- [x] `SetChargingProfile`
- [x] `ActiveChargingProfile`
- [x] `ChargingRateUnit`
- [x] `ChargingProfile`
- [x] `ChargingProfilePeriod`
- [x] `ChargingProfileResponseType`
- [x] `ChargingProfileResultType`

## 15. HubClientInfo Module

- [x] Receiver object endpoint (`GET`, `PUT /clientinfo/{country_code}/{party_id}`)
- [x] Sender list endpoint (`GET /hubclientinfo`)
- [x] `ClientInfo`
- [x] `ConnectionStatus`

## 16. Types

- [x] `CiString` fields represented as strings with OCPI lengths
- [x] `DateTime`
- [x] `DisplayText`
- [x] `number`
- [x] `Price`
- [x] `Role`
- [x] `string` fields represented as strings with OCPI lengths
- [x] `URL`
- [x] `CountryCode`
- [x] `PartyID`
- [x] `day`
- [x] `time`

## Notes

- [x] OCPI Locations Sender and Receiver templates intentionally overlap when represented in one OpenAPI document. `.redocly.yaml` disables only the corresponding path ambiguity rules so the PDF path templates can remain intact.
