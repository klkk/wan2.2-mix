'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { queryTaskLocal } from '@/lib/api-client';
import { TaskStatus } from '@/types';

interface UseTaskProgressOptions {
  taskId: string;
  onComplete: (videoUrl: string, duration: number) => void;
  onError: (error: string) => void;
  initialInterval?: number;
  maxInterval?: number;
  timeout?: number;
}

export function useTaskProgress({
  taskId,
  onComplete,
  onError,
  initialInterval = 3000,
  maxInterval = 10000,
  timeout = 300000,
}: UseTaskProgressOptions) {
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentIntervalRef = useRef(initialInterval);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    try {
      const response = await queryTaskLocal(taskId);
      
      if (response.success && response.data) {
        const newStatus = response.data.status as TaskStatus;
        setStatus(newStatus);
        retryCountRef.current = 0;
        
        if (newStatus === 'PENDING') {
          setProgress(10);
        } else if (newStatus === 'RUNNING') {
          setProgress(prev => {
            const next = prev + Math.random() * 15;
            return Math.min(next, 90);
          });
        } else if (newStatus === 'SUCCEEDED') {
          setProgress(100);
          if (response.data.videoUrl && response.data.duration) {
            onComplete(response.data.videoUrl, response.data.duration);
          }
          stopPolling();
        } else if (newStatus === 'FAILED') {
          onError(response.data.error || '任务失败');
          stopPolling();
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      retryCountRef.current++;
      
      if (retryCountRef.current >= maxRetries) {
        onError('网络错误，请检查网络连接后重试');
        stopPolling();
      } else {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * 1.5,
          maxInterval
        );
      }
    }
  }, [taskId, onComplete, onError, stopPolling, maxInterval]);

  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    setElapsedTime(0);
    setProgress(0);
    
    intervalRef.current = setInterval(() => {
      poll();
    }, currentIntervalRef.current);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    timeoutRef.current = setTimeout(() => {
      onError('处理超时，请稍后重试');
      stopPolling();
    }, timeout);
    
    poll();
  }, [isPolling, poll, stopPolling, timeout]);

  useEffect(() => {
    if (taskId) {
      startPolling();
    }
    
    return stopPolling;
  }, [taskId, startPolling, stopPolling]);

  return {
    status,
    progress,
    elapsedTime,
    isPolling,
    stopPolling,
    startPolling,
  };
}
