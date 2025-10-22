import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { createReadStream, createWriteStream } from 'fs';
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
    const { fileId, fileName, totalChunks } = await request.json();
    
    await ensureDir(UPLOADS_DIR);
    
    const finalFileName = `${uuidv4()}-${fileName}`;
    const finalPath = join(UPLOADS_DIR, finalFileName);
    
    const writeStream = createWriteStream(finalPath);
    
    // 合并所有分片
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(CHUNKS_DIR, `${fileId}-${i}`);
      
      if (existsSync(chunkPath)) {
        const readStream = createReadStream(chunkPath);
        
        // 修复 Promise 类型问题
        await new Promise<void>((resolve, reject) => {
          readStream.pipe(writeStream, { end: false });
          readStream.on('end', () => resolve());
          readStream.on('error', reject);
        });
        
        // 删除分片文件
        await unlink(chunkPath);
      }
    }
    
    // 结束写入流
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
      writeStream.end();
    });
    
    return NextResponse.json({
      success: true,
      data: {
        url: `/uploads/${finalFileName}`,
        type: fileName.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image',
      },
    });
  } catch (error) {
    console.error('Merge error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'InternalError', message: '文件合并失败' } },
      { status: 500 }
    );
  }
}
