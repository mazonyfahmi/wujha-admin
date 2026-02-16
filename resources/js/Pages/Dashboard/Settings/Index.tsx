import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Settings, Save, Store, CreditCard, Bell, Globe, Shield, Wrench,
    Building2, Mail, Phone, MapPin, RotateCcw, CloudUpload, Image as ImageIcon, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';

/* ─── Types ─── */

interface Props {
    settings: Record<string, string>;
}

type TabKey = 'general' | 'payments' | 'notifications' | 'localization' | 'security' | 'maintenance';

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    description: string;
}

const TABS: TabDef[] = [
    { key: 'general', label: 'General', icon: Store, description: 'Store information and contact details' },
    { key: 'payments', label: 'Payments', icon: CreditCard, description: 'Payment methods and bank account' },
    { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and system notification preferences' },
    { key: 'localization', label: 'Localization', icon: Globe, description: 'Language, date, and number formatting' },
    { key: 'security', label: 'Security', icon: Shield, description: 'Password policies and session management' },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Maintenance mode and system status' },
];

/* ─── Defaults ─── */

const DEFAULTS: Record<string, string> = {
    // General
    store_name: 'Wujha',
    store_tagline: '',
    contact_email: '',
    contact_phone: '',
    store_address: '',
    store_currency: 'SDG',
    store_timezone: 'Africa/Khartoum',
    // Payments (bank)
    bank_account_number: '2066856',
    bank_account_name: 'Fahmy Fareed Fahmy',
    bank_name: 'Bank of Khartoum',
    bank_branch_name: 'Al Ahly',
    bank_iban: '',
    payment_bank_transfer: '1',
    payment_cash_on_delivery: '0',
    payment_mobile_wallet: '0',
    // Notifications
    notify_new_order: '1',
    notify_order_status: '1',
    notify_new_customer: '1',
    notify_low_stock: '0',
    notify_new_review: '1',
    notify_refund_request: '1',
    notification_email: '',
    // Localization
    default_language: 'ar',
    date_format: 'DD/MM/YYYY',
    number_format: 'comma_dot',
    // Security
    min_password_length: '8',
    require_uppercase: '1',
    require_numbers: '1',
    session_timeout: '120',
    enable_2fa: '0',
    // Maintenance
    maintenance_mode: '0',
    maintenance_message: 'We are currently performing scheduled maintenance. Please try again later.',
};

/* ─── Component ─── */

export default function Index({ settings }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const [form, setForm] = useState<Record<string, string>>({ ...DEFAULTS, ...settings });
    const [saving, setSaving] = useState(false);

    const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
    const toggle = (key: string) => set(key, form[key] === '1' ? '0' : '1');
    const isOn = (key: string) => form[key] === '1';

    const handleSave = () => {
        setSaving(true);
        router.post('/settings', form, {
            onFinish: () => setSaving(false),
            preserveScroll: true,
        });
    };

    const currentTab = TABS.find(t => t.key === activeTab)!;

    return (
        <DashboardLayout title="Settings">
            <Head title="Settings" />
            <div className="space-y-6">
                <PageHeader
                    title="Settings"
                    description="Manage your application configuration"
                    icon={Settings}
                    actions={
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    }
                />

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ── Sidebar Navigation ── */}
                    <nav className="lg:w-60 shrink-0">
                        <Card className="overflow-hidden">
                            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                                                'hover:bg-muted/50 relative',
                                                isActive
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full hidden lg:block" />
                                            )}
                                            {isActive && (
                                                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary rounded-t-full lg:hidden" />
                                            )}
                                            <Icon className="h-4 w-4 shrink-0" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </nav>

                    {/* ── Content Area ── */}
                    <div className="flex-1 min-w-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <currentTab.icon className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{currentTab.label}</CardTitle>
                                </div>
                                <CardDescription>{currentTab.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {activeTab === 'general' && (
                                    <GeneralTab form={form} set={set} />
                                )}
                                {activeTab === 'payments' && (
                                    <PaymentsTab form={form} set={set} toggle={toggle} isOn={isOn} />
                                )}
                                {activeTab === 'notifications' && (
                                    <NotificationsTab form={form} set={set} toggle={toggle} isOn={isOn} />
                                )}
                                {activeTab === 'localization' && (
                                    <LocalizationTab form={form} set={set} />
                                )}
                                {activeTab === 'security' && (
                                    <SecurityTab form={form} set={set} toggle={toggle} isOn={isOn} />
                                )}
                                {activeTab === 'maintenance' && (
                                    <MaintenanceTab form={form} set={set} toggle={toggle} isOn={isOn} />
                                )}

                                <Separator />
                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setForm({ ...DEFAULTS, ...settings })}>
                                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

