import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, CreditCard, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { earningsService, authService } from "@/lib/supabaseService";

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  completedJobs: number;
  pendingPayments: number;
}

const EarningsCard = () => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeEarnings = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        const data = await earningsService.getEarnings(user.id);
        setEarnings(data);
      }
      setLoading(false);
    };

    initializeEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getMonthChange = () => {
    if (!earnings) return 0;
    if (earnings.lastMonth === 0) return 100;
    return ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100;
  };

  const monthChange = getMonthChange();
  const isPositive = monthChange >= 0;

  if (loading) {
    return (
      <Card className="glass-card border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings
            </CardTitle>
            <CardDescription className="text-blue-200/80">
              Your earnings this month
            </CardDescription>
          </div>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <TrendingUp className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-6">
        <div className="space-y-6">
          {/* Main Earnings Display */}
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              {earnings ? formatCurrency(earnings.thisMonth) : '₹0.00'}
            </div>
            <p className="text-blue-200/80 text-sm">This month's earnings</p>
          </div>

          {/* Month-over-Month Change */}
          <div className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(monthChange).toFixed(1)}%
              </span>
            </div>
            <span className="text-purple-200/70 text-sm">vs last month</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Total Earnings</span>
              </div>
              <div className="text-lg font-bold text-white">
                {earnings ? formatCurrency(earnings.totalEarnings) : '₹0.00'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Pending</span>
              </div>
              <div className="text-lg font-bold text-white">
                {earnings ? formatCurrency(earnings.pendingPayments) : '₹0.00'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Completed Jobs</span>
              </div>
              <div className="text-lg font-bold text-white">
                {earnings ? earnings.completedJobs : 0}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-lg border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Last Month</span>
              </div>
              <div className="text-lg font-bold text-white">
                {earnings ? formatCurrency(earnings.lastMonth) : '₹0.00'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsCard;
