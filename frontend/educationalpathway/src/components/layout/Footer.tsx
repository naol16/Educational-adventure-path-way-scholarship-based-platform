import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full pt-12 pb-8 border-t border-border bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Image 
                src="/admas.png" 
                alt="Path Finder Logo"
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-black text-foreground font-serif tracking-tight">Path Finder</span>
          </Link>

          <p className="text-sm text-muted-foreground font-medium text-center sm:text-right">
            © {new Date().getFullYear()} Path Finder Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

