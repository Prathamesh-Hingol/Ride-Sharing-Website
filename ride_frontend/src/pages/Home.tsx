import { Car, Users, Leaf, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { motion } from 'framer-motion';
import { ParallaxBanner } from 'react-scroll-parallax';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ANIMATIONS = [
  "./src/assets/Money stack.lottie",
  "./src/assets/eco.lottie",
  "./src/assets/socialize.lottie",
  "./src/assets/safety.lottie"
]

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <ParallaxBanner
        layers={[
          {
            image: "/src/assets/carpool.jpg",
            speed: -30,
            expanded: false,
            scale: [1.1, 1],
          },
          {
            speed: -10,
            children: (
              <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-primary-dark/50 to-surface" />
            ),
          },
        ]}
        className="h-screen flex items-center justify-center relative"
      >
        <div className="text-white text-center px-4 z-10 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Share Rides, Share Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/85"
          >
            Connect with fellow students for safe and affordable rides
          </motion.p>

          {/* Glass search-style CTA bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-strong rounded-md p-2 md:p-3 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-10"
          >
            <Button
              size="lg"
              onClick={() => navigate('/find')}
              className="flex-1"
            >
              Find a Ride <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/offer')}
              className="flex-1 !bg-white/70 !text-ink"
            >
              Offer a Ride
            </Button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span className="text-2xl text-white/70">↓</span>
          </motion.div>
        </div>
      </ParallaxBanner>

      {/* Why choose us — glass cards */}
      <section className="py-24 relative">
        <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-20 pointer-events-none" />
        <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-ink">
            Why Choose <span className="text-gradient-primary">RideShare?</span>
          </h2>
          <p className="text-center text-ink-variant max-w-xl mx-auto mb-14">
            Built for the IIT Indore community — simple, safe, and social.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Car className="w-6 h-6" />, title: 'Cost Sharing', description: 'Split travel expenses with fellow students' },
              { icon: <Leaf className="w-6 h-6" />, title: 'Eco-Friendly', description: 'Reduce carbon footprint by sharing rides' },
              { icon: <Users className="w-6 h-6" />, title: 'Socialize', description: 'Meet new friends during your commute' },
              { icon: <Shield className="w-6 h-6" />, title: 'Safety', description: 'Verified college students only' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="glass-card rounded-md p-6 text-center"
              >
                <div className="bg-primary/10 w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary mb-4 overflow-hidden">
                  <DotLottieReact src={ANIMATIONS[index]} loop autoplay />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-ink">{benefit.title}</h3>
                <p className="text-sm text-ink-variant">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-14 text-ink">
            How it Works
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Sign In', description: 'Login with your college Google account' },
              { step: 2, title: 'Find / Offer', description: 'Post or search for rides going your way' },
              { step: 3, title: 'Connect', description: 'Match, chat, and travel together' }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="glass-card rounded-md p-8 text-center flex-1"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xl font-display font-bold flex items-center justify-center mx-auto mb-5 shadow-glow">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-ink">{step.title}</h3>
                <p className="text-sm text-ink-variant">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
