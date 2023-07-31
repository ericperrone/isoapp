export interface ChemComponent {
    component: string;
    value: string;
    isIsotope: boolean;
    um?: string;
}

export interface SampleElement {
    field: string;
    value?: string;
}

export interface Sample {
    fields: Array<SampleElement>;
    components: Array<ChemComponent>;
}

export interface Helper {
    attributes: Array<SampleElement>;
}

