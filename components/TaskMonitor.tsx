'use client';

import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useTaskProgress } from '@/hooks/useTaskProgress';
import { TaskStatus } from '@/types';

interface TaskMonitorProps {
  taskId: string;
  onComplete: (videoUrl: string, duration: number) => void;
  onError: (error: string) => void;
}

export default function TaskMonitor({ taskId, onComplete, onError }: TaskMonitorProps) {
  const { status, progress, elapsedTime, isPolling, stopPolling } = useTaskProgress({
    taskId,
    onComplete,
    onError,
  });

  const getStatusIcon = () => {
    switch (status) {
      case 'PENDING':
      case 'RUNNING':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'SUCCEEDED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'PENDING':
        return '排队中，请耐心等待...';
      case 'RUNNING':
        return 'AI正在处理中，请稍候...';
      case 'SUCCEEDED':
        return '处理完成！';
      case 'FAILED':
        return '处理失败';
      default:
        return '未知状态';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'PENDING':
        return '您的任务已提交，正在排队等待处理';
      case 'RUNNING':
        return 'AI正在分析视频并生成新内容，这可能需要几分钟时间';
      case 'SUCCEEDED':
        return '视频已成功生成，您可以预览和下载';
      case 'FAILED':
        return '很抱歉，处理过程中出现错误';
      default:
        return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTime = () => {
    if (status === 'PENDING') {
      return '预计等待时间: 1-2分钟';
    } else if (status === 'RUNNING') {
      const remaining = Math.max(0, 100 - progress);
      const estimatedSeconds = Math.ceil(remaining * 2);
      return `预计剩余时间: ${formatTime(estimatedSeconds)}`;
    }
    return '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <span className="font-medium text-lg">{getStatusText()}</span>
            <p className="text-sm text-gray-500 mt-1">{getStatusDescription()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">已用时</div>
          <div className="text-lg font-medium">{formatTime(elapsedTime)}</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            处理进度: {progress.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">
            {getEstimatedTime()}
          </span>
        </div>
      </div>
      
      {status === 'RUNNING' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              正在处理中，请保持页面开启，处理完成后将自动显示结果
            </span>
          </div>
        </div>
      )}
      
      {status === 'FAILED' && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新尝试
          </button>
          <button
            onClick={stopPolling}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            取消任务
          </button>
        </div>
      )}
    </div>
  );
}
