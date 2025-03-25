
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Car } from 'lucide-react';

interface Payment {
  id: string;
  title: string;
  status: string;
  amount: number;
  icon: React.ReactNode;
  date: string;
}

interface UpcomingPaymentsProps {
  payments?: Payment[];
  date?: string;
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({
  date = '13 Mar 2021',
  payments = [
    {
      id: '1',
      title: 'Home Rent',
      status: 'Pending',
      amount: 1500,
      icon: <Home className="h-5 w-5 text-blue-500" />,
      date: '13 Mar 2021'
    },
    {
      id: '2',
      title: 'Car Insurance',
      status: 'Pending',
      amount: 150,
      icon: <Car className="h-5 w-5 text-green-500" />,
      date: '15 Mar 2021'
    }
  ]
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Payments</CardTitle>
        <p className="text-sm text-gray-500">{date}</p>
      </CardHeader>
      <CardContent className="px-6 py-2">
        <div className="space-y-6">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {payment.icon}
                </div>
                <div>
                  <h3 className="font-medium">{payment.title}</h3>
                  <p className="text-sm text-yellow-600">{payment.status}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">${payment.amount}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
