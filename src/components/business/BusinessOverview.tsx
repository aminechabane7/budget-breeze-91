
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Business } from '@/pages/Business';

interface BusinessOverviewProps {
  business: Business;
  onEdit: () => void;
  onDelete: () => void;
}

const BusinessOverview: React.FC<BusinessOverviewProps> = ({ 
  business,
  onEdit,
  onDelete
}) => {
  const profit = Number(business.revenue) - Number(business.expenses);
  const profitMargin = business.revenue > 0 ? (profit / Number(business.revenue) * 100) : 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{business.name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Tag className="mr-1 h-4 w-4" />
              <span>{business.category}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            business.status === 'active' ? 'bg-green-100 text-green-800' :
            business.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {business.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{business.description}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Revenue</div>
              <div className="text-2xl font-semibold text-green-600">${Number(business.revenue).toLocaleString()}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Expenses</div>
              <div className="text-2xl font-semibold text-red-600">${Number(business.expenses).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-muted-foreground">Profit</div>
              <div className="text-sm flex items-center">
                {profit >= 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                )}
                {profitMargin.toFixed(1)}% margin
              </div>
            </div>
            <div className={`text-2xl font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(profit).toLocaleString()}
              {profit < 0 && ' (Loss)'}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Created on {format(new Date(business.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit2 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" onClick={onDelete} className="flex items-center">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessOverview;
