import React from "react";
import { FileText } from "lucide-react";

const teamMembers = [
  {
    name: "Pinsara Perera",
    role: "AI & Blockchain Developer",
    image:
      "https://avatars.githubusercontent.com/u/113119539?s=400&u=845a95bc5ca721aed03d7113186f52a64581ba87&v=4",
    bio: "Expert in machine learning and artificial intelligence, developing intelligent systems and algorithms to solve complex problems with cutting-edge technology.",
  },
  {
    name: "Shehan Suraweera",
    role: "Blockchain Developer",
    image:
      "https://avatars.githubusercontent.com/u/121711430?s=400&u=faa7262cccc01cfde44504d16b73fd539b3817e9&v=4",
    bio: "Blockchain specialist focused on building secure, decentralized applications and smart contracts using modern distributed ledger technologies.",
  },
  {
    name: "Pethum Jeewantha",
    role: "Backend Developer",
    image: "https://avatars.githubusercontent.com/u/83197935?v=4",
    bio: "Experienced backend engineer specializing in scalable server architectures, API development, and database optimization using Node.js and cloud technologies.",
  },
  {
    name: "Amindu Bhashana",
    role: "Frontend Developer",
    image: "https://avatars.githubusercontent.com/u/121743174?v=4",
    bio: "Creative frontend developer passionate about crafting responsive, user-friendly interfaces using React, modern CSS frameworks, and intuitive design principles.",
  },
  {
    name: "Yasisuru Viduruwan",
    role: "QA & DevOps ",
    image: "https://avatars.githubusercontent.com/u/117531838?v=4",
    bio: "Quality assurance and DevOps specialist ensuring software reliability through comprehensive testing, automation, and robust CI/CD pipeline implementation.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <header className="relative overflow-hidden from-white via-sky-50 to-emerald-50 pt-16 pb-16">
        {/* Background gradient blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 opacity-30 rounded-full filter blur-3xl animate-pulse-slow group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-300 opacity-20 rounded-full filter blur-2xl animate-spin-slow group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white rounded-full p-3 shadow-md">
              <FileText className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-800">
            Meet <span className="text-blue-600">Team Vertex</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
            The minds behind{" "}
            <span className="text-emerald-600 font-medium">Lawra</span> –
            building the future of AI-powered legal technology with expertise,
            vision, and teamwork.
          </p>
        </div>
      </header>

      {/* Team Members */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition duration-300 text-center p-8"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-600 object-cover"
                />
                <h3 className="text-xl font-bold text-blue-600 mb-1">
                  {member.name}
                </h3>
                <p className="text-emerald-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-slate-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 text-center text-sm">
        &copy; 2024 Lawra. All rights reserved. | Built by Team Vertex
      </footer>
    </div>
  );
};

export default About;
