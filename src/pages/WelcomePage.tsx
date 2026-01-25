import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-light flex flex-col">
      {/* Logo Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-16 pb-8 flex justify-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl">P</span>
          </div>
          <span className="text-white text-2xl font-bold">PayPal</span>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary text-3xl">💳</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-4"
        >
          The simpler, safer way to pay
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-white/80 text-lg mb-12"
        >
          Send and receive money with just a few taps
        </motion.p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="px-6 pb-12 space-y-4"
      >
        <Button 
          onClick={() => navigate('/signup')}
          className="w-full h-14 bg-white text-primary hover:bg-gray-100 text-lg font-semibold rounded-full shadow-lg"
        >
          Sign Up
        </Button>
        <Button 
          onClick={() => navigate('/login')}
          variant="outline"
          className="w-full h-14 bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg font-semibold rounded-full"
        >
          Log In
        </Button>
      </motion.div>

      {/* Bottom Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="pb-8 flex justify-center"
      >
        <div className="flex gap-2">
          <div className="w-8 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
