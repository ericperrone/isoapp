export interface ModalParams {
    headerText?: string;
    bodyText?: string;
    choices?: Array<ExclusiveChoice>;
}

export interface ExclusiveChoice {
    text: string;
    value: number;
    color?: string;
}

export const CONFIRM = 'confirm';
export const CANCEL = 'cancel';