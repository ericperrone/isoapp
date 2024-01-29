export interface ModalParams {
    headerText?: string;
    bodyText?: string;
    list?: Array<DataListItem>;
    choices?: Array<ExclusiveChoice>;
    anyParams?: any;
}

export interface DataListItem {
    key: string;
    value: string;
}

export interface ExclusiveChoice {
    text: string;
    value: number;
    color?: string;
    icon?: string;
}

export const CONFIRM = 'confirm';
export const CANCEL = 'cancel';