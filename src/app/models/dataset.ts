export interface Dataset {
    fileName: string;
    metadata: string;
    id?: number;
    ref: string;
    authors: string;
    year: number;
    processed: boolean;
}