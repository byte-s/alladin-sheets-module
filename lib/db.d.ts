export interface LeadFieldValue {
    value: string,
    enum_id: number,
    enum_code: string
}

export interface LeadFields {
    field_id: number,
    field_name: string,
    field_code: string,
    field_type: string,
    values: LeadFieldValue[]
}

export interface Lead {
    id: number,
    name: string,
    price: number,
    responsible_user_id: number,
    group_id: number,
    status_id: number,
    pipeline_id: number,
    loss_reason_id: number,
    created_by: number,
    updated_by: number,
    created_at: number,
    updated_at: number,
    closed_at: number,
    closest_task_at: number,
    is_deleted: boolean,
    custom_fields_values: LeadFields[]
}