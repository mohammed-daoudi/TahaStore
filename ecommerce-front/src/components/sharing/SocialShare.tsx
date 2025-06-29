import { Facebook, Twitter, Linkedin, Mail, Share2, MessageCircle, Copy, Check, Instagram } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

function SocialShare({ url, title, description, image }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=ShopEase`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${description || ''} ${url}`)}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ''}\n\nCheck out this product: ${url}`)}`
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    const shareUrl = shareUrls[platform];
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
          ...(image && { files: [image] })
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Share this product:</span>
        <div className="flex flex-wrap gap-2">
          {/* Facebook */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="h-5 w-5" />
          </Button>

          {/* Twitter/X */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="text-black hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title="Share on Twitter/X"
          >
            <Twitter className="h-5 w-5" />
          </Button>

          {/* Instagram */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('instagram')}
            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 transition-colors"
            title="Share on Instagram"
          >
            <Instagram className="h-5 w-5" />
          </Button>

          {/* LinkedIn */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </Button>

          {/* WhatsApp */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            title="Share on WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* Email */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('email')}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title="Share via Email"
          >
            <Mail className="h-5 w-5" />
          </Button>

          {/* Copy Link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className={`transition-colors ${
              copied 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title={copied ? 'Link copied!' : 'Copy link'}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </Button>

          {/* Native Share (mobile) */}
          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNativeShare}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Copy Link Feedback */}
      {copied && (
        <div className="text-sm text-green-600 flex items-center space-x-1">
          <Check className="h-4 w-4" />
          <span>Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

export default SocialShare; 