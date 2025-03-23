
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, ChartPieIcon, BarChart3, PlusCircle, Shield } from 'lucide-react';
import BlurredCard from '@/components/shared/BlurredCard';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-primary/5">
        <nav className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-primary font-bold text-2xl tracking-tight">Bolt</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex flex-col space-y-6 lg:w-1/2 animate-fade-in">
            <div>
              <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                Personal Finance Made Simple
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
              Take control of your <span className="text-primary">financial life</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Bolt helps you track expenses, create budgets, and visualize your financial journey with beautifully intuitive design.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <BlurredCard className="p-6 animate-scale-in animation-delay-100 hover-scale">
                <div className="absolute -top-6 -right-6 rounded-full bg-primary/10 p-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Financial Dashboard</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary">
                      <div className="text-xs text-muted-foreground mb-1">Balance</div>
                      <div className="text-lg font-bold">$4,250.35</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-100">
                      <div className="text-xs text-muted-foreground mb-1">Income</div>
                      <div className="text-lg font-bold text-success">$6,520.00</div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-100">
                      <div className="text-xs text-muted-foreground mb-1">Expenses</div>
                      <div className="text-lg font-bold text-destructive">$2,269.65</div>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                </div>
              </BlurredCard>
              
              <BlurredCard className="absolute -bottom-12 -right-8 w-3/4 p-4 animate-scale-in animation-delay-200 hover-scale">
                <div className="flex items-center space-x-3 mb-3">
                  <ChartPieIcon className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Expense Breakdown</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rent</span>
                    <span className="text-sm font-medium">$1,200.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Groceries</span>
                    <span className="text-sm font-medium">$450.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilities</span>
                    <span className="text-sm font-medium">$120.00</span>
                  </div>
                </div>
              </BlurredCard>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <a href="#features" className="rounded-full p-2 bg-primary/10 animate-bounce">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </header>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your personal finances effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expense Tracking</h3>
              <p className="text-muted-foreground">
                Easily log and categorize your expenses to understand where your money is going.
              </p>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <ChartPieIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Budget Management</h3>
              <p className="text-muted-foreground">
                Set budgets for different expense categories and monitor your spending against them.
              </p>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Financial Reports</h3>
              <p className="text-muted-foreground">
                Visualize your financial data with beautiful charts and detailed reports.
              </p>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Categories</h3>
              <p className="text-muted-foreground">
                Create your own expense categories to fit your unique financial situation.
              </p>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure and Private</h3>
              <p className="text-muted-foreground">
                Your financial data is encrypted and securely stored. We prioritize your privacy.
              </p>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Financial Goals</h3>
              <p className="text-muted-foreground">
                Set savings goals and track your progress to achieve your financial objectives.
              </p>
            </BlurredCard>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have improved their financial lives with Bolt.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BlurredCard className="hover-scale">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-lg font-bold text-primary">S</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah M.</h4>
                  <p className="text-sm text-muted-foreground">Designer</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Bolt has completely transformed the way I manage my finances. The intuitive interface makes tracking expenses a breeze."
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-lg font-bold text-primary">J</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jason T.</h4>
                  <p className="text-sm text-muted-foreground">Engineer</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Thanks to Bolt's budget features, I've saved over $5,000 in the past year. The visualizations help me stay accountable."
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </BlurredCard>
            
            <BlurredCard className="hover-scale">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-lg font-bold text-primary">M</span>
                </div>
                <div>
                  <h4 className="font-semibold">Maria K.</h4>
                  <p className="text-sm text-muted-foreground">Entrepreneur</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As a small business owner, I need to keep personal and business expenses separate. Bolt makes this simple with custom categories."
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </BlurredCard>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who have already improved their financial lives with Bolt.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
