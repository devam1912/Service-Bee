import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { motion } from "framer-motion";
import { Ghost, Zap, Shield, Users } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative text-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <Ghost className="w-24 h-24 mx-auto text-spooky-orange mb-6 animate-float" />
          <h1 className="text-5xl md:text-7xl font-spooky text-white mb-6 drop-shadow-[0_0_15px_rgba(255,117,24,0.5)]">
            Service Bee
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            The <span className="text-spooky-purple font-bold">spookiest</span> way to get things done.
            Connect with phantom professionals for all your earthly needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="primary" className="text-lg px-8 py-3 w-full sm:w-auto">
                Join the Hive
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-lg px-8 py-3 w-full sm:w-auto">
                Enter Portal
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Background blobs for Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-spooky-purple/5 blur-[100px] rounded-full pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="h-full text-center hover:border-spooky-purple/50">
              <div className="bg-spooky-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-spooky-purple w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Our service providers appear like apparitions exactly when you need them.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full text-center hover:border-spooky-green/50">
              <div className="bg-spooky-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-spooky-green w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Safe</h3>
              <p className="text-gray-400">
                Protected by ancient wards and Razorpay encryption. No tricks, just treats.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full text-center hover:border-spooky-orange/50">
              <div className="bg-spooky-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-spooky-orange w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
              <p className="text-gray-400">
                Join a global swarm of users and providers. Chat with spirits world-wide.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-spooky-purple/20 to-spooky-orange/20 rounded-3xl p-10 text-center border border-gray-800 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-spooky text-white mb-4">Ready to get summoned?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Whether you need a plumber, a cleaner, or a ghostbuster, Service Bee has you covered.
            </p>
            <Link to="/signup">
              <Button variant="secondary" className="px-8 py-3 text-lg shadow-[0_0_20px_rgba(255,117,24,0.4)]">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Animated overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.com/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
      </section>
    </div>
  );
}
