import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { API_BASE_URL } from "@/utils/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Github } from "lucide-react"

export function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    accountType: "STUDENT" 
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAccountTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, accountType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Registration Successful! Logging you in...");
        navigate("/"); 
      } else {
        alert("Registration Successful! Please login.");
        navigate("/login");
      }

    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-zinc-200 mx-4 sm:mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Join the SVES campus community
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          
          {/* Social Register */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" className="w-full">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
            <Button variant="outline" type="button" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input id="firstname" value={formData.firstname} onChange={handleChange} placeholder="Fullname" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input id="lastname" value={formData.lastname} onChange={handleChange} placeholder="Surname" required />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="22A81A4330@sves.org.in" required />
          </div>
          
          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* FIX 1: Account Type Visibility */}
          <div className="grid gap-2">
            <Label>I am a</Label>
            <Select value={formData.accountType} onValueChange={handleAccountTypeChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              {/* Added bg-white to ensure it's not transparent */}
              <SelectContent className="bg-white z-50">
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FIX 2: Checkbox Alignment */}
          {/* Changed items-start to items-center to fix alignment */}
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" required />
            <label htmlFor="terms" className="text-sm font-medium leading-none text-muted-foreground">
              I agree to the Terms of Service.
            </label>
          </div>

        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create account"}
          </Button>
          <div className="text-center text-sm">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}