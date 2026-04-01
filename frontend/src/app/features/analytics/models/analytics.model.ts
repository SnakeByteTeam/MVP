import { ChartInfoDto } from "./chart-info.model";

export interface AnalyticsDto {
    apartmentId: string;
    analyticsInfo: ChartInfoDto[];
}
