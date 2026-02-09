"use client";

import React from 'react';
import { 
  Share2, 
  Link, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageSquare, 
  Mail,
  CheckCircle,
  Copy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  code?: string;
}

const ShareButtons = ({ url, title, description, code }: ShareButtonsProps) => {
  const [copied, setCopied] = React.useState(false);
  
  const shareData = {
    title: title,
    text: description || `Use code ${code} to get special discounts!`,
    url: url
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const tweetText = `${title} - ${description || ''} ${code ? `Use code: ${code}` : ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const message = `${title}\n\n${description || ''}\n\n${code ? `Offer Code: ${code}` : ''}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Check out this offer: ${title}`;
    const body = `${description || ''}\n\n${code ? `Use offer code: ${code}` : ''}\n\nView more: ${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const shareViaTelegram = () => {
    const message = `${title}\n\n${description || ''}\n\n${code ? `Offer Code: ${code}` : ''}\n\n${url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex flex-col gap-3">
        {/* Share Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Share this offer</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="h-7 text-xs border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>

        {/* Quick Copy Link */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className={`flex-1 justify-start gap-2 ${copied ? 'text-green-600 border-green-300 bg-green-50' : 'hover:border-blue-400'}`}
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="text-sm font-medium truncate">
              {copied ? 'Link Copied!' : 'Copy Link'}
            </span>
          </Button>
        </div>

        {/* Social Media Icons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareOnWhatsApp}
            className="h-9 flex-col gap-0.5 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
            title="Share on WhatsApp"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareOnFacebook}
            className="h-9 flex-col gap-0.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            title="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
            <span className="text-xs">Facebook</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareOnTwitter}
            className="h-9 flex-col gap-0.5 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300"
            title="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
            <span className="text-xs">Twitter</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareOnLinkedIn}
            className="h-9 flex-col gap-0.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
            <span className="text-xs">LinkedIn</span>
          </Button>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaEmail}
            className="h-8 justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <Mail className="h-3 w-3" />
            <span className="text-xs">Email</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareViaTelegram}
            className="h-8 justify-start gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <MessageSquare className="h-3 w-3" />
            <span className="text-xs">Telegram</span>
          </Button>
        </div>

        {/* URL Display */}
        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-700 truncate">{url}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="h-6 w-6 p-0 hover:bg-gray-200"
              title="Copy URL"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;