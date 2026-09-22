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
  // Hedge-fund 13F conviction weight (insider-trading-app DESIGN §3.9) -- a
  // boost on this row, never a filter. Both null when no tracked fund (of 5
  // curated) added/increased this ticker within the 180-day lookback; that's
  // the common case, not an error condition. hedge_fund_names is comma-joined
  // when more than one fund matches.
  hedge_fund_names: string | null;
  hedge_fund_latest_period: string | null; // quarter-end date, e.g. "2026-06-30"
  // Short display name ("ValueAct", not "ValueAct Holdings, L.P.") and which
  // condition fired. hedge_fund_action is null when the matching funds
  // disagree -- one opened a position while another increased -- because no
  // single verb is true of both.
  hedge_fund_short_names: string | null;
  hedge_fund_action: string | null; // "new" | "increased" | null
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

export function officersLabel(row: Pick<BuyAlertRow, 'distinct_officers'>): string {
  return `${row.distinct_officers} officer${row.distinct_officers === 1 ? '' : 's'}`;
}

export function totalBuyDisplay(row: BuyAlertRow): string {
  return row.total_buy_usd == null ? '—' : abbreviatedUSD(row.total_buy_usd);
}

// market_cap_musd is in millions USD; render as "$72.8B". Shared by corporate
// and Congressional rows (both carry the same field, same units, same
// point-in-time-at-detection semantics — insider-trading-app DESIGN §3.5) --
// takes just the field it needs so one function serves both row shapes.
export function marketCapDisplay(row: {market_cap_musd: number | null}): string {
  return row.market_cap_musd == null ? '—' : abbreviatedUSD(row.market_cap_musd * 1_000_000);
}

function formatPe(pe: number | null): string {
  return pe == null ? '—' : pe.toFixed(1);
}

// BuyAlertRow's min_pe is an aggregate (lowest P/E across the ticker's
// clustered officer buys, buy_alerts_v1); CongressAlertRow's pe_ratio (below)
// is a single per-transaction value -- genuinely different fields, not a
// naming inconsistency, hence the two thin wrappers over one formatter.
export function peDisplay(row: Pick<BuyAlertRow, 'min_pe'>): string {
  return formatPe(row.min_pe);
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
  // Same point-in-time-at-detection company snapshot the corporate rows show
  // (Finnhub via enrich-signals, insider-trading-app DESIGN §3.5) -- added for
  // UX parity between the two feeds. Null for a ticker Finnhub has no
  // fundamentals for (e.g. an ETF, which shouldn't reach this view anyway
  // per §3.8d, but nulls are tolerated rather than assumed impossible).
  market_cap_musd: number | null;
  pe_ratio: number | null;
  hedge_fund_names: string | null;
  hedge_fund_latest_period: string | null;
  hedge_fund_short_names: string | null;
  hedge_fund_action: string | null;
};

/// "Boozman, John (Senator)" -> "Sen. John Boozman". Falls back to the raw
/// member_name unchanged if it doesn't match the expected shape, rather than
/// mangling a name the parser doesn't recognize. Takes just the field it
/// needs (not the full CongressAlertRow) so it also works on a convergence
/// card's per-member entries.
export function memberDisplayName(row: Pick<CongressAlertRow, 'member_name'>): string {
  const m = row.member_name.match(/^([^,]+),\s*(.+?)\s*\(Senator\)$/);
  if (!m) return row.member_name;
  const [, last, first] = m;
  return `Sen. ${first} ${last}`;
}

/// "(R-AR)" -- resolved as fine to show (party + state), per the design doc's
/// UX decision. "" when either is missing (not yet enriched / no match).
export function partyStateLabel(row: Pick<CongressAlertRow, 'party' | 'state'>): string {
  if (!row.party || !row.state) return '';
  return `(${row.party}-${row.state})`;
}

export function congressPeDisplay(row: Pick<CongressAlertRow, 'pe_ratio'>): string {
  return formatPe(row.pe_ratio);
}

