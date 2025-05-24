import { Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function CartItem({ id, name, price, quantity, image }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };

  const handleRemove = () => {
    removeItem(id);
  };

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{name}</h3>
            <p className="ml-4">${price.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center">
            <button
              onClick={handleDecrement}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={handleRemove}
              className="font-medium text-red-600 hover:text-red-500 flex items-center"
            >
              <Trash size={16} className="mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;