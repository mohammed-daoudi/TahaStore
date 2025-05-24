import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

function ProductCard({ id, name, price, image, description }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image });
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/products/${id}`} className="block">
        <div className="relative pb-[65%] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">{name}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-semibold">${price.toFixed(2)}</span>
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
    </div>
  );
}

export default ProductCard;