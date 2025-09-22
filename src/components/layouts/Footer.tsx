import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from 'lucide-react';
import { Separator } from '../ui/layout/separator';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3>IoT Hub</h3>
            <p className="text-muted-foreground text-sm">
              Your one-stop destination for IoT components and ready-made projects. Empowering students and professionals with cutting-edge technology solutions.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Github className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4>Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">IoT Components</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Ready-Made Projects</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Project Domains</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Technical Support</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4>Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Project Customization</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Component Selection</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Technical Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Order Tracking</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4>Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">support@iotsolutionshub.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Electronic City, Bangalore, India</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 IoT Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};