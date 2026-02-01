import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import nunsaLogo from '@/assets/nunsa-logo.png';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Shield,
  Users,
  Settings,
  Download,
  Mail,
  Calculator,
  Receipt,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, features, gradient, delay = '0s' }) => (
  <Card 
    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className={`h-2 ${gradient}`} />
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${gradient} text-white`}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const WorkflowStep: React.FC<{ step: number; title: string; description: string; icon: React.ReactNode }> = ({ 
  step, 
  title, 
  description, 
  icon 
}) => (
  <div className="flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${step * 0.2}s` }}>
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4 shadow-lg">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
        {step}
      </div>
    </div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground max-w-[200px]">{description}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent py-20">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center text-white">
            <img src={nunsaLogo} alt="NUNSA Logo" className="w-24 h-24 mb-6 animate-bounce-slow" />
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 animate-fade-in">
              NUNSA HUI Café Finance System
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Complete financial management solution for tracking income, expenses, generating reports, and managing payroll
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">See It In Action</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Watch how easy it is to manage your café's finances with our intuitive system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Recording Income', description: 'Quick and easy income recording with automatic receipt generation', icon: TrendingUp },
              { title: 'Tracking Expenses', description: 'Keep track of all café expenses with categorized entries', icon: TrendingDown },
              { title: 'Generating Reports', description: 'Download monthly or annual financial reports in PDF', icon: FileText },
            ].map((demo, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <demo.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">{demo.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{demo.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to manage your café's finances efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Dashboard"
              description="Overview at a glance"
              features={[
                'Real-time income and expense tracking',
                'Today, weekly, and monthly summaries',
                'Visual charts and statistics',
                'Quick action buttons',
              ]}
              gradient="bg-gradient-to-r from-primary to-accent"
              delay="0s"
            />
            
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Income Management"
              description="Track all revenue streams"
              features={[
                'Record income by category (Printing, Water, Stationery)',
                'Automatic receipt number generation',
                'Download PDF receipts instantly',
                'Track who recorded each entry',
              ]}
              gradient="bg-gradient-to-r from-success to-emerald-600"
              delay="0.1s"
            />
            
            <FeatureCard
              icon={<TrendingDown className="h-6 w-6" />}
              title="Expense Tracking"
              description="Monitor all spending"
              features={[
                'Categorized expense recording',
                'Optional descriptions for context',
                'Attachment support for receipts',
                'Complete expense history',
              ]}
              gradient="bg-gradient-to-r from-destructive to-red-600"
              delay="0.2s"
            />
            
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics"
              description="Insights and trends"
              features={[
                'Income vs expense comparison charts',
                'Category breakdown pie charts',
                'Trend analysis over time',
                'Exportable reports',
              ]}
              gradient="bg-gradient-to-r from-info to-blue-600"
              delay="0.3s"
            />
            
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Reports"
              description="Comprehensive documentation"
              features={[
                'Monthly and annual financial reports',
                'Individual month report downloads',
                'Salary reports for payroll',
                'Email reports automatically',
              ]}
              gradient="bg-gradient-to-r from-purple-500 to-purple-700"
              delay="0.4s"
            />
            
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="User Management"
              description="Role-based access control"
              features={[
                'Super Admin, Admin, and Finance Officer roles',
                'Assign and manage user roles',
                'Track income per user',
                'Calculate and view staff salaries',
              ]}
              gradient="bg-gradient-to-r from-amber-500 to-orange-600"
              delay="0.5s"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple workflow for managing your café's finances
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-4">
            <WorkflowStep
              step={1}
              title="Sign In"
              description="Login with your assigned credentials"
              icon={<Lock className="h-6 w-6" />}
            />
            <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mt-8 shrink-0" />
            <WorkflowStep
              step={2}
              title="Record Transactions"
              description="Add income and expenses as they occur"
              icon={<Receipt className="h-6 w-6" />}
            />
            <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mt-8 shrink-0" />
            <WorkflowStep
              step={3}
              title="View Analytics"
              description="Monitor your financial performance"
              icon={<Eye className="h-6 w-6" />}
            />
            <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mt-8 shrink-0" />
            <WorkflowStep
              step={4}
              title="Generate Reports"
              description="Download or email financial reports"
              icon={<Download className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Role Permissions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">Role-Based Access</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Different roles have different permissions to ensure security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                role: 'Super Admin',
                permissions: ['Full system access', 'Manage all users and roles', 'View all salaries', 'Configure settings', 'Delete records', 'Access audit logs'],
                color: 'from-amber-500 to-orange-600',
              },
              {
                role: 'Admin',
                permissions: ['Manage income & expenses', 'View analytics', 'Generate reports', 'Access audit logs', 'Update settings', 'Cannot manage users'],
                color: 'from-primary to-accent',
              },
              {
                role: 'Finance Officer',
                permissions: ['Record income & expenses', 'View dashboard', 'Download own receipts', 'View analytics', 'Generate reports', 'Limited access'],
                color: 'from-info to-blue-600',
              },
            ].map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white mb-2`}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>{item.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold font-display mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 max-w-lg mx-auto mb-8">
            Join NUNSA HUI Café's financial management system and start tracking your finances efficiently today
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Sign In Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 text-center">
          <img src={nunsaLogo} alt="NUNSA Logo" className="w-12 h-12 mx-auto mb-4" />
          <p className="text-sidebar-foreground/70 text-sm">
            NUNSA HUI Café Finance System © {new Date().getFullYear()}
          </p>
          <p className="text-sidebar-foreground/50 text-xs mt-2">
            Al-Hikmah University, Ilorin | NUNSA Chapter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Features;
