/**
 * The Reconciler (Financial and Health Budget Balancing Logic)
 * A Use Case to give grocery shopping recommendations (high nutrition, affordable)
 * aimed at restoring balance if the user overspends or consumes too many calories.
 */

export interface IBudgetResetItem {
    name: string;
    estimatedCost: number;
    caloriesPerServing: number;
    proteinPerServing: number;
    reasonToRecommend: string;
}

export class ReconcilerUseCase {
    public execute(remainingDiningBudget: number, remainingCalories: number): {
        status: 'OK' | 'WARNING' | 'CRITICAL';
        message: string;
        groceryListRecommendation: IBudgetResetItem[];
    } {
        const isBudgetNegative = remainingDiningBudget < 0;
        const isCaloriesNegative = remainingCalories < 0;

        if (!isBudgetNegative && !isCaloriesNegative) {
            return {
                status: 'OK',
                message: 'Excellent. You are on track with your Calorie and Financial goals this week.',
                groceryListRecommendation: []
            };
        }

        const budgetResetList: IBudgetResetItem[] = [
            {
                name: 'Chicken Breast (1kg)',
                estimatedCost: 80000,
                caloriesPerServing: 165,
                proteinPerServing: 31,
                reasonToRecommend: 'Super affordable and high protein. Keeps you full, repairs muscles after bad carb-loaded meals.'
            },
            {
                name: 'Broccoli / Cabbage (1 head)',
                estimatedCost: 35000,
                caloriesPerServing: 25,
                proteinPerServing: 1,
                reasonToRecommend: 'Very low calorie but provides great volume to chew, keeps your stomach full affordably.'
            },
            {
                name: 'Eggs (1 dozen)',
                estimatedCost: 30000,
                caloriesPerServing: 78,
                proteinPerServing: 6,
                reasonToRecommend: 'Great source of healthy fats after sugar cravings, very cheap.'
            }
        ];

        let message = 'You need a Budget Reset Grocery List for next week.';
        let status: 'WARNING' | 'CRITICAL' = 'WARNING';

        if (isBudgetNegative && isCaloriesNegative) {
            message = 'CRITICAL ALERT: Last week you overspent AND ate too many calories. Buy this cheap homemade grocery list now to detox your body & wallet.';
            status = 'CRITICAL';
        } else if (isBudgetNegative) {
            message = 'Dining out budget is empty! Cook at home using the "Budget Reset List" to catch up.';
            status = 'WARNING';
        } else if (isCaloriesNegative) {
            message = 'Finances are fine, but you ate way too many calories. Use clean eating to balance out that BBQ party.';
            status = 'WARNING';
        }

        return {
            status,
            message,
            groceryListRecommendation: budgetResetList
        };
    }
}
