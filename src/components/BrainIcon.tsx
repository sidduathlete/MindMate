import { motion } from 'framer-motion';

export function BrainIcon() {
  return (
    <motion.div
      className="relative w-8 h-8"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <motion.path
          d="M12 3C10.5 3 9.2 3.6 8.3 4.5C7.4 3.6 6.1 3 4.6 3C2.1 3 0 5.1 0 7.6c0 1.5 0.6 2.8 1.5 3.7C0.6 12.2 0 13.5 0 15c0 2.5 2.1 4.6 4.6 4.6c1.5 0 2.8-0.6 3.7-1.5c0.9 0.9 2.2 1.5 3.7 1.5s2.8-0.6 3.7-1.5c0.9 0.9 2.2 1.5 3.7 1.5c2.5 0 4.6-2.1 4.6-4.6c0-1.5-0.6-2.8-1.5-3.7c0.9-0.9 1.5-2.2 1.5-3.7c0-2.5-2.1-4.6-4.6-4.6c-1.5 0-2.8 0.6-3.7 1.5C14.8 3.6 13.5 3 12 3z"
          fill="url(#brainGradient)"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-teal-300"
          animate={{
            pathLength: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="7"
          cy="8"
          r="1"
          fill="currentColor"
          className="text-teal-400"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="17"
          cy="8"
          r="1"
          fill="currentColor"
          className="text-teal-400"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="1.5"
          fill="currentColor"
          className="text-teal-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0d9488" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute inset-0 bg-teal-400 rounded-full blur-md"
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
