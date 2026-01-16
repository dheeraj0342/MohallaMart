"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, ShoppingBag, Zap, Users, Truck } from "lucide-react";

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
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

const features = [
  { icon: Zap, title: "Fast Delivery", description: "Delivered in minutes" },
  { icon: Truck, title: "Free Shipping", description: "On orders above ₹500" },
  { icon: Users, title: "24/7 Support", description: "Always here to help" },
  { icon: ShoppingBag, title: "Quality Products", description: "100% authentic" },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 transition-colors overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="py-12 border-b border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground mb-1 poppins-semibold">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground inter-regular">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              {/* Logo */}
              <div className="mb-6">
                <Link href="/" className="inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                      🛒
                    </div>
                    <h3 className="text-xl font-bold poppins-bold">
                      <span className="text-primary">Mohalla</span>
                      <span className="text-secondary">Mart</span>
                    </h3>
                  </div>
                </Link>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm inter-regular">
                Your trusted neighborhood marketplace for quality products and reliable delivery services. Fresh groceries delivered to your doorstep in minutes.
              </p>

              {/* Social Links */}
              <div className="flex gap-2 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>

              {/* App Download Badges */}
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-4 py-2.5 bg-muted/50 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all hover:shadow-md active:scale-95 group text-sm"
                >
                  <span className="text-lg">📱</span>
                  <div className="text-left flex-1">
                    <div className="text-[10px] text-muted-foreground">Download on</div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      App Store
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-4 py-2.5 bg-muted/50 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all hover:shadow-md active:scale-95 group text-sm"
                >
                  <span className="text-lg">🤖</span>
                  <div className="text-left flex-1">
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
              <h4 className="text-sm font-bold text-foreground mb-5 poppins-bold uppercase tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200 inter-regular flex items-center gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <h4 className="text-sm font-bold text-foreground mb-5 poppins-bold uppercase tracking-wide">
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200 inter-regular flex items-center gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="lg:col-span-4"
            >
              <h4 className="text-sm font-bold text-foreground mb-5 poppins-bold uppercase tracking-wide">
                Contact & Support
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5 font-medium">Email</div>
                    <a
                      href="mailto:support@mohallamart.com"
                      className="text-sm text-foreground hover:text-primary transition-colors duration-200 inter-regular break-all"
                    >
                      support@mohallamart.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5 font-medium">Phone</div>
                    <a
                      href="tel:+919876543210"
                      className="text-sm text-foreground hover:text-primary transition-colors duration-200 inter-regular"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5 font-medium">Location</div>
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
          className="border-t border-border/30 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground inter-regular text-center sm:text-left">
              © {new Date().getFullYear()} MohallaMart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs">
              {legal.map((item) => (
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
