import { Link } from 'react-router-dom';
import { ShoppingCart, Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Copy, Check, Instagram } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  id: number;
  nom: string;
  prix: string | number;
  images: string[];
  description?: string;
  prix_reduit?: string | number;
}

function ProductCard({ id, nom, prix, images, description, prix_reduit }: ProductCardProps) {
  const { addItem } = useCart();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ 
      id: id.toString(), 
      name: nom, 
      price: typeof prix === 'string' ? parseFloat(prix) : prix, 
      image: images && images.length > 0 ? images[0] : '/placeholder-image.jpg' 
    });
  };

  const handleShare = (platform: string) => {
    const productUrl = `${window.location.origin}/products/${id}`;
    const shareText = `Check out this amazing product: ${nom}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}&hashtags=ShopEase`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(productUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}&title=${encodeURIComponent(nom)}&summary=${encodeURIComponent(description || '')}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(nom)}&body=${encodeURIComponent(`${description || ''}\n\nCheck out this product: ${productUrl}`)}`
    };

    if (platform === 'copy') {
      handleCopyLink();
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}/products/${id}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle price formatting safely
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const displayPrice = formatPrice(prix);
  const displayReducedPrice = prix_reduit ? formatPrice(prix_reduit) : null;
  const mainImage = images && images.length > 0 ? images[0] : '/placeholder-image.jpg';

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md relative">
      <Link to={`/products/${id}`} className="block">
        <div className="relative pb-[65%] overflow-hidden">
          <img
            src={mainImage}
            alt={nom}
            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.jpg';
            }}
          />
          {/* Share button overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">{nom}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {displayReducedPrice ? (
                <>
                  <span className="text-lg font-semibold text-red-600">${displayReducedPrice}</span>
                  <span className="text-sm text-gray-500 line-through">${displayPrice}</span>
                </>
              ) : (
                <span className="text-lg font-semibold">${displayPrice}</span>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddToCart}
              className="opacity-90 group-hover:opacity-100"
            >
              <ShoppingCart size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>
      </Link>

      {/* Share Menu Dropdown */}
      {showShareMenu && (
        <div className="absolute top-12 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[200px]">
          <div className="text-xs font-medium text-gray-700 mb-2 px-2">Share this product:</div>
          <div className="space-y-1">
            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              <Facebook size={16} />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-black hover:bg-gray-50 rounded"
            >
              <Twitter size={16} />
              <span>Twitter/X</span>
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-pink-600 hover:bg-pink-50 rounded"
            >
              <Instagram size={16} />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-blue-700 hover:bg-blue-50 rounded"
            >
              <Linkedin size={16} />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('email')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              <Mail size={16} />
              <span>Email</span>
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}

export default ProductCard;