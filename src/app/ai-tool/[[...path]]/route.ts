import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const pathSegments = params.path || [];
    const requestedPath = pathSegments.join('/');
    
    // If no path or just empty, serve index.html from dist folder
    if (!requestedPath || requestedPath === '') {
      // First try dist folder (built files)
      let filePath = join(process.cwd(), 'public', 'ai-tool', 'dist', 'index.html');
      if (!existsSync(filePath)) {
        // Fallback to source index.html
        filePath = join(process.cwd(), 'public', 'ai-tool', 'index.html');
      }
      if (existsSync(filePath)) {
        const htmlContent = await readFile(filePath, 'utf-8');
        return new NextResponse(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
    }
    
    // Try to serve from dist folder first (built files)
    // Handle assets path - if requesting /ai-tool/assets/..., serve from dist/assets/...
    let filePath: string;
    if (requestedPath.startsWith('assets/')) {
      // Assets are in dist/assets/
      filePath = join(process.cwd(), 'public', 'ai-tool', 'dist', requestedPath);
    } else {
      // Other files - try dist first, then source
      filePath = join(process.cwd(), 'public', 'ai-tool', 'dist', requestedPath);
    }
    
    if (!existsSync(filePath)) {
      // Fallback to source files
      filePath = join(process.cwd(), 'public', 'ai-tool', requestedPath);
    }
    
    if (existsSync(filePath)) {
      // Read file as buffer for binary files (images, etc.)
      const isTextFile = ['.html', '.js', '.css', '.json', '.ts', '.tsx', '.txt'].some(ext => 
        requestedPath.toLowerCase().endsWith(ext)
      );
      
      const fileContent = isTextFile 
        ? await readFile(filePath, 'utf-8')
        : readFileSync(filePath);
      
      const contentType = getContentType(requestedPath);
      
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': contentType,
        },
      });
    }
    
    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('Error serving AI tool file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    'html': 'text/html; charset=utf-8',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'json': 'application/json',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
  };
  return contentTypes[ext || ''] || 'text/plain';
}

