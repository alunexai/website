import {supabase} from '@lib/supabase';
export {
  memberDisplayName,
  partyStateLabel,
  marketCapDisplay,
  congressPeDisplay,
  fundBuyingLine,
  type CongressAlertRow,
} from './format';
import type {CongressAlertRow} from './format';

// congress_buy_alerts_v1 isn't anon-readable (same posture as buy_alerts_v1,
// DESIGN §3.8a) -- reads go through get_congress_alerts_web(), which goes
// straight to the ungated end state since there's no iOS consumer to gate
// around (DESIGN §3.8b).
export async function fetchCongressAlerts(): Promise<CongressAlertRow[]> {
  const {data, error} = await supabase.rpc('get_congress_alerts_web');
  if (error) throw error;
  return data ?? [];
}
