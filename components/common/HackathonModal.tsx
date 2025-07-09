'use client';

import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'hackathon-modal-hide';

export default function HackathonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    // 로컬 스토리지에서 숨김 여부 확인
    const isHidden = localStorage.getItem(STORAGE_KEY);
    if (!isHidden) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    // 비디오 음소거 상태 설정
    const video = document.querySelector('video');
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted, isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsOpen(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const video = document.querySelector('video');
    if (video) {
      video.muted = !isMuted;
    }
  };

  const handleVideoEnd = () => {
    setCurrentVideo(1); // 두 번째 동영상으로 변경
  };

  const videos = [
    '/assets/hakerton_video.mp4',
    '/assets/hackerton_video_animal.mp4'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-0 border-0">
        <DialogTitle className="sr-only">제4회 GS그룹 해커톤: PLAI</DialogTitle>
        <div className="relative bg-white">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* 모달 내용 */}
          <div className="p-6">
            {/* 헤더 */}
            <div className="text-center mb-5">
              <h2 className="text-[28px] font-light text-gray-900 mb-2">
                제4회 GS그룹 해커톤: PLAI
              </h2>
              <p className="text-[16px] text-gray-600">
                Play with GenAI - Make it WOW, Make it WORK!
              </p>
            </div>

            {/* 비디오 영역 */}
            <div className="relative w-full aspect-video bg-gray-50 rounded-xl overflow-hidden mb-5">
              <video
                key={currentVideo}
                className="w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                loop={currentVideo === 1}
                playsInline
                preload="auto"
                style={{ objectFit: 'cover' }}
                onEnded={currentVideo === 0 ? handleVideoEnd : undefined}
              >
                <source src={videos[currentVideo]} type="video/mp4" />
                동영상을 재생할 수 없습니다.
              </video>
              
              {/* 음소거 버튼 */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            {/* 일정 정보 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-[15px] font-medium text-gray-900 mb-3">해커톤 일정</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-[20px] mb-1">📝</div>
                  <p className="text-[13px] font-medium text-gray-800">리모트리그</p>
                  <p className="text-[12px] text-gray-600">8월 13일 - 27일</p>
                </div>
                <div className="text-center">
                  <div className="text-[20px] mb-1">🏆</div>
                  <p className="text-[13px] font-medium text-gray-800">필드리그</p>
                  <p className="text-[12px] text-gray-600">9월 8일 - 9일</p>
                </div>
                <div className="text-center">
                  <div className="text-[20px] mb-1">🎯</div>
                  <p className="text-[13px] font-medium text-gray-800">챔피언스리그</p>
                  <p className="text-[12px] text-gray-600">9월 29일</p>
                </div>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 mb-4">
              <Button
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-10 text-[14px]"
                onClick={() => {
                  window.open('https://v0-gs-group-hackathon.vercel.app', '_blank');
                }}
              >
                해커톤 자세히 보기
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-200 hover:bg-gray-50 h-10 text-[14px]"
                onClick={handleClose}
              >
                나중에
              </Button>
            </div>

            {/* 다시 보지 않기 체크박스 */}
            <div className="flex items-center justify-end">
              <label className="flex items-center cursor-pointer text-[13px] text-gray-600">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="mr-2 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                다시 보지 않기
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}