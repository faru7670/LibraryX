// Simple static gradient background — no animation, zero overhead
export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 dark:from-[#060918] dark:via-[#0a0d1f] dark:to-[#060918]" />
    );
}
