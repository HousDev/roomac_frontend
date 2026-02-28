


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Wallet, AlertCircle, CreditCard 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';

interface PaymentsTabProps {
  profile: TenantProfile;
  paymentSummary: {
    paid: number;
    pending: number;
    total: number;
  };
  isMobile?: boolean;
}

export default function PaymentsTab({ profile, paymentSummary, isMobile = false }: PaymentsTabProps) {
  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      <Card>
        <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
          <CardTitle className={isMobile ? 'text-base' : ''}>Payment Summary</CardTitle>
          <CardDescription className={isMobile ? 'text-xs' : ''}>Overview of your payment history</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'px-4 py-3' : ''}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6'} mb-4`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Wallet className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                <Label className={isMobile ? 'text-xs' : ''}>Total Paid</Label>
              </div>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                ₹ {paymentSummary.paid.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                <Label className={isMobile ? 'text-xs' : ''}>Pending Payments</Label>
              </div>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-amber-600`}>
                ₹ {paymentSummary.pending.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <CreditCard className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                <Label className={isMobile ? 'text-xs' : ''}>Total Amount</Label>
              </div>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                ₹ {paymentSummary.total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {paymentSummary.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Payment Progress</span>
                <span>{Math.round((paymentSummary.paid / paymentSummary.total) * 100)}%</span>
              </div>
              <Progress 
                value={(paymentSummary.paid / paymentSummary.total) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {profile.payments && profile.payments.length > 0 ? (
        <Card>
          <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
            <CardTitle className={isMobile ? 'text-base' : ''}>Payment History</CardTitle>
            <CardDescription className={isMobile ? 'text-xs' : ''}>Detailed payment transactions</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4 py-3' : ''}>
            <div className="space-y-3">
              {profile.payments.map((payment: any, index: number) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{payment.description || `Payment ${index + 1}`}</p>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(payment.payment_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold ${
                      payment.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      ₹ {payment.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {payment.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
            <CreditCard className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} mx-auto text-gray-400 mb-4`} />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>No Payment History</h3>
            <p className="text-gray-500 text-sm">No payment records found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}