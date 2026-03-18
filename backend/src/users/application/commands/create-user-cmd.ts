export class CreateUserCmd {
    constructor(
        public username: string,
        public surname: string,
        public name: string,
        public role: string,
        public tempPassword: string
    ){}
}
