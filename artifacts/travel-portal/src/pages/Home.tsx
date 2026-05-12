import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import {
  Plane, Star, ShieldCheck, Clock, Phone, Mail, MapPin,
  Facebook, Instagram, MessageCircle, Users, Award, Heart,
  CheckCircle, Briefcase, Ticket, ArrowRight, ChevronRight,
  Youtube, Twitter, Globe, Gem,
} from "lucide-react";

const STATS = [
  { value: "5,000+", label: "Happy Pilgrims", icon: Users },
  { value: "15+", label: "Years Experience", icon: Award },
  { value: "200+", label: "Packages Delivered", icon: Briefcase },
  { value: "99%", label: "Satisfaction Rate", icon: Heart },
];

const SERVICES = [
  {
    title: "Umrah Packages",
    desc: "21 & 28 day all-inclusive packages with 5-star hotels near Masjid Al-Haram",
    href: "/umrah-packages",
    icon: Briefcase,
    badge: "Most Popular",
    img: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80",
  },
  {
    title: "KSA One Way Groups",
    desc: "Direct group flights from Pakistan to Jeddah & Riyadh at unbeatable prices",
    href: "/ksa-groups",
    icon: Plane,
    badge: "8 Flights",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  },
  {
    title: "UAE One Way Groups",
    desc: "Premium group flights to Dubai & Abu Dhabi with flexible departure dates",
    href: "/uae-groups",
    icon: Plane,
    badge: "5 Flights",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    title: "Umrah Tickets",
    desc: "Individual air tickets for Umrah pilgrims — all major airlines available",
    href: "/umrah-tickets",
    icon: Ticket,
    badge: "Available Now",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
  },
];

const DESTINATIONS = [
  {
    city: "Makkah Al-Mukarramah",
    arabic: "مَكَّةُ الْمُكَرَّمَة",
    desc: "The holiest city in Islam — home to Masjid Al-Haram and the sacred Kaaba. Every Muslim's lifetime dream fulfilled.",
    img: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=900&q=85",
    highlight: "Masjid Al-Haram",
  },
  {
    city: "Madinah Al-Munawwarah",
    arabic: "الْمَدِينَةُ الْمُنَوَّرَة",
    desc: "The City of Light — home to Masjid an-Nabawi, the blessed resting place of Prophet Muhammad ﷺ.",
    img: "https://images.unsplash.com/photo-1593267942959-f14e3a8caa18?w=900&q=85",
    highlight: "Masjid an-Nabawi",
  },
];

const INCLUDED = [
  "Return Air Ticket (All Major Airlines)", "5-Star & 4-Star Hotel Accommodation",
  "Visa Processing & Documentation", "Airport Transfers & Transportation",
  "Ziyarat Tours (Makkah & Madinah)", "Dedicated Tour Guide",
  "Zamzam Water Supply", "24/7 Customer Support",
];

const TESTIMONIALS = [
  { name: "Haji Muhammad Aslam", city: "Lahore", text: "Bin Yasin Travels made our Umrah journey absolutely beautiful. Everything was perfectly arranged. Highly recommended!", stars: 5, initials: "HA" },
  { name: "Hajjah Amina Bibi", city: "Karachi", text: "Excellent service from booking to return. The hotel was steps from Masjid Al Haram. JazakAllah Khair to the whole team!", stars: 5, initials: "AB" },
  { name: "Muhammad Tariq", city: "Islamabad", text: "Best travel agency in Pakistan for Umrah. Very professional team and great package deals. Already booked again for next year.", stars: 5, initials: "MT" },
];

