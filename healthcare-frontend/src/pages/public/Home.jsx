import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Top Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              MediClaim
            </h1>
          </div>
          <div className="hidden md:flex space-x-8 items-center text-sm font-medium">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#workflow" className="text-slate-600 hover:text-blue-600 transition-colors">Workflow</a>
            <a href="#faq" className="text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
            <button
              onClick={() => navigate("/login")}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-0 -translate-x-1/3 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-8 border border-blue-100 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Next generation healthcare claims
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight lg:leading-[1.1] mb-8">
            Intelligent Healthcare <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Claim Management
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            Connecting Hospitals, Patients, and Insurance Companies with AI-powered insights, seamless workflows, and unprecedented transparency.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all shadow-sm transform hover:-translate-y-1"
            >
              View Demo
            </button>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg">✓</span> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg">✓</span> Free support
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg">✓</span> Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection section */}
      <section className="py-12 bg-white border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
            Tailored Experiences For
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard
              title="Hospitals"
              desc="Streamline patient onboarding and claim submissions."
              icon="🏥"
              color="blue"
              onClick={() => navigate("/register")}
            />
            <RoleCard
              title="Patients"
              desc="Track claims in real-time with complete transparency."
              icon="👤"
              color="indigo"
              onClick={() => navigate("/register")}
            />
            <RoleCard
              title="Insurance"
              desc="Accelerate verifications with AI-powered insights."
              icon="🏢"
              color="purple"
              onClick={() => navigate("/register")}
            />
          </div>
        </div>
      </section>

      {/* Features bento box layout */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need, <span className="text-blue-600">and more.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to remove friction from the healthcare claims process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">AI Claim Agent</h3>
              <p className="text-slate-600 max-w-md">
                Get instant answers about claims, coverage, and complex medical reports using our conversational AI trained on health data.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/40 rounded-tl-full blur-2xl transform translate-x-12 translate-y-12 block"></div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Tracking</h3>
            <p className="text-slate-600">
              Track claim progress with dynamic timeline updates and instant notifications directly to your device.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              🔐
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Vault</h3>
            <p className="text-slate-600">
              Upload and manage sensitive medical documents safely with advanced role-based access control.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Onboarding</h3>
            <p className="text-slate-600">
              Quickly add patients with simple OTP verification and automatic secure account provisioning.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent Billing</h3>
            <p className="text-slate-600">
              Clear visibility of coverage limits, utilized amounts, and remaining benefits.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A simplified, secure three-step process designed for maximum efficiency.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <WorkflowStep
                icon="1"
                title="Initiation"
                desc="Hospital adds the patient, uploads required medical reports, and submits the insurance claim securely."
              />
              <WorkflowStep
                icon="2"
                title="Verification"
                desc="Patient authenticates via OTP, confirms details, and provides digital consent for the claim process."
              />
              <WorkflowStep
                icon="3"
                title="Resolution"
                desc="Insurance provider validates documents with AI assistance and releases funds directly to the hospital."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 bg-slate-50 border-b border-slate-200">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
          Trusted by standard caretakers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Testimonial
            name="Dr. Mehta"
            role="Hospital Administrator"
            text="MediClaim simplified our entire workflow perfectly. The patient onboarding is so intuitive that our staff required zero training."
            avatar="👨‍⚕️"
          />
          <Testimonial
            name="Rahul Kumar"
            role="Patient"
            text="I can finally track my claim status in real time. The AI agent answered all my specific coverage questions almost instantly."
            avatar="👨"
          />
          <Testimonial
            name="Priya Singh"
            role="Claims Manager"
            text="The AI risk detection software saves us hours of manual verification and significantly improves our processing accuracy."
            avatar="👩‍💼"
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Common Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about the product and operations.
            </p>
          </div>

          <div className="space-y-4">
            <Accordion
              title="How do I add patients to the system?"
              content="Simply go to the 'Add Patient' section, fill in the required details, and send an OTP. The patient will receive an email/OTP to verify their account securely."
            />
            <Accordion
              title="Is MediClaim completely secure?"
              content="Absolutely. We utilize industry-standard AES-256 encryption, strict role-based access controls, and secure document vaults. All operations are fully compliant with major healthcare data regulations."
            />
            <Accordion
              title="How does the AI agent actually assist me?"
              content="The AI can instantly answer personal queries about your specific coverage, simplify complex medical jargon found in your reports, and guide you step-by-step through the required documentation."
            />
            <Accordion
              title="What if a specific insurance company isn't registered?"
              content="No problem! We will automatically dispatch a formal invitation via email and SMS to your insurance provider requesting them to register on our platform so your claim can be processed without delay."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
                <h4 className="text-xl font-bold text-slate-100">MediClaim</h4>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                Revolutionizing healthcare finance with intelligent, transparent, and seamless claim management infrastructure.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors border border-slate-800 text-slate-300">X</div>
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors border border-slate-800 text-slate-300">in</div>
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors border border-slate-800 text-slate-300">GH</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-100 mb-6 tracking-wide text-sm uppercase">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-100 mb-6 tracking-wide text-sm uppercase">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#faq" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-100 mb-6 tracking-wide text-sm uppercase">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} MediClaim Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Components ---------- */

function RoleCard({ title, desc, icon, color, onClick }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300 hover:shadow-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300 hover:shadow-purple-100",
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 bg-white group`}
    >
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl border ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} ${colorMap[color].split(' ')[2]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
        Get started <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all">→</span>
      </div>
    </div>
  );
}

function WorkflowStep({ icon, title, desc }) {
  return (
    <div className="relative text-center md:text-left pt-8 md:pt-0">
      <div className="absolute top-0 left-1/2 md:left-0 -translate-x-1/2 md:-translate-x-1/2 -translate-y-1/2 md:-translate-y-1/2 w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center z-10 border-4 border-slate-900 shadow-xl shadow-blue-500/20">
        {icon}
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-3xl md:mt-10 hover:bg-slate-800 transition-colors h-full">
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  );
}

function Testimonial({ name, role, text, avatar }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full">
      <div className="flex gap-1 text-amber-400 mb-6 text-sm">
        ★★★★★
      </div>
      <p className="text-slate-700 mb-8 leading-relaxed flex-grow">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl border border-slate-200">
          {avatar}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{name}</h4>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 font-semibold text-slate-900 flex justify-between items-center hover:bg-slate-50 transition-colors"
      >
        <span className="pr-8">{title}</span>
        <span className={`transform transition-transform duration-300 text-blue-600 border border-blue-100 rounded-full w-8 h-8 flex items-center justify-center bg-blue-50 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out px-6 text-slate-600 leading-relaxed text-sm overflow-hidden ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        {content}
      </div>
    </div>
  );
}
