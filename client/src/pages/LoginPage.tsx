import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GithubLogo, ChartLine, Gauge, Activity } from '@phosphor-icons/react';

export const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GithubLogo size={48} weight="fill" className="text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            GitHub Actions Runner Observatory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor and analyze performance metrics from your self-hosted GitHub Actions runners
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <ChartLine size={32} className="text-accent mb-2" />
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
              <CardDescription>
                Track CPU, memory, and disk usage across all your runner jobs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Gauge size={32} className="text-accent mb-2" />
              <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
              <CardDescription>
                View live metrics and logs during workflow execution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Activity size={32} className="text-accent mb-2" />
              <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
              <CardDescription>
                Get intelligent recommendations to optimize your workflows
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Sign In to Continue</CardTitle>
            <CardDescription>
              Authenticate with GitHub to access your runner metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              className="w-full gap-2 h-12 text-base"
              size="lg"
            >
              <GithubLogo size={20} weight="fill" />
              Sign in with GitHub
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              This is a demo environment. Authentication is simulated.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
