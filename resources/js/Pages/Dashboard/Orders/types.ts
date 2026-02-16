
export interface Customer {
    id: number;
    name: string;
    full_name?: string;
    email?: string;
    phone?: string;
}

export interface Service {
    id: number;
    name: string;
    price: number;
}

export interface Order {
    id: number;
    increment_id?: string;
    customer: Customer;
    service: Service;
    status: string;
    payment_method: string;
    payment_proof_url: string | null;
    price: number;
    notes: string | null;
    created_at: string;
}
