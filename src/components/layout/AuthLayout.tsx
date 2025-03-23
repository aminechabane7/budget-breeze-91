
import React from 'react';
import { useLocation } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const pageTitle = isLoginPage ? 'Welcome back' : 'Create an account';
  const pageDescription = isLoginPage
    ? 'Enter your credentials to access your account'
    : 'Fill in the details below to create your account';

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground">{pageDescription}</p>
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Right side - Visual */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/80 to-primary/30 p-16">
        <div className="h-full glass-morphism rounded-2xl p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Take control of your finances with Bolt</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="rounded-full bg-primary/20 p-1.5 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">Track your spending with beautiful, intuitive dashboards</p>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-primary/20 p-1.5 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">Set budgets and receive notifications to stay on track</p>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-primary/20 p-1.5 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">Visualize your financial history with detailed reports</p>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-primary/20 p-1.5 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">Access your data securely from any device</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
