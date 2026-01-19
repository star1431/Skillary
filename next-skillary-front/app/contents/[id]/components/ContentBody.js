'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

export default function ContentBody({ content, canViewContent }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const videoSwiperRef = useRef(null);
  const mainSwiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('images');

  // 이미지와 비디오 분리
  const imageFiles = content.post?.postFiles?.filter(fileUrl => 
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(fileUrl)
  ) || [];
  
  const videoFiles = content.post?.postFiles?.filter(fileUrl => 
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(fileUrl)
  ) || [];

  // 이미지와 비디오가 모두 있을 때만 탭 표시
  const showTabs = imageFiles.length > 0 && videoFiles.length > 0;

  // 초기 탭 설정: 이미지가 있으면 이미지, 없으면 비디오
  useEffect(() => {
    if (imageFiles.length > 0) {
      setActiveTab('images');
    } else if (videoFiles.length > 0) {
      setActiveTab('videos');
    }
  }, [imageFiles.length, videoFiles.length]);

  return (
    <>
      {/* 콘텐츠 소개 */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">콘텐츠 소개</h2>
        <p className="text-gray-700 leading-relaxed">{content.description}</p>
      </div>

      {/* 콘텐츠 본문 */}
      {content.post && content.post.body && (
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="prose prose-lg max-w-none">
            {canViewContent ? (
              <>
                {/* 이미지/비디오 탭 및 콘텐츠 */}
                {(imageFiles.length > 0 || videoFiles.length > 0) && (
                  <div className="mb-8">
                    {/* 탭 네비게이션 */}
                    {showTabs && (
                      <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                          onClick={() => setActiveTab('images')}
                          className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                            activeTab === 'images'
                              ? 'text-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          이미지 ({imageFiles.length})
                          {activeTab === 'images' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('videos')}
                          className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                            activeTab === 'videos'
                              ? 'text-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          비디오 ({videoFiles.length})
                          {activeTab === 'videos' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* 탭 패널 */}
                    <div className="relative">
                      {/* 이미지 패널 */}
                      {(activeTab === 'images' || !showTabs) && imageFiles.length > 0 && (
                        <div className={showTabs && activeTab !== 'images' ? 'hidden' : ''}>
                          {/* 메인 이미지 스와이퍼 */}
                          <Swiper
                            ref={mainSwiperRef}
                            modules={[Navigation, Thumbs]}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation={imageFiles.length > 1}
                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                            loop={imageFiles.length > 1}
                            autoHeight={true}
                            onSlideChange={(swiper) => {
                              const index = imageFiles.length > 1 && swiper.loopedSlides 
                                ? swiper.realIndex 
                                : swiper.activeIndex;
                              setActiveIndex(index);
                            }}
                            onInit={(swiper) => {
                              const index = imageFiles.length > 1 && swiper.loopedSlides 
                                ? swiper.realIndex 
                                : swiper.activeIndex;
                              setActiveIndex(index);
                            }}
                            className="main-image-swiper rounded-xl overflow-hidden shadow-lg mb-4"
                            style={{
                              '--swiper-navigation-color': '#fff',
                              '--swiper-navigation-size': '24px',
                            }}
                          >
                            {imageFiles.map((fileUrl, index) => (
                              <SwiperSlide key={index}>
                                <div className="relative w-full bg-gray-100">
                                  <img
                                    src={fileUrl}
                                    alt={`콘텐츠 이미지 ${index + 1}`}
                                    className="w-full h-auto object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>

                          {/* 썸네일 갤러리 */}
                          {imageFiles.length > 1 && (
                            <Swiper
                              onSwiper={setThumbsSwiper}
                              modules={[Thumbs]}
                              spaceBetween={8}
                              slidesPerView={5}
                              freeMode={true}
                              watchSlidesProgress={true}
                              breakpoints={{
                                640: {
                                  slidesPerView: 6,
                                },
                                1024: {
                                  slidesPerView: 8,
                                },
                              }}
                              className="thumbs-swiper mt-3"
                            >
                              {imageFiles.map((fileUrl, index) => {
                                const isActive = activeIndex === index;
                                return (
                                  <SwiperSlide key={index}>
                                    <div className={`relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                                      isActive 
                                        ? 'border-blue-500 opacity-100 shadow-md' 
                                        : 'border-transparent opacity-60 hover:border-blue-500 hover:opacity-100'
                                    }`}>
                                      <img
                                        src={fileUrl}
                                        alt={`썸네일 ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </SwiperSlide>
                                );
                              })}
                            </Swiper>
                          )}
                        </div>
                      )}

                      {/* 비디오 패널 */}
                      {(activeTab === 'videos' || !showTabs) && videoFiles.length > 0 && (
                        <div className={showTabs && activeTab !== 'videos' ? 'hidden' : ''}>
                          <Swiper
                            ref={videoSwiperRef}
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation={videoFiles.length > 1}
                            pagination={videoFiles.length > 1 ? {
                              clickable: true,
                              dynamicBullets: true,
                            } : false}
                            loop={videoFiles.length > 1}
                            autoHeight={true}
                            onSlideChange={(swiper) => {
                              // 슬라이드 변경 시 높이 업데이트
                              setTimeout(() => {
                                swiper.updateAutoHeight();
                              }, 100);
                            }}
                            onInit={(swiper) => {
                              // 초기화 시 높이 업데이트
                              setTimeout(() => {
                                swiper.updateAutoHeight();
                              }, 100);
                            }}
                            className="video-swiper rounded-xl overflow-hidden shadow-lg"
                            style={{
                              '--swiper-navigation-color': '#3b82f6',
                              '--swiper-navigation-size': '28px',
                              '--swiper-pagination-color': '#3b82f6',
                            }}
                          >
                            {videoFiles.map((fileUrl, index) => (
                              <SwiperSlide key={index}>
                                <div className="relative w-full bg-black rounded-xl overflow-hidden">
                                  <video
                                    src={fileUrl}
                                    controls
                                    className="w-full h-auto max-h-[800px]"
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                      // 비디오 메타데이터 로드 후 Swiper 높이 업데이트
                                      if (videoSwiperRef.current?.swiper) {
                                        videoSwiperRef.current.swiper.updateAutoHeight();
                                      }
                                    }}
                                    onLoadedData={(e) => {
                                      // 비디오 데이터 로드 후에도 높이 업데이트
                                      if (videoSwiperRef.current?.swiper) {
                                        videoSwiperRef.current.swiper.updateAutoHeight();
                                      }
                                    }}
                                  >
                                    비디오를 재생할 수 없습니다.
                                  </video>
                                  {/* 비디오 오버레이 그라데이션 */}
                                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 본문 텍스트 */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed mt-6 pt-6 border-t border-gray-200">
                  {content.post.body}
                </div>
              </>
            ) : (
              <div className="h-[300px] relative overflow-hidden bg-gray-50 rounded-lg">
                {/* 스켈레톤 UI */}
                <div className="absolute inset-0 p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                {/* 오버레이 메시지 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-bold mb-2">
                      {content.planId ? '구독이 필요한 콘텐츠입니다' : '구매가 필요한 콘텐츠입니다'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {content.planId ? '구독하시면 전체 콘텐츠를 볼 수 있습니다' : '구매하시면 전체 콘텐츠를 볼 수 있습니다'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

