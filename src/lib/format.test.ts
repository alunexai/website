import {describe, it, expect} from 'vitest';
import {
  abbreviatedUSD,
  officersLabel,
  totalBuyDisplay,
  marketCapDisplay,
  peDisplay,
  congressPeDisplay,
  hedgeFundBadge,
  memberDisplayName,
  partyStateLabel,
  groupConvergenceAlerts,
  type BuyAlertRow,
  type CongressAlertRow,
  type ConvergenceAlertRow,
} from './format';

describe('abbreviatedUSD', () => {
  it('formats sub-thousand values with no suffix', () => {
    expect(abbreviatedUSD(0)).toBe('$0');
    expect(abbreviatedUSD(999)).toBe('$999');
  });

  it('formats thousands and trims a trailing .0', () => {
    expect(abbreviatedUSD(1000)).toBe('$1K');
    expect(abbreviatedUSD(1234)).toBe('$1.2K');
  });

  it('formats millions', () => {
    expect(abbreviatedUSD(1_000_000)).toBe('$1M');
    expect(abbreviatedUSD(1_200_000)).toBe('$1.2M');
  });

  it('formats billions', () => {
    expect(abbreviatedUSD(72_800_000_000)).toBe('$72.8B');
  });

  it('formats trillions', () => {
    expect(abbreviatedUSD(1_500_000_000_000)).toBe('$1.5T');
  });

  it('selects the tier at the exact boundary, not one tier early', () => {
    // just under a threshold stays in the lower tier
    expect(abbreviatedUSD(999_000_000)).toBe('$999M');
    // exactly at a threshold moves up
    expect(abbreviatedUSD(1_000_000_000)).toBe('$1B');
  });

  it('keeps the sign on negative values', () => {
    expect(abbreviatedUSD(-1500)).toBe('-$1.5K');
  });
});

describe('officersLabel', () => {
  it('pluralizes based on distinct_officers', () => {
    expect(officersLabel({distinct_officers: 1} as BuyAlertRow)).toBe('1 officer');
    expect(officersLabel({distinct_officers: 3} as BuyAlertRow)).toBe('3 officers');
  });

  it('handles zero as plural, not a falsy special case', () => {
    expect(officersLabel({distinct_officers: 0} as BuyAlertRow)).toBe('0 officers');
  });
});

describe('null handling on a row with no data', () => {
  const emptyRow = {
    total_buy_usd: null,
    market_cap_musd: null,
    min_pe: null,
  } as BuyAlertRow;

  it('renders an em dash for every nullable field', () => {
    expect(totalBuyDisplay(emptyRow)).toBe('—');
    expect(marketCapDisplay(emptyRow)).toBe('—');
    expect(peDisplay(emptyRow)).toBe('—');
  });

  it('treats 0 as a present value, not null', () => {
    const zeroRow = {total_buy_usd: 0, market_cap_musd: 0, min_pe: 0} as BuyAlertRow;
    expect(totalBuyDisplay(zeroRow)).toBe('$0');
    expect(marketCapDisplay(zeroRow)).toBe('$0');
    expect(peDisplay(zeroRow)).toBe('0.0');
  });
});

describe('row-level formatters on realistic data', () => {
  const row = {
    total_buy_usd: 1_400_000,
    market_cap_musd: 65_100, // $ millions -> $65.1B
    min_pe: 26.2076,
  } as BuyAlertRow;

  it('formats the total buy amount', () => {
    expect(totalBuyDisplay(row)).toBe('$1.4M');
  });

  it('scales market cap from millions to a display string', () => {
    expect(marketCapDisplay(row)).toBe('$65.1B');
  });

  it('rounds P/E to one decimal', () => {
    expect(peDisplay(row)).toBe('26.2');
  });
});

describe('marketCapDisplay on a Congressional row', () => {
  it('works the same way it does for a corporate row (shared formatter)', () => {
    const row = {market_cap_musd: 26_083} as CongressAlertRow;
    expect(marketCapDisplay(row)).toBe('$26.1B');
  });

  it('renders an em dash before the row has been enriched', () => {
    const row = {market_cap_musd: null} as CongressAlertRow;
    expect(marketCapDisplay(row)).toBe('—');
  });
});

describe('congressPeDisplay', () => {
  it('rounds pe_ratio to one decimal, distinct from BuyAlertRow\'s min_pe', () => {
    const row = {pe_ratio: 17.2055} as CongressAlertRow;
    expect(congressPeDisplay(row)).toBe('17.2');
  });

  it('renders an em dash when null (not yet enriched, or no Finnhub data e.g. an ETF)', () => {
    expect(congressPeDisplay({pe_ratio: null} as CongressAlertRow)).toBe('—');
  });

  it('treats 0 as a present value, not null', () => {
    expect(congressPeDisplay({pe_ratio: 0} as CongressAlertRow)).toBe('0.0');
  });
});

