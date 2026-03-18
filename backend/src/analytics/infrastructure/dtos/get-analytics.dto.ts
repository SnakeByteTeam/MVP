export class GetAnalyticsDto {
    readonly metric: string;
    readonly id: string;

    constructor(metric: string, id: string) {
        this.metric = metric;
        this.id = id;
    }
}
