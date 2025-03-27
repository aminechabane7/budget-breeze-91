
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BusinessOverview: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Business Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <Building className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">Manage Your Business</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Track your business revenue, expenses, and profitability all in one place.
          </p>
          <Button asChild>
            <Link to="/business">Go to Business</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessOverview;
