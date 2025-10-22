export interface ChunkUploadOptions {
  chunkSize?: number;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
}

export async function uploadFileInChunks(
  file: File,
  uploadUrl: string,
  options: ChunkUploadOptions = {}
): Promise<{ url: string; type: string }> {
  const {
    chunkSize = 5 * 1024 * 1024,
    maxRetries = 3,
    onProgress,
  } = options;

  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = `${Date.now()}-${file.name}`;
  let uploadedChunks = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    let retries = 0;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileId', fileId);
        formData.append('fileName', file.name);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          success = true;
          uploadedChunks++;
          
          if (onProgress) {
            const progress = (uploadedChunks / totalChunks) * 100;
            onProgress(progress);
          }
        } else {
          throw new Error(`Chunk ${chunkIndex} upload failed`);
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed to upload chunk ${chunkIndex} after ${maxRetries} retries`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }

  const mergeResponse = await fetch('/api/upload/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileId,
      fileName: file.name,
      totalChunks,
    }),
  });

  if (!mergeResponse.ok) {
    throw new Error('Failed to merge chunks');
  }

  const result = await mergeResponse.json();
  return result.data;
}
