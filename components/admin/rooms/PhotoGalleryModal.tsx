"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, ChevronLeft, ChevronRight, Play, Image as ImageIcon,
  Video as VideoIcon, Download, Pause, ZoomIn, ZoomOut,
  Maximize2, Grid, List, FileImage, Eye, Film,
  Camera, PanelRight, PanelLeft, MoreVertical, 
  Star, Share2, Bookmark, ExternalLink
} from 'lucide-react';

interface PhotoItem {
  url: string;
  label?: string;
  type: 'photo' | 'video';
}

interface PhotoGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos?: PhotoItem[];
  initialIndex?: number;
  roomNumber?: string;
  propertyName?: string;
}

export function PhotoGalleryModal({
  open,
  onOpenChange,
  photos = [],
  initialIndex = 0,
  roomNumber = '',
  propertyName = ''
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredItems = photos.filter(item => {
    if (activeTab === 'photos') return item.type === 'photo';
    if (activeTab === 'videos') return item.type === 'video';
    return true;
  });

  const currentItem = filteredItems[currentIndex];
  const photoCount = photos.filter(i => i.type === 'photo').length;
  const videoCount = photos.filter(i => i.type === 'video').length;

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setActiveTab('all');
      setIsVideoPlaying(false);
      setZoom(1);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [open, photos, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); goToPrevious(); break;
        case 'ArrowRight': e.preventDefault(); goToNext(); break;
        case 'Escape': e.preventDefault(); onOpenChange(false); break;
        case ' ': if (currentItem?.type === 'video') { e.preventDefault(); handleVideoPlay(); } break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentItem, currentIndex, onOpenChange]);

  const goToPrevious = () => {
    if (filteredItems.length <= 1) return;
    setCurrentIndex(prev => {
      const newIndex = prev > 0 ? prev - 1 : filteredItems.length - 1;
      setIsVideoPlaying(false);
      setZoom(1);
      if (videoRef.current) videoRef.current.pause();
      return newIndex;
    });
  };

  const goToNext = () => {
    if (filteredItems.length <= 1) return;
    setCurrentIndex(prev => {
      const newIndex = prev < filteredItems.length - 1 ? prev + 1 : 0;
      setIsVideoPlaying(false);
      setZoom(1);
      if (videoRef.current) videoRef.current.pause();
      return newIndex;
    });
  };

  const handleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsVideoPlaying(true));
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  const downloadMedia = () => {
    if (!currentItem) return;
    const link = document.createElement('a');
    link.href = currentItem.url;
    link.download = `${propertyName || 'media'}-${currentItem.type}-${Date.now()}.${currentItem.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex flex-col h-full">
          {/* Floating Header - Minimal Design */}
          <div className="absolute top-0 left-0 right-0 z-50">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {propertyName || 'Media Gallery'}
                    </span>
                    {roomNumber && (
                      <Badge variant="secondary" className="text-xs">
                        Room {roomNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                >
                  {sidebarOpen ? <PanelLeft className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${
                    isFavorite ? 'text-amber-500' : ''
                  }`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>

                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700">
                  {currentIndex + 1} / {filteredItems.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden pt-12">
            {/* Collapsible Sidebar - Card Design */}
            {sidebarOpen && (
              <div className="w-72 border-r bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="p-4">
                  {/* Media Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Photos</p>
                            <p className="text-2xl font-bold text-blue-700">{photoCount}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Camera className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-red-600 font-medium">Videos</p>
                            <p className="text-2xl font-bold text-red-700">{videoCount}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Film className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filter Tabs - Card Style */}
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
                    <TabsList className="grid grid-cols-3 bg-gray-100/50 p-1">
                      <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white">
                        All Media
                      </TabsTrigger>
                      <TabsTrigger value="photos" className="text-xs data-[state=active]:bg-white">
                        <ImageIcon className="h-3.5 w-3.5 mr-1" />
                        Photos
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="text-xs data-[state=active]:bg-white">
                        <VideoIcon className="h-3.5 w-3.5 mr-1" />
                        Videos
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Media Grid */}
                  <div className="space-y-2">
                    {filteredItems.map((item, index) => (
                      <Card 
                        key={`${item.url}-${index}`}
                        className={`cursor-pointer transition-all hover:shadow-md border ${
                          currentIndex === index 
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsVideoPlaying(false);
                          setZoom(1);
                          if (videoRef.current) videoRef.current.pause();
                        }}
                      >
                        <CardContent className="p-2">
                          <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {item.type === 'photo' ? (
                                <img
                                  src={item.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                  <VideoIcon className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                              {/* Type Badge */}
                              <Badge className={`absolute bottom-1 right-1 text-[10px] px-1 py-0.5 ${
                                item.type === 'video' 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}>
                                {item.type === 'video' ? 'VID' : 'IMG'}
                              </Badge>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {item.label || `Media ${index + 1}`}
                                </p>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                  {item.type === 'video' ? 'Video File' : 'Image File'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {item.type === 'photo' ? 'Photo' : 'Video'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Viewer with Gradient Background */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {filteredItems.length === 0 ? (
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FileImage className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Media Available</h3>
                      <p className="text-gray-600 text-sm">
                        Upload photos or videos to start viewing
                      </p>
                    </CardContent>
                  </Card>
                ) : currentItem.type === 'photo' ? (
                  <div className="relative max-w-4xl max-h-[70vh] p-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={currentItem.url}
                        alt={currentItem.label || ''}
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: `scale(${zoom})` }}
                      />
                      
                      {/* Zoom Controls - Floating */}
                      <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleZoomIn}
                          disabled={zoom >= 3}
                          className="h-8 w-8"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="text-center text-xs font-medium px-2 py-1">
                          {Math.round(zoom * 100)}%
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleZoomOut}
                          disabled={zoom <= 0.5}
                          className="h-8 w-8"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        {zoom !== 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetZoom}
                            className="h-8 w-8"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative max-w-4xl max-h-[70vh] w-full p-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <video
                        ref={videoRef}
                        src={currentItem.url}
                        className="max-w-full max-h-full"
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        controls
                      />
                      
                      {/* Custom Play Button Overlay */}
                      {!isVideoPlaying && (
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                          <Button
                            size="lg"
                            onClick={handleVideoPlay}
                            className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl hover:from-red-600 hover:to-pink-600"
                          >
                            <Play className="h-8 w-8" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Controls - Floating */}
                {filteredItems.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-xl border">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevious}
                        className="h-10 w-10 rounded-full hover:bg-gray-100 hover:text-gray-500"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      
                      <div className="px-4">
                        <div className="text-center">
                          <span className="font-semibold text-sm">
                            {currentIndex + 1} of {filteredItems.length}
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Navigate with arrow keys
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="h-10 w-10 rounded-full hover:bg-gray-100 hover:text-gray-500"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Control Panel - Glassmorphism */}
              <div className="border-t bg-white/90 backdrop-blur-sm">
                <div className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    {/* Current Media Info */}
                    <div className="flex items-center gap-3">
                      {currentItem && (
                        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                currentItem.type === 'video' 
                                  ? 'bg-gradient-to-br from-red-100 to-pink-100' 
                                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                              }`}>
                                {currentItem.type === 'video' ? (
                                  <VideoIcon className="h-5 w-5 text-red-600" />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">
                                    {currentItem.label || `${currentItem.type === 'video' ? 'Video' : 'Photo'} Preview`}
                                  </h4>
                                  <Badge className={
                                    currentItem.type === 'video' 
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }>
                                    {currentItem.type === 'video' ? 'Video' : 'Photo'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {propertyName && `${propertyName} • `}
                                  {currentItem.type === 'photo' ? 'High-resolution image' : 'Media playback'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadMedia}
                        className="gap-1.5 border-gray-300 hover:bg-gray-50"
                        disabled={!currentItem}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentItem?.url, '_blank')}
                        className="gap-1.5 border-gray-300 hover:bg-gray-50"
                        disabled={!currentItem}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={currentItem?.type === 'video' ? handleVideoPlay : downloadMedia}
                        className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={!currentItem}
                      >
                        {currentItem?.type === 'video' ? (
                          <>
                            {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {isVideoPlaying ? 'Pause Video' : 'Play Video'}
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            View Full Size
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}