export interface VimarDatapoint {
  id: string;
  name: string;
  readable: boolean;
  writable: boolean;
  valueType: string;
  enum: string[] | null;
  sfeType: string;
  value?: string;
}
