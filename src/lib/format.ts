// Pure display-formatting helpers, split out from insiderSignals.ts so they
// carry no side-effecting imports (no Supabase client) and are unit-testable
// with zero setup. Mirrors insider-trading-app's Swift formatting rules
// (InsiderCore's Presentation.swift), so the web page reads the same as the
// iOS app.
export type BuyAlertRow = {
  ticker: string;
  num_buys: number;
  distinct_officers: number;
  total_buy_usd: number | null;
  market_cap_musd: number | null;
  buy_bps_of_mktcap: number | null;
  avg_pct_of_holdings: number | null;
  min_pe: number | null;
  latest_buy: string; // date, e.g. "2026-09-18"
};

/// Abbreviate a USD amount: 1234 -> "$1.2K", 7.28e10 -> "$72.8B". One decimal,
/// trailing ".0" stripped. Mirrors InsiderCore's abbreviatedUSD.
export function abbreviatedUSD(value: number): string {
  const sign = value < 0 ? '-' : '';
  const a = Math.abs(value);
  let scaled: number;
  let suffix: string;
  if (a >= 1e12) {
    [scaled, suffix] = [a / 1e12, 'T'];
  } else if (a >= 1e9) {
    [scaled, suffix] = [a / 1e9, 'B'];
  } else if (a >= 1e6) {
    [scaled, suffix] = [a / 1e6, 'M'];
  } else if (a >= 1e3) {
    [scaled, suffix] = [a / 1e3, 'K'];
  } else {
    [scaled, suffix] = [a, ''];
  }
  const s = scaled.toFixed(1);
  const trimmed = s.endsWith('.0') ? s.slice(0, -2) : s;
  return `${sign}$${trimmed}${suffix}`;
}

export function officersLabel(row: BuyAlertRow): string {
  return `${row.distinct_officers} officer${row.distinct_officers === 1 ? '' : 's'}`;
}

export function totalBuyDisplay(row: BuyAlertRow): string {
  return row.total_buy_usd == null ? '—' : abbreviatedUSD(row.total_buy_usd);
}

// market_cap_musd is in millions USD; render as "$72.8B".
export function marketCapDisplay(row: BuyAlertRow): string {
  return row.market_cap_musd == null ? '—' : abbreviatedUSD(row.market_cap_musd * 1_000_000);
}

export function peDisplay(row: BuyAlertRow): string {
  return row.min_pe == null ? '—' : row.min_pe.toFixed(1);
}

// Mirrors insider-trading-app's congress_buy_alerts_v1 view (DESIGN §3.8b/c).
// Amounts are disclosed ranges (PTR reporting rule), not exact dollars like
// Form 4 -- shown as-is per the resolved UX decision (no extra treatment).
export type CongressAlertRow = {
  ticker: string;
  member_name: string; // efdsearch's own "Lastname, Firstname (Senator)" format
  state: string | null;
  party: string | null; // "D" | "R" | "I"
  chamber: string;
  asset_name: string | null;
  amount_range: string;
  transaction_date: string; // date, e.g. "2026-08-27"
  filed_date: string | null;
};

/// "Boozman, John (Senator)" -> "Sen. John Boozman". Falls back to the raw
/// member_name unchanged if it doesn't match the expected shape, rather than
/// mangling a name the parser doesn't recognize.
export function memberDisplayName(row: CongressAlertRow): string {
  const m = row.member_name.match(/^([^,]+),\s*(.+?)\s*\(Senator\)$/);
  if (!m) return row.member_name;
  const [, last, first] = m;
  return `Sen. ${first} ${last}`;
}

/// "(R-AR)" -- resolved as fine to show (party + state), per the design doc's
/// UX decision. "" when either is missing (not yet enriched / no match).
export function partyStateLabel(row: CongressAlertRow): string {
  if (!row.party || !row.state) return '';
  return `(${row.party}-${row.state})`;
}