/* ══════════════════════════════════════════════
   TAB COMPONENTS
   ══════════════════════════════════════════════ */

interface TabProps {
    form: Record<string, any>;
    set: (key: string, value: any) => void;
    toggle?: (key: string) => void;
    isOn?: (key: string) => boolean;
}

/* ─── General Tab ─── */
function GeneralTab({ form, set }: TabProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input
                        value={form.store_name}
                        onChange={e => set('store_name', e.target.value)}
                        placeholder="e.g. My Store"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                        value={form.store_tagline}
                        onChange={e => set('store_tagline', e.target.value)}
                        placeholder="e.g. Best services in town"
                    />
                </div>
                <div className="col-span-full space-y-4 pt-4 border-t">
                    <div className="flex items-start gap-6">
                        {/* Logo Preview */}
                        <div className="shrink-0">
                            <Label className="mb-3 block">Current Logo</Label>
                            <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-dashed bg-muted/50 flex items-center justify-center">
                                {form.dashboard_logo ? (
                                    <img
                                        src={URL.createObjectURL(form.dashboard_logo)}
                                        alt="New Logo"
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    // @ts-ignore
                                    usePage().props.settings?.dashboard_logo ? (
                                        <img
                                            // @ts-ignore
                                            src={usePage().props.settings.dashboard_logo}
                                            alt="Current Logo"
                                            className="h-full w-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                                            <ImageIcon className="h-10 w-10 mb-1" />
                                            <span className="text-[10px] bg-transparent">No Logo</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-3 pt-6">
                            <Label htmlFor="logo-upload" className="block text-sm font-medium">
                                Upload New Logo
                            </Label>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                    <CloudUpload className="h-4 w-4 mr-2" />
                                    Choose File
                                </Button>
                                {form.dashboard_logo && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => set('dashboard_logo', null)}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Remove Selected
                                    </Button>
                                )}
                            </div>

                            <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                    if (e.target.files?.[0]) {
                                        // @ts-ignore
                                        set('dashboard_logo', e.target.files[0]);
                                    }
                                }}
                            />

                            <div className="text-[0.8rem] text-muted-foreground space-y-1">
                                <p>Recommended dimensions: 512x512 pixels (Square).</p>
                                <p>Supported formats: PNG, JPG, SVG, GIF. Max size: 2MB.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Contact Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                            type="email"
                            value={form.contact_email}
                            onChange={e => set('contact_email', e.target.value)}
                            placeholder="e.g. contact@store.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input
                            value={form.contact_phone}
                            onChange={e => set('contact_phone', e.target.value)}
                            placeholder="e.g. +249 123 456 789"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> Store Address
                </Label>
                <Textarea
                    value={form.store_address}
                    onChange={e => set('store_address', e.target.value)}
                    placeholder="e.g. 123 Main St, Khartoum, Sudan"
                    rows={3}
                />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={form.store_currency} onValueChange={v => set('store_currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SDG">SDG — Sudanese Pound</SelectItem>
                            <SelectItem value="USD">USD — US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR — Euro</SelectItem>
                            <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
                            <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={form.store_timezone} onValueChange={v => set('store_timezone', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Africa/Khartoum">Africa/Khartoum (UTC+2)</SelectItem>
                            <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
                            <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

/* ─── Payments Tab ─── */
function PaymentsTab({ form, set, toggle, isOn }: TabProps) {
    return (
        <div className="space-y-6">
            {/* Payment methods */}
            <div>
                <h4 className="text-sm font-semibold mb-4">Payment Methods</h4>
                <div className="space-y-3">
                    <SettingToggle
                        label="Bank Transfer"
                        description="Allow customers to pay via direct bank transfer"
                        checked={isOn!('payment_bank_transfer')}
                        onToggle={() => toggle!('payment_bank_transfer')}
                    />
                    <SettingToggle
                        label="Cash on Delivery"
                        description="Allow payment upon service delivery"
                        checked={isOn!('payment_cash_on_delivery')}
                        onToggle={() => toggle!('payment_cash_on_delivery')}
                    />
                    <SettingToggle
                        label="Mobile Wallet"
                        description="Accept payments through mobile wallets"
                        checked={isOn!('payment_mobile_wallet')}
                        onToggle={() => toggle!('payment_mobile_wallet')}
                    />
                </div>
            </div>

            <Separator />

            {/* Bank Account Details */}
            <div>
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> Bank Account Details
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                    Displayed to customers who choose bank transfer as payment method.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Account Number *</Label>
                        <Input
                            value={form.bank_account_number}
                            onChange={e => set('bank_account_number', e.target.value)}
                            placeholder="e.g. 2066856"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Holder *</Label>
                        <Input
                            value={form.bank_account_name}
                            onChange={e => set('bank_account_name', e.target.value)}
                            placeholder="e.g. Fahmy Fareed Fahmy"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bank Name *</Label>
                        <Input
                            value={form.bank_name}
                            onChange={e => set('bank_name', e.target.value)}
                            placeholder="e.g. Bank of Khartoum"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Branch *</Label>
                        <Input
                            value={form.bank_branch_name}
                            onChange={e => set('bank_branch_name', e.target.value)}
                            placeholder="e.g. Al Ahly"
                        />
                    </div>
                </div>
                <div className="space-y-2 mt-4">
                    <Label>IBAN</Label>
                    <Input
                        value={form.bank_iban}
                        onChange={e => set('bank_iban', e.target.value)}
                        placeholder="e.g. SD12 3456 7890 1234 5678 90"
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Notifications Tab ─── */
function NotificationsTab({ form, set, toggle, isOn }: TabProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input
                    type="email"
                    value={form.notification_email}
                    onChange={e => set('notification_email', e.target.value)}
                    placeholder="admin@store.com — Leave blank to use contact email"
                />
                <p className="text-xs text-muted-foreground">All notifications will be sent to this address.</p>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-semibold mb-4">Order Notifications</h4>
                <div className="space-y-3">
                    <SettingToggle
                        label="New Order"
                        description="Receive an email when a new order is placed"
                        checked={isOn!('notify_new_order')}
                        onToggle={() => toggle!('notify_new_order')}
                    />
                    <SettingToggle
                        label="Order Status Change"
                        description="Receive notification when order status is updated"
                        checked={isOn!('notify_order_status')}
                        onToggle={() => toggle!('notify_order_status')}
                    />
                    <SettingToggle
                        label="Refund Request"
                        description="Get notified when a customer requests a refund"
                        checked={isOn!('notify_refund_request')}
                        onToggle={() => toggle!('notify_refund_request')}
                    />
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-semibold mb-4">Customer & Product Notifications</h4>
                <div className="space-y-3">
                    <SettingToggle
                        label="New Customer Registration"
                        description="Receive notification when a new customer signs up"
                        checked={isOn!('notify_new_customer')}
                        onToggle={() => toggle!('notify_new_customer')}
                    />
                    <SettingToggle
                        label="New Review"
                        description="Get notified when a customer leaves a review"
                        checked={isOn!('notify_new_review')}
                        onToggle={() => toggle!('notify_new_review')}
                    />
                    <SettingToggle
                        label="Low Stock Alert"
                        description="Receive a warning when service slots are running low"
                        checked={isOn!('notify_low_stock')}
                        onToggle={() => toggle!('notify_low_stock')}
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Localization Tab ─── */
function LocalizationTab({ form, set }: TabProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select value={form.default_language} onValueChange={v => set('default_language', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ar">العربية (Arabic)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français (French)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={form.date_format} onValueChange={v => set('date_format', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2 sm:w-1/2">
                <Label>Number Format</Label>
                <Select value={form.number_format} onValueChange={v => set('number_format', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="comma_dot">1,234.56 (Comma + Dot)</SelectItem>
                        <SelectItem value="dot_comma">1.234,56 (Dot + Comma)</SelectItem>
                        <SelectItem value="space_comma">1 234,56 (Space + Comma)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

/* ─── Security Tab ─── */
function SecurityTab({ form, set, toggle, isOn }: TabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-semibold mb-4">Password Policy</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Minimum Password Length</Label>
                        <Select value={form.min_password_length} onValueChange={v => set('min_password_length', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6 characters</SelectItem>
                                <SelectItem value="8">8 characters</SelectItem>
                                <SelectItem value="10">10 characters</SelectItem>
                                <SelectItem value="12">12 characters</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Session Timeout (minutes)</Label>
                        <Select value={form.session_timeout} onValueChange={v => set('session_timeout', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="480">8 hours</SelectItem>
                                <SelectItem value="0">Never</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="text-sm font-semibold mb-4">Requirements</h4>
                <div className="space-y-3">
                    <SettingToggle
                        label="Require Uppercase Letters"
                        description="Passwords must contain at least one uppercase letter"
                        checked={isOn!('require_uppercase')}
                        onToggle={() => toggle!('require_uppercase')}
                    />
                    <SettingToggle
                        label="Require Numbers"
                        description="Passwords must contain at least one numeric digit"
                        checked={isOn!('require_numbers')}
                        onToggle={() => toggle!('require_numbers')}
                    />
                    <SettingToggle
                        label="Two-Factor Authentication"
                        description="Require 2FA for admin accounts (coming soon)"
                        checked={isOn!('enable_2fa')}
                        onToggle={() => toggle!('enable_2fa')}
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Maintenance Tab ─── */
function MaintenanceTab({ form, set, toggle, isOn }: TabProps) {
    return (
        <div className="space-y-6">
            <div className={cn(
                'rounded-lg border p-4 transition-colors',
                isOn!('maintenance_mode')
                    ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/20'
                    : 'border-border'
            )}>
                <SettingToggle
                    label="Maintenance Mode"
                    description="When enabled, the storefront will show a maintenance page to all visitors. Admin panel remains accessible."
                    checked={isOn!('maintenance_mode')}
                    onToggle={() => toggle!('maintenance_mode')}
                />
            </div>

            {isOn!('maintenance_mode') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label>Maintenance Message</Label>
                    <Textarea
                        value={form.maintenance_message}
                        onChange={e => set('maintenance_message', e.target.value)}
                        placeholder="Custom message shown to visitors..."
                        rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                        This message will be displayed on the maintenance page.
                    </p>
                </div>
            )}

            <Separator />

            <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-semibold mb-2">System Information</h4>
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Environment</span>
                        <span className="font-medium">Production</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">PHP Version</span>
                        <span className="font-medium">8.2+</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Laravel Version</span>
                        <span className="font-medium">11.x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Reusable Toggle Row ─── */

function SettingToggle({
    label, description, checked, onToggle,
}: {
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={onToggle}
        >
            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onToggle} />
        </div>
    );
}