const SOCIAL = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com", color: "#1877F2", bg: "#EBF5FE" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", color: "#E1306C", bg: "#FEE9F0" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/923001234567", color: "#25D366", bg: "#E9FAF0" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com", color: "#FF0000", bg: "#FFE9E9" },
  { icon: Twitter, label: "X / Twitter", href: "https://twitter.com", color: "#1DA1F2", bg: "#E9F5FE" },
];

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col -mt-4 -mx-4 md:-mx-6">

        {/* ═══════════════════════════════════════════════════════════
            HERO SECTION — Full-screen cinematic with Kaaba image
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1600&q=90"
              alt="Makkah Al-Mukarramah VIP"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b3e]/90 via-[#0d1b3e]/75 to-[#0d1b3e]/95" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3e]/60 via-transparent to-[#0d1b3e]/40" />
          </div>

          {/* Gold decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f5c842] to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
            {/* Arabic Bismillah */}
            <div className="text-3xl md:text-4xl font-bold text-[#f5c842] mb-2 drop-shadow-lg" style={{ fontFamily: "Georgia, serif" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <p className="text-white/40 text-[10px] mb-8 tracking-[0.25em] uppercase">In the name of Allah, the Most Gracious, the Most Merciful</p>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 border border-[#f5c842]/40 bg-[#f5c842]/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold text-[#f5c842] mb-8">
              <Gem className="h-4 w-4" />
              Pakistan's #1 Trusted Umrah Travel Agency
              <Gem className="h-4 w-4" />
            </div>

            {/* Main title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
              <span className="text-[#f5c842] drop-shadow-xl" style={{ textShadow: "0 0 60px rgba(245,200,66,0.4)" }}>Bin Yasin</span>
              <br />
              <span className="text-white">Travels</span>
            </h1>

            <div className="text-2xl text-[#f5c842]/50 mb-6" style={{ fontFamily: "Georgia, serif" }}>
              بن یاسین ٹریولز
            </div>

            {/* Talbiyah */}
            <div className="text-xl text-white/70 italic mb-6" style={{ fontFamily: "Georgia, serif" }}>
              لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
            </div>

            <p className="text-white/75 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Your journey to the Holy Land begins here. Premium Umrah packages, exclusive flight groups, and 15 years of trust — making your spiritual journey truly unforgettable.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/umrah-packages">
                <Button size="lg" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-black px-10 text-base h-14 shadow-2xl shadow-[#f5c842]/30 rounded-xl">
                  <Briefcase className="h-5 w-5 mr-2" /> View Umrah Packages
                </Button>
              </Link>
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-10 text-base h-14 rounded-xl">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-400" /> WhatsApp Us Now
                </Button>
              </a>
            </div>

            {/* Contact quick links */}
            <div className="flex flex-wrap justify-center gap-6 text-white/50 text-sm">
              <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-[#f5c842] transition-colors">
                <Phone className="h-4 w-4" /> +92-300-123-4567
              </a>
              <a href="mailto:info@binyasintravels.com" className="flex items-center gap-2 hover:text-[#f5c842] transition-colors">
                <Mail className="h-4 w-4" /> info@binyasintravels.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Ferozepur Road, Lahore
              </span>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs animate-bounce">
            <ChevronRight className="h-5 w-5 rotate-90" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STATS — Gold gradient floating cards
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-background px-4 md:px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1b3e] via-[#12255a] to-[#1a3a7c] text-white text-center p-6 shadow-xl group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#f5c842]/8 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#f5c842]/5 rounded-full translate-y-6 -translate-x-6" />
                  <div className="relative">
                    <div className="h-12 w-12 bg-[#f5c842]/15 border border-[#f5c842]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-[#f5c842]" />
                    </div>
                    <div className="text-4xl font-black text-[#f5c842] leading-none">{value}</div>
                    <div className="text-white/60 text-sm mt-2 font-medium">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SERVICES — Cards with images
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-background px-4 md:px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border border-[#0d1b3e]/20 dark:border-[#f5c842]/20 bg-[#0d1b3e]/5 dark:bg-[#f5c842]/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#0d1b3e] dark:text-[#f5c842] mb-4">
                Our Services
              </div>
              <h2 className="text-4xl font-black mb-3">Everything for Your Sacred Journey</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Complete travel solutions designed for every pilgrim and travel agent across Pakistan</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SERVICES.map(({ title, desc, href, icon: Icon, badge, img }) => (
                <Link key={title} href={href}>
                  <div className="group rounded-2xl border overflow-hidden bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden flex-shrink-0">
                      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="bg-[#f5c842] text-[#0d1b3e] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {badge}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="h-9 w-9 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-black text-base text-foreground leading-tight mb-2">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
                      <div className="flex items-center text-[#0d1b3e] dark:text-[#f5c842] text-sm font-bold pt-3 mt-auto">
                        Book Now <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            DESTINATIONS — Makkah & Madinah full-width showcase
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-background px-4 md:px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border border-[#0d1b3e]/20 dark:border-[#f5c842]/20 bg-[#0d1b3e]/5 dark:bg-[#f5c842]/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#0d1b3e] dark:text-[#f5c842] mb-4">
                Sacred Destinations
              </div>
              <h2 className="text-4xl font-black mb-3">The Two Holy Cities</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Journey to the most blessed places on earth — where every step is an act of worship</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {DESTINATIONS.map(({ city, arabic, desc, img, highlight }) => (
                <div key={city} className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:-translate-y-1 transition-transform duration-300" style={{ minHeight: 400 }}>
                  <img src={img} alt={city} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e]/95 via-[#0d1b3e]/40 to-transparent" />
                  {/* Highlight badge */}
                  <div className="absolute top-5 left-5">
                    <span className="bg-[#f5c842]/90 text-[#0d1b3e] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide backdrop-blur-sm">
                      {highlight}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="text-[#f5c842]/70 text-2xl mb-2" style={{ fontFamily: "Georgia, serif" }}>{arabic}</div>
                    <h3 className="text-white font-black text-2xl mb-3 leading-tight">{city}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
                    <Link href="/umrah-packages">
                      <Button size="sm" className="mt-5 bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-bold rounded-xl">
                        View Packages <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            QURANIC VERSE — full width banner
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1600&q=80"
            alt="Kaaba"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0d1b3e]/92" />
          <div className="relative z-10 py-20 px-6 text-center max-w-4xl mx-auto">
            <div className="text-[#f5c842]/40 text-3xl mb-6">✦ ❖ ✦</div>
            <div className="text-4xl md:text-5xl text-[#f5c842] font-bold mb-4 leading-relaxed" style={{ fontFamily: "Georgia, serif", direction: "rtl" }}>
              لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
            </div>
            <div className="text-white/50 text-lg italic mb-3">Labbayk Allāhumma Labbayk</div>
            <div className="text-white/70 text-base max-w-lg mx-auto leading-relaxed">
              "Here I am, O Allah, Here I am — the Talbiyah, recited by every pilgrim on the path to Allah's House"
            </div>
            <div className="mt-6 text-[#f5c842]/40 text-2xl">✦ ❖ ✦ ❖ ✦</div>

            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              {[
                { arabic: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ", trans: "Quran 3:97" },
                { arabic: "إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ", trans: "Quran 3:96" },
                { arabic: "وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ", trans: "Quran 2:196" },
              ].map((v, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-[#f5c842]/15 hover:bg-white/10 transition-colors">
                  <div className="text-[#f5c842] text-lg font-bold leading-loose mb-2" style={{ fontFamily: "Georgia, serif", direction: "rtl" }}>{v.arabic}</div>
                  <div className="text-white/40 text-xs">{v.trans}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            WHAT'S INCLUDED
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-background px-4 md:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 mb-4">
                All-Inclusive
              </div>
              <h2 className="text-4xl font-black mb-3">Everything Included — Zero Hidden Charges</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Every package covers all your needs from departure to return</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INCLUDED.map((item) => (
                <div key={item} className="group flex items-center gap-4 p-5 rounded-2xl border bg-card hover:border-[#f5c842]/50 hover:shadow-lg transition-all duration-200">
                  <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f5c842]/10 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:text-[#f5c842]" />
                  </div>
                  <span className="text-sm font-semibold leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ABOUT US — split with airline logos
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-muted/30 dark:bg-muted/10 px-4 md:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 border border-[#0d1b3e]/20 dark:border-[#f5c842]/20 bg-[#0d1b3e]/5 dark:bg-[#f5c842]/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#0d1b3e] dark:text-[#f5c842]">
                  About Us
                </div>
                <h2 className="text-4xl font-black leading-tight">
                  15+ Years of Serving <span className="text-[#0d1b3e] dark:text-[#f5c842]">Allah's Guests</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Bin Yasin Travels was established in 2009 with a single mission — to give every Pakistani Muslim the opportunity to perform Umrah comfortably, affordably, and with full peace of mind.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Over 15+ years, we have served more than 5,000 pilgrims, partnering with PIA, Air Arabia, Emirates, Fly Dubai and more. Our packages suit every budget — from economy to premium VIP luxury.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: ShieldCheck, label: "IATA Certified Agency", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                    { icon: Award, label: "Award-Winning Service", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    { icon: Users, label: "5000+ Satisfied Clients", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
                    { icon: Clock, label: "2-Hour Hold Guarantee", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
                  ].map(({ icon: Icon, label, color, bg }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${bg} border border-transparent`}>
                      <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
                      <span className="text-sm font-semibold leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <Button className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c] h-12 px-8 rounded-xl font-bold text-base">
                    Get Started Today <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Right — feature image + mini cards */}
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-64">
                  <img
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
                    alt="5-Star Hotel Makkah"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e]/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white font-black">5-Star Hotels Near Haramain</div>
                    <div className="text-white/60 text-sm">Steps from Masjid Al-Haram</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg h-36">
                    <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80" alt="Flight" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e]/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white font-bold text-sm">Premium Flights</div>
                      <div className="text-white/50 text-xs">All Major Airlines</div>
                    </div>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-lg h-36">
                    <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80" alt="Travel" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e]/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white font-bold text-sm">Visa & Docs</div>
                      <div className="text-white/50 text-xs">Full Assistance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-background px-4 md:px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-4">
                Client Reviews
              </div>
              <h2 className="text-4xl font-black mb-3">What Our Pilgrims Say</h2>
              <p className="text-muted-foreground">Thousands of satisfied pilgrims trust Bin Yasin Travels</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="group p-7 rounded-3xl border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-5">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#f5c842] fill-[#f5c842]" />
                    ))}
                  </div>
                  {/* Quote */}
                  <div className="text-4xl text-[#f5c842]/20 font-serif leading-none">"</div>
                  <p className="text-foreground/80 text-sm leading-relaxed -mt-4">{t.text}</p>
                  {/* Author */}
                  <div className="flex items-center gap-4 border-t pt-5">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#0d1b3e] to-[#1a3a7c] flex items-center justify-center text-[#f5c842] font-black text-sm flex-shrink-0 shadow-md">
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{t.city}, Pakistan
                      </div>
                    </div>
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CONTACT & LOCATION — with Google Maps embed style
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-muted/30 dark:bg-muted/10 px-4 md:px-6 py-16" id="contact">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border border-[#0d1b3e]/20 dark:border-[#f5c842]/20 bg-[#0d1b3e]/5 dark:bg-[#f5c842]/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#0d1b3e] dark:text-[#f5c842] mb-4">
                Find Us
              </div>
              <h2 className="text-4xl font-black mb-3">Visit Our Office</h2>
              <p className="text-muted-foreground">We're located in the heart of Lahore — come meet our team in person</p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Map left (3 cols) */}
              <div className="md:col-span-3 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 380 }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.345!2d74.3587!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzEzLjQiTiA3NMKwMjEnMzEuMyJF!5e0!3m2!1sen!2spk!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 380 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bin Yasin Travels Location"
                />
              </div>

              {/* Contact info right (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="font-black text-xl mb-5">Get In Touch</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Phone, label: "Phone / Call", value: "+92-300-123-4567", sub: "Mon–Sat: 9am–7pm (PKT)", href: "tel:+923001234567", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-700" },
                      { icon: MessageCircle, label: "WhatsApp", value: "+92-300-123-4567", sub: "Available 24/7", href: "https://wa.me/923001234567", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-700" },
                      { icon: Mail, label: "Email", value: "info@binyasintravels.com", sub: "Reply within 24 hours", href: "mailto:info@binyasintravels.com", bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-700" },
                      { icon: MapPin, label: "Address", value: "Shop #12, Al-Haramain Plaza", sub: "Main Ferozepur Road, Lahore 54000", href: "https://maps.google.com/?q=31.5204,74.3587", bg: "bg-red-50 dark:bg-red-900/20", color: "text-red-700" },
                      { icon: Globe, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM", sub: "Sunday: 11:00 AM – 3:00 PM", href: null, bg: "bg-purple-50 dark:bg-purple-900/20", color: "text-purple-700" },
                    ].map(({ icon: Icon, label, value, sub, href, bg, color }) => {
                      const Inner = (
                        <div className={`flex items-start gap-3 p-3.5 rounded-xl border hover:shadow-md transition-all group`}>
                          <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
                            <div className="font-bold text-sm mt-0.5 truncate">{value}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">{sub}</div>
                          </div>
                        </div>
                      );
                      return href ? (
                        <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{Inner}</a>
                      ) : (
                        <div key={label}>{Inner}</div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Row */}
            <div className="mt-8 p-6 rounded-2xl border bg-card shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-sm mr-2">Follow Us:</span>
                {SOCIAL.map(({ icon: Icon, label, href, color, bg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border hover:shadow-md transition-all hover:-translate-y-0.5 group"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                    <span className="text-sm font-semibold" style={{ color }}>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CTA BANNER — bottom
        ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1593267942959-f14e3a8caa18?w=1600&q=80"
            alt="Madinah"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0d1b3e]/88" />
          <div className="relative z-10 py-20 px-6 text-center max-w-3xl mx-auto">
            <div className="text-[#f5c842]/60 text-xl mb-4" style={{ fontFamily: "Georgia, serif" }}>بن یاسین ٹریولز</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Start Your Spiritual Journey <span className="text-[#f5c842]">Today</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Join thousands of pilgrims who trusted Bin Yasin Travels to take them to the house of Allah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-black px-10 h-14 text-base rounded-xl shadow-2xl">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/umrah-packages">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-10 h-14 rounded-xl">
                  Browse Packages
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════ */}
        <footer className="bg-[#0a1428] text-white px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#f5c842] rounded-xl flex items-center justify-center flex-shrink-0">
                <Plane className="h-4 w-4 text-[#0d1b3e]" />
              </div>
              <div>
                <div className="font-black text-sm">Bin Yasin Travels</div>
                <div className="text-white/40 text-xs">© 2009–2026 All rights reserved</div>
              </div>
            </div>
            <div className="text-white/30 text-xs text-center">
              IATA Certified | Licensed by PCAA | Member of TAAP Pakistan
            </div>
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>
    </Layout>
  );
}
