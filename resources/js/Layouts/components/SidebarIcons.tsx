import { DuotoneIcon } from "@/components/DuotoneIcon";

interface IconProps {
    className?: string;
}

export const IconDashboard = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/home-smile.527750.svg" className={className} />
);

export const IconOrders = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/bag-4.528016.svg" className={className} />
);

export const IconChat = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/chat-round-line.528137.svg" className={className} />
);

export const IconCustomers = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/users-group-rounded.527963.svg" className={className} />
);

export const IconGroups = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/users-group-two-rounded.527964.svg" className={className} />
);

export const IconReviews = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/star.527909.svg" className={className} />
);

export const IconServices = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/box-minimalistic.527629.svg" className={className} />
);

// Using layers for Categories/Groups
export const IconCategories = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/layers-minimalistic.527770.svg" className={className} />
);

export const IconBanners = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/gallery-wide.528286.svg" className={className} />
);

export const IconSales = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/card-recive.528095.svg" className={className} />
);

export const IconInvoices = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/bill-list.528037.svg" className={className} />
);

export const IconRefunds = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/undo-left.527935.svg" className={className} />
);


export const IconUsers = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/shield-user.527885.svg" className={className} />
);


export const IconApi = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/key-square.527767.svg" className={className} />
);


export const IconSettings = ({ className }: IconProps) => (
    <DuotoneIcon src="/icons/settings-minimalistic.528589.svg" className={className} />
);
