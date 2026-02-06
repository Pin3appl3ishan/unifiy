import { Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="px-6 py-20 border-t border-white/5 bg-[#06110d]">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-serif font-bold mb-6">U&I</div>
          <p className="text-sm text-white/40 max-w-[200px]">
            The collaborative workspace that remembers everything.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white">Product</h4>
          <ul className="text-sm text-white/40 space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors">Whiteboard</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white">Company</h4>
          <ul className="text-sm text-white/40 space-y-2">
            <li className="hover:text-white cursor-pointer transition-colors">About</li>
            <li className="hover:text-white cursor-pointer transition-colors">Journal</li>
            <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white">Social</h4>
          <div className="flex gap-4 text-white/40">
            <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30">
        <p>&copy; 2024 U&I</p>
        <p>BUILT FOR THE CURIOUS</p>
      </div>
    </footer>
  );
}
