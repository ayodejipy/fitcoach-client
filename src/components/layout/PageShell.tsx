import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageShellSize = "narrow" | "medium" | "wide";

interface PageShellProps {
    size?: PageShellSize;
    children: ReactNode;
    className?: string;
}

const MAX_WIDTH: Record<PageShellSize, string> = {
    narrow: "max-w-[720px]",
    medium: "max-w-[1040px]",
    wide: "max-w-[1120px]",
};

export function PageShell({ size = "narrow", children, className }: PageShellProps) {
    return <div className={cn("mx-auto w-full px-5 py-6 lg:px-10 lg:py-10", MAX_WIDTH[size], className)}>{children}</div>;
}
