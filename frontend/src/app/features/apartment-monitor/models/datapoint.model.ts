export interface Datapoint {
	id: string;
	name: string;
	readable: boolean;
	writable: boolean;
	valueType: string;
	enum: string[];
	sfeType: string;
}