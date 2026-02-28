// "use client";

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   X, Download, FileText, Image as ImageIcon, Eye, ZoomIn, ZoomOut
// } from 'lucide-react';

// interface DocumentViewerModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   url?: string;
//   title: string;
//   type: 'image' | 'pdf';
//   downloadName?: string;
// }

// export function DocumentViewerModal({
//   open,
//   onOpenChange,
//   url,
//   title,
//   type,
//   downloadName
// }: DocumentViewerModalProps) {
//   const [zoom, setZoom] = useState(100);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setZoom(100);
//       setLoading(true);
//       setError(false);
//     }
//   }, [open, url]);

//   const handleDownload = () => {
//     if (!url) return;

//     const link = document.createElement('a');
//     link.href = url;
//     link.download = downloadName || `${title.toLowerCase().replace(/\s+/g, '-')}.${type === 'pdf' ? 'pdf' : 'jpg'}`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleZoomIn = () => {
//     setZoom(prev => Math.min(prev + 25, 300));
//   };

//   const handleZoomOut = () => {
//     setZoom(prev => Math.max(prev - 25, 25));
//   };

//   const handleImageLoad = () => {
//     setLoading(false);
//   };

//   const handleImageError = () => {
//     setLoading(false);
//     setError(true);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
//         <div className="flex flex-col h-full">
//           {/* Header */}
//           <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
//             <div className="flex items-center gap-3">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onOpenChange(false)}
//                 className="text-gray-600 hover:bg-gray-900"
//               >
//                 <X className="h-5 w-5" />
//               </Button>
//               <div className="flex items-center gap-2">
//                 {type === 'image' ? (
//                   <ImageIcon className="h-5 w-5 text-blue-600" />
//                 ) : (
//                   <FileText className="h-5 w-5 text-red-600" />
//                 )}
//                 <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {type === 'image' && (
//                 <div className="flex items-center gap-1">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={handleZoomOut}
//                     disabled={zoom <= 25}
//                     className="h-8 w-8 p-0"
//                   >
//                     <ZoomOut className="h-4 w-4" />
//                   </Button>
//                   <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={handleZoomIn}
//                     disabled={zoom >= 300}
//                     className="h-8 w-8 p-0"
//                   >
//                     <ZoomIn className="h-4 w-4" />
//                   </Button>
//                 </div>
//               )}
//               <Badge variant="outline" className="bg-white">
//                 {type === 'image' ? 'Image' : 'PDF'}
//               </Badge>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleDownload}
//                 disabled={!url}
//                 className="text-blue-600 border-blue-200 hover:bg-blue-500"
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 Download
//               </Button>
//             </div>
//           </DialogHeader>

