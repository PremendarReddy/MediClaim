import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 scroll-smooth">

      {/* Top Navbar */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-600">MediClaim</h1>
          <div className="space-x-6 text-sm">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#workflow" className="hover:text-blue-600">Workflow</a>
            <a href="#faq" className="hover:text-blue-600">FAQ</a>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h1 className="text-5xl font-bold mb-6">
          Intelligent Healthcare Claim Management
        </h1>
        <p className="max-w-2xl mx-auto mb-10 text-blue-100">
          Connecting Hospitals, Patients, and Insurance Companies with
          AI-powered insights and transparent claim workflows.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate("/hospital/dashboard")}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            For Hospitals
          </button>

          <button
            onClick={() => navigate("/patient/dashboard")}
            className="bg-blue-500 px-6 py-3 rounded-lg font-medium"
          >
            For Patients
          </button>

          <button
            onClick={() => navigate("/insurance/dashboard")}
            className="bg-indigo-900 px-6 py-3 rounded-lg font-medium"
          >
            For Insurance
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>

        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="AI Risk Analysis"
            desc="Advanced AI models detect abnormal billing and fraud patterns."
          />
          <FeatureCard
            title="Real-Time Tracking"
            desc="Track claim progress with dynamic timeline updates."
          />
          <FeatureCard
            title="Secure Document System"
            desc="Upload and manage insurance documents safely."
          />
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="flex justify-center space-x-16">
          <WorkflowStep step="1" text="Hospital submits claim" />
          <WorkflowStep step="2" text="Patient verifies & uploads documents" />
          <WorkflowStep step="3" text="Insurance reviews & approves" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Users Say
        </h2>

        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Testimonial
            name="Dr. Mehta"
            role="Hospital Admin"
            text="MediClaim simplified our claim workflow tremendously."
          />
          <Testimonial
            name="Rahul Kumar"
            role="Patient"
            text="I can now track my claim status in real time."
          />
          <Testimonial
            name="Insurance Officer"
            role="Claims Manager"
            text="AI risk detection saves hours of manual verification."
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          <CollapsibleFAQ
            question="Is MediClaim secure?"
            answer="Yes. All documents are securely handled and role-based access is enforced."
          />
          <CollapsibleFAQ
            question="Can patients track claim updates?"
            answer="Yes. Real-time updates and notifications keep patients informed."
          />
          <CollapsibleFAQ
            question="Does the system support AI analysis?"
            answer="Yes. AI-powered risk analysis highlights suspicious claims."
          />
        </div>
      </section>

      <footer className="bg-gray-900 text-white text-center py-6">
        © 2026 MediClaim. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------- Components ---------- */

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function WorkflowStep({ step, text }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
        {step}
      </div>
      <p>{text}</p>
    </div>
  );
}

function Testimonial({ name, role, text }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <p className="text-gray-600 mb-4">"{text}"</p>
      <h4 className="font-semibold">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
}

function CollapsibleFAQ({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left font-semibold flex justify-between"
      >
        {question}
        <span>{open ? "-" : "+"}</span>
      </button>

      {open && (
        <p className="mt-3 text-gray-600 text-sm">
          {answer}
        </p>
      )}
    </div>
  );
}