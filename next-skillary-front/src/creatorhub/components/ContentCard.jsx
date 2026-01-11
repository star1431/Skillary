import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatCurrency, formatDate, truncateText } from '../utils/formatters';
import { getContentAccessBadgeVariant, getContentAccessLabel } from '../utils/helpers';
import { CONTENT_ACCESS_TYPE } from '../config/constants';
import { getCreatorById } from '@/lib/creatorRepo';
import { getCommentCountByContent, subscribeCommentsChanged } from '@/lib/commentsRepo';

export function ContentCard({ content, onClick }) {
  const creator = getCreatorById(content.creatorId);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!content?.id) return;
    const refresh = () => setCommentCount(getCommentCountByContent(content.id));
    refresh();
    return subscribeCommentsChanged(refresh);
  }, [content?.id]);

  const getAccessBadge = () => {
    const variant = getContentAccessBadgeVariant(content.accessType);
    const label = getContentAccessLabel(content.accessType, content.price);
    
    switch (content.accessType) {
      case CONTENT_ACCESS_TYPE.PREVIEW:
        return <Badge variant={variant}>{label}</Badge>;
      case CONTENT_ACCESS_TYPE.SUBSCRIBER:
        return <Badge variant={variant}>{label}</Badge>;
      case CONTENT_ACCESS_TYPE.PAID:
        return <Badge variant={variant}>{label || formatCurrency(content.price)}</Badge>;
      default:
        // 혹시 FREE 같은 값이 들어온 경우도 표시
        if (label) return <Badge variant={variant}>{label}</Badge>;
        return null;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
      onClick={onClick}
    >
      {content.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2 flex-1">{content.title}</h3>
          {getAccessBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {content.preview || truncateText(content.body, 100)}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {creator?.profileImage && (
            <ImageWithFallback
              src={creator.profileImage}
              alt={creator.displayName}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-muted-foreground">{creator?.displayName || '알 수 없음'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">댓글 {commentCount}</Badge>
          <span className="text-muted-foreground text-xs">{formatDate(content.createdAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

