export class UpdateUserCmd {
    constructor(
        public id: number,
        public username: string,
        public surname: string,
        public name: string,
        public role: string
    ){}
}