describe('hedgeFundBadge', () => {
  it('is blank when there is no tracked-fund match (the common case)', () => {
    const row = {hedge_fund_names: null, hedge_fund_latest_period: null} as BuyAlertRow;
    expect(hedgeFundBadge(row)).toBe('');
  });

  it('formats a single fund with its quarter', () => {
    const row = {
      hedge_fund_names: 'ValueAct',
      hedge_fund_latest_period: '2026-06-30',
    } as BuyAlertRow;
    expect(hedgeFundBadge(row)).toBe('ValueAct · Q2 2026');
  });

  it('passes a comma-joined multi-fund match through as-is', () => {
    const row = {
      hedge_fund_names: 'ValueAct, Appaloosa',
      hedge_fund_latest_period: '2026-06-30',
    } as BuyAlertRow;
    expect(hedgeFundBadge(row)).toBe('ValueAct, Appaloosa · Q2 2026');
  });

  it('maps every quarter-end month to the right quarter', () => {
    const badge = (period: string) =>
      hedgeFundBadge({hedge_fund_names: 'X', hedge_fund_latest_period: period} as BuyAlertRow);
    expect(badge('2026-03-31')).toBe('X · Q1 2026');
    expect(badge('2026-06-30')).toBe('X · Q2 2026');
    expect(badge('2026-09-30')).toBe('X · Q3 2026');
    expect(badge('2025-12-31')).toBe('X · Q4 2025');
  });

  it('works identically on a CongressAlertRow (shared formatter)', () => {
    const row = {
      hedge_fund_names: 'Baupost',
      hedge_fund_latest_period: '2026-06-30',
    } as CongressAlertRow;
    expect(hedgeFundBadge(row)).toBe('Baupost · Q2 2026');
  });
});

describe('memberDisplayName', () => {
  it('reformats efdsearch\'s "Last, First (Senator)" into "Sen. First Last"', () => {
    const row = {member_name: 'Boozman, John (Senator)'} as CongressAlertRow;
    expect(memberDisplayName(row)).toBe('Sen. John Boozman');
  });

  it('falls back to the raw string when the shape is unrecognized', () => {
    const row = {member_name: 'something unexpected'} as CongressAlertRow;
    expect(memberDisplayName(row)).toBe('something unexpected');
  });
});

describe('partyStateLabel', () => {
  it('formats party and state together', () => {
    const row = {party: 'R', state: 'AR'} as CongressAlertRow;
    expect(partyStateLabel(row)).toBe('(R-AR)');
  });

  it('is blank when party or state is missing (not yet enriched)', () => {
    expect(partyStateLabel({party: null, state: 'AR'} as CongressAlertRow)).toBe('');
    expect(partyStateLabel({party: 'R', state: null} as CongressAlertRow)).toBe('');
  });
});

describe('groupConvergenceAlerts', () => {
  const row = (overrides: Partial<ConvergenceAlertRow>): ConvergenceAlertRow => ({
    ticker: 'PLTR',
    distinct_officers: 4,
    total_buy_usd: 2_100_000,
    market_cap_musd: 65_000,
    min_pe: 120,
    corporate_latest_buy: '2026-09-10',
    hedge_fund_names: null,
    hedge_fund_latest_period: null,
    member_name: 'Okafor, Rosa (Senator)',
    state: 'TX',
    party: 'R',
    chamber: 'senate',
    congress_amount_range: '$100,001 - $250,000',
    congress_transaction_date: '2026-09-05',
    ...overrides,
  });

  it('returns one card per ticker with the corporate summary carried over', () => {
    const cards = groupConvergenceAlerts([row({})]);
    expect(cards).toHaveLength(1);
    expect(cards[0].ticker).toBe('PLTR');
    expect(cards[0].distinct_officers).toBe(4);
    expect(cards[0].total_buy_usd).toBe(2_100_000);
  });

  it('carries the hedge-fund overlap fields through to the card', () => {
    const cards = groupConvergenceAlerts([
      row({hedge_fund_names: 'ValueAct', hedge_fund_latest_period: '2026-06-30'}),
    ]);
    expect(cards[0].hedge_fund_names).toBe('ValueAct');
    expect(hedgeFundBadge(cards[0])).toBe('ValueAct · Q2 2026');
  });

  it('groups multiple Congressional buyers on the same ticker into one card', () => {
    const cards = groupConvergenceAlerts([
      row({member_name: 'Okafor, Rosa (Senator)'}),
      row({member_name: 'Whitfield, Jordan (Senator)', party: 'D', state: 'CO'}),
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0].members).toHaveLength(2);
    expect(cards[0].members[1].party).toBe('D');
  });

  it('keeps separate tickers as separate cards', () => {
    const cards = groupConvergenceAlerts([
      row({ticker: 'PLTR'}),
      row({ticker: 'NVDA', distinct_officers: 2}),
    ]);
    expect(cards.map(c => c.ticker).sort()).toEqual(['NVDA', 'PLTR']);
  });

  it('returns an empty array for no rows (the common case today)', () => {
    expect(groupConvergenceAlerts([])).toEqual([]);
  });
});
