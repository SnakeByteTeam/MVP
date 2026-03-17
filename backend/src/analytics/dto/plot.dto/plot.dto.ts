import { Plot } from "../../model/plot.model";

export class PlotDto {
    title: string;
    metric: string;
    labels: string[];
    data: string[];

    static fromDomain(p: Plot): PlotDto {
        const dto = new PlotDto();
        dto.title = p.title;
        dto.metric = p.metric;
        dto.labels = p.labels;
        dto.data = p.data;
        return dto;
    }
}
