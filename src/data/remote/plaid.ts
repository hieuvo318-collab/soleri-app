/**
 * Interface cho việc kết nối hệ thống ngân hàng cá nhân thông qua Plaid API
 * Tương lai sẽ giúp động bộ hóa chi phí đi chợ hoặc ăn ngoài về thay vì manual log.
 */
export interface IPlaidIntegrationService {
    /**
     * Đồng bộ hóa giao dịch mới nhất cho chi phí eating out
     * @param accountId - ID tài khoản ngân hàng liên kết
     * @param startDate - Từ khoảng thời gian
     * @returns Danh sách các giao dịch (Transactions) tự động gắn tag Dining/Eating Out
     */
    syncDiningTransactions(accountId: string, startDate: Date): Promise<any[]>;

    /**
     * Xác thực với Plaid bằng public token khi kết nối tài khoản
     */
    exchangePublicToken(publicToken: string): Promise<string>;
}
