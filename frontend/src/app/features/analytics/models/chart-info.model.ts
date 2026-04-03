import { ChartDatasetDto } from "./chart-dataset.model";
import { EnergySavingSuggestionDto } from "./energy-saving-suggestion.model";

export interface ChartInfoDto {
    labels: string[];
    datasets: ChartDatasetDto[];
    title: string;
    unit: string;
    suggestions: EnergySavingSuggestionDto;
    metric: string;
}
