/**
 * Interface để bóc tách thông tin từ Camera/Hình ảnh
 * Ứng dụng mô hình AI (OpenAI Vision hoặc Claude 3.5 Sonnet Vision)
 * Phục vụ scan hóa đơn đi chợ hoặc tính năng snap food.
 */
export interface IVisionAIService {
    /**
     * Chụp tấm ảnh bữa ăn và phân tích khẩu phần Calories và Protein.
     * @param base64Image - Ảnh chụp bữa ăn từ Camera
     */
    analyzeMealNutrition(base64Image: string): Promise<{
        calories: number;
        protein: number;
        foodName: string;
        confidenceLevel: number;
    }>;

    /**
     * Quét bill thanh toán để trích xuất số tiền chi tiêu
     * @param base64Image - Ảnh hóa đơn nhà hàng / quán ăn
     */
    extractReceiptTotal(base64Image: string): Promise<{
        totalAmount: number;
        merchantName: string;
        date: string;
    }>;
}
