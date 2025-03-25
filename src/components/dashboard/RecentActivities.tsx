
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Bolt, Wifi, DollarSign } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  amount: number;
  icon: React.ReactNode;
  date: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
  date?: string;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  date = '02 Mar 2021',
  activities = [
    {
      id: '1',
      title: 'Water Bill',
      description: 'Successfully',
      amount: 120,
      icon: <Droplet className="h-5 w-5 text-blue-500" />,
      date: '02 Mar 2021'
    },
    {
      id: '2',
      title: 'Income Salary',
      description: 'Received',
      amount: 4500,
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      date: '02 Mar 2021'
    },
    {
      id: '3',
      title: 'Electric Bill',
      description: 'Successfully',
      amount: 150,
      icon: <Bolt className="h-5 w-5 text-yellow-500" />,
      date: '02 Mar 2021'
    },
    {
      id: '4',
      title: 'Internet Bill',
      description: 'Successfully',
      amount: 60,
      icon: <Wifi className="h-5 w-5 text-purple-500" />,
      date: '02 Mar 2021'
    }
  ]
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Recent Activities</CardTitle>
        <p className="text-sm text-gray-500">{date}</p>
      </CardHeader>
      <CardContent className="px-6 py-2">
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activity.icon}
                </div>
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
              <p className={`font-semibold ${activity.title.includes('Income') ? 'text-green-600' : 'text-gray-900'}`}>
                {activity.title.includes('Income') ? '+' : ''}${activity.amount}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
