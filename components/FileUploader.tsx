'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';
import { validateImageFile, validateVideoFile } from '@/lib/file-validator';
import { compressImage, compressVideo } from '@/lib/image-compressor';
import { uploadFileInChunks } from '@/lib/chunk-upload';
import { FileUpload } from '@/types';

interface FileUploaderProps {
  accept: string;
  maxFiles: number;
  onFilesChange: (files: FileUpload[]) => void;
  type: 'image' | 'video';
  title: string;
  description: string;
}

export default function FileUploader({
  accept,
  maxFiles,
  onFilesChange,
  type,
  title,
  description,
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = useCallback(
    async (newFiles: FileList) => {
      setError(null);
      const validFiles: FileUpload[] = [];
      
      for (const file of Array.from(newFiles)) {
        const validationError = type === 'image' ? validateImageFile(file) : validateVideoFile(file);
        
        if (validationError) {
          setError(validationError);
          return;
        }
        
        if (files.length + validFiles.length >= maxFiles) {
          setError(`最多只能上传 ${maxFiles} 个文件`);
          return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        
        try {
          const compressedFile = type === 'image' 
            ? await compressImage(file, { maxWidth: 1920, quality: 0.8 })
            : await compressVideo(file);
          
          const uploadResult = await uploadFileInChunks(
            compressedFile,
            '/api/upload',
            {
              onProgress: (progress) => {
                setUploadProgress(progress);
              },
            }
          );
          
          validFiles.push({
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            url: uploadResult.url,
          });
        } catch (error) {
          console.error('Upload error:', error);
          setError('文件上传失败，请重试');
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
      
      if (validFiles.length > 0) {
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
      }
    },
    [files, maxFiles, onFilesChange, type]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = async (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">上传中...</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress.toFixed(1)}%</p>
          </div>
        ) : (
          <div className="text-center">
            {type === 'image' ? (
              <Image className="mx-auto h-12 w-12 text-gray-400" />
            ) : (
              <Video className="mx-auto h-12 w-12 text-gray-400" />
            )}
            
            <p className="mt-2 text-sm text-gray-600">
              拖拽文件到此处或{' '}
              <span className="font-medium text-blue-600 hover:text-blue-500">
                点击上传
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              支持 {accept.replace(/image\/|video\//g, '').toUpperCase()} 格式
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {type === 'image' ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
