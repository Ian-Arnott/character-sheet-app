import LoginForm from "@/components/auth/login-form"

export const metadata = {
  title: "Login - D&D Character Sheet",
  description: "Login to your D&D Character Sheet account",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
