export class ChangeCredentialsCmd {
    constructor(
        public username: string,
        public newPassword: string,
        public firstAccess: boolean
    ){}
}
