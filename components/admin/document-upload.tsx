"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { uploadDocument } from "@/lib/tenantApi";

interface DocumentUploadProps {
  tenantId?: string | number;
  type: 'id_proof' | 'address_proof' | 'photo';
  label: string;
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  accept?: string;
}

export function DocumentUpload({
  tenantId,
  type,
  label,
  currentUrl,
  onUploadSuccess,
  accept = "image/*,.pdf,.doc,.docx"
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadDocument(tenantId, type, file, null);
      if (result?.success) {
        const url = result.url || URL.createObjectURL(file);
        setPreview(url);
        onUploadSuccess(url);
        toast.success("Document uploaded successfully");
      } else {
        toast.error(result?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onUploadSuccess(url);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
        {preview ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  onUploadSuccess("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {preview.match(/\.(jpeg|jpg|png|gif)$/i) ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt={label}
                  className="w-full h-48 object-cover rounded"
                />
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-white p-1 rounded"
                >
                  <Eye className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <File className="h-3 w-3" />
                View Document
              </a>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag & drop or click to upload</p>
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || !tenantId}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <Label 
              htmlFor={`file-upload-${type}`}
              className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Label>
            <p className="text-xs text-gray-500 mt-2">Max size: 5MB • Formats: JPG, PNG, PDF, DOC</p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Or enter URL</Label>
        <Input
          type="url"
          placeholder="Enter document URL"
          value={preview || ""}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={uploading}
        />
      </div>
    </div>
  );
}