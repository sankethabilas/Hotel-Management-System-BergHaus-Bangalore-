import React, { useState, useEffect } from 'react';
import { automatedRulesService } from '../../services/automatedRulesService';
import { 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  PlayCircle, 
  TestTube,
  TrendingUp,
  Users,
  Gift,
  Star,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AutomatedRules = () => {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testingRule, setTestingRule] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('rules');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'booking_completed',
    conditions: {
      minBookingAmount: '',
      minFeedbackRating: '',
      tierRestrictions: [],
      dateRange: {
        startDate: '',
        endDate: ''
      }
    },
    action: {
      type: 'award_points',
      points: 100,
      multiplier: 2,
      targetTier: 'Gold',
      notificationMessage: ''
    },
    isActive: true,
    priority: 1,
    maxExecutionsPerUser: '',
    expiryDays: ''
  });

  const [testData, setTestData] = useState({
    guestId: '',
    loyaltyId: '',
    bookingAmount: '',
    rating: '',
    basePoints: ''
  });

  const triggers = [
    { value: 'booking_created', label: 'Booking Created', icon: '📅' },
    { value: 'booking_completed', label: 'Booking Completed', icon: '✅' },
    { value: 'feedback_submitted', label: 'Feedback Submitted', icon: '💬' },
    { value: 'tier_upgraded', label: 'Tier Upgraded', icon: '⬆️' },
    { value: 'birthday', label: 'Birthday', icon: '🎂' },
    { value: 'anniversary', label: 'Anniversary', icon: '🎊' },
    { value: 'first_booking', label: 'First Booking', icon: '🌟' },
    { value: 'referral', label: 'Referral', icon: '👥' }
  ];

  const actionTypes = [
    { value: 'award_points', label: 'Award Points', icon: '🎁' },
    { value: 'multiply_points', label: 'Multiply Points', icon: '✖️' },
    { value: 'tier_upgrade', label: 'Tier Upgrade', icon: '⬆️' },
    { value: 'send_notification', label: 'Send Notification', icon: '📢' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesRes, statsRes] = await Promise.all([
        automatedRulesService.getAllRules(),
        automatedRulesService.getRuleStats()
      ]);
      setRules(rulesRes.rules || []);
      setStats(statsRes.stats || null);

      if (activeTab === 'executions') {
        const executionsRes = await automatedRulesService.getRuleExecutions({ limit: 50 });
        setExecutions(executionsRes.executions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        conditions: {
          ...formData.conditions,
          minBookingAmount: formData.conditions.minBookingAmount ? parseFloat(formData.conditions.minBookingAmount) : undefined,
          minFeedbackRating: formData.conditions.minFeedbackRating ? parseFloat(formData.conditions.minFeedbackRating) : undefined
        },
        action: {
          ...formData.action,
          points: formData.action.points ? parseFloat(formData.action.points) : undefined,
          multiplier: formData.action.multiplier ? parseFloat(formData.action.multiplier) : undefined
        },
        maxExecutionsPerUser: formData.maxExecutionsPerUser ? parseInt(formData.maxExecutionsPerUser) : undefined,
        expiryDays: formData.expiryDays ? parseInt(formData.expiryDays) : undefined
      };

      if (editingRule) {
        await automatedRulesService.updateRule(editingRule._id, submitData);
      } else {
        await automatedRulesService.createRule(submitData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Error saving rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      trigger: rule.trigger,
      conditions: {
        minBookingAmount: rule.conditions?.minBookingAmount || '',
        minFeedbackRating: rule.conditions?.minFeedbackRating || '',
        tierRestrictions: rule.conditions?.tierRestrictions || [],
        dateRange: {
          startDate: rule.conditions?.dateRange?.startDate ? new Date(rule.conditions.dateRange.startDate).toISOString().split('T')[0] : '',
          endDate: rule.conditions?.dateRange?.endDate ? new Date(rule.conditions.dateRange.endDate).toISOString().split('T')[0] : ''
        }
      },
      action: {
        type: rule.action.type,
        points: rule.action.points || 100,
        multiplier: rule.action.multiplier || 2,
        targetTier: rule.action.targetTier || 'Gold',
        notificationMessage: rule.action.notificationMessage || ''
      },
      isActive: rule.isActive,
      priority: rule.priority,
      maxExecutionsPerUser: rule.maxExecutionsPerUser || '',
      expiryDays: rule.expiryDays || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await automatedRulesService.deleteRule(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Error deleting rule');
    }
  };

  const handleTest = async (rule) => {
    setTestingRule(rule);
    setTestResult(null);
    setShowTestModal(true);
  };

  const handleRunTest = async (e) => {
    e.preventDefault();
    try {
      const result = await automatedRulesService.testRule(testingRule._id, testData);
      setTestResult(result.result);
    } catch (error) {
      console.error('Error testing rule:', error);
      alert('Error testing rule');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger: 'booking_completed',
      conditions: {
        minBookingAmount: '',
        minFeedbackRating: '',
        tierRestrictions: [],
        dateRange: { startDate: '', endDate: '' }
      },
      action: {
        type: 'award_points',
        points: 100,
        multiplier: 2,
        targetTier: 'Gold',
        notificationMessage: ''
      },
      isActive: true,
      priority: 1,
      maxExecutionsPerUser: '',
      expiryDays: ''
    });
    setEditingRule(null);
  };

  const toggleTier = (tier) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        tierRestrictions: prev.conditions.tierRestrictions.includes(tier)
          ? prev.conditions.tierRestrictions.filter(t => t !== tier)
          : [...prev.conditions.tierRestrictions, tier]
      }
    }));
  };

  if (loading && activeTab === 'rules') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automated Rules Engine</h1>
          <p className="text-gray-600 mt-1">Configure automated point awards and actions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Rules</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Active Rules</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Executions</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.executionStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Points Awarded</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.executionStats?.find(s => s._id === 'success')?.totalPoints.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'executions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Execution History
          </button>
          <button
            onClick={() => setActiveTab('top-rules')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'top-rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Top Performers
          </button>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {rules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No automated rules configured</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {triggers.find(t => t.value === rule.trigger)?.icon || '⚡'}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Priority: {rule.priority}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-gray-600 mb-3">{rule.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Trigger</p>
                        <p className="font-semibold text-gray-900">
                          {triggers.find(t => t.value === rule.trigger)?.label || rule.trigger}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Action</p>
                        <p className="font-semibold text-gray-900">
                          {actionTypes.find(a => a.value === rule.action.type)?.label || rule.action.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Executions</p>
                        <p className="font-semibold text-gray-900">{rule.executionCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Executed</p>
                        <p className="font-semibold text-gray-900">
                          {rule.lastExecuted 
                            ? new Date(rule.lastExecuted).toLocaleDateString() 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    {rule.action.type === 'award_points' && (
                      <div className="text-sm text-gray-600">
                        Awards: <span className="font-semibold text-blue-600">{rule.action.points} points</span>
                      </div>
                    )}
                    {rule.action.type === 'multiply_points' && (
                      <div className="text-sm text-gray-600">
                        Multiplier: <span className="font-semibold text-purple-600">{rule.action.multiplier}x</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleTest(rule)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Test Rule"
                    >
                      <TestTube className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Execution History Tab */}
      {activeTab === 'executions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map((exec) => (
                  <tr key={exec._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{exec.ruleName}</div>
                      <div className="text-xs text-gray-500">{exec.trigger}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{exec.guestId}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        +{exec.pointsAwarded}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exec.status === 'success' 
                          ? 'bg-green-100 text-green-800'
                          : exec.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(exec.executedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Rules Tab */}
      {activeTab === 'top-rules' && stats?.topRules && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Rules</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topRules.map((rule, index) => (
              <div key={rule._id} className="p-6 flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <span className="text-2xl font-bold">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{rule.ruleName}</h3>
                  <p className="text-sm text-gray-600">{rule.trigger}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{rule.executions}</p>
                  <p className="text-xs text-gray-500">executions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{rule.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">points awarded</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal - PART 1 OF 2 - Will continue in next message due to size */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Automated Rule' : 'Create Automated Rule'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Birthday Bonus Points"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Describe what this rule does..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Higher priority rules execute first</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Executions Per User
                    </label>
                    <input
                      type="number"
                      value={formData.maxExecutionsPerUser}
                      onChange={(e) => setFormData({ ...formData, maxExecutionsPerUser: e.target.value })}
                      min="1"
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Trigger Event</h3>
                <div className="grid grid-cols-2 gap-3">
                  {triggers.map((trigger) => (
                    <button
                      key={trigger.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, trigger: trigger.value })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.trigger === trigger.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{trigger.icon}</span>
                        <span className="font-medium text-gray-900">{trigger.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Conditions</h3>
                
                {(formData.trigger === 'booking_created' || formData.trigger === 'booking_completed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Booking Amount
                    </label>
                    <input
                      type="number"
                      value={formData.conditions.minBookingAmount}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: { ...formData.conditions, minBookingAmount: e.target.value }
                      })}
                      placeholder="Leave empty for any amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {formData.trigger === 'feedback_submitted' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Rating
                    </label>
                    <input
                      type="number"
                      value={formData.conditions.minFeedbackRating}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: { ...formData.conditions, minFeedbackRating: e.target.value }
                      })}
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="Leave empty for any rating"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier Restrictions (leave empty for all tiers)
                  </label>
                  <div className="flex gap-2">
                    {['Silver', 'Gold', 'Platinum'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => toggleTier(tier)}
                        className={`px-4 py-2 rounded-lg border ${
                          formData.conditions.tierRestrictions.includes(tier)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.conditions.dateRange.startDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {
                          ...formData.conditions,
                          dateRange: { ...formData.conditions.dateRange, startDate: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.conditions.dateRange.endDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {
                          ...formData.conditions,
                          dateRange: { ...formData.conditions.dateRange, endDate: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Action</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {actionTypes.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        action: { ...formData.action, type: action.value }
                      })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.action.type === action.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{action.icon}</span>
                        <span className="font-medium text-gray-900">{action.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {formData.action.type === 'award_points' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points to Award *
                    </label>
                    <input
                      type="number"
                      value={formData.action.points}
                      onChange={(e) => setFormData({
                        ...formData,
                        action: { ...formData.action, points: e.target.value }
                      })}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {formData.action.type === 'multiply_points' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Multiplier *
                    </label>
                    <input
                      type="number"
                      value={formData.action.multiplier}
                      onChange={(e) => setFormData({
                        ...formData,
                        action: { ...formData.action, multiplier: e.target.value }
                      })}
                      required
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., 2 = double points, 1.5 = 50% bonus</p>
                  </div>
                )}

                {formData.action.type === 'tier_upgrade' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Tier *
                    </label>
                    <select
                      value={formData.action.targetTier}
                      onChange={(e) => setFormData({
                        ...formData,
                        action: { ...formData.action, targetTier: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                )}

                {formData.action.type === 'send_notification' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Message *
                    </label>
                    <textarea
                      value={formData.action.notificationMessage}
                      onChange={(e) => setFormData({
                        ...formData,
                        action: { ...formData.action, notificationMessage: e.target.value }
                      })}
                      required
                      rows={3}
                      placeholder="Enter the message to send..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Expiry Days (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.expiryDays}
                    onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                    min="1"
                    placeholder="Leave empty to use default expiry policy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Rule</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && testingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Test Rule: {testingRule.name}</h2>
              <p className="text-gray-600 text-sm mt-1">Simulate rule execution without actually awarding points</p>
            </div>
            <form onSubmit={handleRunTest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest ID *
                  </label>
                  <input
                    type="text"
                    value={testData.guestId}
                    onChange={(e) => setTestData({ ...testData, guestId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loyalty ID *
                  </label>
                  <input
                    type="text"
                    value={testData.loyaltyId}
                    onChange={(e) => setTestData({ ...testData, loyaltyId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {(testingRule.trigger === 'booking_created' || testingRule.trigger === 'booking_completed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Amount
                  </label>
                  <input
                    type="number"
                    value={testData.bookingAmount}
                    onChange={(e) => setTestData({ ...testData, bookingAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {testingRule.trigger === 'feedback_submitted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    value={testData.rating}
                    onChange={(e) => setTestData({ ...testData, rating: e.target.value })}
                    min="1"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {testingRule.action.type === 'multiply_points' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Points
                  </label>
                  <input
                    type="number"
                    value={testData.basePoints}
                    onChange={(e) => setTestData({ ...testData, basePoints: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.wouldExecute ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h3 className="font-semibold text-gray-900 mb-2">Test Result:</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Would Execute:</span>{' '}
                      <span className={testResult.wouldExecute ? 'text-green-600' : 'text-yellow-600'}>
                        {testResult.wouldExecute ? 'Yes ✓' : 'No ✗'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Conditions Met:</span>{' '}
                      <span className={testResult.conditionsMet ? 'text-green-600' : 'text-red-600'}>
                        {testResult.conditionsMet ? 'Yes ✓' : 'No ✗'}
                      </span>
                    </p>
                    {testResult.wouldExecute && (
                      <p>
                        <span className="font-medium">Estimated Points:</span>{' '}
                        <span className="text-blue-600 font-bold">{testResult.estimatedPoints}</span>
                      </p>
                    )}
                    {testResult.loyalty && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="font-medium mb-1">Member Info:</p>
                        <p className="text-gray-600">Guest: {testResult.loyalty.guestId}</p>
                        <p className="text-gray-600">Tier: {testResult.loyalty.tier}</p>
                        <p className="text-gray-600">Current Points: {testResult.loyalty.currentPoints}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setTestingRule(null);
                    setTestResult(null);
                    setTestData({ guestId: '', loyaltyId: '', bookingAmount: '', rating: '', basePoints: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Run Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedRules;
