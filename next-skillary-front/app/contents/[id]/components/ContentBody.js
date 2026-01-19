'use client';

export default function ContentBody({ content, canViewContent }) {

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
              <>
                {/* 포스트 파일 (이미지/동영상) */}
                {content.post.postFiles && content.post.postFiles.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {content.post.postFiles.map((fileUrl, index) => {
                      // 파일 확장자로 이미지/동영상 판단
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(fileUrl);
                      const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(fileUrl);
                      
                      if (isImage) {
                        return (
                          <div key={index} className="my-4">
                            <img
                              src={fileUrl}
                              alt={`콘텐츠 이미지 ${index + 1}`}
                              className="w-full max-w-full h-auto rounded-lg border border-gray-200"
                              style={{ maxWidth: '100%', height: 'auto' }}
                            />
                          </div>
                        );
                      } else if (isVideo) {
                        return (
                          <div key={index} className="my-4">
                            <video
                              src={fileUrl}
                              controls
                              className="w-full max-w-full h-auto rounded-lg border border-gray-200"
                              style={{ maxWidth: '100%', height: 'auto' }}
                            >
                              비디오를 재생할 수 없습니다.
                            </video>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                {/* 본문 텍스트 */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {content.post.body}
                </div>
              </>
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

