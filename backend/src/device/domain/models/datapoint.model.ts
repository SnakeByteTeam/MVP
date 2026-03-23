export class Datapoint {
    private id: string;
    private name: string;
    private readable: boolean;
    private writable: boolean;
    private valueType: string;
    private enum: string[];
    private sfeType: string;  

    constructor(
        id: string,
        name: string,
        readable: boolean,
        writable: boolean,
        valueType: string,
        enumValues: string[],
        sfeType: string,
    ) {
        this.id = id;
        this.name = name;
        this.readable = readable;
        this.writable = writable;
        this.valueType = valueType;
        this.enum = [...enumValues];
        this.sfeType = sfeType;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    isReadable(): boolean {
        return this.readable;
    }

    isWritable(): boolean {
        return this.writable;
    }

    getValueType(): string {
        return this.valueType;
    }

    getEnum(): string[] {
        return [...this.enum];
    }

    getSfeType(): string {
        return this.sfeType;
    }
}