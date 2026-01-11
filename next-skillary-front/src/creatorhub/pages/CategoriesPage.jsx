import { useState } from 'react';
import { Search } from 'lucide-react';
import { ContentCard } from '../components/ContentCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { getContentDetailPath } from '../config/routes';
import { listCategories, listContents } from '@/lib/contentRepo';

export function CategoriesPage({ onNavigate, initialCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedAccessType, setSelectedAccessType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');

  let filteredContents = listContents().filter((content) => {
    const matchesCategory =
      selectedCategory === 'all' || content.category === selectedCategory;
    const matchesAccessType =
      selectedAccessType === 'all' || content.accessType === selectedAccessType.toUpperCase();
    const matchesSearch =
      searchTerm === '' ||
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesAccessType && matchesSearch;
  });

  // Sort
  if (sortBy === 'latest') {
    filteredContents.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">콘텐츠 탐색</h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="콘텐츠 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {listCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAccessType} onValueChange={setSelectedAccessType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="접근 방식" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="preview">무료</SelectItem>
                <SelectItem value="subscriber">구독자 전용</SelectItem>
                <SelectItem value="paid">단건 구매</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSearchTerm('')}
              >
                검색: {searchTerm} ✕
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory} ✕
              </Badge>
            )}
            {selectedAccessType !== 'all' && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedAccessType('all')}
              >
                {selectedAccessType === 'preview' && '무료'}
                {selectedAccessType === 'subscriber' && '구독자 전용'}
                {selectedAccessType === 'paid' && '단건 구매'} ✕
              </Badge>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredContents.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              {filteredContents.length}개의 콘텐츠
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onClick={() => onNavigate(getContentDetailPath(content.id))}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

