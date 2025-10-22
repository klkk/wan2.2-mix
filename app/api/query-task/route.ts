import { NextRequest, NextResponse } from 'next/server';
import { queryTask } from '@/lib/api-client';
import { createErrorResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        createErrorResponse('InvalidParameter', '缺少taskId参数'),
        { status: 400 }
      );
    }

    const response = await queryTask(taskId);

    if (!response.success) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: response.data?.task_status,
        videoUrl: response.data?.video_url,
        duration: response.data?.task_metrics?.TOTAL,
      },
      requestId: response.requestId,
    });
  } catch (error) {
    console.error('Query task error:', error);
    return NextResponse.json(
      createErrorResponse('InternalError', '服务器内部错误'),
      { status: 500 }
    );
  }
}
