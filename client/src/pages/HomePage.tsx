import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const HomePage = () => {
  const [jobUuid, setJobUuid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobUuid.trim()) {
      toast.error("Please enter a job UUID");
      return;
    }

    setIsLoading(true);

    try {
      // Validate that metrics exist for this job UUID
      const response = await fetch(
        `http://localhost:8080/api/metrics/${jobUuid}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to fetch metrics");
      }

      if (data.count === 0) {
        toast.error("No metrics found for this job UUID");
        return;
      }

      // Navigate to metrics page
      navigate(`/metrics/${jobUuid}`);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error(
        "Failed to load metrics. Please check the job UUID and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">GitHub Actions Metrics</CardTitle>
          <CardDescription>
            Enter a job UUID to view detailed system metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobUuid">Job UUID</Label>
              <Input
                id="jobUuid"
                type="text"
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                value={jobUuid}
                onChange={(e) => setJobUuid(e.target.value)}
                disabled={isLoading}
                className="font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "View Metrics"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
