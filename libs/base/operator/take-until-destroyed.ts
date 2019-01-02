import {Observable, Subject, MonoTypeOperatorFunction} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface IDestroyedStreamOptions {
  initMethod?: Function;
  destroyMethod?: Function;
  constructorInit?: boolean;
}

const DESTROYED_STREAM_DEFAULT_NAME = '_destroyed_';
const DEFAULT_DESTROY_METHOD_NAME = 'ngOnDestroy';

/**
 * Rxjs operator. By default uses `ngOnDestroy` as destroy method and init destroy stream once.
 *
 * For other cases use `options` param.
 *
 * ### Usage example
 * ```
 * // regular case
 * takeUntilDestroyed(this)
 *
 * // non-component or custom init/destroy methods
 * takeUntilDestroyed(this, { initMethod: this.init, destroyMethod: this.destroy })
 * ```
 */
export function takeUntilDestroyed<T>(target: any, options: IDestroyedStreamOptions = {}): MonoTypeOperatorFunction<T> {
  if (options.initMethod && !options.destroyMethod) {
    throwError(target, `Missed destroy method in options object`);
  }

  if (options.destroyMethod && !options.initMethod && !options.constructorInit) {
    throwError(target, `Missed init method in options object`);
  }

  const initMethodName = options.initMethod
    ? getClassMethodName(target, options.initMethod) || DEFAULT_DESTROY_METHOD_NAME
    : null;
  const destroyMethodName = options.destroyMethod
    ? getClassMethodName(target, options.destroyMethod) || DEFAULT_DESTROY_METHOD_NAME
    : DEFAULT_DESTROY_METHOD_NAME;
  // NOTE: we need separate destroy streams based on used init method
  const destroyedStreamName = DESTROYED_STREAM_DEFAULT_NAME + initMethodName;

  if (!target[destroyedStreamName]) {
    setupDestroyedStream(target, destroyedStreamName, initMethodName, destroyMethodName);
  }

  return (source: Observable<T>) => {
    return source.pipe(
      takeUntil(target[destroyedStreamName]),
    );
  };
}

function setupDestroyedStream(
  target: any,
  destroyedStreamName: string,
  initMethodName: string | null,
  destroyMethodName: string
) {
  // initial destroy stream setup
  target[destroyedStreamName] = new Subject<void>();

  // re-assign init method to re-init destroy stream on each call (previous one can be already completed)
  if (initMethodName) {
    const originalInitMethod = target[initMethodName];

    if (!originalInitMethod) {
      throwError(target, `Missed init method '${initMethodName}'`);
    }

    target[initMethodName] = function() {
      target[destroyedStreamName] = new Subject<void>();

      return originalInitMethod.call(this);
    };
  }

  // re-assign destroy method for destroy stream completion
  const originalDestroyMethod = target[destroyMethodName];

  if (!originalDestroyMethod) {
    throwError(target, `Missed destroy method '${destroyMethodName}'`);
  }

  target[destroyMethodName] = function() {
    const originalResult = originalDestroyMethod.call(this);

    if (this[destroyedStreamName]) {
      this[destroyedStreamName].next();
      this[destroyedStreamName].complete();
    }

    return originalResult;
  };
}

function throwError(target: any, textPart: string): void {
  throw new Error(`takeUntilDestroyed: ${textPart} in '${target.constructor.name}'`);
}

function getClassMethodName(classObj: any, method: Function): string | null {
  const methodName = Object.getOwnPropertyNames(classObj).find(prop => classObj[prop] === method);

  if (methodName) {
    return methodName;
  }

  const proto = Object.getPrototypeOf(classObj);
  if (proto) {
    return getClassMethodName(proto, method);
  }

  return null;
}
