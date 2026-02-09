"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Download, FileText, Image as ImageIcon, Eye, ZoomIn, ZoomOut
} from 'lucide-react';

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  title: string;
  type: 'image' | 'pdf';
  downloadName?: string;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  url,
  title,
  type,
  downloadName
}: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setZoom(100);
      setLoading(true);
      setError(false);
    }
  }, [open, url]);

  const handleDownload = () => {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName || `${title.toLowerCase().replace(/\s+/g, '-')}.${type === 'pdf' ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-gray-600 hover:bg-gray-900"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {type === 'image' ? (
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <FileText className="h-5 w-5 text-red-600" />
                )}
                <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {type === 'image' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 25}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 300}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Badge variant="outline" className="bg-white">
                {type === 'image' ? 'Image' : 'PDF'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!url}
                className="text-blue-600 border-blue-200 hover:bg-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {!url ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No document available</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <p className="text-red-600 font-medium mb-2">Failed to load document</p>
                  <p className="text-gray-500 text-sm mb-4">The document could not be displayed</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 flex items-center justify-center min-h-full">
                  {type === 'image' ? (
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      <img
                        src={url}
                        alt={title}
                        style={{
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: 'center',
                          transition: 'transform 0.2s ease-in-out'
                        }}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl">
                      {loading && (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      <iframe
                        src={url}
                        className="w-full h-[70vh] border rounded-lg shadow-lg"
                        onLoad={() => setLoading(false)}
                        onError={handleImageError}
                        title={title}
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
