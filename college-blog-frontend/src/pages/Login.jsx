import { LoginForm } from "@/features/auth/components/LoginForm"

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      {/* We simply drop the feature component here */}
      <LoginForm />
    </div>
  )
}