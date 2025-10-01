'use client';

import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueTime?: string;
  assignedBy: string;
  category: string;
}

export default function TasksOverview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    // Mock tasks data - replace with actual API call
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Prepare breakfast menu items',
        description: 'Prepare continental breakfast items for morning service',
        priority: 'high',
        status: 'pending',
        dueTime: '07:00 AM',
        assignedBy: 'Head Chef',
        category: 'Kitchen'
      },
      {
        id: '2',
        title: 'Stock inventory check',
        description: 'Check and update ingredient inventory levels',
        priority: 'medium',
        status: 'in-progress',
        dueTime: '10:00 AM',
        assignedBy: 'Kitchen Manager',
        category: 'Inventory'
      },
      {
        id: '3',
        title: 'Clean kitchen equipment',
        description: 'Deep clean all cooking equipment after lunch service',
        priority: 'medium',
        status: 'pending',
        dueTime: '03:00 PM',
        assignedBy: 'Head Chef',
        category: 'Maintenance'
      },
      {
        id: '4',
        title: 'Prep vegetables for dinner',
        description: 'Prepare all vegetables needed for evening dinner service',
        priority: 'high',
        status: 'completed',
        dueTime: '04:00 PM',
        assignedBy: 'Sous Chef',
        category: 'Kitchen'
      }
    ];

    setTasks(mockTasks);
  }, []);

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      'in-progress': '🔄',
      completed: '✅'
    };
    return icons[status as keyof typeof icons];
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const taskStats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="p-6">
      {/* Task Statistics */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{taskStats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500">No tasks found for this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      ⏰ Due: {task.dueTime || 'No time set'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">
                      👤 By: {task.assignedBy}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">
                      📂 {task.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    <span className="mr-1">{getStatusIcon(task.status)}</span>
                    {task.status.replace('-', ' ').charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                  
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}