//           {/* Content */}
//           <div className="flex-1 overflow-hidden bg-gray-50">
//             {!url ? (
//               <div className="h-full flex items-center justify-center">
//                 <div className="text-center">
//                   <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//                   <p className="text-gray-500">No document available</p>
//                 </div>
//               </div>
//             ) : error ? (
//               <div className="h-full flex items-center justify-center">
//                 <div className="text-center">
//                   <FileText className="h-16 w-16 mx-auto mb-4 text-red-400" />
//                   <p className="text-red-600 font-medium mb-2">Failed to load document</p>
//                   <p className="text-gray-500 text-sm mb-4">The document could not be displayed</p>
//                   <div className="flex gap-2 justify-center">
//                     <Button
//                       variant="outline"
//                       onClick={() => window.open(url, '_blank')}
//                     >
//                       <Eye className="h-4 w-4 mr-2" />
//                       Open in New Tab
//                     </Button>
//                     <Button
//                       variant="outline"
//                       onClick={handleDownload}
//                     >
//                       <Download className="h-4 w-4 mr-2" />
//                       Download
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <ScrollArea className="h-full">
//                 <div className="p-4 flex items-center justify-center min-h-full">
//                   {type === 'image' ? (
//                     <div className="relative">
//                       {loading && (
//                         <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         </div>
//                       )}
//                       <img
//                         src={url}
//                         alt={title}
//                         style={{
//                           transform: `scale(${zoom / 100})`,
//                           transformOrigin: 'center',
//                           transition: 'transform 0.2s ease-in-out'
//                         }}
//                         className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
//                         onLoad={handleImageLoad}
//                         onError={handleImageError}
//                       />
//                     </div>
//                   ) : (
//                     <div className="w-full max-w-4xl">
//                       {loading && (
//                         <div className="flex items-center justify-center py-12">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         </div>
//                       )}
//                       <iframe
//                         src={url}
//                         className="w-full h-[70vh] border rounded-lg shadow-lg"
//                         onLoad={() => setLoading(false)}
//                         onError={handleImageError}
//                         title={title}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </ScrollArea>
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <DialogContent 
        className={`
          ${isMobile 
            ? 'w-[95vw] max-w-[95vw] h-[90vh] p-0 rounded-xl' 
            : 'max-w-6xl max-h-[90vh] p-0 overflow-hidden'
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header - Mobile Optimized */}
          <DialogHeader className={`
            flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50
            ${isMobile ? 'p-2' : 'p-4'}
          `}>
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className={`
                  text-gray-600 hover:bg-gray-900 shrink-0
                  ${isMobile ? 'h-7 w-7' : 'h-9 w-9'}
                `}
              >
                <X className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                {type === 'image' ? (
                  <ImageIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600 shrink-0`} />
                ) : (
                  <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-600 shrink-0`} />
                )}
                <DialogTitle className={`
                  font-semibold truncate
                  ${isMobile ? 'text-sm max-w-[120px]' : 'text-lg'}
                `}>
                  {title}
                </DialogTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {type === 'image' && !isMobile && (
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
              
              {/* Mobile image zoom controls - Simplified */}
              {type === 'image' && isMobile && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 25}
                    className="h-7 w-7"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 300}
                    className="h-7 w-7"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <Badge variant="outline" className={`
                bg-white shrink-0
                ${isMobile ? 'text-[10px] px-1.5 py-0 h-5' : ''}
              `}>
                {type === 'image' ? 'Image' : 'PDF'}
              </Badge>
              
              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={handleDownload}
                disabled={!url}
                className={`
                  text-blue-600 border-blue-200 hover:bg-blue-500
                  ${isMobile ? 'h-7 w-7' : ''}
                `}
              >
                <Download className={isMobile ? 'h-3 w-3' : 'h-4 w-4 mr-2'} />
                {!isMobile && 'Download'}
              </Button>
            </div>
          </DialogHeader>

          {/* Content - Mobile Optimized */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {!url ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <FileText className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} mx-auto mb-4 text-gray-400`} />
                  <p className={`text-gray-500 ${isMobile ? 'text-sm' : ''}`}>No document available</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center max-w-xs">
                  <FileText className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} mx-auto mb-4 text-red-400`} />
                  <p className={`text-red-600 font-medium mb-2 ${isMobile ? 'text-sm' : ''}`}>Failed to load document</p>
                  <p className={`text-gray-500 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>The document could not be displayed</p>
                  <div className={`flex gap-2 justify-center ${isMobile ? 'flex-col' : 'flex-row'}`}>
                    <Button
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      onClick={() => window.open(url, '_blank')}
                      className={isMobile ? 'w-full' : ''}
                    >
                      <Eye className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      onClick={handleDownload}
                      className={isMobile ? 'w-full' : ''}
                    >
                      <Download className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex items-center justify-center min-h-full p-2 md:p-4">
                  {type === 'image' ? (
                    <div className="relative w-full flex justify-center">
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
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
                        className={`
                          object-contain rounded-lg shadow-lg
                          ${isMobile 
                            ? 'max-w-full max-h-[calc(90vh-120px)]' 
                            : 'max-w-full max-h-[70vh]'
                          }
                        `}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      {loading && (
                        <div className="flex items-center justify-center py-8 md:py-12">
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      <iframe
                        src={url}
                        className={`
                          border rounded-lg shadow-lg
                          ${isMobile 
                            ? 'w-full h-[calc(90vh-140px)]' 
                            : 'w-full h-[70vh]'
                          }
                        `}
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

          {/* Mobile Instructions */}
          {isMobile && !error && url && (
            <div className="py-1 px-2 text-center border-t bg-gray-50">
              <p className="text-[10px] text-gray-500">
                {type === 'pdf' 
                  ? 'Pinch to zoom • Swipe to scroll' 
                  : 'Double tap to zoom • Pinch to adjust'
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}