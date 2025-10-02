"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface BackgroundCirclesProps {
    title?: string;
    description?: string;
    className?: string;
    variant?: keyof typeof COLOR_VARIANTS;
}

const COLOR_VARIANTS = {
    primary: {
        border: [
            "border-emerald-500/60",
            "border-cyan-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-emerald-500/30",
    },
    secondary: {
        border: [
            "border-violet-500/60",
            "border-fuchsia-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-violet-500/30",
    },
    tertiary: {
        border: [
            "border-orange-500/60",
            "border-yellow-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-orange-500/30",
    },
    quaternary: {
        border: [
            "border-purple-500/60",
            "border-pink-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-purple-500/30",
    },
    quinary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    }, // red
    senary: {
        border: [
            "border-blue-500/60",
            "border-sky-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-blue-500/30",
    }, // blue
    septenary: {
        border: [
            "border-gray-500/60",
            "border-gray-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-gray-500/30",
    },
    octonary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    },
} as const;

const AnimatedGrid = () => (
    <motion.div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"
        animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
            duration: 40,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
        }}
    >
        <div className="h-full w-full [background-image:repeating-linear-gradient(100deg,#64748B_0%,#64748B_1px,transparent_1px,transparent_4%)] opacity-20" />
    </motion.div>
);

export function BackgroundCircles({
    title = "Продажник из тиндера",
    description = "",
    className,
    variant = "octonary",
}: BackgroundCirclesProps) {
    const variantStyles = COLOR_VARIANTS[variant];

    return (
        <div
            className={clsx(
                "relative flex h-screen w-full items-center justify-center overflow-hidden",
                "bg-white dark:bg-black/5",
                className
            )}
        >
            <AnimatedGrid />
            <motion.div className="absolute h-[480px] w-[480px]">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={clsx(
                            "absolute inset-0 rounded-full",
                            "border-2 bg-gradient-to-br to-transparent",
                            variantStyles.border[i],
                            variantStyles.gradient
                        )}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.05 + i * 0.05, 1],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    >
                        <div
                            className={clsx(
                                "absolute inset-0 rounded-full mix-blend-screen",
                                `bg-[radial-gradient(ellipse_at_center,${variantStyles.gradient.replace(
                                    "from-",
                                    ""
                                )}/10%,transparent_70%)]`
                            )}
                        />
                    </motion.div>
                ))}
            </motion.div>
            {/* Заголовок и кнопки по центру фиолетового круга */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center px-6 w-[520px] max-w-[92vw] mx-auto">
                    <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-3 text-sm md:text-base opacity-80 text-slate-700 dark:text-slate-300">
                            {description}
                        </p>
                    ) : null}
                    <div className="mt-8 space-y-4 pointer-events-auto">
                        <button aria-label="Выявление потребностей" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/90">
                                📘
                            </span>
                            <span className="flex-1">
                                <span className="block text-base md:text-lg font-semibold text-white">Выявление потребностей</span>
                                <span className="block text-sm text-white/70">Сбор информации и понимание задач клиента</span>
                            </span>
                        </button>

                        <button aria-label="Отработка возражений" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/90">
                                ⚡
                            </span>
                            <span className="flex-1">
                                <span className="block text-base md:text-lg font-semibold text-white">Отработка возражений</span>
                                <span className="block text-sm text-white/70">Работа с сомнениями и барьерами клиента</span>
                            </span>
                        </button>

                        <button aria-label="Постмит после встречи" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/90">
                                📨
                            </span>
                            <span className="flex-1">
                                <span className="block text-base md:text-lg font-semibold text-white">Постмит после встречи</span>
                                <span className="block text-sm text-white/70">Резюме, материалы и дальнейшие шаги</span>
                            </span>
                        </button>

                        <button aria-label="Дожим клиентов" className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/90">
                                🎯
                            </span>
                            <span className="flex-1">
                                <span className="block text-base md:text-lg font-semibold text-white">Дожим клиентов</span>
                                <span className="block text-sm text-white/70">Финализация сделки и призыв к действию</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 [mask-image:radial-gradient(90%_60%_at_50%_50%,#000_40%,transparent)]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0F766E/30%,transparent_70%)] blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2DD4BF/15%,transparent)] blur-[80px]" />
            </div>
        </div>
    );
}