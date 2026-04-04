export class DeviceValue {
  private readonly deviceId: string;
  private readonly values: DatapointValue[];

  constructor(deviceId: string, values: DatapointValue[]) {
    this.deviceId = deviceId;
    this.values = [...values];
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  getValues(): DatapointValue[] {
    return [...this.values];
  }
}

export class DatapointValue {
  private readonly datapointId: string;
  private readonly name: string;
  private readonly value: string | number;

  constructor(datapointId: string, name: string, value: string | number) {
    this.datapointId = datapointId;
    this.name = name;
    this.value = value;
  }

  getDatapointId(): string {
    return this.datapointId;
  }

  getName(): string {
    return this.name;
  }

  getValue(): string | number {
    return this.value;
  }
}
