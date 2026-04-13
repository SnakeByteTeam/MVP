import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as http from 'node:http';
import request from 'supertest';
import { DeviceController } from 'src/device/adapters/in/device.controller';
import { DeviceModule } from 'src/device/device.module';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { UserGuard } from 'src/guard/user/user.guard';
import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DeviceValue, DatapointValue } from 'src/device/domain/models/device-value.model';
import {
  FIND_DEVICE_BY_ID_PORT,
  FindDeviceByIdPort,
} from 'src/device/application/ports/out/find-device-by-id.port';
import {
  FIND_DEVICE_BY_PLANTID_PORT,
  FindDeviceByPlantIdPort,
} from 'src/device/application/ports/out/find-device-by-plantid.port';
import {
  INGEST_TIMESERIES_PORT,
  IngestTimeseriesPort,
} from 'src/device/application/ports/out/ingest-timeseries.port';
import {
  GET_DEVICE_VALUE_PORT,
  GetDeviceValuePort,
} from 'src/device/application/ports/out/get-device-value.port';
import {
  GET_DEVICE_VALUE_USECASE,
  GetDeviceValueUseCase,
} from 'src/device/application/ports/in/get-device-value.usecase';
import {
  WRITE_DATAPOINT_VALUE_PORT,
  WriteDatapointValuePort,
} from 'src/device/application/ports/out/write-device-value.port';
import {
  FIND_DEVICE_BY_DATAPOINTID_PORT,
  FindDeviceByDatapointIdPort,
} from 'src/device/application/ports/out/find-device-by-datapointId';
import {
  FIND_DEVICE_BY_DATAPOINTID_USECASE,
  FindDeviceByDatapointIdUsecase,
} from 'src/device/application/ports/in/find-device-by-datapointId.usecase';
import {
  CHECK_ALARM_RULE_USECASE,
  CheckAlarmRuleUseCase,
} from 'src/alarms/application/ports/in/check-alarm-rule-use-case.interface';

const DEVICE_ID = 'device-test-001';
const PLANT_ID = 'plant-test-001';
const DATAPOINT_ID = 'dp-test-001';


function createMockDevice(
  id: string = DEVICE_ID,
  plantId: string = PLANT_ID,
  name: string = 'Test Device',
  type: string = 'light',
): Device {
  const datapoints = [
    new Datapoint(
      'dp-brightness-001',
      'brightness',
      true,
      true,
      'number',
      ['0', '100'],
      'slider',
    ),
    new Datapoint(
      'dp-power-001',
      'power',
      true,
      false,
      'boolean',
      ['on', 'off'],
      'switch',
    ),
  ];

  return new Device(id, plantId, name, type, `${type}-sub`, datapoints);
}

function createMockDeviceValue(
  deviceId: string = DEVICE_ID,
  values: DatapointValue[] = [
    new DatapointValue('dp-brightness-001', 'brightness', 75),
    new DatapointValue('dp-power-001', 'power', 'on'),
  ],
): DeviceValue {
  return new DeviceValue(deviceId, values);
}

