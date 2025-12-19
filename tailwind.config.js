import MarqueeCards from './MarqueeCards';

module.exports = {
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 40s linear infinite',
        marquee2: 'marquee2 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
}

export default function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 sm:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/10" />
      <div className="relative z-10 w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Explore Our Contracts
        </h2>
        <MarqueeCards />
      </div>
    </section>
  );
}