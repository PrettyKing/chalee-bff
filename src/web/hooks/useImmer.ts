
import { useCallback, useState } from 'react';
import { Draft, freeze, produce } from 'immer';

export type DraftFunction<T> = (draft: Draft<T>) => void;

export type Updater<S> = (f: DraftFunction<S> | S) => void;
export type ImmerHooks<S> = [S, Updater<S>];
export function useImmer<S = unknown>(initialValue: S | (() => S)): ImmerHooks<S>;

export function useImmer<T>(initialValue: T) {
    const [value, updateValue] = useState<T>(
        freeze(typeof initialValue === 'function' ? initialValue() : initialValue, true)
    );

    return [
        value,
        useCallback(
            (updater: T | DraftFunction<T>) => {
                if (typeof updater === 'function') {
                    updateValue(produce(updater as DraftFunction<T>));
                } else {
                    updateValue(freeze(updater));
                }
            },
            []
        )
    ]
}