import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'announcement-dismissed';

/**
 * Site-wide banner from the Global Blocks module. Dismissal is remembered per
 * browser and keyed on the message, so editing the banner shows it again to
 * someone who dismissed the previous one.
 */
export default function AnnouncementBanner() {
    const { announcement } = usePage().props;
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        if (!announcement?.message) return;

        try {
            setDismissed(window.localStorage.getItem(DISMISS_KEY) === announcement.message);
        } catch {
            setDismissed(false);
        }
    }, [announcement?.message]);

    if (!announcement?.message || dismissed) return null;

    const dismiss = () => {
        setDismissed(true);
        try {
            window.localStorage.setItem(DISMISS_KEY, announcement.message);
        } catch {
            // A browser with storage blocked simply shows the banner again.
        }
    };

    return (
        <div
            className="relative z-[130] flex items-center justify-center gap-4 px-4 py-2.5 text-center text-[12px] font-semibold text-white"
            style={{ background: announcement.accent || '#891FFB' }}
            role="status"
        >
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span>{announcement.message}</span>
                {announcement.linkLabel && announcement.linkUrl && (
                    <Link href={announcement.linkUrl} className="underline underline-offset-4">
                        {announcement.linkLabel}
                    </Link>
                )}
            </p>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[15px] leading-none opacity-80 transition-opacity hover:opacity-100"
            >
                ×
            </button>
        </div>
    );
}
