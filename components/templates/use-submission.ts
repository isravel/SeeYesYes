'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SubmissionStatus = 'idle' | 'pending' | 'failed' | 'success';

/**
 * The pending, failed and success states of one user-started action. Nothing runs until `run` is called, a second call while one is pending is ignored,
 * and a rejected or throwing action only marks the status `failed`: the error itself is never read or shown, so a backend message cannot leak account details.
 */
export function useSubmission(initial: SubmissionStatus = 'idle') {
  const [status, setStatus] = useState<SubmissionStatus>(initial);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const run = useCallback(async (action: () => void | Promise<void>): Promise<boolean> => {
    if (busy.current) return false;
    busy.current = true;
    setStatus('pending');
    try {
      await action();
      if (mounted.current) setStatus('success');
      return true;
    } catch {
      if (mounted.current) setStatus('failed');
      return false;
    } finally { busy.current = false; }
  }, []);
  const reset = useCallback(() => setStatus('idle'), []);
  return { status, run, reset };
}
