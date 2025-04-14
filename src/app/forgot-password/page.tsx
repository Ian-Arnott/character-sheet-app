import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot Password - D&D Character Sheet",
  description: "Reset your D&D Character Sheet password",
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordForm />
    </main>
  )
}