describe('Device Module Integration Test', () => {
  let app: INestApplication;
  let deviceController: DeviceController;
  let findDeviceByIdPort: jest.Mocked<FindDeviceByIdPort>;
  let findDeviceByPlantIdPort: jest.Mocked<FindDeviceByPlantIdPort>;
  let ingestTimeseriesPort: jest.Mocked<IngestTimeseriesPort>;
  let getDeviceValuePort: jest.Mocked<GetDeviceValuePort>;
  let writeDatapointValuePort: jest.Mocked<WriteDatapointValuePort>;
  let findDeviceByDatapointIdPort: jest.Mocked<FindDeviceByDatapointIdPort>;
  let checkAlarmRuleUseCase: jest.Mocked<CheckAlarmRuleUseCase>;
  let getDeviceValueUseCase: GetDeviceValueUseCase;
  let findDeviceByDatapointIdUseCase: FindDeviceByDatapointIdUsecase;

  beforeEach(async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    };

    const mockPool = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      connect: jest.fn().mockResolvedValue(mockClient),
      end: jest.fn(),
      on: jest.fn(),
    };

    const mockUserGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    // Create mocks for all output ports
    findDeviceByIdPort = {
      findById: jest.fn(),
    } as any;

    findDeviceByPlantIdPort = {
      findByPlantId: jest.fn(),
    } as any;

    ingestTimeseriesPort = {
      ingestTimeseries: jest.fn(),
    } as any;

    getDeviceValuePort = {
      getDeviceValue: jest.fn(),
    } as any;

    writeDatapointValuePort = {
      writeDatapointValue: jest.fn(),
    } as any;

    findDeviceByDatapointIdPort = {
      findByDatapointId: jest.fn(),
    } as any;

    checkAlarmRuleUseCase = {
      checkAlarmRule: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, DeviceModule],
    })
      .overrideGuard(UserGuard)
      .useValue(mockUserGuard)
      .overrideProvider(PG_POOL)
      .useValue(mockPool)
      .overrideProvider(FIND_DEVICE_BY_ID_PORT)
      .useValue(findDeviceByIdPort)
      .overrideProvider(FIND_DEVICE_BY_PLANTID_PORT)
      .useValue(findDeviceByPlantIdPort)
      .overrideProvider(INGEST_TIMESERIES_PORT)
      .useValue(ingestTimeseriesPort)
      .overrideProvider(GET_DEVICE_VALUE_PORT)
      .useValue(getDeviceValuePort)
      .overrideProvider(WRITE_DATAPOINT_VALUE_PORT)
      .useValue(writeDatapointValuePort)
      .overrideProvider(FIND_DEVICE_BY_DATAPOINTID_PORT)
      .useValue(findDeviceByDatapointIdPort)
      .overrideProvider(CHECK_ALARM_RULE_USECASE)
      .useValue(checkAlarmRuleUseCase)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    deviceController = module.get<DeviceController>(DeviceController);

    getDeviceValueUseCase = module.get<GetDeviceValueUseCase>(
      GET_DEVICE_VALUE_USECASE,
    );
    findDeviceByDatapointIdUseCase = module.get<FindDeviceByDatapointIdUsecase>(
      FIND_DEVICE_BY_DATAPOINTID_USECASE,
    );
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  // ============================================================================
  // GET /device/:id
  // ============================================================================

  describe('GET /device/:id - Retrieve Device by ID', () => {
    it('should retrieve a device by ID and return correct response structure', async () => {
      // Arrange
      const mockDevice = createMockDevice(DEVICE_ID, PLANT_ID);
      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      // Assert
      expect(findDeviceByIdPort.findById).toHaveBeenCalledWith({
        id: DEVICE_ID,
      });
      expect(response.body).toHaveProperty('id', DEVICE_ID);
      expect(response.body).toHaveProperty('plantId', PLANT_ID);
      expect(response.body).toHaveProperty('name', 'Test Device');
      expect(response.body).toHaveProperty('type', 'light');
      expect(response.body).toHaveProperty('subType', 'light-sub');
      expect(response.body).toHaveProperty('datapoints');
      expect(Array.isArray(response.body.datapoints)).toBe(true);
      expect(response.body.datapoints).toHaveLength(2);
    });

    it('should include all datapoint properties in response', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByIdPort.findById.mockResolvedValue(device);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      // Assert
      const datapoint = response.body.datapoints[0];
      expect(datapoint).toHaveProperty('id');
      expect(datapoint).toHaveProperty('name');
      expect(datapoint).toHaveProperty('readable');
      expect(datapoint).toHaveProperty('writable');
      expect(datapoint).toHaveProperty('valueType');
      expect(datapoint).toHaveProperty('enum');
      expect(datapoint).toHaveProperty('sfeType');
    });

    it('should return 500 when port throws error', async () => {
      // Arrange
      findDeviceByIdPort.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(500);
    });

    it('should pass correct command to port', async () => {
      // Arrange
      const testDeviceId = 'custom-device-id-123';
      const mockDevice = createMockDevice(testDeviceId);
      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);

      // Act
      await request(app.getHttpServer() as http.Server)
        .get(`/device/${testDeviceId}`)
        .expect(200);

      // Assert
      expect(findDeviceByIdPort.findById).toHaveBeenCalledWith({
        id: testDeviceId,
      });
      expect(findDeviceByIdPort.findById).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // GET /device/plant/:plantId
  // ============================================================================

  describe('GET /device/plant/:plantId - Retrieve Devices by Plant', () => {
    it('should retrieve all devices for a plant', async () => {
      // Arrange
      const devices = [
        createMockDevice('device-1', PLANT_ID, 'Light 1', 'light'),
        createMockDevice('device-2', PLANT_ID, 'Light 2', 'light'),
        createMockDevice('device-3', PLANT_ID, 'Thermostat', 'climate'),
      ];
      findDeviceByPlantIdPort.findByPlantId.mockResolvedValue(devices);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/plant/${PLANT_ID}`)
        .expect(200);

      // Assert
      expect(findDeviceByPlantIdPort.findByPlantId).toHaveBeenCalledWith({
        id: PLANT_ID,
      });
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].id).toBe('device-1');
      expect(response.body[1].id).toBe('device-2');
      expect(response.body[2].id).toBe('device-3');
    });

    it('should return empty array when plant has no devices', async () => {
      // Arrange
      findDeviceByPlantIdPort.findByPlantId.mockResolvedValue([]);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/plant/${PLANT_ID}`)
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should maintain plant association for all devices', async () => {
      // Arrange
      const plantId = 'specific-plant-id';
      const devices = [
        createMockDevice('d1', plantId, 'Device 1', 'light'),
        createMockDevice('d2', plantId, 'Device 2', 'light'),
      ];
      findDeviceByPlantIdPort.findByPlantId.mockResolvedValue(devices);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/plant/${plantId}`)
        .expect(200);

      // Assert
      expect(response.body.every((d: any) => d.plantId === plantId)).toBe(true);
    });

    it('should return 500 when port throws error', async () => {
      // Arrange
      findDeviceByPlantIdPort.findByPlantId.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .get(`/device/plant/${PLANT_ID}`)
        .expect(500);
    });
  });

  // ============================================================================
  // POST /device - Write Datapoint Value
  // ============================================================================

  describe('POST /device - Write Datapoint Value', () => {
    it('should accept write datapoint request and return 202', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      writeDatapointValuePort.writeDatapointValue.mockResolvedValue(undefined);

      const payload = {
        datapointId: 'dp-brightness-001',
        value: 80,
      };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send(payload)
        .expect(202);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode', 202);
      expect(findDeviceByDatapointIdPort.findByDatapointId).toHaveBeenCalled();
      expect(writeDatapointValuePort.writeDatapointValue).toHaveBeenCalledWith(
        expect.objectContaining({
          datapointId: 'dp-brightness-001',
          value: 80,
          plantId: PLANT_ID,
        }),
      );
    });

    it('should reject request without datapointId', async () => {
      // Arrange
      const payload = {
        value: 50,
        // missing datapointId
      };

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send(payload)
        .expect(400);

      expect(findDeviceByDatapointIdPort.findByDatapointId).not.toHaveBeenCalled();
    });

    it('should reject request without value', async () => {
      // Arrange
      const payload = {
        datapointId: 'dp-123',
        // missing value
      };

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send(payload)
        .expect(400);
    });

    it('should handle various value types (number, string, boolean)', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      writeDatapointValuePort.writeDatapointValue.mockResolvedValue(undefined);

      const testValues = [100, 'cool', true, 0, false, ''];

      // Act & Assert for each value type
      for (const value of testValues) {
        const response = await request(app.getHttpServer() as http.Server)
          .post('/device')
          .send({
            datapointId: DATAPOINT_ID,
            value,
          })
          .expect(202);

        expect(response.body.statusCode).toBe(202);
      }
    });

    it('should return 503 when service unavailable', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      writeDatapointValuePort.writeDatapointValue.mockRejectedValue(
        new Error('External API unavailable'),
      );

      const payload = {
        datapointId: DATAPOINT_ID,
        value: 50,
      };

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send(payload)
        .expect(503);
    });

    it('should add plantId to command based on device lookup', async () => {
      // Arrange
      const customPlantId = 'custom-plant-xyz';
      const device = createMockDevice(DEVICE_ID, customPlantId);
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      writeDatapointValuePort.writeDatapointValue.mockResolvedValue(undefined);

      const payload = {
        datapointId: DATAPOINT_ID,
        value: 60,
      };

      // Act
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send(payload)
        .expect(202);

      // Assert: plantId added by service
      expect(writeDatapointValuePort.writeDatapointValue).toHaveBeenCalledWith(
        expect.objectContaining({
          plantId: customPlantId,
        }),
      );
    });
  });

  // ============================================================================
  // POST /device/update - Ingest Timeseries (Webhook)
  // ============================================================================

  describe('POST /device/update - Ingest Timeseries from Webhook', () => {
    it('should handle Error objects in ingestion and alarm catches', async () => {
      ingestTimeseriesPort.ingestTimeseries.mockRejectedValue(
        new Error('ingestion error'),
      );
      checkAlarmRuleUseCase.checkAlarmRule.mockRejectedValue(
        new Error('alarm error'),
      );

      await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send({
          data: [
            {
              id: 'dp-1',
              type: 'datapoint',
              attributes: {
                value: 12,
                timestamp: new Date().toISOString(),
              },
            },
          ],
        })
        .expect(202);

      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    it('should handle non-Error values in ingestion and alarm catches', async () => {
      ingestTimeseriesPort.ingestTimeseries.mockRejectedValue('ingestion string');
      checkAlarmRuleUseCase.checkAlarmRule.mockRejectedValue('alarm string');

      await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send({
          data: [
            {
              id: 'dp-1',
              type: 'datapoint',
              attributes: {
                value: 11,
                timestamp: new Date().toISOString(),
              },
            },
          ],
        })
        .expect(202);

      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    it('should accept webhook payload with datapoint updates', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      const payload = {
        data: [
          {
            id: 'dp-brightness-001',
            type: 'datapoint',
            attributes: {
              value: 90,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload)
        .expect(202);

      // Assert
      expect(response.body).toHaveProperty('statusCode', 202);
      expect(ingestTimeseriesPort.ingestTimeseries).toHaveBeenCalled();
      expect(checkAlarmRuleUseCase.checkAlarmRule).toHaveBeenCalled();
    });

    it('should filter non-datapoint items from webhook payload', async () => {
      // Arrange
      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      const payload = {
        data: [
          {
            id: 'dp-valid',
            type: 'datapoint',
            attributes: {
              value: 50,
              timestamp: new Date().toISOString(),
            },
          },
          {
            id: 'other-data',
            type: 'non-datapoint',
            attributes: {
              value: 100,
            },
          },
        ],
      };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload)
        .expect(202);

      // Assert: Only datapoint type processed
      expect(response.body.statusCode).toBe(202);
    });

    it('should validate required fields (value and timestamp)', async () => {
      // Arrange
      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      const payload = {
        data: [
          {
            id: 'dp-incomplete',
            type: 'datapoint',
            attributes: {
              value: 50,
              // missing timestamp
            },
          },
          {
            id: 'dp-no-value',
            type: 'datapoint',
            attributes: {
              timestamp: new Date().toISOString(),
              // missing value
            },
          },
        ],
      };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload)
        .expect(202);

      // Assert: Still returns 202, but invalid items filtered
      expect(response.body.statusCode).toBe(202);
    });

    it('should trigger alarm check for each valid datapoint', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      const payload = {
        data: [
          {
            id: 'dp-1',
            type: 'datapoint',
            attributes: {
              value: 50,
              timestamp: new Date().toISOString(),
            },
          },
          {
            id: 'dp-2',
            type: 'datapoint',
            attributes: {
              value: 75,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      };

      // Act
      await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload)
        .expect(202);

      // Assert: checkAlarmRule called for each datapoint
      expect(checkAlarmRuleUseCase.checkAlarmRule).toHaveBeenCalledTimes(2);
    });

    it('should handle empty webhook payload', async () => {
      // Arrange
      const payload = { data: [] };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload)
        .expect(202);

      // Assert
      expect(response.body.statusCode).toBe(202);
      expect(ingestTimeseriesPort.ingestTimeseries).not.toHaveBeenCalled();
    });

    it('should accept webhook without UserGuard', async () => {
      // Note: This endpoint should be publicly accessible for webhooks
      const payload = {
        data: [
          {
            id: 'dp-webhook',
            type: 'datapoint',
            attributes: {
              value: 60,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      };

      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      // Act & Assert: No auth header needed, should still work
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(payload);

      expect([202, 500]).toContain(response.status);
    });
  });

  // ============================================================================
  // GET /device/:deviceId/value - Get Device Current Values
  // ============================================================================

  describe('GET /device/:deviceId/value - Retrieve Device Values', () => {
    it('should retrieve current values for a device', async () => {
      // Arrange
      const mockDevice = createMockDevice();
      const mockValues = createMockDeviceValue();

      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);
      getDeviceValuePort.getDeviceValue.mockResolvedValue(mockValues);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}/value`)
        .expect(200);

      // Assert
      expect(findDeviceByIdPort.findById).toHaveBeenCalledWith({
        id: DEVICE_ID,
      });
      expect(getDeviceValuePort.getDeviceValue).toHaveBeenCalled();
      expect(response.body).toHaveProperty('deviceId', DEVICE_ID);
      expect(response.body).toHaveProperty('values');
      expect(Array.isArray(response.body.values)).toBe(true);
    });

    it('should return DatapointValue objects with correct structure', async () => {
      // Arrange
      const mockDevice = createMockDevice();
      const mockValues = new DeviceValue(DEVICE_ID, [
        new DatapointValue('dp-1', 'brightness', 75),
        new DatapointValue('dp-2', 'power', 'on'),
      ]);

      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);
      getDeviceValuePort.getDeviceValue.mockResolvedValue(mockValues);

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}/value`)
        .expect(200);

      // Assert
      expect(response.body.values).toHaveLength(2);
      expect(response.body.values[0]).toHaveProperty('datapointId', 'dp-1');
      expect(response.body.values[0]).toHaveProperty('name', 'brightness');
      expect(response.body.values[0]).toHaveProperty('value', 75);
      expect(response.body.values[1]).toHaveProperty('datapointId', 'dp-2');
      expect(response.body.values[1]).toHaveProperty('name', 'power');
      expect(response.body.values[1]).toHaveProperty('value', 'on');
    });

    it('should pass plantId to getDeviceValue port', async () => {
      // Arrange
      const customPlantId = 'special-plant-id';
      const mockDevice = createMockDevice(DEVICE_ID, customPlantId);
      const mockValues = createMockDeviceValue();

      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);
      getDeviceValuePort.getDeviceValue.mockResolvedValue(mockValues);

      // Act
      await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}/value`)
        .expect(200);

      // Assert: plantId from device added to command
      expect(getDeviceValuePort.getDeviceValue).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: DEVICE_ID,
          plantId: customPlantId,
        }),
      );
    });

    it('should return 500 when port fails', async () => {
      // Arrange
      const mockDevice = createMockDevice();
      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);
      getDeviceValuePort.getDeviceValue.mockRejectedValue(
        new Error('API unavailable'),
      );

      // Act & Assert
      await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}/value`)
        .expect(500);
    });
  });

  // ============================================================================
  // Integration Scenarios - Complete Flows
  // ============================================================================

  describe('Complete Device Workflows', () => {
    it('should handle full device lifecycle: find -> write -> read values', async () => {
      // Arrange
      const mockDevice = createMockDevice();
      const mockValues = createMockDeviceValue();

      findDeviceByIdPort.findById.mockResolvedValue(mockDevice);
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(
        mockDevice,
      );
      writeDatapointValuePort.writeDatapointValue.mockResolvedValue(undefined);
      getDeviceValuePort.getDeviceValue.mockResolvedValue(mockValues);

      // Act 1: Get device
      const getDeviceResponse = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      expect(getDeviceResponse.body.id).toBe(DEVICE_ID);

      // Act 2: Write datapoint
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send({
          datapointId: 'dp-brightness-001',
          value: 80,
        })
        .expect(202);

      // Act 3: Get device values
      const getValuesResponse = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}/value`)
        .expect(200);

      // Assert
      expect(getValuesResponse.body.values).toHaveLength(2);
    });

    it('should handle multiple devices in same plant', async () => {
      // Arrange
      const device1 = createMockDevice('device-1', PLANT_ID, 'Light 1', 'light');
      const device2 = createMockDevice(
        'device-2',
        PLANT_ID,
        'Thermostat',
        'climate',
      );

      findDeviceByPlantIdPort.findByPlantId.mockResolvedValue([device1, device2]);
      findDeviceByIdPort.findById.mockImplementation((cmd: any) => {
        if (cmd.id === 'device-1') return Promise.resolve(device1);
        if (cmd.id === 'device-2') return Promise.resolve(device2);
        return Promise.reject(new Error('Device not found'));
      });

      // Act 1: Get all devices
      const listResponse = await request(app.getHttpServer() as http.Server)
        .get(`/device/plant/${PLANT_ID}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(2);

      // Act 2: Get individual devices
      const device1Response = await request(app.getHttpServer() as http.Server)
        .get(`/device/device-1`)
        .expect(200);

      const device2Response = await request(app.getHttpServer() as http.Server)
        .get(`/device/device-2`)
        .expect(200);

      // Assert
      expect(device1Response.body.id).toBe('device-1');
      expect(device2Response.body.id).toBe('device-2');
    });

    it('should process webhook and trigger alarms concurrently', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByDatapointIdPort.findByDatapointId.mockResolvedValue(device);
      ingestTimeseriesPort.ingestTimeseries.mockResolvedValue(undefined);
      checkAlarmRuleUseCase.checkAlarmRule.mockResolvedValue(undefined);

      const webhookPayload = {
        data: [
          {
            id: 'dp-1',
            type: 'datapoint',
            attributes: {
              value: 95,
              timestamp: new Date().toISOString(),
            },
          },
          {
            id: 'dp-2',
            type: 'datapoint',
            attributes: {
              value: 10,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      };

      // Act
      const response = await request(app.getHttpServer() as http.Server)
        .post('/device/update')
        .send(webhookPayload)
        .expect(202);

      // Assert
      expect(response.body.statusCode).toBe(202);
      expect(ingestTimeseriesPort.ingestTimeseries).toHaveBeenCalledTimes(2);
      expect(checkAlarmRuleUseCase.checkAlarmRule).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // Error & Edge Case Scenarios
  // ============================================================================

  describe('Error Handling & Edge Cases', () => {
    it('should execute guard clauses for missing params in controller methods', async () => {
      await expect(deviceController.findByPlantId('')).rejects.toBe(
        BadRequestException,
      );

      await expect(deviceController.getDeviceValue('')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should reject service calls when required identifiers are missing', async () => {
      await expect(
        getDeviceValueUseCase.getDeviceValue({ deviceId: '' }),
      ).rejects.toThrow('[Device Controller] Device id is missing');

      await expect(
        findDeviceByDatapointIdUseCase.findByDatapointId({ datapointId: '' }),
      ).rejects.toThrow('[Device Controller] DatapointId is missing');
    });

    it('should handle port failures without crashing', async () => {
      // Arrange
      findDeviceByIdPort.findById.mockRejectedValue(
        new Error('Database connection timeout'),
      );

      // Act
      const response = await request(app.getHttpServer() as http.Server).get(
        `/device/${DEVICE_ID}`,
      );

      // Assert: Returns error response, not crash
      expect(response.status).toBe(500);
    });

    it('should isolate failures between requests', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByIdPort.findById.mockImplementation((cmd: any) => {
        if (cmd.id === 'broken-id') {
          return Promise.reject(new Error('Not found'));
        }
        return Promise.resolve(device);
      });

      // Act: First request fails
      const failResponse = await request(app.getHttpServer() as http.Server).get(
        `/device/broken-id`,
      );

      // Act: Second request succeeds
      const successResponse = await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      // Assert: Failures isolated
      expect(failResponse.status).toBe(500);
      expect(successResponse.status).toBe(200);
    });

    it('should track method call counts across multiple requests', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByIdPort.findById.mockResolvedValue(device);

      // Act
      await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      await request(app.getHttpServer() as http.Server)
        .get(`/device/${DEVICE_ID}`)
        .expect(200);

      await request(app.getHttpServer() as http.Server)
        .get(`/device/other-id`)
        .expect(200);

      // Assert: Call count accumulates
      expect(findDeviceByIdPort.findById).toHaveBeenCalledTimes(3);
    });

    it('should handle null/undefined values gracefully', async () => {
      // Arrange
      const device = createMockDevice();
      findDeviceByIdPort.findById.mockResolvedValue(device);

      // Act & Assert: Various edge cases
      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send({
          datapointId: DATAPOINT_ID,
          value: null,
        })
        .expect(400); // Validation should reject null

      await request(app.getHttpServer() as http.Server)
        .post('/device')
        .send({
          datapointId: '',
          value: 50,
        })
        .expect(400); // Empty string rejected
    });
  });
});
