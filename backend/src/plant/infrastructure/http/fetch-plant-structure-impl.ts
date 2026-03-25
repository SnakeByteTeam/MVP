import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { FetchPlantStructureRepo } from "src/plant/application/repository/fetch-plant-structure.repository";
import { PlantDto } from "../dtos/plant.dto";
import { RoomDto } from "../dtos/room.dto";
import { DeviceDto } from "src/device/infrastructure/dtos/device.dto";
import { DatapointDto } from "src/device/infrastructure/dtos/datapoint.dto";



export class FetchPlantStructureImpl implements FetchPlantStructureRepo {

    private readonly API_DOMAIN = process.env.HOST3 || "";

    constructor(
        private readonly httpService: HttpService
    ) {}

    async fetch(validToken: string, plantId: string): Promise<PlantDto | null> {
        let plantdto: PlantDto = new PlantDto();

        const response  = await firstValueFrom(this.httpService.get(
                `${this.API_DOMAIN}/${plantId}/locations`, 
                { headers: {Authorization: `Bearer ${validToken}`}},
            )
        );

        if(!response.data) return null;

        plantdto.id = plantId; 
        plantdto.name = response.data?.data?.attributes?.title; 
        plantdto.rooms = response.data?.data.map(async ( room: any ) => await this.fetchRoom(validToken, plantId, room))

        return plantdto;
    }
    
    private async fetchRoom(validToken: string, plantId: string, room: any): Promise<RoomDto | null> {
        let roomdto: RoomDto = new RoomDto();

        roomdto.id = room?.id;
        roomdto.name = room?.attributes?.title;

        const response  = await firstValueFrom(this.httpService.get(
                `${this.API_DOMAIN}/${plantId}/locations/${roomdto.id}/functions`, 
                { headers: {Authorization: `Bearer ${validToken}`}},
            )
        );

        if(!response.data) return null;

        roomdto.devices = response.data?.data.map(async (device: any) => await this.fetchDevice(validToken, plantId, device));

        return roomdto;
    }

    private async fetchDevice(validToken: string, plantId: string, device: any): Promise<DeviceDto | null> {
        let devicedto: DeviceDto = new DeviceDto();

        devicedto.id = device?.id;
        devicedto.name = device?.attributes?.title;
        devicedto.plantId = plantId;
        devicedto.type = device?.meta['vimar:ssType'];
        devicedto.type = device?.meta['vimar:sfType'];

        const response  = await firstValueFrom(this.httpService.get(
                `${this.API_DOMAIN}/${plantId}/functions/${devicedto.id}/datapoints`, 
                { headers: {Authorization: `Bearer ${validToken}`}},
            )
        );

        if(!response.data) return null;

        devicedto.datapoints = response.data?.data.map(async (dp: any) => await this.fetchDatapoint(dp));

        return devicedto;
    }

    private async fetchDatapoint(datapoint: any): Promise<DatapointDto | null> {
        let datapointdto: DatapointDto = {
            id: datapoint?.id, 
            name: datapoint?.attributes?.title,
            readable: datapoint?.attributes?.readable,
            writable: datapoint?.attributes?.writable,
            enum: datapoint?.attributes?.enum,
            valueType: datapoint?.attributes?.valueType,
            sfeType: datapoint?.meta['vimar:sfeType']
        }

        if(!datapointdto) return null;

        return datapointdto;
    }
}