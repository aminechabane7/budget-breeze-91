
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

interface Transaction {
  id: string;
  user: {
    name: string;
    image?: string;
  };
  description: string;
  amount: number;
  time: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions = [
    {
      id: '1',
      user: { name: 'John Smith', image: '/lovable-uploads/ff7b9736-dea6-4fed-9297-4f41ced94292.png' },
      description: 'Car Insurance',
      amount: 350.00,
      time: '10:42:23 AM',
      status: 'Completed'
    },
    {
      id: '2',
      user: { name: 'Sarah Johnson', image: '/lovable-uploads/ff7b9736-dea6-4fed-9297-4f41ced94292.png' },
      description: 'Loan Payment',
      amount: 1200.00,
      time: '12:42:00 PM',
      status: 'Completed'
    },
    {
      id: '3',
      user: { name: 'Emma Williams', image: '/lovable-uploads/ff7b9736-dea6-4fed-9297-4f41ced94292.png' },
      description: 'Online Payment',
      amount: 154.00,
      time: '10:42:23 AM',
      status: 'Completed'
    }
  ] 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">History</CardTitle>
        <p className="text-sm text-gray-500">Transaction of last 6 months</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50">
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={transaction.user.image} alt={transaction.user.name} />
                      <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.time}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={transaction.status === 'Completed' ? 'outline' : 'secondary'}
                    className={`${
                      transaction.status === 'Completed' 
                        ? 'border-green-200 text-green-600 bg-green-50' 
                        : transaction.status === 'Pending'
                        ? 'border-yellow-200 text-yellow-600 bg-yellow-50'
                        : 'border-red-200 text-red-600 bg-red-50'
                    }`}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
