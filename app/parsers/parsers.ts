

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

export interface IPayrollParser {
    parse(fileData: Uint8Array<ArrayBufferLike>): Promise<Payroll>
}

export type TimeCardDayPunch = {
    kind: 'IN' | 'OUT',
    time_raw: string,
    time_hhmm: string,
};

export type TimeCardDay = {
    date_raw: string,
    punches: TimeCardDayPunch[],
}

export type TimeCardPage = {
    page: number,
}

export type TimeCard = {
    pages: TimeCardPage[],
};

export interface ITimeCardParser {
    parse(fileData: Uint8Array<ArrayBufferLike>): Promise<TimeCard>
}