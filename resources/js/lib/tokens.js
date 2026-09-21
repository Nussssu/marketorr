export const COLORS = {
    grape: '#891FFB',
    iris: '#507AF4',
    frost: '#1BE2EB',
    gradient: 'linear-gradient(90deg, #891FFB 0%, #507AF4 50%, #1BE2EB 100%)',
};

export const STAGES = [
    { key: 'idea', label: 'IDEA', color: COLORS.grape, index: '01' },
    { key: 'experience', label: 'EXPERIENCE', color: COLORS.iris, index: '02' },
    { key: 'result', label: 'RESULT', color: COLORS.frost, index: '03' },
];

/** The brand colours in order, for cycling accents across a variable list. */
export const BRAND_SEQUENCE = [COLORS.grape, COLORS.iris, COLORS.frost];
