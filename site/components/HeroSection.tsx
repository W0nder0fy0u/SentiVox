import { memo } from "react";
import Image from "next/image";
import { VALUES } from "@/lib/values";
import { Zap, Globe, Lock } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Fast",
        description: "Get results in milliseconds",
    },
    {
        icon: Globe,
        title: "Multilingual",
        description: "4+ languages supported",
    },
    {
        icon: Lock,
        title: "Secure",
        description: "Your data is never stored",
    },
];

function HeroSection() {
    return (
        <section className="relative pt-10 lg:pt-16 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    {/* Logo animation */}
                    <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-primary/10 mb-6 animate-pulse-glow">
                        <Image src="/logo.png" alt="Logo" width={320} height={320} className="w-16 h-16 text-primary" />
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                        <span className="gradient-text">{VALUES.APP_NAME}</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {VALUES.APP_SHORT_DESCRIPTION}
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm"
                            >
                                <feature.icon size={16} className="text-primary" />
                                <span className="font-medium">{feature.title}</span>
                                <span className="text-muted-foreground hidden sm:inline">
                                    {feature.description}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default memo(HeroSection);