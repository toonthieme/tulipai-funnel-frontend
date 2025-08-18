
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center pt-24">
      <div className="w-full max-w-4xl mx-auto rounded-xl p-8 md:p-12 animate-fade-in">
        <h1 className="text-5xl font-light text-white mb-8">About TulipAI</h1>
        <div className="space-y-6 text-gray-300 font-light leading-relaxed max-w-3xl mx-auto text-left md:text-center">
          <p>
            At TulipAI, our mission is to make the power of artificial intelligence accessible to everyone, not just large corporations. We believe that small and medium-sized enterprises are the backbone of our economy, and with the right tools, they can achieve unprecedented growth and efficiency.
          </p>
          <p>
            Our platform was built by a team of frontend engineers and AI specialists passionate about user experience and tangible results. We've designed this intake funnel to be intuitive, insightful, and, most importantly, effective. We translate your business context into a clear AI strategy, helping you navigate the future with confidence.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;