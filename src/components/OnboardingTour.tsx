import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText,
  Settings,
  Users,
  Sparkles,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NUNSA HUI Café! 🎉',
    description: 'This quick tour will help you understand how to use the finance management system effectively. Let\'s get started!',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Your dashboard shows real-time financial summaries including today\'s income, expenses, and overall balance. Quick action buttons help you record transactions instantly.',
    icon: <LayoutDashboard className="h-8 w-8" />,
    highlight: '/dashboard',
  },
  {
    id: 'income',
    title: 'Recording Income',
    description: 'Go to the Income page to record all incoming payments. Each entry generates a unique receipt number, and you can download a PDF receipt immediately.',
    icon: <TrendingUp className="h-8 w-8" />,
    highlight: '/income',
  },
  {
    id: 'expenses',
    title: 'Tracking Expenses',
    description: 'Use the Expenses page to log all café spending. Categorize expenses and add descriptions for better tracking and reporting.',
    icon: <TrendingDown className="h-8 w-8" />,
    highlight: '/expenses',
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'The Analytics page provides visual charts and graphs to help you understand income vs expenses trends and category breakdowns.',
    icon: <BarChart3 className="h-8 w-8" />,
    highlight: '/analytics',
  },
  {
    id: 'reports',
    title: 'Generate Reports',
    description: 'Download monthly or annual financial reports as PDFs. Admins can also email reports directly to the configured recipient.',
    icon: <FileText className="h-8 w-8" />,
    highlight: '/reports',
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Super Admins can manage user roles and view staff salaries based on the income they\'ve generated. Salary percentage is configurable in settings.',
    icon: <Users className="h-8 w-8" />,
    highlight: '/users',
  },
  {
    id: 'settings',
    title: 'Configure Settings',
    description: 'Admins can update café information, salary percentage, and report recipient email in the Settings page.',
    icon: <Settings className="h-8 w-8" />,
    highlight: '/settings',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re now ready to start managing your café\'s finances. If you need help, you can always revisit this tour from the settings or contact your administrator.',
    icon: <Check className="h-8 w-8" />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" onClick={handleSkip} />
      
      {/* Tour Card */}
      <Card className={cn(
        "relative z-10 w-full max-w-md mx-4 shadow-2xl transition-all duration-300",
        isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        {/* Progress Bar */}
        <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-2">
          <div className={cn(
            "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-white",
            step.id === 'complete' || step.id === 'welcome'
              ? "bg-gradient-to-br from-primary to-accent"
              : "bg-primary"
          )}>
            {step.icon}
          </div>
          <CardTitle className="text-xl">{step.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tourSteps.length}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-6">
          <p className="text-muted-foreground mb-6">{step.description}</p>

          {/* Step Indicators */}
          <div className="flex justify-center gap-1.5 mb-6">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <Button
              variant="gradient"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
