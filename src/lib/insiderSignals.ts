import {supabase} from '@lib/supabase';
export {abbreviatedUSD, officersLabel, totalBuyDisplay, marketCapDisplay, peDisplay, type BuyAlertRow} from './format';
import type {BuyAlertRow} from './format';

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
