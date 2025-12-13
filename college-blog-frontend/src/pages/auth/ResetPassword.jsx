import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/utils/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setStatus({ type: "error", msg: "Passwords do not match" });
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) throw new Error("Invalid or expired token");

      setStatus({ type: "success", msg: "Password reset successful! Redirecting..." });
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="text-center p-10">Invalid Link</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="password" 
              placeholder="New Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="Confirm New Password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {status.msg && (
                <div className={`p-3 text-sm rounded-md text-center ${status.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                    {status.msg}
                </div>
            )}

            <Button className="w-full bg-indigo-600" disabled={loading}>
              {loading ? "Resetting..." : "Set New Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}