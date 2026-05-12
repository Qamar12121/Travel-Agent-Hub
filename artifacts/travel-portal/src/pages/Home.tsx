import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import {
  Plane, Star, ShieldCheck, Clock, Phone, Mail, MapPin,
  Facebook, Instagram, MessageCircle, Users, Award, Heart,
  CheckCircle, Briefcase, Ticket, ArrowRight, ChevronRight,
  Youtube, Twitter,
} from "lucide-react";

const STATS = [
  { value: "5000+", label: "Happy Pilgrims", icon: Users },
  { value: "15+", label: "Years Experience", icon: Award },
  { value: "200+", label: "Packages Delivered", icon: Briefcase },
  { value: "99%", label: "Satisfaction Rate", icon: Heart },
];

const SERVICES = [
  { title: "Umrah Packages", desc: "21 & 28 day packages with premium hotels near Haramain", href: "/umrah-packages", icon: Briefcase, badge: "Most Popular" },
  { title: "KSA One Way Groups", desc: "Direct flights from Pakistan to Jeddah & Riyadh", href: "/ksa-groups", icon: Plane, badge: "8 Flights" },
  { title: "UAE One Way Groups", desc: "Affordable flights to Dubai & Abu Dhabi", href: "/uae-groups", icon: Plane, badge: "5 Flights" },
  { title: "Umrah Tickets", desc: "Individual air tickets for Umrah pilgrims", href: "/umrah-tickets", icon: Ticket, badge: "Available Now" },
];

const INCLUDED = [
  "Return Air Ticket (All Major Airlines)", "5-Star & 4-Star Hotel Accommodation",
  "Visa Processing & Documentation", "Airport Transfers & Transportation",
  "Ziyarat Tours (Makkah & Madinah)", "Dedicated Tour Guide",
  "Zamzam Water Supply", "24/7 Customer Support",
];

const ARABIC_VERSES = [
  {
    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ",
    transliteration: "Labbayk Allāhumma Labbayk",
    meaning: "Here I am, O Allah, here I am — the Talbiyah of Hajj & Umrah",
  },
  {
    arabic: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ",
    transliteration: "Wa lillāhi 'alan-nāsi hijjul-bayt",
    meaning: "And [due] to Allah from the people is a pilgrimage to the House — Quran 3:97",
  },
  {
    arabic: "إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ",
    transliteration: "Inna awwala baytin wudi'a lin-nās",
    meaning: "Indeed, the first House established for mankind — Quran 3:96",
  },
];

const TESTIMONIALS = [
  { name: "Haji Muhammad Aslam", city: "Lahore", text: "Bin Yasin Travels made our Umrah journey absolutely beautiful. Everything was perfectly arranged. Highly recommended!", stars: 5 },
  { name: "Hajjah Amina Bibi", city: "Karachi", text: "Excellent service from booking to return. The hotel was steps from Masjid Al Haram. JazakAllah Khair to the whole team!", stars: 5 },
  { name: "Muhammad Tariq", city: "Islamabad", text: "Best travel agency in Pakistan for Umrah. Very professional team and great package deals. Already booked again for next year.", stars: 5 },
];

