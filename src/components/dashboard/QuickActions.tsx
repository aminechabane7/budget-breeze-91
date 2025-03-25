
import React from 'react';
import { SendIcon, Download, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickActions: React.FC = () => {
  const actions = [
    { 
      name: 'Deposit', 
      icon: <Download className="h-5 w-5" />, 
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Deposit clicked') 
    },
    { 
      name: 'Send', 
      icon: <SendIcon className="h-5 w-5" />, 
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Send clicked') 
    },
    { 
      name: 'Receive', 
      icon: <Upload className="h-5 w-5" />, 
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Receive clicked') 
    },
    { 
      name: 'Receipt', 
      icon: <FileText className="h-5 w-5" />, 
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => console.log('Receipt clicked') 
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => (
            <Button
              key={action.name}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center h-24 ${action.color} text-white`}
              variant="ghost"
            >
              <div className="bg-white/20 rounded-full p-2 mb-2">
                {action.icon}
              </div>
              <span className="text-sm">{action.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
