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
