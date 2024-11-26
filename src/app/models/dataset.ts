export interface Dataset {
    fileName: string;
    keywords: string;
    id?: number;
    ref: string;
    authors: string;
    year: number;
    processed: boolean;
    metadata: string;
}