import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRecycle } from '@fortawesome/free-solid-svg-icons';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-eco-bg flex items-center justify-center z-[9999]">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <FontAwesomeIcon icon={faRecycle} className="text-eco-accent text-5xl" />
        </motion.div>
        <motion.div
          className="h-1 bg-eco-surface rounded-full overflow-hidden w-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-eco-primary via-eco-accent to-eco-light rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <p className="text-eco-secondary text-sm font-body tracking-widest uppercase">Loading</p>
      </motion.div>
    </div>
  );
}
