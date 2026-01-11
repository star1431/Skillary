import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { mockSubscriptions, mockPurchases } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { ROUTES, getCreatorProfilePath } from '../config/routes';
import { getContentAccessLabel } from '../utils/helpers';
import { getVideoEmbedInfo, parseContentBody } from '../utils/contentBlocks';
import { getContentById } from '@/lib/contentRepo';
import { getCreatorById, getCreatorByUserId, listPlansByCreator } from '@/lib/creatorRepo';
import {
  addComment,
  deleteComment,
  listCommentsByContent,
  subscribeCommentsChanged,
  toggleCommentLike,
} from '@/lib/commentsRepo';

export function ContentDetailPage({ contentId, onNavigate }) {
  const { user } = useAuth();
  const content = getContentById(contentId);
  const creator = content ? getCreatorById(content.creatorId) : null;
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // newest | oldest
  const [replyToId, setReplyToId] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  if (!content || !creator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>콘텐츠를 찾을 수 없습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // Check access rights
  const hasSubscription = user
    ? mockSubscriptions.some(
        (s) => s.userId === user.id && s.creatorId === creator.id && s.status === 'ACTIVE'
      )
    : false;

  const hasPurchased = user
    ? mockPurchases.some((p) => p.userId === user.id && p.contentId === content.id)
    : false;

  const canViewFullContent =
    content.accessType === 'PREVIEW' ||
    (content.accessType === 'SUBSCRIBER' && hasSubscription) ||
    (content.accessType === 'PAID' && hasPurchased);

  const plans = listPlansByCreator(creator.id).filter((p) => p.isActive);

  const handleSubscribe = (planId) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    onNavigate(`${ROUTES.PAYMENT_SUBSCRIPTION}?planId=${planId}`);
  };

  const handlePurchase = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    onNavigate(`${ROUTES.PAYMENT_CONTENT}?contentId=${content.id}`);
  };

  useEffect(() => {
    if (!content?.id) return;
    const order = sortOrder === 'newest' ? 'desc' : 'asc';
    setComments(listCommentsByContent(content.id, { order }));
    const handler = () => {
      const order = sortOrder === 'newest' ? 'desc' : 'asc';
      setComments(listCommentsByContent(content.id, { order }));
    };
    return subscribeCommentsChanged(handler);
  }, [content?.id, sortOrder]);

  const refreshComments = () => {
    if (!content?.id) return;
    const order = sortOrder === 'newest' ? 'desc' : 'asc';
    setComments(listCommentsByContent(content.id, { order }));
  };

  const handleAddComment = async () => {
    if (!content?.id) return;
    if (!canViewFullContent) {
      toast.error('전체 콘텐츠를 열람한 뒤 댓글을 작성할 수 있어요.');
      return;
    }
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    const body = commentBody.trim();
    if (!body) {
      toast.error('댓글을 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const created = addComment({
        contentId: content.id,
        userId: user.id,
        authorName: user.nickname,
        body,
      });
      if (!created) {
        toast.error('댓글 작성에 실패했습니다.');
        return;
      }
      setCommentBody('');
      refreshComments();
      toast.success('댓글이 등록되었습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!content?.id) return;
    if (!canViewFullContent) {
      toast.error('전체 콘텐츠를 열람한 뒤 답글을 작성할 수 있어요.');
      return;
    }
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    const body = replyBody.trim();
    if (!body) {
      toast.error('답글을 입력해주세요.');
      return;
    }
    setIsSubmittingReply(true);
    try {
      const created = addComment({
        contentId: content.id,
        userId: user.id,
        authorName: user.nickname,
        body,
        parentId,
      });
      if (!created) {
        toast.error('답글 작성에 실패했습니다.');
        return;
      }
      setReplyBody('');
      setReplyToId(null);
      refreshComments();
      toast.success('답글이 등록되었습니다.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteComment = (comment) => {
    if (!comment?.id) return;
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    const canDelete = user.role === 'ADMIN' || user.id === comment.userId;
    if (!canDelete) {
      toast.error('본인 댓글만 삭제할 수 있습니다.');
      return;
    }
    const ok = deleteComment(comment.id);
    if (ok) {
      refreshComments();
      toast.success('댓글이 삭제되었습니다.');
    }
  };

  const handleToggleLike = (commentId) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    const res = toggleCommentLike(commentId, user.id);
    if (!res.ok) {
      toast.error('좋아요 처리에 실패했습니다.');
      return;
    }
    refreshComments();
  };

  const authorUserId = creator?.userId || null;

  const creatorUserIdSet = useMemo(() => {
    // mockCreators 기반이라 호출 비용은 작지만, 댓글/답글 렌더링에서 반복 호출을 피하기 위해 캐싱
    const set = new Set();
    for (const c of comments) {
      if (!c?.userId) continue;
      if (getCreatorByUserId(c.userId)) set.add(c.userId);
    }
    return set;
  }, [comments]);

  const { topLevelComments, repliesByParent } = useMemo(() => {
    const top = [];
    const replies = new Map();
    for (const c of comments) {
      if (!c) continue;
      if (!c.parentId) {
        top.push(c);
      } else {
        const arr = replies.get(c.parentId) || [];
        arr.push(c);
        replies.set(c.parentId, arr);
      }
    }
    return { topLevelComments: top, repliesByParent: replies };
  }, [comments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => onNavigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        {/* Thumbnail */}
        {content.thumbnail && (
          <div className="aspect-video rounded-lg overflow-hidden mb-6">
            <ImageWithFallback
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold flex-1">{content.title}</h1>
            {!!getContentAccessLabel(content.accessType, content.price) && (
              <Badge
                variant={
                  content.accessType === 'PAID'
                    ? 'outline'
                    : content.accessType === 'SUBSCRIBER'
                      ? 'default'
                      : 'secondary'
                }
              >
                {getContentAccessLabel(content.accessType, content.price)}
              </Badge>
            )}
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-4">
            {creator.profileImage && (
              <ImageWithFallback
                src={creator.profileImage}
                alt={creator.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <button
                onClick={() => onNavigate(getCreatorProfilePath(creator.id))}
                className="font-semibold hover:underline"
              >
                {creator.displayName}
              </button>
              <p className="text-sm text-muted-foreground">
                {new Date(content.createdAt).toLocaleDateString('ko-KR')} · {content.category}
              </p>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Content Body */}
        <Card>
          <CardContent className="p-6">
            {canViewFullContent ? (
              <div className="prose max-w-none">
                {parseContentBody(content.body).map((block, idx) => {
                  if (block.type === 'text') {
                    const trimmed = block.text?.trim();
                    if (!trimmed) return null;
                    return (
                      <p key={`t-${idx}`} className="whitespace-pre-wrap">
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'image') {
                    return (
                      <figure key={`i-${idx}`} className="my-6">
                        <img
                          src={block.url}
                          alt={block.alt || '이미지'}
                          className="rounded-lg border max-w-full"
                        />
                        {block.alt ? (
                          <figcaption className="text-sm text-muted-foreground mt-2">
                            {block.alt}
                          </figcaption>
                        ) : null}
                      </figure>
                    );
                  }

                  if (block.type === 'video') {
                    const info = getVideoEmbedInfo(block.url);
                    if (!info.src) return null;

                    if (info.kind === 'youtube') {
                      return (
                        <div key={`v-${idx}`} className="my-6 aspect-video w-full overflow-hidden rounded-lg border bg-black">
                          <iframe
                            src={info.src}
                            title="영상"
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={`v-${idx}`} className="my-6">
                        <video src={info.src} controls className="w-full rounded-lg border" />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ) : (
              <div>
                {/* Intro (non-free content) */}
                {content.preview && (
                  <div className="mb-6 rounded-lg border bg-white p-6">
                    <h3 className="text-sm font-semibold mb-2">콘텐츠 소개</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {content.preview}
                    </p>
                  </div>
                )}

                {/* Lock Message */}
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    {content.accessType === 'SUBSCRIBER'
                      ? '구독자 전용 콘텐츠'
                      : '유료 콘텐츠'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {content.accessType === 'SUBSCRIBER'
                      ? '이 크리에이터를 구독하면 전체 콘텐츠를 볼 수 있습니다.'
                      : '단건 구매 후 전체 콘텐츠를 열람할 수 있습니다.'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    {content.accessType === 'SUBSCRIBER' && (
                      <Button size="lg" onClick={() => setShowSubscribeDialog(true)}>
                        구독하기
                      </Button>
                    )}
                    {content.accessType === 'PAID' && (
                      <Button size="lg" onClick={() => setShowPurchaseDialog(true)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        ₩{content.price?.toLocaleString()} 구매하기
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onNavigate(getCreatorProfilePath(creator.id))}
                    >
                      크리에이터 프로필 보기
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="mt-8">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl font-semibold">댓글</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={sortOrder === 'newest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('newest')}
              >
                최신순
              </Button>
              <Button
                type="button"
                variant={sortOrder === 'oldest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('oldest')}
              >
                오래된순
              </Button>
              <span className="text-sm text-muted-foreground">{comments.length}개</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {!canViewFullContent ? (
                <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">
                  전체 콘텐츠를 열람한 뒤 댓글을 확인/작성할 수 있어요.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
                    ) : (
                      topLevelComments.map((c) => {
                        const replies = repliesByParent.get(c.id) || [];
                        const liked = !!user && (c.likedByUserIds || []).includes(user.id);
                        const likeCount = (c.likedByUserIds || []).length;
                        const isAuthor = !!authorUserId && c.userId === authorUserId;
                        const isCreator = creatorUserIdSet.has(c.userId);
                        return (
                          <div key={c.id} className="rounded-lg border bg-white p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium truncate">{c.authorName || '익명'}</span>
                                  {isAuthor ? <Badge variant="default">작성자</Badge> : null}
                                  {isCreator ? <Badge variant="secondary">크리에이터</Badge> : null}
                                  <span className="text-xs text-muted-foreground">
                                    {c.createdAt ? new Date(c.createdAt).toLocaleString('ko-KR') : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant={liked ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleToggleLike(c.id)}
                                >
                                  좋아요 {likeCount}
                                </Button>
                                {user && (user.role === 'ADMIN' || user.id === c.userId) ? (
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteComment(c)}>
                                    삭제
                                  </Button>
                                ) : null}
                              </div>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>

                            <div className="mt-3 flex items-center justify-between">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (!user) {
                                    toast.error('로그인이 필요합니다.');
                                    onNavigate(ROUTES.LOGIN);
                                    return;
                                  }
                                  setReplyToId((prev) => (prev === c.id ? null : c.id));
                                  setReplyBody('');
                                }}
                              >
                                답글
                              </Button>
                              {replies.length > 0 ? (
                                <span className="text-xs text-muted-foreground">답글 {replies.length}개</span>
                              ) : null}
                            </div>

                            {replyToId === c.id ? (
                              <div className="mt-3 space-y-2">
                                <Textarea
                                  value={replyBody}
                                  onChange={(e) => setReplyBody(e.target.value)}
                                  placeholder="답글을 입력하세요"
                                  rows={2}
                                  disabled={isSubmittingReply}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyToId(null);
                                      setReplyBody('');
                                    }}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => handleAddReply(c.id)}
                                    disabled={isSubmittingReply}
                                  >
                                    {isSubmittingReply ? '등록 중...' : '답글 등록'}
                                  </Button>
                                </div>
                              </div>
                            ) : null}

                            {replies.length > 0 ? (
                              <div className="mt-4 space-y-3 border-l pl-4">
                                {replies.map((r) => {
                                  const rLiked = !!user && (r.likedByUserIds || []).includes(user.id);
                                  const rLikeCount = (r.likedByUserIds || []).length;
                                  const rIsAuthor = !!authorUserId && r.userId === authorUserId;
                                  const rIsCreator = creatorUserIdSet.has(r.userId);
                                  return (
                                    <div key={r.id} className="rounded-lg border bg-white p-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium truncate text-sm">{r.authorName || '익명'}</span>
                                            {rIsAuthor ? <Badge variant="default">작성자</Badge> : null}
                                            {rIsCreator ? <Badge variant="secondary">크리에이터</Badge> : null}
                                            <span className="text-xs text-muted-foreground">
                                              {r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : ''}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            type="button"
                                            variant={rLiked ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleToggleLike(r.id)}
                                          >
                                            좋아요 {rLikeCount}
                                          </Button>
                                          {user && (user.role === 'ADMIN' || user.id === r.userId) ? (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteComment(r)}>
                                              삭제
                                            </Button>
                                          ) : null}
                                        </div>
                                      </div>
                                      <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder={user ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있어요'}
                      rows={3}
                      disabled={!user || isSubmittingComment}
                    />
                    <div className="flex justify-end">
                      <Button type="button" onClick={handleAddComment} disabled={isSubmittingComment}>
                        {isSubmittingComment ? '등록 중...' : '댓글 등록'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>구독 플랜 선택</DialogTitle>
            <DialogDescription>
              {creator.displayName}의 구독 플랜을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:border-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ₩{plan.price.toLocaleString()}
                      </div>
                      <Button size="sm" onClick={() => handleSubscribe(plan.id)}>
                        선택
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>콘텐츠 구매</DialogTitle>
            <DialogDescription>
              이 콘텐츠를 단건 구매하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{content.title}</h4>
              <div className="flex items-center justify-between">
                <span>결제 금액</span>
                <span className="font-semibold text-lg">
                  ₩{content.price?.toLocaleString()}
                </span>
              </div>
            </div>
            <Button className="w-full" onClick={handlePurchase}>
              구매하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

