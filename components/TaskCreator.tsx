'use client';

import { useState } from 'react';
import { createTaskLocal } from '@/lib/api-client';
import { FileUpload, ModelType } from '@/types';
import { toast } from 'sonner';

interface TaskCreatorProps {
  imageFile: FileUpload | null;
  videoFile: FileUpload | null;
  model: ModelType;
  onTaskCreated: (taskId: string) => void;
  onError: (error: string) => void;
}

export default function TaskCreator({
  imageFile,
  videoFile,
  model,
  onTaskCreated,
  onError,
}: TaskCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!imageFile || !videoFile) {
      toast.error('请先上传图片和视频');
      return;
    }

    setIsCreating(true);
    toast.loading('正在创建任务...');

    try {
      const taskResponse = await createTaskLocal(
        `${window.location.origin}${imageFile.url}`,
        `${window.location.origin}${videoFile.url}`,
        model
      );

      if (!taskResponse.success) {
        throw new Error(taskResponse.error?.message || '任务创建失败');
      }

      toast.dismiss();
      toast.success('任务创建成功');
      onTaskCreated(taskResponse.data?.taskId || '');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || '创建任务失败');
      onError(error.message || '创建任务失败');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateTask}
      disabled={!imageFile || !videoFile || isCreating}
      className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
    >
      {isCreating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>处理中...</span>
        </>
      ) : (
        <span>生成视频</span>
      )}
    </button>
  );
}
