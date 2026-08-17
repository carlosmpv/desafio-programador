

export type PayrollPageBase = {
    label: string,
    value: string,
};

export type PayrollPageField = {
    code: string,
    label: string,
    reference: string, // Monetário
    value: string, // Monetário
};

export type PayrollPage = {
    page: number,
    year: string,
    month: string,
    fields: PayrollPageField[],
    bases: PayrollPageBase[],
};

export type Payroll = {
    pages: PayrollPage[]
};

