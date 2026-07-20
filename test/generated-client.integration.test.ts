import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, connect } from 'node:net';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { client } from '../src/generated/client.gen';
import * as sdk from '../src/generated/sdk.gen';
import type {
  ActiveChargingProfile,
  Cdr,
  ChargingProfile,
  ChargingPreferences,
  ChargingProfileAsyncResult,
  ClientInfo,
  Command,
  CommandResult,
  Credentials,
  Location,
  LocationPatch,
  LocationReferences,
  Session,
  SessionPatch,
  SetChargingProfile,
  Tariff,
  Token,
  TokenPatch,
} from '../src/generated/types.gen';

const HOST = '127.0.0.1';
const AUTH_TOKEN = 'Token integration-token';
const DATE_TIME = '2015-06-29T20:39:09Z';
const RESPONSE_URL = 'https://example.com/ocpi/callback';
const COUNTRY_CODE = 'JP';
const PARTY_ID = 'EXA';

type ClientResult = {
  error?: unknown;
  request?: Request;
  response?: Response;
};
type OperationCall = () => Promise<unknown>;

const getAvailablePort = async (): Promise<number> => {
  const server = createServer();
  server.listen(0, HOST);
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to allocate a TCP port for Prism');
  }
  const port = address.port;
  server.close();
  await once(server, 'close');
  return port;
};

const waitForPort = async (port: number): Promise<void> => {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 15_000) {
    try {
      await new Promise<void>((resolveConnection, rejectConnection) => {
        const socket = connect(port, HOST);
        socket.once('connect', () => {
          socket.end();
          resolveConnection();
        });
        socket.once('error', rejectConnection);
      });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 100));
    }
  }

  throw new Error(`Prism did not start on ${HOST}:${port}. Last error: ${String(lastError)}`);
};

const coordinates = {
  latitude: '35.68123',
  longitude: '139.76712',
};

const credentials: Credentials = {
  token: 'receiver-token',
  url: 'https://example.com/ocpi/2.2.1',
  roles: {
    role: 'CPO',
    business_details: {
      name: 'Example Operator',
    },
    party_id: PARTY_ID,
    country_code: COUNTRY_CODE,
  },
};

const token: Token = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  uid: 'TOKEN1',
  type: 'RFID',
  contract_id: 'JP-EXA-C123456',
  issuer: 'Example Provider',
  valid: true,
  whitelist: 'ALLOWED',
  last_updated: DATE_TIME,
};

const location: Location = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  id: 'LOC1',
  publish: true,
  address: '1 Marunouchi',
  city: 'Tokyo',
  country: 'JPN',
  coordinates,
  time_zone: 'Asia/Tokyo',
  last_updated: DATE_TIME,
};

const locationPatch: LocationPatch = {
  publish: true,
  last_updated: DATE_TIME,
};

const evsePatch: LocationPatch = {
  status: 'AVAILABLE',
  last_updated: DATE_TIME,
};

const connectorPatch: LocationPatch = {
  standard: 'IEC_62196_T2',
  format: 'CABLE',
  power_type: 'AC_3_PHASE',
  max_voltage: 230,
  max_amperage: 32,
  last_updated: DATE_TIME,
};

const cdrToken = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  uid: 'TOKEN1',
  type: 'RFID',
  contract_id: 'JP-EXA-C123456',
} as const;

const session: Session = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  id: 'SESSION1',
  start_date_time: DATE_TIME,
  kwh: 10.5,
  cdr_token: cdrToken,
  auth_method: 'AUTH_REQUEST',
  location_id: 'LOC1',
  evse_uid: 'EVSE1',
  connector_id: '1',
  currency: 'JPY',
  status: 'ACTIVE',
  last_updated: DATE_TIME,
};

const sessionPatch: SessionPatch = {
  status: 'ACTIVE',
  last_updated: DATE_TIME,
};

const cdr: Cdr = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  id: 'CDR1',
  start_date_time: DATE_TIME,
  end_date_time: '2015-06-29T21:39:09Z',
  cdr_token: cdrToken,
  auth_method: 'AUTH_REQUEST',
  cdr_location: {
    id: 'LOC1',
    address: '1 Marunouchi',
    city: 'Tokyo',
    country: 'JPN',
    coordinates,
    evse_uid: 'EVSE1',
    evse_id: 'JP*EXA*E1',
    connector_id: '1',
    connector_standard: 'IEC_62196_T2',
    connector_format: 'CABLE',
    connector_power_type: 'AC_3_PHASE',
  },
  currency: 'JPY',
  total_cost: {
    excl_vat: 1000,
  },
  total_energy: 10.5,
  total_time: 1,
  last_updated: DATE_TIME,
};

const tariff: Tariff = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  id: 'TARIFF1',
  currency: 'JPY',
  last_updated: DATE_TIME,
};

const tokenPatch: TokenPatch = {
  valid: true,
  last_updated: DATE_TIME,
};

const locationReferences: LocationReferences = {
  location_id: 'LOC1',
  evse_uids: ['EVSE1'],
};

const command: Command = {
  response_url: RESPONSE_URL,
  token,
  location_id: 'LOC1',
};

const commandResult: CommandResult = {
  result: 'ACCEPTED',
};

const chargingProfile: ChargingProfile = {
  charging_rate_unit: 'W',
  charging_profile_period: [
    {
      start_period: 0,
      limit: 7200,
    },
  ],
};

const setChargingProfile: SetChargingProfile = {
  charging_profile: chargingProfile,
  response_url: RESPONSE_URL,
};

