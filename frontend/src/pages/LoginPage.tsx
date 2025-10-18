import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Github } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">GitHub Actions Monitor</CardTitle>
          <CardDescription className="text-base mt-2">
            Monitor your GitHub Actions runners with real-time metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            Sign in with your GitHub account to continue
          </div>
          <Button 
            onClick={login}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
