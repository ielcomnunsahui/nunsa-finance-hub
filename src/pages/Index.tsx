import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, BarChart3, FileText, Sparkles } from 'lucide-react';
import nunsaLogo from '@/assets/nunsa-logo.png';
import { Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={nunsaLogo} alt="NUNSA Logo" className="h-10 w-10 rounded-full" />
            <span className="font-display font-bold text-lg">NUNSA HUI Café</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="gradient">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <img src={nunsaLogo} alt="NUNSA Logo" className="h-24 w-24 mx-auto mb-6 rounded-full shadow-lg" />
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Secure Financial Management
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            NUNSA HUI Café
            <span className="text-primary block">Financial Management System</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive solution for managing income, expenses, and financial reports 
            for the Nigerian Universities Nursing Students Association - Al-Hikmah University Chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/auth')} size="lg" variant="gradient" className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Sparkles className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="p-3 rounded-lg bg-success/10 w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Track income and expenses in real-time with beautiful charts and insights.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Reports</h3>
              <p className="text-muted-foreground">
                Generate professional financial reports and receipts with one click.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="p-3 rounded-lg bg-warning/10 w-fit mb-4">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Auditable</h3>
              <p className="text-muted-foreground">
                Role-based access control with immutable audit logs for accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 NUNSA HUI Café - Al-Hikmah University Chapter</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