// "2026-03-31" -> "Mar 31". 13F reports a position as of quarter-end, so the
// row says "as of <date>" rather than a transaction date -- the whole point is
// that this is a snapshot, not a dated trade like a Form 4 or a PTR.
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function asOfLabel(periodOfReport: string): string {
  const [, month, day] = periodOfReport.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

/// "Appaloosa, Pershing Square" -> "Appaloosa and Pershing Square".
/// The view comma-joins; English doesn't.
function fundNamesLabel(funds: string[]): string {
  if (funds.length === 1) return funds[0];
  return `${funds.slice(0, -1).join(', ')} and ${funds[funds.length - 1]}`;
}

/// The supporting-signal line: "Fund buying: ValueAct opened a new position ·
/// as of Mar 31".
///
/// Leads with the CATEGORY, not the fund. A reader who has never heard of
/// ValueAct still learns that a fund bought this stock, and "Fund buying"
/// echoes the page's own "Insider Buying" / "Congressional buying" headings, so
/// it needs no new vocabulary. The previous version rendered the fund's legal
/// name alone, directly under the ticker, where a reader expects "what is this
/// company" -- so "WIX / ValueAct Holdings, L.P." read as a parent or
/// subsidiary rather than a different investor. It also had no verb, while
/// every other line on the page has one.
///
/// Returns '' when there's no match so the caller omits the line entirely.
/// Absence is uninformative -- most tickers have no tracked-fund match -- and
/// an empty placeholder would make it read as a negative.
export function fundBuyingLine(
  row: {
    hedge_fund_names: string | null;
    hedge_fund_short_names: string | null;
    hedge_fund_action: string | null;
    hedge_fund_latest_period: string | null;
  },
): string {
  if (!row.hedge_fund_latest_period) return '';
  const asOf = asOfLabel(row.hedge_fund_latest_period);

  // Fall back to the legal name if short names aren't present. The two are
  // populated together by the view, but a migration and a deploy don't land at
  // the same instant -- a served-from-cache response during that window should
  // degrade rather than drop the line.
  //
  // The fallback does NOT split on commas or add a verb. Legal names contain
  // them ("ValueAct Holdings, L.P."), so splitting would render "ValueAct
  // Holdings and L.P." as two funds. Short names never do, which is exactly
  // why the view comma-joins them.
  if (!row.hedge_fund_short_names) {
    return row.hedge_fund_names
      ? `Fund buying: ${row.hedge_fund_names} · as of ${asOf}`
      : '';
  }

  const funds = row.hedge_fund_short_names.split(',').map(f => f.trim()).filter(Boolean);
  if (!funds.length) return '';

  // Only attach a verb for a single fund. With two, the action is usually null
  // anyway (the view suppresses it when funds disagree), but even when both
  // funds did the same thing "Appaloosa and Pershing Square increased its
  // stake" doesn't parse -- so multi-fund just names them.
  let verb = '';
  if (funds.length === 1) {
    if (row.hedge_fund_action === 'new') verb = ' opened a new position';
    else if (row.hedge_fund_action === 'increased') verb = ' increased its stake';
  }

  return `Fund buying: ${fundNamesLabel(funds)}${verb} · as of ${asOf}`;
}

// Mirrors insider-trading-app's convergence_alerts_v1 view (DESIGN §3.8e): a
// ticker with both a qualifying corporate buy and a qualifying Congressional
// buy. One row per (ticker, Congressional transaction) -- a ticker with two
// Senators buying arrives as two rows sharing the same corporate summary.
export type ConvergenceAlertRow = {
  ticker: string;
  distinct_officers: number;
  total_buy_usd: number | null;
  market_cap_musd: number | null;
  min_pe: number | null;
  corporate_latest_buy: string;
  hedge_fund_names: string | null;
  hedge_fund_latest_period: string | null;
  hedge_fund_short_names: string | null;
  hedge_fund_action: string | null;
  member_name: string;
  state: string | null;
  party: string | null;
  chamber: string;
  congress_amount_range: string;
  congress_transaction_date: string;
};

export type ConvergenceCard = {
  ticker: string;
  distinct_officers: number;
  total_buy_usd: number | null;
  market_cap_musd: number | null;
  min_pe: number | null;
  corporate_latest_buy: string;
  hedge_fund_names: string | null;
  hedge_fund_latest_period: string | null;
  hedge_fund_short_names: string | null;
  hedge_fund_action: string | null;
  members: Array<{
    member_name: string;
    state: string | null;
    party: string | null;
    chamber: string;
    amount_range: string;
    transaction_date: string;
  }>;
};

/// Groups the flat (ticker, Congressional transaction) rows into one card per
/// ticker, each carrying every Congressional buyer who converged on it.
export function groupConvergenceAlerts(rows: ConvergenceAlertRow[]): ConvergenceCard[] {
  const byTicker = new Map<string, ConvergenceCard>();
  for (const r of rows) {
    let card = byTicker.get(r.ticker);
    if (!card) {
      card = {
        ticker: r.ticker,
        distinct_officers: r.distinct_officers,
        total_buy_usd: r.total_buy_usd,
        market_cap_musd: r.market_cap_musd,
        min_pe: r.min_pe,
        corporate_latest_buy: r.corporate_latest_buy,
        hedge_fund_names: r.hedge_fund_names,
        hedge_fund_latest_period: r.hedge_fund_latest_period,
        hedge_fund_short_names: r.hedge_fund_short_names,
        hedge_fund_action: r.hedge_fund_action,
        members: [],
      };
      byTicker.set(r.ticker, card);
    }
    card.members.push({
      member_name: r.member_name,
      state: r.state,
      party: r.party,
      chamber: r.chamber,
      amount_range: r.congress_amount_range,
      transaction_date: r.congress_transaction_date,
    });
  }
  return [...byTicker.values()];
}
