export declare class WalletController {
    getWallet(userId: string): {
        userId: string;
        balance: number;
    };
    addFunds(body: {
        userId: string;
        amount: number;
    }): {
        userId: string;
        balance: number;
    };
}
