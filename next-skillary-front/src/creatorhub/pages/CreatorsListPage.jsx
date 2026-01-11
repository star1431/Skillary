import { useState } from 'react';
import { CreatorCard } from '../components/CreatorCard';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { listCreators } from '@/lib/creatorRepo';
import { listCategories } from '@/lib/contentRepo';
import { Search } from 'lucide-react';
import { getCreatorProfilePath } from '../config/routes';

export function CreatorsListPage({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCreators = listCreators()
    .filter((c) => c.status === 'APPROVED')
    .filter((creator) => {
      const matchesSearch =
        creator.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || creator.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">크리에이터 탐색</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="크리에이터 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="카테고리 선택" />
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
        </div>

        {/* Results */}
        {filteredCreators.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              {filteredCreators.length}명의 크리에이터
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onClick={() => onNavigate(getCreatorProfilePath(creator.id))}
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

