import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import rewardService from '@/services/rewardService';
import loyaltyService from '@/services/loyaltyService';
import { Gift, Star, Search, Check, X, Loader2, AlertCircle } from 'lucide-react';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Type assertion to ensure TypeScript recognizes redeemReward method
const typedLoyaltyService = loyaltyService as typeof loyaltyService & {
  redeemReward: (guestId: string, rewardId: string) => Promise<any>;
};

interface RewardsCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  userTier: string;
  userId: string;
  onRedemptionSuccess: () => void;
}

export default function RewardsCatalogModal({
  isOpen,
  onClose,
  userPoints,
  userTier,
  userId,
  onRedemptionSuccess
}: RewardsCatalogModalProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Rewards', icon: '🎁' },
    { value: 'room', label: 'Room Perks', icon: '🏨' },
    { value: 'dining', label: 'Dining', icon: '🍽️' },
    { value: 'spa', label: 'Spa & Wellness', icon: '💆' },
    { value: 'experience', label: 'Experiences', icon: '✨' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchRewards();
    }
  }, [isOpen]);

  useEffect(() => {
    filterRewards();
  }, [rewards, searchTerm, selectedCategory]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardService.getRewardsCatalog();
      setRewards(response.rewards || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards catalog',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    let filtered = rewards;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by points required (ascending)
    filtered.sort((a, b) => a.pointsRequired - b.pointsRequired);

    setFilteredRewards(filtered);
  };

  const handleRedeem = (reward: any) => {
    console.log('🎯 handleRedeem called with reward:', reward);
    const pointsCost = reward.pointsCost || reward.pointsRequired || 0;
    console.log('💰 Points cost:', pointsCost, 'User points:', userPoints);
    
    if (userPoints < pointsCost) {
      console.log('❌ Insufficient points');
      toast({
        title: 'Insufficient Points',
        description: `You need ${pointsCost - userPoints} more points to redeem this reward.`,
        variant: 'destructive'
      });
      return;
    }

    // Show beautiful confirmation dialog
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

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

      // Close dialogs first
      setShowConfirmDialog(false);
      setSelectedReward(null);
      
      // Refresh rewards list to show updated stock
      await fetchRewards();
      
      // Trigger parent refresh and close modal
      onRedemptionSuccess();
      onClose();
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

  const canRedeem = (reward: any) => {
    const pointsCost = reward.pointsCost || reward.pointsRequired || 0;
    return userPoints >= pointsCost && reward.status === 'active';
  };

  const getTierBadgeColor = (minTier: string) => {
    switch (minTier?.toLowerCase()) {
      case 'platinum':
        return 'bg-slate-700 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const meetsTierRequirement = (minTier: string) => {
    const tierOrder = ['silver', 'gold', 'platinum'];
    const userTierIndex = tierOrder.indexOf(userTier?.toLowerCase());
    const requiredTierIndex = tierOrder.indexOf(minTier?.toLowerCase());
    return userTierIndex >= requiredTierIndex;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Gift className="w-6 h-6 text-hms-primary" />
            <span>Rewards Catalog</span>
          </DialogTitle>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-lg">{userPoints.toLocaleString()} Points Available</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {userTier} Member
            </Badge>
          </div>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={selectedCategory === cat.value ? 'bg-hms-primary' : ''}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-hms-primary" />
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rewards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRewards.map((reward) => {
              const pointsCost = reward.pointsCost || reward.pointsRequired || 0;
              const canRedeemReward = canRedeem(reward);
              const meetsTier = meetsTierRequirement(reward.minTier);
              const isRedeeming = redeeming === reward._id;

              return (
                <div
                  key={reward._id}
                  className={`border rounded-lg p-4 transition-all ${
                    canRedeemReward && meetsTier
                      ? 'border-hms-primary bg-blue-50 hover:shadow-lg'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {reward.description}
                      </p>
                    </div>
                    {reward.category && (
                      <span className="text-2xl ml-2">
                        {categories.find(c => c.value === reward.category)?.icon || '🎁'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className={`font-bold ${canRedeemReward ? 'text-hms-primary' : 'text-gray-500'}`}>
                        {pointsCost.toLocaleString()} pts
                      </span>
                    </div>
                    <Badge className={getTierBadgeColor(reward.minTier)}>
                      {reward.minTier}+
                    </Badge>
                  </div>

                  <Button
                    onClick={() => {
                      console.log('🖱️ Redeem button clicked for:', reward.name);
                      handleRedeem(reward);
                    }}
                    disabled={!canRedeemReward || !meetsTier || isRedeeming}
                    className={`w-full ${
                      canRedeemReward && meetsTier
                        ? 'bg-hms-primary hover:bg-hms-primary/90'
                        : ''
                    }`}
                    variant={canRedeemReward && meetsTier ? 'default' : 'outline'}
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : !meetsTier ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Requires {reward.minTier} Tier
                      </>
                    ) : !canRedeemReward ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Insufficient Points
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Redeem Now
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>

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
    </Dialog>
  );
}
