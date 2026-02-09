"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface AvatarUploaderProps {
  avatarUrl: string;
  fullName: string;
  onUpload: (file: File) => void;
  uploading: boolean;
}

export default function AvatarUploader({ avatarUrl, fullName, onUpload, uploading }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
          {fullName ? fullName.charAt(0).toUpperCase() : 'A'}
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleButtonClick}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload Photo
        </Button>
        <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
      </div>
    </div>
  );
}