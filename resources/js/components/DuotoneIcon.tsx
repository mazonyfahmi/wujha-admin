import { cn } from "@/lib/utils";

interface DuotoneIconProps {
    src: string;
    className?: string;
}

export const DuotoneIcon = ({ src, className }: DuotoneIconProps) => {
    return (
        <div
            className={cn("bg-current w-5 h-5", className)}
            style={{
                maskImage: `url('${src}')`,
                maskSize: 'contain',
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: `url('${src}')`,
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
            }}
        />
    );
};
