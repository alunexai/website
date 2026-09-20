import {supabase} from '@lib/supabase';

// Mirrors insider-trading-app's buy_alerts_v1 view (public, anon-readable —
// DESIGN.md §3.8) and its Swift display-formatting rules (InsiderCore's
// Presentation.swift), so the web page reads the same as the iOS app.
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

// buy_alerts_v1 itself isn't anon-readable (insider-trading-app DESIGN §3.8a) —
// all client reads go through a gated RPC. get_buy_alerts() is iOS-only (it
// fails closed on the X-App-Version header, which a browser never sends), so
// the web channel uses get_buy_alerts_web(), which reads the same view with
// no version check (insider-trading-app PR #26).
export async function fetchBuyAlerts(): Promise<BuyAlertRow[]> {
  const {data, error} = await supabase.rpc('get_buy_alerts_web');
  if (error) throw error;
  return data ?? [];
}

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
