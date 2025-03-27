
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';
import { Business } from '@/pages/Business';

interface BusinessListProps {
  businesses: Business[];
  isLoading: boolean;
  onSelectBusiness: (business: Business) => void;
  selectedBusinessId?: string;
}

type SortField = 'name' | 'revenue' | 'expenses' | 'profit' | 'status';
type SortDirection = 'asc' | 'desc';

const BusinessList: React.FC<BusinessListProps> = ({ 
  businesses, 
  isLoading, 
  onSelectBusiness,
  selectedBusinessId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate profit for each business
  const businessesWithProfit = businesses.map(business => ({
    ...business,
    profit: Number(business.revenue) - Number(business.expenses)
  }));

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter businesses based on search term
  const filteredBusinesses = businessesWithProfit.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort businesses based on sort field and direction
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'status') {
      return sortDirection === 'asc' 
        ? a.status.localeCompare(b.status) 
        : b.status.localeCompare(a.status);
    } else {
      const aValue = sortField === 'profit' ? a.profit : (sortField === 'revenue' ? Number(a.revenue) : Number(a.expenses));
      const bValue = sortField === 'profit' ? b.profit : (sortField === 'revenue' ? Number(b.revenue) : Number(b.expenses));
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const SortableHeader = ({ field, title }: { field: SortField, title: string }) => (
    <div 
      className="flex items-center cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      {title}
      <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
      {sortField === field && (
        <span className="ml-1 text-xs">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Business List</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedBusinesses.length > 0 ? (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader field="name" title="Business Name" /></TableHead>
                  <TableHead className="text-right"><SortableHeader field="revenue" title="Revenue" /></TableHead>
                  <TableHead className="text-right"><SortableHeader field="expenses" title="Expenses" /></TableHead>
                  <TableHead className="text-right"><SortableHeader field="profit" title="Profit" /></TableHead>
                  <TableHead><SortableHeader field="status" title="Status" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBusinesses.map((business) => (
                  <TableRow 
                    key={business.id} 
                    className={`cursor-pointer ${business.id === selectedBusinessId ? 'bg-muted' : ''}`}
                    onClick={() => onSelectBusiness(business)}
                  >
                    <TableCell className="font-medium">{business.name}</TableCell>
                    <TableCell className="text-right">${Number(business.revenue).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${Number(business.expenses).toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-medium ${business.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${business.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        business.status === 'active' ? 'bg-green-100 text-green-800' :
                        business.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col">
            <p className="text-muted-foreground">No businesses found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try a different search term' : 'Add a business to get started'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessList;
