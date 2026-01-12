import FeatureItem from './FeatureItem';

const features = [
  {
    title: '전문가 콘텐츠',
    description: '검증된 크리에이터의 고품질 콘텐츠',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    )
  },
  {
    title: '지속적인 업데이트',
    description: '구독하면 새로운 콘텐츠를 계속 받아보세요',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    )
  },
  {
    title: '유연한 접근',
    description: '구독 또는 단건 구매로 자유롭게 선택',
    borderColor: 'border-green-300',
    iconColor: 'text-green-400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    )
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              title={feature.title}
              description={feature.description}
              borderColor={feature.borderColor}
              iconColor={feature.iconColor}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
