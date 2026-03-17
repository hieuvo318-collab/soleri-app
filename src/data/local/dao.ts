import { IProfile, IBudget, ILog } from '../../core/entities';
import { supabase } from '../remote/supabase';

// ----------------------------------------------------------------------------
// PROFILES DAO
// ----------------------------------------------------------------------------

export const createProfile = async (
    name: string,
    dailyCalorieGoal: number,
    weeklyDiningBudget: number,
    currentWeight: number,
    targetWeight: number,
    activityLevel: number
): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    name,
                    daily_calorie_goal: dailyCalorieGoal,
                    weekly_dining_budget: weeklyDiningBudget,
                    current_weight: currentWeight,
                    target_weight: targetWeight,
                    activity_level: activityLevel
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating Profile:', error);
        throw error;
    }
};

export const updateProfile = async (
    id: string,
    name: string,
    dailyCalorieGoal: number,
    weeklyDiningBudget: number,
    currentWeight: number,
    targetWeight: number,
    activityLevel: number
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                name,
                daily_calorie_goal: dailyCalorieGoal,
                weekly_dining_budget: weeklyDiningBudget,
                current_weight: currentWeight,
                target_weight: targetWeight,
                activity_level: activityLevel
            })
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating Profile:', error);
        throw error;
    }
};

export const getProfile = async (id: string): Promise<IProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as IProfile;
    } catch (error) {
        console.error('Error fetching Profile:', error);
        return null;
    }
};

export const getFirstProfile = async (): Promise<IProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1)
            .single();

        return data as IProfile || null;
    } catch (error) {
        console.error('Error fetching first Profile:', error);
        return null;
    }
};

// ----------------------------------------------------------------------------
// BUDGETS DAO
// ----------------------------------------------------------------------------

export const createBudget = async (
    profileId: string,
    periodStart: string, // YYYY-MM-DD
    periodEnd: string
): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('budgets')
            .insert([
                { profile_id: profileId, period_start: periodStart, period_end: periodEnd, amount_spent: 0 }
            ])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating Budget:', error);
        return null;
    }
};

export const updateBudgetSpent = async (id: string, addAmountSpent: number): Promise<void> => {
    try {
        // Since Supabase doesn't easily support dynamic 'amount_spent = amount_spent + ?' natively without RPC, 
        // we first fetch it and then update. For robust systems, you should create a Postgres function (RPC).
        const { data: budget, error: fetchError } = await supabase
            .from('budgets')
            .select('amount_spent')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newSpent = (budget?.amount_spent || 0) + addAmountSpent;

        const { error: updateError } = await supabase
            .from('budgets')
            .update({ amount_spent: newSpent })
            .eq('id', id);

        if (updateError) throw updateError;
    } catch (error) {
        console.error('Error updating Budget spend:', error);
    }
};

// ----------------------------------------------------------------------------
// LOGS DAO
// ----------------------------------------------------------------------------

export const createLog = async (
    profileId: string,
    logDate: string, // YYYY-MM-DD
    caloriesConsumed: number,
    foodName: string,
    isDiningOut: boolean,
    cost: number
): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('logs')
            .insert([
                {
                    profile_id: profileId,
                    log_date: logDate,
                    calories_consumed: caloriesConsumed,
                    food_name: foodName,
                    is_dining_out: isDiningOut,
                    cost
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error writing Log:', error);
        return null;
    }
};

export const getLogsByDate = async (profileId: string, date: string): Promise<ILog[]> => {
    try {
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .eq('profile_id', profileId)
            .eq('log_date', date);

        if (error) throw error;
        return data as ILog[];
    } catch (error) {
        console.error('Error fetching Logs:', error);
        return [];
    }
};
