import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Wallet, AlertCircle, CreditCard 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';
import { ReactElement, JSXElementConstructor, ReactNode, Key, ReactPortal } from 'react';

interface PaymentsTabProps {
  profile: TenantProfile;
  paymentSummary: {
    paid: number;
    pending: number;
    total: number;
  };
}

export default function PaymentsTab({ profile, paymentSummary }: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Overview of your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Wallet className="h-4 w-4" />
                <Label>Total Paid</Label>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹ {paymentSummary.paid.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <Label>Pending Payments</Label>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                ₹ {paymentSummary.pending.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <CreditCard className="h-4 w-4" />
                <Label>Total Amount</Label>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹ {paymentSummary.total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {paymentSummary.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Progress</span>
                <span>{Math.round((paymentSummary.paid / paymentSummary.total) * 100)}%</span>
              </div>
              <Progress 
                value={(paymentSummary.paid / paymentSummary.total) * 100} 
                className="h-2 bg-green-500"
                // indicatorClassName="bg-green-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {profile.payments && profile.payments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Detailed payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.payments.map((payment: any, index: number) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payment.description || `Payment ${index + 1}`}</p>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(payment.payment_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      payment.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      ₹ {payment.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Transaction ID: {payment.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
            <p className="text-gray-500">No payment records found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}