"use client";

import { AuthLayout, SocialProvider } from "@/components/auth/auth-layout";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
    <path d="M12 1C5.92 1 1 5.92 1 12c0 4.87 3.15 8.99 7.52 10.45.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.04-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.61-1.22-1.61-1-.68.07-.67.07-.67 1.1.08 1.69 1.13 1.69 1.13.98 1.69 2.58 1.2 3.21.92.1-.71.39-1.2.7-1.48-2.45-.28-5.02-1.22-5.02-5.45 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.24-2.58 5.16-5.04 5.44.4.34.75 1.02.75 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.76.53C19.85 20.99 23 16.87 23 12c0-6.08-4.92-11-11-11z" />
  </svg>
);

export default function SignUpPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Account created",
        description: "Welcome to NxAIO!",
      });
      router.push("/");
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not sign up with Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  const socialProviders: SocialProvider[] = [
    { label: "Google", icon: GoogleIcon, onClick: handleGoogleSignIn },
    { label: "GitHub", icon: GithubIcon, href: "#" },
  ];

  return (
    <AuthLayout
      loading={loading}
      heading="Start for free."
      description="Join 10,000+ engineers building the future. No credit card required."
      socialProviders={socialProviders}
      fields={[
        { label: "Full Name", placeholder: "Jane Cooper", type: "text" },
        { label: "Email Address", placeholder: "you@example.com", type: "email" },
        { label: "Secure Password", placeholder: "Create a password", type: "password" },
      ]}
      alternatePrompt={{
        text: "Already a member?",
        linkLabel: "Sign in",
        href: "/login",
      }}
      labels={{
        divider: "or sign up with email",
        terms: 'I agree to the <a href="#">Terms</a> and <a href="/privacy">Privacy Policy</a>',
        submit: "Create Account",
        passwordToggle: "Toggle password visibility",
      }}
      showcase={{
        image: {
          src: "https://images.unsplash.com/photo-1522071823991-b1ae5e6a3048?q=80&w=1600&auto=format&fit=crop",
          alt: "Creative team collaborating",
        },
        quote: "NxAIO transformed our workflow. The automated logic chains saved us dozens of hours in our first month alone.",
        author: {
          name: "Maria Santos",
          title: "Product Lead, Northwind",
          avatar: {
            src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
            alt: "Maria Santos profile",
          },
        },
      }}
      mediaPosition="right"
    />
  );
}
