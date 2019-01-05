import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * Synchronously get last value from stream
 */
export function getStreamValue<T>(stream$: Observable<T>): T {
  let hasValue = false;
  let value: T | null = null;

  stream$.pipe(
      take(1),
    )
    .subscribe(streamValue => {
      hasValue = true;
      value = streamValue;
    });

  if (!hasValue) {
    throw new Error('getStreamValue is called with stream that does not produce last value on subscribe');
  }

  return value!;
}
