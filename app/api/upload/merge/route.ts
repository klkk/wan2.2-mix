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
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(CHUNKS_DIR, `${fileId}-${i}`);
      
      if (existsSync(chunkPath)) {
        const readStream = createReadStream(chunkPath);
        
        await new Promise((resolve, reject) => {
          readStream.pipe(writeStream, { end: false });
          readStream.on('end', resolve);
          readStream.on('error', reject);
        });
        
        await unlink(chunkPath);
      }
    }
    
    writeStream.end();
    
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
