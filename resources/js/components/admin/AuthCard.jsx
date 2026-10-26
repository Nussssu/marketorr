import BrandMark from '../ui/BrandMark';

/**
 * The standalone frame of the admin sign-in pages (login, two-factor,
 * invitation, password reset): brand mark, heading, and the form card.
 */
export default function AuthCard({ title, subtitle, children }) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[var(--bg)] px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2">
                    <BrandMark size="2rem" />
                    <span className="font-display text-xl font-extrabold tracking-tight text-[var(--ink-strong)]">
                        MARKETORR<span className="text-gradient">.</span>
                    </span>
                </div>
                <h1 className="mt-8 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)]">{title}</h1>
                {subtitle && <p className="mt-2 text-[13px] text-[var(--mute)]">{subtitle}</p>}
                <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">{children}</div>
            </div>
        </div>
    );
}
