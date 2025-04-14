import RegisterForm from "@/components/auth/register-form"

export const metadata = {
  title: "Register - D&D Character Sheet",
  description: "Create a new D&D Character Sheet account",
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </main>
  )
}
