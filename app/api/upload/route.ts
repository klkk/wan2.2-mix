import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

const CHUNKS_DIR = join(process.cwd(), 'temp', 'chunks');
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const chunkIndex = data.get('chunkIndex') as string;
    const totalChunks = data.get('totalChunks') as string;
    const fileId = data.get('fileId') as string;
    const fileName = data.get('fileName') as string;

    // 分片上传
    if (chunkIndex && totalChunks && fileId) {
      await ensureDir(CHUNKS_DIR);
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const chunkPath = join(CHUNKS_DIR, `${fileId}-${chunkIndex}`);
      await writeFile(chunkPath, buffer);
      
      return NextResponse.json({
        success: true,
        data: {
          chunkIndex,
          received: true,
        },
      });
    }

    // 普通上传
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'InvalidParameter', message: '没有上传文件' } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await ensureDir(UPLOADS_DIR);

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = join(UPLOADS_DIR, uniqueFileName);
    
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video',
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
