export const validateImageFile = (file: File): string | null => {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE || '10485760');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return '仅支持 JPG、PNG、WEBP 格式的图片';
  }
  
  if (file.size > maxSize) {
    return `图片大小不能超过 ${maxSize / 1024 / 1024}MB`;
  }
  
  return null;
};

export const validateVideoFile = (file: File): string | null => {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE || '104857600');
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
  
  if (!allowedTypes.includes(file.type)) {
    return '仅支持 MP4、MOV、AVI 格式的视频';
  }
  
  if (file.size > maxSize) {
    return `视频大小不能超过 ${maxSize / 1024 / 1024}MB`;
  }
  
  return null;
};
