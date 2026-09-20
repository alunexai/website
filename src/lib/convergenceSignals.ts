import {supabase} from '@lib/supabase';
export {groupConvergenceAlerts, type ConvergenceAlertRow, type ConvergenceCard} from './format';
import type {ConvergenceAlertRow} from './format';

// Same ungated-web-RPC posture as the other two feeds (DESIGN §3.8a/e) -- no
// iOS consumer to gate around.
export async function fetchConvergenceAlerts(): Promise<ConvergenceAlertRow[]> {
  const {data, error} = await supabase.rpc('get_convergence_alerts_web');
  if (error) throw error;
  return data ?? [];
}
