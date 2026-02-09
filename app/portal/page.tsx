import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CreditCard, Wrench, Gift, User, LogIn } from 'lucide-react';
import Link from '@/src/compat/next-link';

export default function TenantPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tenant Portal</h1>
          <p className="text-primary-foreground/80">Manage your stay, payments, and requests</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Sign In to Your Account</h2>
            <p className="text-slate-600 mb-8">
              Login with your registered mobile number to access your tenant dashboard
            </p>
            <Link href="/tenant/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Sign In with OTP
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" />
                Room Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                View your room details, amenities, and property information
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Track rent payments, view invoices, and payment history
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-primary" />
                Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Submit and track maintenance and service requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-primary" />
                Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Refer friends and earn rewards for successful referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Update your personal information and preferences
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
