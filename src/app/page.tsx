import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowRight, BarChart, CheckCircle, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-foreground">ArvaForm</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/features"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link
              href="/components-demo"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Components
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build Advanced Forms
            <span className="text-primary block">That Convert</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, customize, and deploy intelligent forms with conditional logic, seamless
            integrations, and powerful analytics. The modern form builder for teams and enterprises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl">
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/demo"
              className="border border-border text-foreground px-8 py-4 rounded-lg hover:bg-muted transition-all duration-200 flex items-center gap-2 text-lg font-medium">
              View Demo
            </Link>
          </div>

          {/* Trusted by section */}
          <div className="text-center text-muted-foreground mb-16">
            <p className="text-sm uppercase tracking-wider mb-4">Trusted by teams at</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <span className="text-2xl font-bold">Company</span>
              <span className="text-2xl font-bold">Startup</span>
              <span className="text-2xl font-bold">Enterprise</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Lightning Fast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Build complex forms in minutes with our intuitive drag-and-drop interface and
              pre-built components.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Enterprise Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              Bank-level security with encryption, compliance certifications, and advanced access
              controls.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Smart Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get deep insights into form performance, user behavior, and conversion optimization
              opportunities.
            </p>
          </div>
        </div>

        {/* Key Features List */}
        <div className="bg-card border border-border rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Everything you need to build better forms
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Conditional Logic & Branching',
              'Real-time Validation',
              'Payment Integration',
              'Multi-step Forms',
              'Custom Styling',
              'API Integrations',
              'Team Collaboration',
              'Advanced Analytics',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 ArvaForm. Built with Next.js 15 and modern web technologies.</p>
        </div>
      </footer>
    </div>
  );
}
