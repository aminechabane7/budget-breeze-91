
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  amount: string;
  icon: React.ReactNode;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  amount,
  icon
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-md">
                {icon}
              </div>
              <div>
                <h3 className="font-medium text-sm">{title}</h3>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>
            <p className="text-2xl font-bold mt-4">${amount}</p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
