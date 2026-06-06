import { format } from "date-fns";

import { NotificationsBellDropdown } from "@/features/notifications/components/NotificationsBellDropdown";
import { NotificationsBellSheet } from "@/features/notifications/components/NotificationsBellSheet";
import { initials } from "@/features/profile/utils/initials";

/*
 * GreetingHeader — top of the dashboard.
 *
 * Layout: greeting block (left) + notifications bell trigger (right).
 *
 * The bell now opens the unified notifications inbox (coach replies +
 * system updates) via NotificationsBellDropdown on desktop or
 * NotificationsBellSheet on mobile. Each component owns its own
 * unread-count subscription (drives the red dot), so this header no
 * longer plumbs `hasUnread`.
 */
interface Props {
    firstName: string | null | undefined;
    coachName: string | null | undefined;
    programWeek: number | null | undefined;
    programTotal: number | null | undefined;
}

function timeOfDayGreeting(date: Date = new Date()): string {
    const hour = date.getHours();
    if (hour < 5) return "Late night";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
}

export function GreetingHeader({ firstName, coachName, programWeek, programTotal }: Props) {
    const greeting = timeOfDayGreeting();
    const programLine = programWeek && programTotal ? `Week ${programWeek} of ${programTotal}` : null;
    const todayEyebrow = format(new Date(), "EEE · MMM d").toUpperCase();

    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">{todayEyebrow}</div>
                <h1 className="mt-2 font-display text-[34px] lg:text-[38px] font-light leading-[1.05] tracking-[-0.015em] text-foreground" style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}>
                    {greeting}
                    {firstName ? (
                        <>
                            ,{" "}
                            <em
                                className="not-italic"
                                style={{
                                    fontVariationSettings: "'opsz' 108, 'SOFT' 80",
                                    fontWeight: 400,
                                }}
                            >
                                {firstName}.
                            </em>
                        </>
                    ) : (
                        "."
                    )}
                </h1>
                {(coachName || programLine) && (
                    <div className="mt-2 flex items-center gap-2 text-[13px] text-(--text-secondary)">
                        {coachName && (
                            <>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-(--green-pale) text-[11px] font-bold text-(--green-brand) ring-1 ring-(--green-soft)" aria-hidden>
                                    {initials(coachName)}
                                </span>
                                <span>with Coach {coachName}</span>
                            </>
                        )}
                        {coachName && programLine && <span aria-hidden>·</span>}
                        {programLine && <span>{programLine}</span>}
                    </div>
                )}
            </div>

            <div className="shrink-0">
                <NotificationsBellDropdown />
                <NotificationsBellSheet />
            </div>
        </header>
    );
}