const SOCIAL = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/binyasintravels", color: "#1877F2" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/binyasintravels", color: "#E1306C" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/923001234567", color: "#25D366" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@binyasintravels", color: "#FF0000" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com/binyasintravels", color: "#1DA1F2" },
];

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col">

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative w-full py-24 md:py-36 bg-[#0d1b3e] text-white rounded-2xl overflow-hidden mb-10">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5c842' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#0d1b3e]/95 to-[#1a3a7c]/60" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#f5c842] mb-2" style={{ fontFamily: "Georgia, serif" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <p className="text-white/40 text-xs mb-8 tracking-widest uppercase">In the name of Allah, the Most Gracious, the Most Merciful</p>

            <Badge className="mb-6 bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 px-4 py-1 text-sm font-medium">
              <Star className="h-3 w-3 mr-1 fill-current" /> Pakistan's Most Trusted Umrah Travel Agency
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
              <span className="text-[#f5c842]">Bin Yasin</span>
              <br />
              <span className="text-white">Travels</span>
            </h1>

            <div className="text-2xl text-[#f5c842]/60 mb-4" style={{ fontFamily: "Georgia, serif" }}>
              بن یاسین ٹریولز
            </div>

            <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Your journey to the Holy Land begins with us. Premium Umrah packages, exclusive flight groups, and a legacy of trust — making your spiritual journey unforgettable since 2009.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/umrah-packages">
                <Button size="lg" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-bold px-8 text-base shadow-lg">
                  <Briefcase className="h-5 w-5 mr-2" /> View Umrah Packages
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 text-base">
                  Join as Agent <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
              <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-[#f5c842] transition-colors">
                <Phone className="h-4 w-4" /> +92-300-123-4567
              </a>
              <a href="https://wa.me/923001234567" className="flex items-center gap-2 hover:text-[#f5c842] transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <a href="mailto:info@binyasintravels.com" className="flex items-center gap-2 hover:text-[#f5c842] transition-colors">
                <Mail className="h-4 w-4" /> info@binyasintravels.com
              </a>
            </div>
          </div>
        </section>

        {/* ─── STATS ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map(({ value, label, icon: Icon }) => (
            <Card key={label} className="text-center border-0 shadow-md bg-gradient-to-br from-[#0d1b3e] to-[#1a3a7c] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#f5c842]/10 rounded-full -translate-y-4 translate-x-4" />
              <CardContent className="pt-6 pb-5">
                <Icon className="h-7 w-7 text-[#f5c842] mx-auto mb-2" />
                <div className="text-3xl font-black text-[#f5c842]">{value}</div>
                <div className="text-white/70 text-sm mt-1 font-medium">{label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ─── SERVICES ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-[#0d1b3e]/10 text-[#0d1b3e] border-[#0d1b3e]/20 dark:bg-white/10 dark:text-white dark:border-white/20">Our Services</Badge>
            <h2 className="text-3xl font-black">Everything You Need for Sacred Travel</h2>
            <p className="text-muted-foreground mt-2">Complete travel solutions for pilgrims and agents across Pakistan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map(({ title, desc, href, icon: Icon, badge }) => (
              <Link key={title} href={href}>
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group border">
                  <CardContent className="pt-6 pb-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[#0d1b3e] flex items-center justify-center group-hover:bg-[#f5c842] transition-colors">
                        <Icon className="h-5 w-5 text-white group-hover:text-[#0d1b3e] transition-colors" />
                      </div>
                      <Badge className="text-xs bg-[#f5c842]/15 text-[#9a7c00] border-[#f5c842]/30">{badge}</Badge>
                    </div>
                    <h3 className="font-bold text-foreground leading-tight">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    <div className="flex items-center text-[#0d1b3e] text-sm font-semibold pt-1 dark:text-[#f5c842]">
                      Book Now <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── QURANIC VERSES / ARABIC POETRY ──────────────────────── */}
        <section className="mb-12 bg-gradient-to-br from-[#0d1b3e] to-[#1a3a7c] rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <div className="text-[#f5c842]/50 text-3xl mb-3">✦ ❖ ✦</div>
            <h2 className="text-2xl font-bold text-[#f5c842] mb-2">آيات قرآنية كريمة</h2>
            <p className="text-white/50 text-sm tracking-widest uppercase">Quranic Verses about Hajj & Umrah</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ARABIC_VERSES.map((v, i) => (
              <div key={i} className="text-center space-y-3 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-2xl text-[#f5c842] font-bold leading-relaxed" style={{ fontFamily: "Georgia, serif", direction: "rtl" }}>
                  {v.arabic}
                </div>
                <div className="text-white/50 text-sm italic">{v.transliteration}</div>
                <div className="text-white/80 text-sm leading-relaxed">{v.meaning}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-[#f5c842]/30 text-4xl tracking-widest">✦ ❖ ✦ ❖ ✦</div>
        </section>

        {/* ─── WHAT'S INCLUDED ──────────────────────────────────────── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400">Package Benefits</Badge>
            <h2 className="text-3xl font-black">What's Included in Our Packages</h2>
            <p className="text-muted-foreground mt-2">All-inclusive Umrah packages with zero hidden charges</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INCLUDED.map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ABOUT US ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <Badge className="bg-[#0d1b3e]/10 text-[#0d1b3e] border-[#0d1b3e]/20 dark:bg-white/10 dark:text-white">About Bin Yasin Travels</Badge>
              <h2 className="text-3xl font-black leading-tight">
                15+ Years of Serving <span className="text-[#0d1b3e] dark:text-[#f5c842]">Allah's Guests</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Bin Yasin Travels was established in 2009 with a single mission — to provide every Pakistani Muslim the opportunity to perform Umrah comfortably, affordably, and with full peace of mind.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Over 15 years, we have successfully served more than 5,000 pilgrims, partnering with top airlines including PIA, Air Arabia, Emirates, and Fly Dubai. Our packages are designed to suit every budget — from economy to premium luxury.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { icon: ShieldCheck, label: "IATA Certified Agency", color: "text-blue-600" },
                  { icon: Award, label: "Award-Winning Service", color: "text-amber-600" },
                  { icon: Users, label: "5000+ Satisfied Clients", color: "text-green-600" },
                  { icon: Clock, label: "2-Hour Hold Guarantee", color: "text-purple-600" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <Button className="bg-[#0d1b3e] text-white hover:bg-[#1a3a7c] mt-2">
                  Get Started Today <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Umrah Packages", desc: "21 & 28 day all-inclusive", icon: Briefcase, bg: "bg-blue-50 dark:bg-blue-900/20", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-700" },
                { title: "Group Flights", desc: "KSA & UAE one-way groups", icon: Plane, bg: "bg-amber-50 dark:bg-amber-900/20", iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-700" },
                { title: "Visa Services", desc: "Complete documentation", icon: ShieldCheck, bg: "bg-green-50 dark:bg-green-900/20", iconBg: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-700" },
                { title: "24/7 Support", desc: "Always here for you", icon: Users, bg: "bg-purple-50 dark:bg-purple-900/20", iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-700" },
              ].map(({ title, desc, icon: Icon, bg, iconBg, iconColor }) => (
                <div key={title} className={`p-5 rounded-xl ${bg} border space-y-3`}>
                  <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">Client Reviews</Badge>
            <h2 className="text-3xl font-black">What Our Pilgrims Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#f5c842] fill-[#f5c842]" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">"{t.text}"</p>
                  <div className="border-t pt-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#0d1b3e] flex items-center justify-center text-white text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{t.city}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── CONTACT & LOCATION ───────────────────────────────────── */}
        <section className="mb-12 grid md:grid-cols-2 gap-8" id="contact">
          {/* Contact Details */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6 space-y-5">
              <div>
                <Badge className="mb-2 bg-[#0d1b3e]/10 text-[#0d1b3e] border-[#0d1b3e]/20 dark:bg-white/10 dark:text-white">Contact Us</Badge>
                <h3 className="text-2xl font-black mt-2">Get In Touch</h3>
                <p className="text-muted-foreground text-sm mt-1">We're here to help you plan your perfect Umrah journey</p>
              </div>
              <div className="space-y-4">
                <a href="tel:+923001234567" className="flex items-start gap-4 p-3 rounded-xl border hover:bg-muted/30 transition-colors group">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Phone / Call</div>
                    <div className="text-muted-foreground text-sm">+92-300-123-4567</div>
                    <div className="text-muted-foreground text-xs">Mon–Sat: 9am–7pm (PKT)</div>
                  </div>
                </a>
                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">WhatsApp</div>
                    <div className="text-muted-foreground text-sm">+92-300-123-4567</div>
                    <div className="text-muted-foreground text-xs">Available 24/7 for inquiries</div>
                  </div>
                </a>
                <a href="mailto:info@binyasintravels.com" className="flex items-start gap-4 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Email</div>
                    <div className="text-muted-foreground text-sm">info@binyasintravels.com</div>
                    <div className="text-muted-foreground text-xs">Reply within 24 hours</div>
                  </div>
                </a>
                <div className="flex items-start gap-4 p-3 rounded-xl border">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-red-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Office Address</div>
                    <div className="text-muted-foreground text-sm">Shop #12, Al-Haramain Plaza</div>
                    <div className="text-muted-foreground text-sm">Main Ferozepur Road, Lahore</div>
                    <div className="text-muted-foreground text-xs">Punjab, Pakistan — 54000</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location / Map + Social */}
          <div className="space-y-5">
            <Card className="border shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a7c] p-6 text-white">
                <h3 className="font-bold text-lg mb-1">Our Location</h3>
                <p className="text-white/60 text-sm">Al-Haramain Plaza, Ferozepur Road, Lahore</p>
              </div>
              <CardContent className="p-0">
                <div className="bg-muted/30 h-48 flex flex-col items-center justify-center gap-3 border-b">
                  <MapPin className="h-10 w-10 text-[#0d1b3e]" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">Bin Yasin Travels</div>
                    <div className="text-xs text-muted-foreground">Shop #12, Al-Haramain Plaza</div>
                    <div className="text-xs text-muted-foreground">Main Ferozepur Road, Lahore</div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=31.5204,74.3587"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="mt-1">
                      Open in Google Maps <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-bold mb-4">Follow Us on Social Media</h3>
                <div className="grid grid-cols-5 gap-2">
                  {SOCIAL.map(({ icon: Icon, label, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:bg-muted/30 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── CTA BANNER ───────────────────────────────────────────── */}
        <section className="mb-8 bg-gradient-to-r from-[#0d1b3e] to-[#1a3a7c] rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="text-3xl font-bold text-[#f5c842] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
          </div>
          <h2 className="text-2xl md:text-3xl font-black mt-4 mb-3">Ready to Begin Your Sacred Journey?</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-6 leading-relaxed">
            Join thousands of satisfied pilgrims who trusted Bin Yasin Travels with their Umrah journey. Book now and secure your seat with our 2-hour hold guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/umrah-packages">
              <Button size="lg" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-bold px-8">
                View Packages <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────────── */}
        <footer className="border-t pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 bg-[#0d1b3e] rounded-lg flex items-center justify-center">
                  <Plane className="h-4 w-4 text-[#f5c842]" />
                </div>
                <div>
                  <div className="font-black text-sm">Bin Yasin Travels</div>
                  <div className="text-xs text-muted-foreground">بن یاسین ٹریولز</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pakistan's trusted Umrah travel agency since 2009. IATA certified, serving 5000+ pilgrims.
              </p>
            </div>
            <div>
              <div className="font-bold text-sm mb-3">Services</div>
              <div className="space-y-2">
                {[["Umrah Packages", "/umrah-packages"], ["KSA One Way", "/ksa-groups"], ["UAE One Way", "/uae-groups"], ["Umrah Tickets", "/umrah-tickets"]].map(([label, href]) => (
                  <Link key={label} href={href} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-sm mb-3">Account</div>
              <div className="space-y-2">
                {[["Login", "/login"], ["Sign Up", "/signup"], ["My Bookings", "/bookings"], ["My Ledger", "/ledger"]].map(([label, href]) => (
                  <Link key={label} href={href} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-sm mb-3">Contact</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>+92-300-123-4567</div>
                <div>info@binyasintravels.com</div>
                <div>Shop #12, Al-Haramain Plaza</div>
                <div>Ferozepur Road, Lahore</div>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <div>© 2025 Bin Yasin Travels. All rights reserved. IATA Member.</div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Licensed Travel Agency — Punjab Tourism, Pakistan
            </div>
          </div>
        </footer>

      </div>
    </Layout>
  );
}
