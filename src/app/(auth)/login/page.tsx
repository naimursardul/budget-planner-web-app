import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; signedOut?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { callbackUrl, signedOut } = await searchParams;
  return <LoginForm callbackUrl={callbackUrl} signedOut={signedOut === "1"} />;
}
