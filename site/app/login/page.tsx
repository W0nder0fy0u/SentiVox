"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VALUES } from "@/lib/values";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, User } from "lucide-react";

type Step = "email" | "otp" | "register";

export default function LoginPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading, login } = useAuth();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && isLoggedIn) {
            router.push("/account");
        }
    }, [authLoading, isLoggedIn, router]);

    const isValidEmail = (email: string) => {
        return VALUES.ALLOWED_EMAIL_DOMAINS.some((domain) =>
            email.toLowerCase().endsWith(domain)
        );
    };

    const isValidName = (name: string) => {
        const nameRegex = /^[A-Za-z\s]+$/;
        return nameRegex.test(name) && name.length >= 2 && name.length <= 19;
    };

    const handleSendOtp = async () => {
        setError("");

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        if (!isValidEmail(email)) {
            setError(`Only ${VALUES.ALLOWED_EMAIL_DOMAINS.join(" or ")} emails are allowed`);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            setStep("otp");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-character OTP");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    otp: otp.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);

                if (newAttempts >= 3) {
                    router.push("/");
                    return;
                }

                setError(`${data.error || "Invalid OTP"}. ${3 - newAttempts} attempts remaining.`);
                setOtp("");
                return;
            }

            if (data.exists && data.user) {
                // Existing user - log them in
                login(data.user);
                router.push("/account");
            } else {
                // New user - need to register
                setStep("register");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify OTP. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setError("");

        const trimmedName = name.trim();

        if (!isValidName(trimmedName)) {
            setError("Name must contain only letters and spaces, 2-19 characters");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    name: trimmedName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to register");
            }

            // Log the new user in
            login(data.user);
            router.push("/account");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking auth status
    if (authLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Don't render if already logged in (will redirect)
    if (isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen flex justify-center px-4 items-center">
            <div className="w-full max-w-md">
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            {step === "email" && "Welcome"}
                            {step === "otp" && "Verify OTP"}
                            {step === "register" && "Complete Registration"}
                        </CardTitle>
                        <CardDescription>
                            {step === "email" && "Sign in or create an account with your email"}
                            {step === "otp" && `We sent a 6-character code to ${email}`}
                            {step === "register" && "Just one more step to get started"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 rounded-lg text-sm text-danger animate-fade-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Email Step */}
                        {step === "email" && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Allowed: {VALUES.ALLOWED_EMAIL_DOMAINS.join(", ")}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="w-full gap-2"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send OTP
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* OTP Step */}
                        {step === "otp" && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-sm font-medium">
                                        Enter OTP
                                    </label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        placeholder="******"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.toLowerCase())}
                                        onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                                        className="text-center text-2xl tracking-[0.5em] font-mono"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Check your email for the 6-character code
                                    </p>
                                </div>

                                <Button
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full gap-2"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Verify OTP
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={() => {
                                        setStep("email");
                                        setOtp("");
                                        setError("");
                                        setAttempts(0);
                                    }}
                                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft size={14} />
                                    Change email
                                </button>
                            </div>
                        )}

                        {/* Register Step */}
                        {step === "register" && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Your Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                                            className="pl-10"
                                            disabled={isLoading}
                                            maxLength={19}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Letters and spaces only, 2-19 characters
                                    </p>
                                </div>

                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground">
                                        Your email: <span className="text-foreground font-medium">{email}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        An API key will be generated for your account.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleRegister}
                                    disabled={isLoading || !name.trim()}
                                    className="w-full gap-2"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    By continuing, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
}
