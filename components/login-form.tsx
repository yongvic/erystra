"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/ui/input-field";

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string): string | undefined => {
    if (!value) return "L'adresse email est requise.";
    if (!/\S+@\S+\.\S+/.test(value)) return "Veuillez entrer une adresse email valide.";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Le mot de passe est requis.";
    if (value.length < 6) return "Le mot de passe doit contenir au moins 6 caracteres.";
    return undefined;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setIsSubmitting(true);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        router.replace("/");
        router.refresh();
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || "Echec de la connexion. Veuillez reessayer.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setFormError("Echec de la connexion. Verifiez votre connexion internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {formError && (
        <p className="error-message form-general-error" role="alert">
          {formError}
        </p>
      )}
      <InputField
        label="Adresse email"
        id="email"
        type="email"
        name="email"
        placeholder="marketing@erystra-group.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onValidate={validateEmail}
        error={emailError}
        required
        disabled={isSubmitting}
        autoComplete="email"
      />
      <InputField
        label="Mot de passe"
        id="password"
        type="password"
        name="password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onValidate={validatePassword}
        error={passwordError}
        required
        disabled={isSubmitting}
        autoComplete="current-password"
      />
      <button className="button button-primary" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  );
}
