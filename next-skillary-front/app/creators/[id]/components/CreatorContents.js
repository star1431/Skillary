'use client';

import PopularCard from '../../../components/PopularCard';

export default function CreatorContents({ 
  creator, 
  creatorContents, 
  loadingContents, 
  isOwner,
  onCreateContent,
  formatDate,
  getBadgeInfo
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">컨텐츠</h2>
          <p className="text-gray-500 text-sm">{creatorContents.length}개의 컨텐츠</p>
        </div>
        {/* 컨텐츠 생성 버튼: 본인 크리에이터인 경우에만 표시 */}
        {isOwner && (
          <button
            onClick={onCreateContent}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            컨텐츠 생성
          </button>
        )}
      </div>

      {loadingContents ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
        </div>
      ) : creatorContents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatorContents.map((content) => {
            const badgeInfo = getBadgeInfo(content);
            return (
              <PopularCard
                key={content.contentId}
                id={content.contentId}
                title={content.title}
                description={content.description}
                author={content.creatorName}
                profileImageUrl={content.profileImageUrl}
                date={formatDate(content.createdAt)}
                badge={badgeInfo.text}
                badgeType={badgeInfo.type}
                price={badgeInfo.type === 'price' ? badgeInfo.text : null}
                thumbnailUrl={content.thumbnailUrl}
                category={content.category}
                viewCount={content.viewCount || 0}
                likeCount={content.likeCount || 0}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4">
            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">아직 컨텐츠가 없습니다</h3>
          <p className="text-gray-500 text-sm">곧 새로운 컨텐츠가 업로드될 예정입니다.</p>
        </div>
      )}
    </div>
  );
}

