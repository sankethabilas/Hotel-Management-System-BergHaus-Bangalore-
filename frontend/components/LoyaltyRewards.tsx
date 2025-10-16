import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, TrendingUp, ShoppingBag, Award, ArrowRight, Loader2 } from 'lucide-react';
import { getRewardsCatalog } from '@/services/rewardService';
import loyaltyService from '@/services/loyaltyService';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Type assertion to ensure TypeScript recognizes redeemReward method
const typedLoyaltyService = loyaltyService as typeof loyaltyService & {
  redeemReward: (guestId: string, rewardId: string) => Promise<any>;
};

interface LoyaltyRewardsProps {
  points: number;
  tier: string;
  onRedeemClick: () => void;
  userId?: string; // Email for loyalty API calls
  onRedemptionSuccess?: () => void;
}

export default function LoyaltyRewards({ points, tier, onRedeemClick, userId, onRedemptionSuccess }: LoyaltyRewardsProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      // Use catalog endpoint for guest access (no admin auth required)
      const response = await getRewardsCatalog();
      console.log('📦 Catalog response:', response);
      
      // Backend returns { success, count, data: [...] }
      const rewardsData = response.data || [];
      console.log('📦 Rewards data:', rewardsData);
      console.log('📦 Total rewards:', rewardsData?.length);
      
      // Catalog already returns active rewards
      // Note: Backend sorts by pointsCost, we need pointsRequired
      const sortedRewards = rewardsData
        .sort((a: any, b: any) => (a.pointsRequired || a.pointsCost || 0) - (b.pointsRequired || b.pointsCost || 0))
        .slice(0, 4); // Show top 4 rewards
      
      console.log('✅ Rewards to display:', sortedRewards);
      setRewards(sortedRewards);
    } catch (error: any) {
      console.error('❌ Error fetching rewards:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRedeem = (reward: any) => {
    console.log('🎯 Quick redeem clicked for:', reward.name);
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User information not available. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    const pointsCost = reward.pointsCost || reward.pointsRequired || 0;
    
    // Check if user has enough points
    if (points < pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${pointsCost - points} more points to redeem this reward.`,
        variant: 'destructive'
      });
      return;
    }

    // Show beautiful confirmation dialog
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !userId) return;

    try {
      setRedeeming(selectedReward._id);
      console.log('🎁 Redeeming reward:', selectedReward.name, 'for user:', userId);
      
      // Use new redeemReward endpoint (handles points, stock, and transaction)
      const result = await typedLoyaltyService.redeemReward(userId, selectedReward._id);
      console.log('✅ Redemption result:', result);

      // Show success message
      toast({
        title: 'Reward Redeemed! 🎉',
        description: `Successfully redeemed ${selectedReward.name}. ${result.reward?.stockRemaining !== null ? `${result.reward?.stockRemaining} remaining in stock.` : ''} Check your email for details.`,
      });

      // Close dialog first
      setShowConfirmDialog(false);
      setSelectedReward(null);
      
      // Refresh rewards list to show updated data
      await fetchRewards();
      
      // Trigger parent component refresh (updates points and loyalty data)
      if (onRedemptionSuccess) {
        onRedemptionSuccess();
      }
    } catch (error: any) {
      console.error('❌ Error redeeming reward:', error);
      console.error('❌ Full error object:', error);
      
      // Extract meaningful error message
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to redeem reward. Please try again.';
      
      toast({
        title: 'Redemption Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return 'from-slate-700 to-slate-900';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      default:
        return '⭐';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'room upgrade':
        return '⬆️';
      case 'dining voucher':
        return '🍽️';
      case 'discount voucher':
        return '�';
      case 'spa':
      case 'wellness':
        return '💆';
      case 'experience':
        return '🎭';
      default:
        return '🎁';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-hms-primary" />
            <span>Loyalty Rewards</span>
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {tier} Member
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Display */}
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getTierColor(tier)} p-6 text-white`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">Available Points</div>
              <div className="text-3xl">{getTierIcon(tier)}</div>
            </div>
            <div className="text-4xl font-bold mb-2">
              {points?.toLocaleString() || 0}
            </div>
            <div className="text-sm opacity-75">
              {tier} Tier Benefits Active
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <Star className="w-32 h-32" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Membership</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{tier}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Can Redeem</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {rewards.filter((r: any) => (r.pointsCost || r.pointsRequired || 0) <= points).length}/{rewards.length}
            </div>
          </div>
        </div>

        {/* Quick Redeem Options */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2 text-hms-primary" />
            Popular Rewards
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-hms-primary" />
              <span className="ml-2 text-sm text-gray-500">Loading rewards...</span>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rewards available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rewards.map((reward: any) => {
                // Backend uses pointsCost, not pointsRequired
                const pointsCost = reward.pointsCost || reward.pointsRequired || 0;
                const canRedeem = points >= pointsCost;
                const isRedeeming = redeeming === reward._id;
                return (
                  <div
                    key={reward._id}
                    onClick={() => canRedeem && !isRedeeming && handleQuickRedeem(reward)}
                    className={`border rounded-lg p-3 transition-all ${
                      canRedeem 
                        ? 'border-hms-primary bg-blue-50 hover:shadow-md cursor-pointer' 
                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl mb-2">{getCategoryIcon(reward.category)}</div>
                    <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                      {reward.name}
                    </div>
                    <div className={`text-xs font-bold ${canRedeem ? 'text-hms-primary' : 'text-gray-500'}`}>
                      {pointsCost.toLocaleString()} pts
                    </div>
                    {isRedeeming ? (
                      <div className="mt-1 flex items-center text-xs text-blue-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Redeeming...
                      </div>
                    ) : canRedeem ? (
                      <div className="mt-1 flex items-center text-xs text-green-600">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Can Redeem
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browse All Button */}
        <Button
          onClick={onRedeemClick}
          className="w-full bg-hms-primary hover:bg-hms-primary/90"
          size="lg"
        >
          <Gift className="w-4 h-4 mr-2" />
          Browse All Rewards
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          Redeem your points for exclusive rewards, room upgrades, and special experiences
        </p>
      </CardContent>

      {/* Beautiful Confirmation Dialog */}
      {selectedReward && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setSelectedReward(null);
          }}
          onConfirm={handleConfirmRedeem}
          title="Redeem Reward?"
          description="You're about to redeem this amazing reward! Your points will be deducted and you'll receive a confirmation email with all the details."
          rewardName={selectedReward.name}
          pointsCost={selectedReward.pointsCost || selectedReward.pointsRequired || 0}
          loading={redeeming === selectedReward._id}
        />
      )}
    </Card>
  );
}
