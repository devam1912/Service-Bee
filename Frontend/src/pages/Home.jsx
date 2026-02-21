import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { motion } from "framer-motion";
import { Sparkles, Shield, Activity, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import UserHome from "../components/home/UserHome";
import CompanyHome from "../components/home/CompanyHome";
import AdminHome from "../components/home/AdminHome";
import BeeLogo from "../components/ui/BeeLogo";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-petal-light dark:bg-deep-moss">
      {/* Background Decorative Bloom */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-petal-rose/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-petal-leaf/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-petal-rose/10 backdrop-blur-md px-4 py-2 rounded-full border border-petal-rose/20 mb-8"
          >
            <BeeLogo className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-petal-rose">Premium Service Bee Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-black text-petal-leaf dark:text-white leading-[0.9] tracking-tighter mb-8"
          >
            Your Curated <br />
            <span className="text-petal-rose italic pr-2"><span className="text-petal-moss dark:text-white not-italic">Service</span> Bee</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-12"
          >
            Connecting you with the finest local service providers.
            Experience the efficiency of professional services in your beehive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/signup">
              <Button className="px-10 py-5 text-lg rounded-[24px] bg-petal-leaf hover:bg-petal-leaf/90 text-white shadow-2xl shadow-petal-leaf/20 border-none">
                Join the Hive
              </Button>
            </Link>
            <Link to="/global-chat">
              <Button variant="outline" className="px-10 py-5 text-lg rounded-[24px] border-petal-rose/30 text-petal-rose hover:bg-petal-rose/5 transition-all">
                Explore Hive Chat
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <Card className="p-8 border-none bg-white dark:bg-petal-muted/20 shadow-xl rounded-[40px] hover:shadow-2xl transition-all group">
    <div className="bg-petal-rose/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
      <Icon className="text-petal-rose w-8 h-8" />
    </div>
    <h3 className="text-2xl font-black text-petal-leaf dark:text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
  </Card>
);

const Home = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <AdminHome />;
    if (user.role === 'company') return <CompanyHome />;
    return <UserHome />;
  }

  return (
    <div className="bg-petal-light dark:bg-deep-moss min-h-screen">
      <Hero />

      <section className="py-32 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            icon={Shield}
            title="Vetted Providers"
            desc="Only verified providers enter our hive. We ensure quality through strict standards."
          />
          <FeatureCard
            icon={Activity}
            title="Real-time Wisdom"
            desc="AI-powered insights to help you find the perfect service for your specific needs."
          />
          <FeatureCard
            icon={Briefcase}
            title="Secure Exchange"
            desc="Safe as a hive. Your service requests are handled with maximum security and care."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto bg-petal-leaf dark:bg-petal-muted/30 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl border border-petal-leaf/20">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 tracking-tight">Ready to Get Started?</h2>
            <p className="text-white/70 mb-12 max-w-xl mx-auto text-lg leading-relaxed font-medium">
              Join thousands of happy souls who have improved their lives with Service Bee.
            </p>
            <Link to="/signup">
              <Button className="bg-petal-rose text-white hover:opacity-90 px-12 py-5 text-xl font-black rounded-[24px] flex items-center gap-3 mx-auto shadow-2xl shadow-petal-rose/30 border-none">
                Get Started Now <ArrowRight size={24} />
              </Button>
            </Link>
          </div>

          {/* Subtle decoration */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-petal-rose/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default Home;
