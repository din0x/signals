// @ts-check

export { state, derived, effect };

/**
 * @type {(() => void)?}
 */
let _observer = null;

/**
 * @type {(() => void)?}
 */
let _effect = null;

/**
 * This signal stores state that can be changed using `set` or `update`.
 * @template T
 * @param {T} state
 */
const state = state => {
    const observers = /** @type {(() => void)[]} */ ([]);
    const effects = /** @type {(() => void)[]} */ ([]);

    const get = () => {
        if (_effect != null && !effects.includes(_effect)) {
            effects.push(_effect);
        }

        if (_observer != null && !observers.includes(_observer)) {
            observers.push(_observer);
        }

        return state;
    };

    /**
     * @param {T} value
     */
    const set = value => {
        state = value;

        for (const observer of observers) {
            observer();
        }

        for (const effect of effects) {
            effect();
        }
    }

    /**
     * @param {(old: T) => T} f 
     */
    const update = f => {
        set(f(state));
    }

    return { get, set, update };
};

/**
 * This signal is lazily evaluated. `f` is call on first usage off `get` after
 * dependencies change.
 * @template T
 * @param {() => T} f
 */
const derived = f => {
    const observers = /** @type {(() => void)[]} */ ([]);
    const effects = /** @type {(() => void)[]} */ ([]);

    let valid = false;
    let state = /** @type {T?} */ (undefined);

    const observer = () => {
        valid = false;

        for (const observer of observers) {
            observer();
        }
        
        for (const effect of effects) {
            effect();
        }
    };

    /**
     * @returns {T}
     * @throws If `f` throws.
     */
    const get = () => {
        if (!valid) {
            const prev = _observer;
            _observer = observer;

            state = f();

            _observer = prev;
            valid = true;
        }

        if (_effect != null && !effects.includes(_effect)) {
            effects.push(_effect);
        }

        if (_observer != null && !observers.includes(_observer)) {
            observers.push(_observer);
        }

        return /** @type {T} */ (state);
    }

    return { get };
};

/**
 * This signal is evaluated every time its dependencies change.
 * @param {() => void} f
 */
const effect = f => {
    if (_effect != null) {
        throw 'Cannot nest `effect`s';
    }

    _effect = () => {
        f();
    };

    f();

    _effect = null;
}
