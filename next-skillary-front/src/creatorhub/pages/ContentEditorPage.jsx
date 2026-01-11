import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus, Link2, Video } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { CONTENT_ACCESS_TYPE, CONTENT_ACCESS_TYPE_LABELS } from '../config/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getVideoEmbedInfo, parseContentBody } from '../utils/contentBlocks';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { createContent, editContent, getContentById, listCategories } from '@/lib/contentRepo';
import { createCreatorProfile, getCreatorByUserId } from '@/lib/creatorRepo';

export function ContentEditorPage({ contentId, onNavigate }) {
  const { user } = useAuth();
  const existingContent = contentId ? getContentById(contentId) : null;
  const categories = listCategories();

  // categories가 제대로 로드되었는지 확인하고 기본값 설정
  const defaultCategory = categories && categories.length > 0 
    ? categories[0] 
    : '개발/프로그래밍'; // fallback 값
  
  const [title, setTitle] = useState(existingContent?.title || '');
  const [thumbnail, setThumbnail] = useState(existingContent?.thumbnail || '');
  const [body, setBody] = useState(existingContent?.body || '');
  const [intro, setIntro] = useState(existingContent?.preview || '');
  const [category, setCategory] = useState(existingContent?.category || defaultCategory);
  const [accessType, setAccessType] = useState(
    existingContent?.accessType === 'PREVIEW' 
      ? CONTENT_ACCESS_TYPE.FREE 
      : (existingContent?.accessType || CONTENT_ACCESS_TYPE.FREE)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [editorTab, setEditorTab] = useState('write');

  const textareaRef = useRef(null);

  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaTab, setMediaTab] = useState('image'); // image | video
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaFileUrl, setMediaFileUrl] = useState('');

  const blurActiveElement = () => {
    try {
      if (textareaRef.current) textareaRef.current.blur();
      const active = typeof document !== 'undefined' ? document.activeElement : null;
      if (active && typeof active.blur === 'function') active.blur();
    } catch {
      // ignore
    }
  };

  if (!user || user.role !== 'CREATOR') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">크리에이터만 접근할 수 있습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)}>홈으로</Button>
      </div>
    );
  }

  // 크리에이터 프로필이 없으면 자동으로 생성
  let creatorProfile = getCreatorByUserId(user.id);
  if (!creatorProfile) {
    // 임시 크리에이터 프로필 생성
    creatorProfile = createCreatorProfile({
      id: `creator-profile-${user.id}`,
      userId: user.id,
      displayName: user.nickname || '크리에이터',
      profileImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      bio: '크리에이터 프로필',
      category: categories && categories.length > 0 ? categories[0] : '기타',
      subscriberCount: 0,
      status: 'APPROVED',
      createdAt: new Date(),
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!title.trim() || !body.trim()) {
      toast.error('제목과 본문을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!category || !accessType) {
      toast.error('카테고리와 접근 방식을 모두 선택해주세요.');
      setIsLoading(false);
      return;
    }

    // 무료가 아닌 경우(구독자 전용/단건 구매) 소개 입력 필수
    if (accessType !== CONTENT_ACCESS_TYPE.FREE) {
      if (!intro.trim()) {
        toast.error('무료가 아닌 콘텐츠는 "콘텐츠 소개"를 입력해주세요.');
        setIsLoading(false);
        return;
      }
    }

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 접근 방식 처리: FREE는 PREVIEW로 저장 (기존 호환성)
    const accessTypeToSave = accessType === CONTENT_ACCESS_TYPE.FREE ? 'PREVIEW' : accessType;
    const previewToSave =
      accessTypeToSave === 'PREVIEW'
        ? body.substring(0, 100)
        : intro.trim();

    if (contentId) {
      // 수정
      editContent(contentId, {
        title,
        thumbnail: thumbnail?.trim() || undefined,
        body,
        preview: previewToSave,
        category,
        accessType: accessTypeToSave,
      });
      toast.success('콘텐츠가 수정되었습니다.');
    } else {
      // 새로 작성
      createContent({
        creatorId: creatorProfile.id,
        title,
        thumbnail:
          thumbnail?.trim() ||
          'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600',
        body,
        preview: previewToSave,
        category,
        accessType: accessTypeToSave,
      });
      toast.success('콘텐츠가 작성되었습니다.');
    }
    
    setIsLoading(false);
    onNavigate(ROUTES.MY_PAGE);
  };

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => `${prev}${text}`);
      return;
    }

    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);

    // restore cursor
    requestAnimationFrame(() => {
      try {
        el.focus();
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
      } catch {
        // ignore
      }
    });
  };

  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaFileUrl(url);
    setMediaUrl('');
    if (!mediaAlt) setMediaAlt(file.name);
  };

  const handlePickCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setThumbnail(url);
  };

  const handleInsertMedia = () => {
    const url = (mediaUrl || mediaFileUrl || '').trim();
    if (!url) {
      toast.error('미디어 URL을 입력하거나 파일을 선택해주세요.');
      return;
    }

    if (mediaTab === 'image') {
      const alt = (mediaAlt || '이미지').trim();
      insertAtCursor(`\n\n![${alt}](${url})\n\n`);
    } else {
      insertAtCursor(`\n\n@[video](${url})\n\n`);
    }

    setShowMediaDialog(false);
    setMediaUrl('');
    setMediaAlt('');
    setMediaFileUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="ghost" onClick={() => onNavigate(ROUTES.MY_PAGE)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            마이페이지
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate(ROUTES.MY_PAGE)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="button" onClick={() => document.getElementById('content-editor-submit')?.click()} disabled={isLoading}>
              {isLoading ? '저장 중...' : '발행하기'}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-lg">
              {contentId ? '콘텐츠 수정' : '새 콘텐츠 작성'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="p-6 pb-4 bg-white">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="text-3xl font-bold border-0 px-2 focus-visible:ring-0 focus-visible:border-0"
                  required
                />
              </div>

              {/* Cover */}
              <div className="px-6 pb-6 bg-white">
                <div className="space-y-2">
                  <Label>표지 이미지(썸네일)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-2">
                      <Input
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="이미지 URL을 입력하거나 파일을 선택하세요"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePickCoverFile}
                          className="w-full"
                        />
                        {thumbnail && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setThumbnail('')}
                          >
                            제거
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        파일 업로드는 데모 환경이라 새로고침하면 URL이 사라질 수 있어요. 실제 서비스에선 업로드 후 URL을 저장하세요.
                        <br />
                        권장 표지 크기: 16:9 비율 (예: 1280×720, 1600×900)
                      </p>
                    </div>

                    <div className="md:col-span-1">
                      {thumbnail ? (
                        <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                          <ImageWithFallback
                            src={thumbnail}
                            alt="표지 이미지 미리보기"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          미리보기 없음
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="px-6 pt-4 pb-6 bg-white border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>카테고리 *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>접근 방식 *</Label>
                    <Select value={accessType} onValueChange={setAccessType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="접근 방식 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CONTENT_ACCESS_TYPE.FREE}>{CONTENT_ACCESS_TYPE_LABELS.FREE}</SelectItem>
                        <SelectItem value={CONTENT_ACCESS_TYPE.SUBSCRIBER}>{CONTENT_ACCESS_TYPE_LABELS.SUBSCRIBER}</SelectItem>
                        <SelectItem value={CONTENT_ACCESS_TYPE.PAID}>{CONTENT_ACCESS_TYPE_LABELS.PAID}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Intro (only for non-free) */}
                {accessType !== CONTENT_ACCESS_TYPE.FREE && (
                  <div className="mt-4 space-y-2">
                    <Label>콘텐츠 소개 *</Label>
                    <Textarea
                      value={intro}
                      onChange={(e) => setIntro(e.target.value)}
                      placeholder="구독/구매 전에 보여줄 짧은 소개를 작성해주세요 (예: 1~3문장)"
                      rows={3}
                      className="bg-white"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      유료/구독자 전용 콘텐츠는 본문 대신 소개 문구가 노출됩니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="border-t bg-gray-50">
                <div className="px-6 pt-4">
                  <Tabs value={editorTab} onValueChange={setEditorTab}>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <TabsList>
                        <TabsTrigger value="write">작성</TabsTrigger>
                        <TabsTrigger value="preview">미리보기</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            blurActiveElement();
                            setMediaTab('image');
                            setShowMediaDialog(true);
                          }}
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          이미지
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            blurActiveElement();
                            setMediaTab('video');
                            setShowMediaDialog(true);
                          }}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          영상
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertAtCursor('[링크 텍스트](https://)')}>
                          <Link2 className="mr-2 h-4 w-4" />
                          링크
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="write">
                      <div className="px-6 pb-6">
                        <Textarea
                          ref={textareaRef}
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="본문을 작성하세요. 이미지: ![설명](URL) / 영상: @[video](URL)"
                          rows={12}
                          className="min-h-[300px] bg-white"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          - 이미지 삽입: <span className="font-mono">![설명](URL)</span> · 영상 삽입: <span className="font-mono">@[video](URL)</span>
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="px-6 pb-6">
                        <Card className="bg-white">
                          <CardContent className="p-6">
                            <div className="prose max-w-none">
                              {parseContentBody(body).length === 0 ? (
                                <p className="text-muted-foreground">미리볼 내용이 없습니다.</p>
                              ) : (
                                parseContentBody(body).map((block, idx) => {
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
                                        <img src={block.url} alt={block.alt || '이미지'} className="rounded-lg border max-w-full" />
                                        {block.alt ? (
                                          <figcaption className="text-sm text-muted-foreground mt-2">{block.alt}</figcaption>
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
                                })
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* submit button (hidden) */}
              <button id="content-editor-submit" type="submit" className="hidden" />
            </form>
          </CardContent>
        </Card>

        {/* Media Dialog */}
        <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{mediaTab === 'image' ? '이미지 삽입' : '영상 삽입'}</DialogTitle>
              <DialogDescription>
                {mediaTab === 'image'
                  ? '이미지 URL을 붙여넣거나 파일을 업로드해 본문에 삽입할 수 있습니다.'
                  : 'YouTube 링크 또는 mp4/webm 링크(또는 파일 업로드)를 본문에 삽입할 수 있습니다.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {mediaTab === 'image' && (
                <div className="space-y-2">
                  <Label>이미지 설명(선택)</Label>
                  <Input value={mediaAlt} onChange={(e) => setMediaAlt(e.target.value)} placeholder="예) 스크린샷, 다이어그램" />
                </div>
              )}

              <div className="space-y-2">
                <Label>{mediaTab === 'image' ? 'URL' : 'URL (YouTube 또는 mp4 등)'}</Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={mediaTab === 'image' ? 'https://...jpg' : 'https://youtube.com/watch?v=... 또는 https://...mp4'}
                />
              </div>

              <div className="space-y-2">
                <Label>파일 업로드(선택)</Label>
                <Input type="file" accept={mediaTab === 'image' ? 'image/*' : 'video/*'} onChange={handlePickFile} />
                {mediaFileUrl ? (
                  mediaTab === 'image' ? (
                    <img src={mediaFileUrl} alt="미리보기" className="mt-2 rounded-md border max-h-48" />
                  ) : (
                    <video src={mediaFileUrl} controls className="mt-2 w-full rounded-md border" />
                  )
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMediaDialog(false);
                  setMediaUrl('');
                  setMediaAlt('');
                  setMediaFileUrl('');
                }}
              >
                취소
              </Button>
              <Button type="button" onClick={handleInsertMedia}>
                본문에 삽입
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

