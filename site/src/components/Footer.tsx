import { Mail, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="mailto:st.garg19@gmail.com"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Email</span>
            </a>
            
            <a
              href="https://www.linkedin.com/in/stgarg/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            
            <a
              href="https://x.com/gargsumit"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm font-medium">X</span>
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sumit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
