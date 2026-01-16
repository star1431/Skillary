'use client';

import { useEffect, useRef } from 'react';

export default function ContentBody({ content, canViewContent }) {
  const viewerRef = useRef(null);
  const viewerDivRef = useRef(null);

  // ToastUI Viewer 초기화 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR 방지
    if (!viewerDivRef.current || viewerRef.current) return;
    if (!content?.post?.body) return;

    // 동적 import로 Viewer와 CSS 로드
    Promise.all([
      import('@toast-ui/editor/dist/toastui-editor-viewer'),
      import('@toast-ui/editor/dist/toastui-editor-viewer.css')
    ]).then(([viewerModule]) => {
      const Viewer = viewerModule.default;
      viewerRef.current = new Viewer({
        el: viewerDivRef.current,
        initialValue: content.post.body || '',
      });
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [content]);

  // content.post.body 변경 시 Viewer 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR 방지
    if (viewerRef.current && content?.post?.body !== undefined) {
      viewerRef.current.setMarkdown(content.post.body);
    }
  }, [content?.post?.body]);

  return (
    <>
      {/* 콘텐츠 소개 */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">콘텐츠 소개</h2>
        <p className="text-gray-700 leading-relaxed">{content.description}</p>
      </div>

      {/* 콘텐츠 본문 */}
      {content.post && content.post.body && (
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <div className="prose prose-lg max-w-none">
            {canViewContent ? (
              <div className="toastui-editor-viewer-wrapper">
                <div ref={viewerDivRef} />
              </div>
            ) : (
              <div className="h-[300px] relative overflow-hidden bg-gray-50 rounded-lg">
                {/* 스켈레톤 UI */}
                <div className="absolute inset-0 p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                {/* 오버레이 메시지 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-bold mb-2">
                      {content.planId ? '구독이 필요한 콘텐츠입니다' : '구매가 필요한 콘텐츠입니다'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {content.planId ? '구독하시면 전체 콘텐츠를 볼 수 있습니다' : '구매하시면 전체 콘텐츠를 볼 수 있습니다'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

