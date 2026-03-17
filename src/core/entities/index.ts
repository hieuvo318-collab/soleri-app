export interface IProfile {
    id: string; // UUID in Supabase
    name: string;
    daily_calorie_goal: number;
    weekly_dining_budget: number;
    current_weight?: number;
    target_weight?: number;
    activity_level?: number;
    gender?: 'male' | 'female';
    age?: number;
    height?: number; // integer (cm)
    created_at?: string;
}

export interface IBudget {
    id: number;
    profile_id: number;
    period_start: string; // ISO Date "YYYY-MM-DD"
    period_end: string;
    amount_spent: number;
}

export interface ILog {
    id: number;
    profile_id: number;
    log_date: string; // ISO Date "YYYY-MM-DD"
    calories_consumed: number;
    food_name: string;
    is_dining_out: boolean; // boolean trong TS sẽ map với 0/1 trong SQLite
    cost: number;
}
