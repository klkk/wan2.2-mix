import { NextRequest, NextResponse } from 'next/server';
import { createTask } from '@/lib/api-client';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, videoUrl, model } = body;

    if (!imageUrl || !videoUrl || !model) {
      return NextResponse.json(
        { success: false, error: { code: 'InvalidParameter', message: '缺少必要参数' } },
        { status: 400 }
      );
    }

    const response = await createTask(imageUrl, videoUrl, model);

    if (!response.success) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: response.data?.task_id,
      },
      requestId: response.requestId,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'InternalError', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
