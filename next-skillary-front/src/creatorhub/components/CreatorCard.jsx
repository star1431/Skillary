import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatCurrency, formatSubscriberCount } from '../utils/formatters';
import { listPlansByCreator } from '@/lib/creatorRepo';

export function CreatorCard({ creator, onClick }) {
  const plans = listPlansByCreator(creator.id).filter((p) => p.isActive);
  const mainPlan = plans[0];

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="text-center">
        {creator.profileImage && (
          <div className="mx-auto mb-4">
            <ImageWithFallback
              src={creator.profileImage}
              alt={creator.displayName}
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />
          </div>
        )}
        <h3 className="font-semibold text-lg">{creator.displayName}</h3>
        <Badge variant="outline" className="mx-auto mt-2">
          {creator.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center line-clamp-2 mb-4">
          {creator.bio}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>구독자 {formatSubscriberCount(creator.subscriberCount)}명</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {mainPlan && (
          <div className="text-center w-full">
            <div className="text-sm text-muted-foreground">{mainPlan.name}</div>
            <div className="font-semibold text-lg">
              월 {formatCurrency(mainPlan.price)}
            </div>
          </div>
        )}
        <Button className="w-full" onClick={onClick}>
          프로필 보기
        </Button>
      </CardFooter>
    </Card>
  );
}

