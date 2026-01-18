import { cn } from "@/lib/utils";

interface ConfigPageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function ConfigPage({ children, className, ...props }: ConfigPageProps) {
    return (
        <div
            className={cn("w-full max-w-[1920px] mx-auto space-y-8", className)}
            {...props}
        >
            {children}
        </div>
    );
}
