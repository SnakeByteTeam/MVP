import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class DecoderPasswordService {

    public decodeTempPassword(tempPassword: string): string {
        const normalized = tempPassword.trim();
        const isBase64Like = /^[A-Za-z0-9+/]+={0,2}$/.test(normalized) && normalized.length % 4 === 0;

        if (!isBase64Like) {
            return tempPassword;
        }

        try {
            return atob(normalized);
        } catch {
            return tempPassword;
        }
    }

}