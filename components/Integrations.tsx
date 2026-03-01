import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChatBubbleLeftIcon,
  CloudIcon,
  CodeBracketSquareIcon,
  EnvelopeIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';

const integrationIcons = [
  {
    id: 'mail',
    icon: <EnvelopeIcon className="w-8 h-8 text-red-500" />,
    shadowColor: 'shadow-red-500/10',
  },
  {
    id: 'message',
    icon: <ChatBubbleLeftIcon className="w-8 h-8 text-purple-500" />,
    shadowColor: 'shadow-purple-500/10',
  },
  {
    id: 'video',
    icon: <VideoCameraIcon className="w-8 h-8 text-blue-500" />,
    shadowColor: 'shadow-blue-500/10',
  },
  {
    id: 'calendar',
    icon: <CalendarIcon className="w-8 h-8 text-green-500" />,
    shadowColor: 'shadow-green-500/10',
  },
  {
    id: 'cloud',
    icon: <CloudIcon className="w-8 h-8 text-yellow-500" />,
    shadowColor: 'shadow-yellow-500/10',
  },
  {
    id: 'github',
    icon: <CodeBracketSquareIcon className="w-8 h-8 text-gray-800" />,
    shadowColor: 'shadow-gray-800/10',
  },
];

export default function Integrations() {
  return (
    <section className="w-full py-24 bg-[#FAFAFA] flex flex-col items-center justify-center relative z-20 overflow-hidden">
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827]">
          Integrate with your existing tools <br className="hidden sm:block" /> in seconds.
        </h2>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 px-4">
        {integrationIcons.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
              className={`w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl ${item.shadowColor} border border-gray-100 hover:scale-110 transition-transform cursor-pointer`}
            >
              {item.icon}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
