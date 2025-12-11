"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, ArrowUpRight, Phone, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const contactLinks = [
  {
    icon: Github,
    label: "GitHub",
    value: "Vedi i miei progetti",
    href: "https://github.com/MrHighSea",
    gradient: "from-gray-400 to-gray-600",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Connettiti con me",
    href: "https://www.linkedin.com/in/luca-altimare/",
    gradient: "from-blue-600 to-blue-400",
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contatti" className="py-32 px-6 relative">
      {/* Background Effects */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-green-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            Contatti
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Lavoriamo Insieme
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Hai un progetto in mente? Parliamone. 
            Sono sempre aperto a nuove collaborazioni e sfide tecniche.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Messaggio Inviato!</h3>
                <p className="text-gray-400">Ti risponderò il prima possibile.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Il tuo nome"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="La tua email"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Messaggio</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Descrivi il tuo progetto..."
                    required
                    rows={5}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 resize-none"
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {isSubmitting ? "Invio in corso..." : "Invia Messaggio"}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Direct Contact */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contatto Diretto</h3>
              <div className="space-y-4">
                <a href="mailto:info@lradev.app" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white group-hover:text-blue-400 transition-colors">info@lradev.app</p>
                  </div>
                </a>
                <a href="tel:+393201568688" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Telefono</p>
                    <p className="text-white group-hover:text-green-400 transition-colors">+39 320 156 8688</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactLinks.map((link, idx) => (
                <motion.a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all duration-300 block"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} shadow-lg`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{link.label}</h3>
                      <p className="text-gray-500 text-sm">{link.value}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors ml-auto" />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Availability Badge */}
            <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm">Disponibile per nuovi progetti</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}