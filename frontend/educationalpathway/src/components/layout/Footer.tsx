import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";


export function Footer() {
  return (
    <footer className="w-full pt-16 pb-12 border-t border-border bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Image 
                src="/pathfinder.png" 
                alt="Path Finder Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-black text-foreground font-serif tracking-tight">Path Finder</span>
          </Link>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full border border-border bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                  <Icon size={18} />
                </Link>
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} Path Finder Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

