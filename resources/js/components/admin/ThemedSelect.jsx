import { Children, isValidElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const BRAND_GRADIENT = 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))';

/** The text inside an <option>, however it was written in JSX. */
function textOf(node) {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(textOf).join('');

    return isValidElement(node) ? textOf(node.props.children) : '';
}

/**
 * The <option> and <optgroup> children as a flat list: group headings and
 * choosable options, in order.
 *
 * @returns {Array<{ type: 'group', label: string } | { type: 'option', value: string, label: string, disabled: boolean }>}
 */
function readOptions(children) {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement(child)) return [];

        if (child.type === 'optgroup') {
            return [{ type: 'group', label: String(child.props.label ?? '') }, ...readOptions(child.props.children)];
        }

        if (child.type === 'option') {
            const label = textOf(child.props.children);

            return [{ type: 'option', value: String(child.props.value ?? label), label, disabled: Boolean(child.props.disabled) }];
        }

        return [];
    });
}

/**
 * The admin's dropdown in the site theme, a drop-in for a native <select>:
 * same `value`, `onChange(event)` (read `event.target.value`), `disabled` and
 * <option>/<optgroup> children. The trigger matches the other fields; the open
 * list is the theme surface with a brand-gradient highlight and a dot on the
 * chosen option, as on the Inquiries filters. Arrow keys, Enter, Space,
 * Home/End and Escape work as they do on a native select.
 */
export default function ThemedSelect({ value, onChange, disabled = false, className = '', children, name, id, 'aria-label': ariaLabel, ...rest }) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [menuPosition, setMenuPosition] = useState(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const entries = readOptions(children);
    const options = entries.filter((entry) => entry.type === 'option');
    const current = options.find((option) => option.value === String(value ?? '')) ?? options[0];

    useEffect(() => {
        if (!open) return undefined;

        const closeOnOutsidePress = (event) => {
            if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
        };
        const closeOnViewportChange = (event) => {
            if (!menuRef.current?.contains(event.target)) setOpen(false);
        };

        document.addEventListener('pointerdown', closeOnOutsidePress);
        window.addEventListener('resize', closeOnViewportChange);
        window.addEventListener('scroll', closeOnViewportChange, true);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePress);
            window.removeEventListener('resize', closeOnViewportChange);
            window.removeEventListener('scroll', closeOnViewportChange, true);
        };
    }, [open]);

    // Keep the highlighted option in view while moving through a long list.
    useEffect(() => {
        if (open && highlighted >= 0) {
            menuRef.current?.querySelector(`[data-option-index="${highlighted}"]`)?.scrollIntoView({ block: 'nearest' });
        }
    }, [open, highlighted]);

    const openList = () => {
        const bounds = buttonRef.current?.getBoundingClientRect();
        if (!bounds) return;

        const menuHeight = Math.min(entries.length * 36 + 12, 320);
        const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > window.innerHeight - bounds.bottom;

        setHighlighted(Math.max(0, options.indexOf(current)));
        setMenuPosition({ left: bounds.left, top: dropUp ? bounds.top - 6 : bounds.bottom + 6, dropUp, width: Math.max(bounds.width, 180) });
        setOpen(true);
    };

    const choose = (option) => {
        setOpen(false);
        buttonRef.current?.focus();
        if (!option || option.disabled || option.value === String(value ?? '')) return;
        onChange?.({ target: { value: option.value, name }, currentTarget: { value: option.value, name } });
    };

    const step = (from, direction) => {
        for (let i = 1; i <= options.length; i++) {
            const index = (from + direction * i + options.length * i) % options.length;
            if (!options[index].disabled) return index;
        }

        return from;
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (open) setOpen(false);
            if (event.key === 'Escape' && open) event.preventDefault();

            return;
        }

        if (!['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(event.key)) return;

        event.preventDefault();
        if (!open) {
            openList();

            return;
        }

        if (event.key === 'ArrowDown') setHighlighted((index) => step(index, 1));
        if (event.key === 'ArrowUp') setHighlighted((index) => step(index, -1));
        if (event.key === 'Home') setHighlighted(step(-1, 1));
        if (event.key === 'End') setHighlighted(step(options.length, -1));
        if ((event.key === 'Enter' || event.key === ' ') && highlighted >= 0) choose(options[highlighted]);
    };

    return (
        <>
            <button
                {...rest}
                ref={buttonRef}
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel ? `${ariaLabel}: ${current?.label ?? ''}` : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] text-[var(--ink)] transition-colors focus:outline-none focus-visible:border-[var(--brand-2)] focus-visible:shadow-[0_0_0_3px_rgba(var(--brand-2-rgb),0.18)] disabled:cursor-not-allowed disabled:opacity-60 ${
                    open ? 'border-[var(--brand-2)] shadow-[0_0_0_3px_rgba(var(--brand-2-rgb),0.18)]' : 'border-[var(--field-line)] hover:border-[rgba(var(--brand-1-rgb),0.65)]'
                } ${className}`}
            >
                <span className="min-w-0 truncate">{current?.label ?? ''}</span>
                <svg viewBox="0 0 12 7" className={`h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" aria-hidden>
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && menuPosition && typeof document !== 'undefined' && createPortal(
                <ul
                    ref={menuRef}
                    role="listbox"
                    aria-label={ariaLabel}
                    className="fixed z-[400] max-h-80 overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]"
                    style={{
                        left: menuPosition.left,
                        top: menuPosition.top,
                        width: menuPosition.width,
                        transform: menuPosition.dropUp ? 'translateY(-100%)' : undefined,
                    }}
                >
                    {entries.map((entry, entryIndex) => {
                        if (entry.type === 'group') {
                            return (
                                <li key={`group-${entryIndex}`} role="presentation" className="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-1)]">
                                    {entry.label}
                                </li>
                            );
                        }

                        const index = options.indexOf(entry);
                        const active = highlighted === index;
                        const selected = current === entry;

                        return (
                            <li
                                key={`${entry.value}-${entryIndex}`}
                                role="option"
                                aria-selected={selected}
                                aria-disabled={entry.disabled || undefined}
                                data-option-index={index}
                                onPointerEnter={() => !entry.disabled && setHighlighted(index)}
                                onClick={() => choose(entry)}
                                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
                                    entry.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                                } ${active ? 'text-white' : 'text-[var(--ink)]'} ${selected ? 'font-bold' : 'font-medium'}`}
                                style={active ? { background: BRAND_GRADIENT } : undefined}
                            >
                                <span className="min-w-0 truncate">{entry.label}</span>
                                {selected && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: active ? '#fff' : 'var(--brand-2)' }} aria-hidden />}
                            </li>
                        );
                    })}
                </ul>,
                document.body,
            )}
        </>
    );
}
