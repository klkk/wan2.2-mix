import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 使用内存存储，仅用于演示
const tempStorage = new Map<string, { data: ArrayBuffer; type: string; name: string }>();

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'InvalidParameter', message: '没有上传文件' } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const fileId = uuidv4();
    
    // 存储到内存（生产环境应使用云存储）
    tempStorage.set(fileId, {
      data: bytes,
      type: file.type,
      name: file.name,
    });

    // 返回一个临时URL
    const tempUrl = `/api/temp-file/${fileId}`;

    return NextResponse.json({
      success: true,
      data: {
        url: tempUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        fileId,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'InternalError', message: '文件上传失败' } },
      { status: 500 }
    );
  }
}

// 获取临时文件
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  const fileData = tempStorage.get(fileId);
  
  if (!fileData) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  return new NextResponse(fileData.data, {
    headers: {
      'Content-Type': fileData.type,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
