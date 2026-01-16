"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Shops", href: "/shops" },
  { name: "About Us", href: "#about" },
];

const services = [
  { name: "Grocery Delivery", href: "#" },
  { name: "Quick Commerce", href: "#" },
  { name: "Local Partnerships", href: "#" },
  { name: "Become a Partner", href: "/shopkeeper/apply" },
];

const legal = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Refund Policy", href: "#" },
  { name: "Cookie Policy", href: "#" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#", color: "hover:bg-blue-primary" },
  { name: "Twitter", icon: Twitter, href: "#", color: "hover:bg-blue-primary" },
  { name: "Instagram", icon: Instagram, href: "#", color: "hover:bg-purple-primary" },
  { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:bg-blue-primary" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background via-muted/30 to-muted/50 border-t border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section - Takes more space */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              {/* Logo */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🛒</span>
                <h3 className="text-2xl font-bold poppins-bold">
                  <span className="text-primary">Mohalla</span>
                  <span className="text-secondary">Mart</span>
                </h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm max-w-sm inter-regular">
                Your trusted neighborhood marketplace for quality products and
                reliable delivery services. Fresh groceries delivered to your doorstep in minutes.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      className={`w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground ${social.color} hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-110 active:scale-95 hover:border-transparent`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  );
                })}
              </div>

              {/* App Download Badges */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-md active:scale-95 group"
                >
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground">Download on</div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      App Store
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary transition-all hover:shadow-md active:scale-95 group"
                >
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground">Get it on</div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      Google Play
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <h4 className="text-base font-semibold text-foreground mb-4 poppins-semibold">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inter-regular flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <h4 className="text-base font-semibold text-foreground mb-4 poppins-semibold">
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inter-regular flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <h4 className="text-base font-semibold text-foreground mb-4 poppins-semibold">
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                    <a
                      href="mailto:support@mohallamart.com"
                      className="text-sm text-foreground hover:text-primary transition-colors duration-200 inter-regular"
                    >
                      support@mohallamart.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Phone</div>
                    <a
                      href="tel:+919876543210"
                      className="text-sm text-foreground hover:text-primary transition-colors duration-200 inter-regular"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Location</div>
                    <span className="text-sm text-foreground inter-regular">
                      Mumbai, India
                    </span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-border py-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground inter-regular text-center sm:text-left">
              © {new Date().getFullYear()} MohallaMart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {legal.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inter-regular"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
