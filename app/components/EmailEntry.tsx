import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface EmailEntryProps {
  onSubmit: (email: string) => void;
}

export default function EmailEntry({ onSubmit }: EmailEntryProps) {
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load email from sessionStorage if available
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("user_email");
    if (storedEmail) {
      setEmail(storedEmail);
      validateEmail(storedEmail);
    }
  }, []);

  const validateEmail = (value: string) => {
    // Basic email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value);
    setIsValid(valid);
    setError(valid ? null : "Lütfen geçerli bir email adresi girin");
    return valid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      sessionStorage.setItem("user_email", email);
      onSubmit(email);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl w-full max-w-xl shadow-xl">
      <h1 className="text-white text-3xl font-bold text-center tracking-wide drop-shadow-lg mb-6">
        Hediyele Blind Test 🎁
      </h1>
      
      <p className="text-white text-md mb-6 text-center">
        Lütfen testleri kaydedebilmemiz için email adresinizi girin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="text-white mb-2">
            Email Adresiniz:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="you@example.com"
            required
          />
          {error && <p className="text-rose-400 text-sm mt-1">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Devam Et
        </Button>
      </form>
    </div>
  );
} 