import {describe, it, expect} from 'vitest';
import {
  abbreviatedUSD,
  officersLabel,
  totalBuyDisplay,
  marketCapDisplay,
  peDisplay,
  type BuyAlertRow,
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
