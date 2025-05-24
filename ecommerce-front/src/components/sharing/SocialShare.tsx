import { Facebook, Twitter, Linkedin, Mail, Share2 } from 'lucide-react';
import Button from '../ui/Button';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

function SocialShare({ url, title, description }: SocialShareProps) {
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description || '')}%0A%0A${encodeURIComponent(url)}`
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    const shareUrl = shareUrls[platform];
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Share:</span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="text-blue-600 hover:text-blue-700"
          >
            <Facebook className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="text-blue-400 hover:text-blue-500"
          >
            <Twitter className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="text-blue-700 hover:text-blue-800"
          >
            <Linkedin className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare('email')}
            className="text-gray-600 hover:text-gray-700"
          >
            <Mail className="h-5 w-5" />
          </Button>
          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNativeShare}
              className="text-gray-600 hover:text-gray-700"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialShare; 