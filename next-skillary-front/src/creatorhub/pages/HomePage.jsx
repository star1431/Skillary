import { Button } from '../components/ui/button';
import { ContentCard } from '../components/ContentCard';
import { CreatorCard } from '../components/CreatorCard';
import { ArrowRight, TrendingUp, Star, Zap } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { listCreators } from '@/lib/creatorRepo';
import { listCategories, listContents } from '@/lib/contentRepo';

export function HomePage({ onNavigate }) {
  const featuredCreators = listCreators().filter((c) => c.status === 'APPROVED').slice(0, 3);
  const popularContents = listContents().slice(0, 4);
  const categories = listCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            크리에이터와 함께 성장하세요
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            전문가의 지식과 노하우를 구독하고, 당신의 성장을 가속화하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate(ROUTES.CREATORS)}>
              크리에이터 둘러보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate(ROUTES.CATEGORIES)}>
              카테고리 탐색
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">전문가 콘텐츠</h3>
            <p className="text-sm text-muted-foreground">
              검증된 크리에이터의 고품질 콘텐츠
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">지속적인 업데이트</h3>
            <p className="text-sm text-muted-foreground">
              구독하면 새로운 콘텐츠를 계속 받아보세요
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">유연한 접근</h3>
            <p className="text-sm text-muted-foreground">
              구독 또는 단건 구매로 자유롭게 선택
            </p>
          </div>
        </div>
      </section>

      {/* Popular Contents */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">인기 콘텐츠</h2>
          <Button variant="ghost" onClick={() => onNavigate(ROUTES.CATEGORIES)}>
            전체 보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularContents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onClick={() => onNavigate(`${ROUTES.CONTENT_DETAIL.replace(':id', content.id)}`)}
            />
          ))}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">추천 크리에이터</h2>
          <Button variant="ghost" onClick={() => onNavigate(ROUTES.CREATORS)}>
            전체 보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onClick={() => onNavigate(`${ROUTES.CREATOR_PROFILE.replace(':id', creator.id)}`)}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">카테고리</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-auto py-6"
              onClick={() => onNavigate(`${ROUTES.CATEGORIES}?category=${encodeURIComponent(category)}`)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-lg mb-6 opacity-90">
            관심있는 크리에이터를 구독하고 전문 지식을 얻으세요
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate(ROUTES.CREATORS)}>
            구독 시작하기
          </Button>
        </div>
      </section>
    </div>
  );
}

