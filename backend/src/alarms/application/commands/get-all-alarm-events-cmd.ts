export class GetAllAlarmEventsCmd {
    constructor(
        public limit: number = 5, 
        public offset: number = 0
    ){}
}
