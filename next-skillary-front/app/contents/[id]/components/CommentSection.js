'use client';

import CommentItem from './CommentItem';

export default function CommentSection({
  comments,
  canComment,
  isLoggedIn,
  currentUserId,
  contentCreatorId,
  newComment,
  setNewComment,
  onAddComment,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onToggleLike
}) {
  // 댓글 개수 계산 (대댓글 포함)
  const countComments = (comments) => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.children ? countComments(comment.children) : 0);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          댓글 <span className="text-gray-500 font-normal">({countComments(comments)})</span>
        </h2>
      </div>
      
      {/* 댓글 목록 - 댓글이 있을 때만 표시 */}
      {comments.length > 0 ? (
        <div className="border-b border-gray-200 pb-4">
          {comments.map((comment, index) => (
            <CommentItem 
              key={comment.commentId} 
              comment={comment} 
              depth={0} 
              canComment={canComment}
              isFirst={index === 0}
              currentUserId={currentUserId}
              contentCreatorId={contentCreatorId}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm border-b border-gray-200">
          댓글이 없습니다.
        </div>
      )}

      {/* 댓글 작성 폼 - 댓글 작성 권한이 있는 경우만 표시 (하단) */}
      {canComment && (
        <form onSubmit={onAddComment} className="pt-4">
          <div className="flex items-start gap-3">
            {/* [TODO] 현재 사용자 프로필 이미지 표시 */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
      
      {/* 로그인한 사용자 중 댓글 작성 권한이 없는 경우에만 메시지 표시 (비로그인 사용자에게는 표시 안 함) */}
      {!canComment && isLoggedIn && (
        <div className="pt-4 bg-yellow-50 py-3 px-2">
          <p className="text-xs text-yellow-800 text-center leading-relaxed">
            댓글을 작성하려면 콘텐츠에 접근할 수 있는 권한이 필요합니다.
          </p>
        </div>
      )}
    </div>
  );
}

