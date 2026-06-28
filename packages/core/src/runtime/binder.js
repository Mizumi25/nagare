// =========================================================
// NAGARE DOM BINDER
// =========================================================
import { getSoul } from './registry.js';
import { executeBehavior } from './executor.js';
// Continuous behavior names that use onUpdate
const CONTINUOUS_BEHAVIORS = [
    'hover',
    'scroll',
    'drag',
    'resize',
    'press',
    'focus'
];
export function bindSoul(name) {
    const el = document.querySelector(`[data-soul="${name}"]`);
    if (!el) {
        console.warn(`Nagare: no element found with data-soul="${name}"`);
        return;
    }
    const soul = getSoul(name);
    if (!soul) {
        console.warn(`Nagare: soul "${name}" not registered`);
        return;
    }
    soul.domElement = el;
    // Mount default
    if (soul.default) {
        if (soul.default.tw) {
            el.classList.add(...soul.default.tw.classes.trim().split(/\s+/));
        }
        if (soul.default.css) {
            Object.entries(soul.default.css.properties).forEach(([prop, val]) => {
                el.style.setProperty(prop, val);
            });
        }
        if (soul.default.js) {
            try {
                soul.default.js.fn.call({ state: soul.state, el });
            }
            catch (err) {
                console.error(`Nagare: default js block error`, err);
            }
        }
    }
    // Attach behaviors
    soul.behaviors.forEach((behavior, behaviorName) => {
        const params = {};
        if (behaviorName === 'hover') {
            el.addEventListener('mouseenter', () => {
                executeBehavior(el, behavior, soul, params);
            });
            el.addEventListener('mouseleave', () => {
                if (behavior.onEnd) {
                    import('./executor.js').then(({ executeLifecycle }) => {
                        executeLifecycle(el, behavior.onEnd, soul, params);
                    });
                }
            });
        }
        if (behaviorName === 'click') {
            el.addEventListener('click', () => {
                executeBehavior(el, behavior, soul, params);
            });
        }
        if (behaviorName === 'focus') {
            el.addEventListener('focus', () => {
                executeBehavior(el, behavior, soul, params);
            });
            el.addEventListener('blur', () => {
                if (behavior.onEnd) {
                    import('./executor.js').then(({ executeLifecycle }) => {
                        executeLifecycle(el, behavior.onEnd, soul, params);
                    });
                }
            });
        }
        if (behaviorName === 'press') {
            el.addEventListener('mousedown', () => {
                executeBehavior(el, behavior, soul, params);
            });
            el.addEventListener('mouseup', () => {
                if (behavior.onEnd) {
                    import('./executor.js').then(({ executeLifecycle }) => {
                        executeLifecycle(el, behavior.onEnd, soul, params);
                    });
                }
            });
        }
        if (behaviorName === 'onMount') {
            executeBehavior(el, behavior, soul, params);
        }
        if (behaviorName === 'onVisible' || behaviorName === 'onInvisible') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && behaviorName === 'onVisible') {
                        executeBehavior(el, behavior, soul, params);
                    }
                    if (!entry.isIntersecting && behaviorName === 'onInvisible') {
                        executeBehavior(el, behavior, soul, params);
                    }
                });
            });
            observer.observe(el);
        }
        if (behaviorName === 'scroll') {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                executeBehavior(el, behavior, soul, { ...params, scrollY });
            });
        }
        if (behaviorName === 'drag') {
            el.addEventListener('dragstart', () => {
                executeBehavior(el, behavior, soul, params);
            });
            el.addEventListener('dragend', () => {
                if (behavior.onEnd) {
                    import('./executor.js').then(({ executeLifecycle }) => {
                        executeLifecycle(el, behavior.onEnd, soul, params);
                    });
                }
            });
        }
        if (behaviorName === 'resize') {
            window.addEventListener('resize', () => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                executeBehavior(el, behavior, soul, { ...params, width, height });
            });
        }
    });
}
export function bindAll() {
    const elements = document.querySelectorAll('[data-soul]');
    elements.forEach(el => {
        const name = el.getAttribute('data-soul');
        if (name)
            bindSoul(name);
    });
}
//# sourceMappingURL=binder.js.map