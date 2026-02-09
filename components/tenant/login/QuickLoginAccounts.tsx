"use client";

interface QuickLoginAccountsProps {
  accounts: Array<{
    name: string;
    email: string;
    password: string;
    avatar: string;
    color: string;
  }>;
  onSelect: (email: string, password: string) => void;
  onClose: () => void;
}

export default function QuickLoginAccounts({ accounts, onSelect, onClose }: QuickLoginAccountsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Quick Login Accounts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Select an account to pre-fill credentials:
        </p>
        <div className="space-y-3">
          {accounts.map((account) => (
            <button
              key={account.email}
              onClick={() => onSelect(account.email, account.password)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center text-white font-bold`}>
                {account.avatar}
              </div>
              <div className="text-left">
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-gray-600">{account.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}