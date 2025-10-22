import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const storedState = sessionStorage.getItem("oauth_state");

      if (!code) {
        setError("No authorization code received");
        return;
      }

      // Verify state to prevent CSRF attacks
      if (state !== storedState) {
        setError("Invalid state parameter. Possible CSRF attack.");
        return;
      }

      try {
        await handleCallback(code, state || "");
        sessionStorage.removeItem("oauth_state");
        navigate("/organizations", { replace: true });
      } catch (err: any) {
        setError(err.message || "Authentication failed");
      }
    };

    processCallback();
  }, [searchParams, navigate, handleCallback]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Authentication Error
            </CardTitle>
            <CardDescription>
              Failed to complete GitHub authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-primary hover:underline"
            >
              Return to login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Authenticating...
          </CardTitle>
          <CardDescription>
            Please wait while we complete your GitHub authentication
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
