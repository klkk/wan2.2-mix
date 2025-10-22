'use client';

import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import FileUploader from '@/components/FileUploader';
import TaskCreator from '@/components/TaskCreator';
import TaskMonitor from '@/components/TaskMonitor';
import VideoPlayer from '@/components/VideoPlayer';
import { FileUpload, ModelType } from '@/types';

export default function HomePage() {
  const [imageFiles, setImageFiles] = useState<FileUpload[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileUpload[]>([]);
  const [model, setModel] = useState<ModelType>('std');
  const [taskId, setTaskId] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleTaskCreated = (newTaskId: string) => {
    setTaskId(newTaskId);
    setError('');
    toast.success('任务已提交，正在处理中...');
  };

  const handleTaskError = (errorMessage: string) => {
    setError(errorMessage);
    setTaskId('');
    toast.error(errorMessage);
  };

  const handleTaskComplete = (url: string, videoDuration: number) => {
    setVideoUrl(url);
    setDuration(videoDuration);
    toast.success('视频生成完成！');
  };

  const handleReset = () => {
    setImageFiles([]);
    setVideoFiles([]);
    setTaskId('');
    setVideoUrl('');
    setDuration(0);
    setError('');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              通义万相视频换人
            </h1>
            <p className="text-gray-600">
              上传人物照片和参考视频，AI自动替换视频中的人物角色
            </p>
          </header>

          <main className="space-y-8">
            {!taskId && !videoUrl && (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  <FileUploader
                    accept="image/jpeg,image/png,image/webp"
                    maxFiles={1}
                    onFilesChange={setImageFiles}
                    type="image"
                    title="上传人物照片"
                    description="请上传清晰、正面、无遮挡的人物照片"
                  />
                  
                  <FileUploader
                    accept="video/mp4,video/mov,video/avi"
                    maxFiles={1}
                    onFilesChange={setVideoFiles}
                    type="video"
                    title="上传参考视频"
                    description="请上传需要替换人物的参考视频"
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-4">选择服务模式</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                        model === 'std'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="std"
                        checked={model === 'std'}
                        onChange={() => setModel('std')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <h4 className="font-medium">标准版</h4>
                        <p className="text-sm text-gray-500 mt-1">0.6元/秒</p>
                        <p className="text-xs text-gray-400 mt-2">生成快，性价比高</p>
                      </div>
                    </label>
                    
                    <label
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                        model === 'pro'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="pro"
                        checked={model === 'pro'}
                        onChange={() => setModel('pro')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <h4 className="font-medium">专业版</h4>
                        <p className="text-sm text-gray-500 mt-1">0.9元/秒</p>
                        <p className="text-xs text-gray-400 mt-2">流畅度高，效果逼真</p>
                      </div>
                    </label>
                  </div>
                </div>

                <TaskCreator
                  imageFile={imageFiles[0] || null}
                  videoFile={videoFiles[0] || null}
                  model={model}
                  onTaskCreated={handleTaskCreated}
                  onError={handleTaskError}
                />
              </>
            )}

            {taskId && !videoUrl && (
              <TaskMonitor
                taskId={taskId}
                onComplete={handleTaskComplete}
                onError={handleTaskError}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">处理失败</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  重新开始
                </button>
              </div>
            )}

            {videoUrl && (
              <div className="space-y-4">
                <VideoPlayer videoUrl={videoUrl} duration={duration} />
              </div>
            )}
          </main>
        </div>
        
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
      </div>
    </ErrorBoundary>
  );
}
