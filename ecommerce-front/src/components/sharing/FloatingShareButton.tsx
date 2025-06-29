import { useState, useEffect } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Copy, Check, X, Instagram } from 'lucide-react';
import Button from '../ui/Button';

function FloatingShareButton() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const pageTitle = document.title;
    const pageDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Check out this amazing website!';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(pageTitle)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(pageTitle)}&hashtags=ShopEase`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(currentUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(pageTitle)}&summary=${encodeURIComponent(pageDescription)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${pageTitle} - ${pageDescription} ${currentUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(`${pageDescription}\n\nCheck out this website: ${currentUrl}`)}`
    };

    if (platform === 'copy') {
      handleCopyLink();
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Share Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Share2 size={24} />
        </Button>
      </div>

      {/* Share Menu Overlay */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share this page</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-3 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Facebook size={20} />
                <span className="font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-3 p-3 text-black hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Twitter size={20} />
                <span className="font-medium">Twitter/X</span>
              </button>
              
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center space-x-3 p-3 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <Instagram size={20} />
                <span className="font-medium">Instagram</span>
              </button>
              
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-3 p-3 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Linkedin size={20} />
                <span className="font-medium">LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-3 p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <MessageCircle size={20} />
                <span className="font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail size={20} />
                <span className="font-medium">Email</span>
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                <span className="font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            
            {copied && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Check size={16} />
                  <span className="text-sm font-medium">Link copied to clipboard!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingShareButton; 