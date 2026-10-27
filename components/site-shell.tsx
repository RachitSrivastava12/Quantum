"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Overview" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/playground", label: "Lab" },
  { href: "/glossary", label: "Glossary" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="topbar">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-mark"><Atom size={18} strokeWidth={1.7} aria-hidden="true"/></span>
        <span>QUBIT <span className="brand-light">ATLAS</span></span>
      </Link>
      <nav id="primary-navigation" className={open ? "nav nav-open" : "nav"} aria-label="Main navigation">
        {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={(pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))) ? "nav-link active" : "nav-link"}>{link.label}</Link>)}
      </nav>
      <div className="top-actions">
        <span className="local-label"><span className="status-dot"/> OPEN LEARNING</span>
        <Link className="top-cta" href="/curriculum">Start learning <ArrowUpRight size={14}/></Link>
      </div>
      <button className="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={20} aria-hidden="true"/> : <Menu size={20} aria-hidden="true"/>}</button>
    </header>
    <main id="main-content">{children}</main>
    <footer className="footer">
      <Link className="brand footer-brand" href="/"><span className="brand-mark"><Atom size={17} aria-hidden="true"/></span><span>QUBIT <span className="brand-light">ATLAS</span></span></Link>
      <p>A clearer way into quantum computing.</p>
    </footer>
  </>;
}
