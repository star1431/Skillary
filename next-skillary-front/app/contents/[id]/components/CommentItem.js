'use client';

import { useState, useEffect } from 'react';
import { formatCount, formatDate } from '../../../utils/formatUtils';

export default function CommentItem({ 
  comment, 
  depth = 0, 
  canComment, 
  isFirst = false,
  currentUserId,
  contentCreatorId,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onToggleLike
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.likedByCurrentUser || comment.likedByUser || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  const isCommentOwner = currentUserId !== null && Number(comment.userId) === Number(currentUserId);
  const isContentCreator = comment.isCreator && contentCreatorId === comment.userId;

  useEffect(() => {
    setIsLiked(comment.likedByCurrentUser || comment.likedByUser || false);
    setLikeCount(comment.likeCount || 0);
  }, [comment.likedByCurrentUser, comment.likedByUser, comment.likeCount]);

  return (
    <div className={`${depth > 0 ? 'pl-12' : ''} ${isFirst ? '' : 'border-t border-gray-200'} relative`}>
      <div className="py-6">
        <div className="flex items-start gap-3">
          {/* 프로필 이미지 */}
          {comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? (
            <img 
              src={comment.profileImageUrl} 
              alt={comment.displayName || '사용자'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 ${comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? 'hidden' : ''}`}></div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.displayName || `사용자 ${comment.userId}`}
                </span>
                {isContentCreator && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                    작성자
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt || new Date().toISOString())}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {!comment.isDeleted && (
                  <button
                    onClick={async () => {
                      await onToggleLike(comment.commentId).catch(err => {
                        console.error('좋아요 처리 중 오류 (상태는 새로고침으로 동기화됨):', err);
                      });
                    }}
                    className={`flex items-center gap-1 transition ${
                      isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{formatCount(likeCount)}</span>
                  </button>
                )}
                
                {isCommentOwner && !comment.isDeleted && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {showMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowMenu(false)}
                        ></div>
                        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[80px]">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              onDeleteComment(comment.commentId);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.comment);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (editText.trim()) {
                        onUpdateComment(comment.commentId, editText);
                        setIsEditing(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                  >
                    등록
                  </button>
                </div>
              </div>
            ) : (
              <>
                {comment.isDeleted ? (
                  <p className="text-gray-400 italic text-sm mt-1">
                    삭제된 댓글입니다
                  </p>
                ) : (
                  <>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words mt-1">
                      {comment.comment}
                    </p>
                    {canComment && depth === 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => setIsReplying(!isReplying)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition"
                        >
                          답글
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {isReplying && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      {comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? (
                        <img 
                          src={comment.profileImageUrl} 
                          alt={comment.displayName || '사용자'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 ${comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? 'hidden' : ''}`}></div>
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="댓글을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => {
                              if (replyText.trim()) {
                                onAddReply(comment.commentId, replyText);
                                setReplyText('');
                                setIsReplying(false);
                              }
                            }}
                            className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 대댓글 렌더링 */}
      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentItem 
              key={child.commentId} 
              comment={child} 
              depth={depth + 1} 
              canComment={canComment}
              currentUserId={currentUserId}
              contentCreatorId={contentCreatorId}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