const chargingPreferences: ChargingPreferences = {
  profile_type: 'REGULAR',
  departure_time: DATE_TIME,
  energy_need: 30,
};

const chargingProfileResult: ChargingProfileAsyncResult = {
  result: 'ACCEPTED',
};

const activeChargingProfile: ActiveChargingProfile = {
  start_date_time: DATE_TIME,
  charging_profile: chargingProfile,
};

const clientInfo: ClientInfo = {
  party_id: PARTY_ID,
  country_code: COUNTRY_CODE,
  role: 'CPO',
  status: 'CONNECTED',
  last_updated: DATE_TIME,
};

const collectionQuery = {
  date_from: DATE_TIME,
  date_to: DATE_TIME,
  offset: 0,
  limit: 1,
};

const paths = {
  country_code: COUNTRY_CODE,
  party_id: PARTY_ID,
  location_id: 'LOC1',
  evse_uid: 'EVSE1',
  connector_id: '1',
  session_id: 'SESSION1',
  cdr_id: 'CDR1',
  tariff_id: 'TARIFF1',
  token_uid: 'TOKEN1',
};

const operationCalls = {
  getVersions: () => sdk.getVersions(),
  getVersionDetails: () => sdk.getVersionDetails({ path: { version: '2.2.1' } }),
  deleteCredentials: () => sdk.deleteCredentials(),
  getCredentials: () => sdk.getCredentials(),
  postCredentials: () => sdk.postCredentials({ body: credentials }),
  putCredentials: () => sdk.putCredentials({ body: credentials }),
  getLocations: () => sdk.getLocations({ query: collectionQuery }),
  getLocation: () => sdk.getLocation({ path: { location_id: paths.location_id } }),
  getEvse: () => sdk.getEvse({ path: { location_id: paths.location_id, evse_uid: paths.evse_uid } }),
  getConnector: () =>
    sdk.getConnector({
      path: {
        location_id: paths.location_id,
        evse_uid: paths.evse_uid,
        connector_id: paths.connector_id,
      },
    }),
  getSessions: () => sdk.getSessions({ query: collectionQuery }),
  getSessionById: () =>
    sdk.getSessionById({
      path: {
        country_code: paths.country_code,
        party_id: paths.party_id,
        session_id: paths.session_id,
      },
    }),
  setChargingPreferences: () =>
    sdk.setChargingPreferences({
      body: chargingPreferences,
      path: { session_id: paths.session_id },
    }),
  getCdrs: () => sdk.getCdrs({ query: collectionQuery }),
  getCdrById: () => sdk.getCdrById({ path: { cdr_id: paths.cdr_id } }),
  getTariffs: () => sdk.getTariffs({ query: collectionQuery }),
  getTariffById: () =>
    sdk.getTariffById({
      path: {
        country_code: paths.country_code,
        party_id: paths.party_id,
        tariff_id: paths.tariff_id,
      },
    }),
  patchToken: () =>
    sdk.patchToken({
      body: tokenPatch,
      path: {
        country_code: paths.country_code,
        party_id: paths.party_id,
        token_uid: paths.token_uid,
      },
      query: { type: 'RFID' },
    }),
  putToken: () =>
    sdk.putToken({
      body: token,
      path: {
        country_code: paths.country_code,
        party_id: paths.party_id,
        token_uid: paths.token_uid,
      },
      query: { type: 'RFID' },
    }),
  sendCommand: () =>
    sdk.sendCommand({
      body: command,
      path: { command: 'START_SESSION' },
    }),
  deleteChargingProfile: () =>
    sdk.deleteChargingProfile({
      path: { session_id: paths.session_id },
      query: { response_url: RESPONSE_URL },
    }),
  getActiveChargingProfile: () =>
    sdk.getActiveChargingProfile({
      path: { session_id: paths.session_id },
      query: { duration: 3600, response_url: RESPONSE_URL },
    }),
  putChargingProfile: () =>
    sdk.putChargingProfile({
      body: setChargingProfile,
      path: { session_id: paths.session_id },
    }),
} satisfies Record<string, OperationCall>;

describe('generated OCPI TypeScript client', () => {
  let prism: ReturnType<typeof spawn>;
  let prismOutput = '';

  beforeAll(async () => {
    const port = await getAvailablePort();
    const prismBin = resolve('node_modules/.bin/prism');

    prism = spawn(
      prismBin,
      [
        'mock',
        'dist/yaml/openapi.ems.yaml',
        '--host',
        HOST,
        '--port',
        String(port),
        '--dynamic',
        '--seed',
        'ocpi-client-test',
        '--verboseLevel',
        'error',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    prism.stdout?.on('data', (chunk: Buffer) => {
      prismOutput += chunk.toString();
    });
    prism.stderr?.on('data', (chunk: Buffer) => {
      prismOutput += chunk.toString();
    });

    await waitForPort(port);
    client.setConfig({
      auth: AUTH_TOKEN,
      baseUrl: `http://${HOST}:${port}`,
    });
  });

  afterAll(() => {
    prism.kill();
  });

  it('has an integration test case for every generated SDK function', () => {
    const sdkFunctions = Object.entries(sdk)
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name)
      .sort();

    expect(Object.keys(operationCalls).sort()).toEqual(sdkFunctions);
  });

  it.each(Object.entries(operationCalls))('%s calls the generated mock server', async (_, call) => {
    const result = (await call()) as ClientResult;

    expect(result.error, prismOutput).toBeUndefined();
    expect(result.request?.headers.get('Authorization')).toBe(AUTH_TOKEN);
    expect(result.request?.url).not.toContain('{');
    expect(result.response?.ok, prismOutput).toBe(true);
  });
});
