
import React from 'react';
import { 
  CreditCard, 
  Home, 
  ShoppingCart, 
  Utensils, 
  Car, 
  Briefcase,
  Heart, 
  Plane,
  Zap,
  PhoneCall,
  Coffee,
  DollarSign,
  Gift,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CategoryType = 
  | 'groceries'
  | 'rent'
  | 'utilities'
  | 'dining'
  | 'transportation'
  | 'salary'
  | 'health'
  | 'travel'
  | 'entertainment'
  | 'phone'
  | 'subscriptions'
  | 'income'
  | 'gift'
  | 'other';

interface CategoryIconProps {
  category: CategoryType;
  className?: string;
  size?: number;
  color?: string;
}

const iconMap: Record<CategoryType, React.ElementType> = {
  groceries: ShoppingCart,
  rent: Home,
  utilities: Zap,
  dining: Utensils,
  transportation: Car,
  salary: Briefcase,
  health: Heart,
  travel: Plane,
  entertainment: Coffee,
  phone: PhoneCall,
  subscriptions: Wifi,
  income: DollarSign,
  gift: Gift,
  other: CreditCard
};

const colorMap: Record<CategoryType, string> = {
  groceries: 'bg-blue-100 text-blue-600',
  rent: 'bg-purple-100 text-purple-600',
  utilities: 'bg-yellow-100 text-yellow-600',
  dining: 'bg-red-100 text-red-600',
  transportation: 'bg-green-100 text-green-600',
  salary: 'bg-emerald-100 text-emerald-600',
  health: 'bg-pink-100 text-pink-600',
  travel: 'bg-indigo-100 text-indigo-600',
  entertainment: 'bg-orange-100 text-orange-600',
  phone: 'bg-sky-100 text-sky-600',
  subscriptions: 'bg-violet-100 text-violet-600',
  income: 'bg-teal-100 text-teal-600',
  gift: 'bg-rose-100 text-rose-600',
  other: 'bg-gray-100 text-gray-600'
};

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className,
  size = 16,
  color,
}) => {
  const Icon = iconMap[category] || CreditCard;
  const defaultColor = colorMap[category];

  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full p-2",
      color || defaultColor,
      className
    )}>
      <Icon size={size} />
    </div>
  );
};

export default CategoryIcon;
