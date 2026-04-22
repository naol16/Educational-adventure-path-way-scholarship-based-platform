'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Model';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, Loader2, Landmark, PhonePhone } from 'lucide-react';
import { requestPayout } from '@/features/counselor/api/counselor-api';
import { toast } from 'react-hot-toast';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    onSuccess: () => void;
}

export const WithdrawalModal = ({ isOpen, onClose, availableBalance, onSuccess }: WithdrawalModalProps) => {
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'bank_transfer' | 'fana' | 'telebirr'>('bank_transfer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Details
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async () => {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) return toast.error("Enter a valid amount");
        if (numAmount > availableBalance) return toast.error("Insufficient balance");
        if (numAmount < 100) return toast.error("Minimum 100 ETB required");

        setIsSubmitting(true);
        try {
            const details = method === 'bank_transfer' 
                ? { accountNumber, bankName, accountHolderName: accountHolder }
                : { phoneNumber: phone };

            await requestPayout({
                amount: numAmount,
                payoutMethod: method,
                payoutDetails: details
            });
            
            toast.success("Withdrawal request submitted for approval");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Request failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal">
            <div className="space-y-6 pt-4">
                <div className="p-4 bg-slate-900 rounded-xl flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Available</span>
                    </div>
                    <span className="text-xl font-black">{availableBalance.toLocaleString()} <span className="text-xs opacity-60">ETB</span></span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount to Withdraw</label>
                    <Input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="Min 100 ETB"
                        className="h-12 text-lg font-bold"
                    />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {(['bank_transfer', 'telebirr', 'fana'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMethod(m)}
                            className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${
                                method === m ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'
                            }`}
                        >
                            {m.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {method === 'bank_transfer' ? (
                        <>
                            <Input placeholder="Bank Name (e.g. CBE, Awash)" value={bankName} onChange={e => setBankName(e.target.value)} />
                            <Input placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                            <Input placeholder="Account Holder Name" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} />
                        </>
                    ) : (
                        <Input placeholder="Phone Number (e.g. 0911...)" value={phone} onChange={e => setPhone(e.target.value)} />
                    )}
                </div>

                <Button 
                    className="w-full h-12 primary-gradient text-white shadow-lg"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Submit Request"}
                </Button>
            </div>
        </Modal>
    );
};
