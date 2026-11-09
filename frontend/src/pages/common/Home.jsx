import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Shield, Users, BookOpen, ArrowRight, Star, MapPin, Menu, X, UserPlus, FileText, Package, BadgeCheck, CheckCircle2, MessageSquare, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const features = [
  { icon: <Shield size={32} className="text-primary" />, title: 'Verified Lawyers', desc: 'Every lawyer on LawLink is Bar Council verified and background-checked for your safety.' },
  { icon: <Scale size={32} className="text-primary" />, title: 'Expert Legal Advice', desc: 'Get advice from specialists across Civil, Criminal, Family, Labour, and Corporate law.' },
  { icon: <BookOpen size={32} className="text-primary" />, title: 'Legal Knowledge Hub', desc: 'Access free articles and guides written by top legal professionals across Sri Lanka.' },
  { icon: <Users size={32} className="text-primary" />, title: 'Trusted by Thousands', desc: 'Join over 50,000 users who have successfully resolved their legal matters with LawLink.' },
];

const lawyers = [
  { name: 'Adv.Pravitharan', spec: 'Civil Law', rating: 4.8, cases: 48, city: 'Colombo', avatar: 'PP' },
  { name: 'Adv. Nishal', spec: 'Family Law', rating: 4.9, cases: 67, city: 'Kandy', avatar: 'AN' },
  { name: 'Adv. Thirushi', spec: 'Criminal Law', rating: 4.5, cases: 31, city: 'Galle', avatar: 'AT' },
];

const testimonials = [
  { name: 'Kavindu Perera', location: 'Colombo', text: 'LawLink helped me resolve a property dispute that had been going on for 5 years. I found the right lawyer within days!', rating: 5 },
  { name: 'Ishani Silva', location: 'Kandy', text: 'The consultation process was seamless and affordable. Highly recommend to anyone facing a family law issue.', rating: 5 },
  { name: 'Sahantha Fernando', location: 'Galle', text: 'Professional, quick, and effective. My labour case was handled with great expertise.', rating: 4 },
];

const Home = () => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { role } = useContext(AuthContext);
  const dashboard = role ? `/${role}` : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-surface-container-high shadow-sm">
        <div className="max-w-7xl mx-auto px-lg flex items-center justify-between h-16">
          <Link to="/" className="text-headline-sm font-bold text-primary no-underline flex items-center gap-sm">
            <Scale size={28} className="text-primary" /> LawLink
          </Link>
          <div className="hidden md:flex items-center gap-xl">
            <a href="#features" className="text-body-md text-on-surface-variant hover:text-primary transition-colors no-underline">Features</a>
            <a href="#lawyers" className="text-body-md text-on-surface-variant hover:text-primary transition-colors no-underline">Lawyers</a>
            <a href="#testimonials" className="text-body-md text-on-surface-variant hover:text-primary transition-colors no-underline">Reviews</a>
          </div>
          <div className="hidden md:flex items-center gap-sm">
            {dashboard ? (
              <Link to={dashboard} className="flex items-center gap-sm px-lg py-sm rounded-lg bg-primary text-on-primary text-body-md no-underline hover:bg-primary-container transition-colors">
                <LayoutDashboard size={16} /> Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-lg py-sm rounded-lg border border-primary text-primary text-body-md no-underline hover:bg-primary/5 transition-colors">Login</Link>
                <Link to="/register" className="px-lg py-sm rounded-lg bg-primary text-on-primary text-body-md no-underline hover:bg-primary-container transition-colors">Get Started</Link>
              </>
            )}
          </div>
          <button
            className="md:hidden p-sm rounded-lg hover:bg-surface-container"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-surface-container-high px-lg py-md space-y-xs animate-fade-in">
            {[['#features', 'Features'], ['#lawyers', 'Lawyers'], ['#testimonials', 'Reviews']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)} className="block px-md py-sm rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container no-underline">{label}</a>
            ))}
            <div className="pt-sm mt-sm border-t border-surface-container-high space-y-sm">
              {dashboard ? (
                <Link to={dashboard} className="block px-md py-sm rounded-lg bg-primary text-on-primary text-body-md no-underline text-center">Go to dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="block px-md py-sm rounded-lg text-body-md text-on-surface hover:bg-surface-container no-underline">Login</Link>
                  <Link to="/register" className="block px-md py-sm rounded-lg bg-primary text-on-primary text-body-md no-underline text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-[#1a2f7a] text-on-primary py-3xl px-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#90a8ff_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-[1.15fr_1fr] gap-3xl items-center">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-sm bg-white/10 border border-white/20 rounded-full px-md py-xs mb-xl text-body-sm">
              <BadgeCheck size={14} /> Trusted legal platform across Sri Lanka
            </div>
            <h1 className="text-display text-on-primary leading-tight mb-lg">
              Get Expert Legal Help,<br />
              <span className="text-on-primary-container">Right When You Need It</span>
            </h1>
            <p className="text-body-lg text-on-primary/80 mb-2xl max-w-xl leading-relaxed">
              Connect with verified lawyers, file complaints, and resolve your legal matters — all in one secure, easy-to-use platform built for every Sri Lankan.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <Link
                to={dashboard || '/register'}
                className="group flex items-center justify-center gap-sm px-2xl py-md rounded-xl bg-white text-primary text-body-lg font-semibold no-underline shadow-lg shadow-black/10 hover:bg-primary-fixed transition-colors"
              >
                {dashboard ? 'Open your dashboard' : 'Get Started Free'} <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              {!dashboard && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-sm px-2xl py-md rounded-xl border-2 border-white/40 text-on-primary text-body-lg no-underline hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Product preview */}
          <div className="hidden lg:block relative animate-slide-up" style={{ animationDelay: '120ms' }} aria-hidden="true">
            <div className="absolute -inset-6 bg-white/5 rounded-[2rem] blur-2xl" />
            <div className="relative bg-white text-on-surface rounded-2xl shadow-2xl shadow-black/30 p-xl rotate-[1.5deg]">
              <div className="flex items-center justify-between mb-lg">
                <span className="text-label-sm font-mono font-semibold text-primary bg-primary/5 px-sm py-0.5 rounded">#4F2A91C3</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> In Review
                </span>
              </div>
              <p className="text-headline-sm mb-xs">Land boundary dispute</p>
              <p className="text-body-sm text-on-surface-variant mb-lg">Property Law · Filed 12 Oct</p>
              <ol className="space-y-md mb-lg">
                {[
                  ['Complaint submitted', true],
                  ['Lawyer assigned — Adv. Nishal', true],
                  ['Documents reviewed', true],
                  ['Hearing scheduled', false],
                ].map(([label, done]) => (
                  <li key={label} className="flex items-center gap-md text-body-sm">
                    {done
                      ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      : <span className="w-[18px] h-[18px] rounded-full border-2 border-dashed border-outline-variant shrink-0" />}
                    <span className={done ? 'text-on-surface' : 'text-on-surface-variant'}>{label}</span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-md p-md rounded-xl bg-surface-container-low">
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold">AN</div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-sm font-semibold">Adv. Nishal</p>
                  <p className="text-body-sm text-on-surface-variant truncate">I've reviewed the deed — we have a strong case.</p>
                </div>
                <MessageSquare size={16} className="text-primary shrink-0" />
              </div>
            </div>
          </div>
        </div>
        {/* Decorative stats */}
        <div className="max-w-7xl mx-auto mt-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {[
              { value: '50,000+', label: 'Happy Users' },
              { value: '1,500+', label: 'Verified Lawyers' },
              { value: '98%', label: 'Success Rate' },
              { value: '30+', label: 'Legal Categories' },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/10 border border-white/20 rounded-2xl p-lg backdrop-blur-sm">
                <p className="text-headline-lg font-bold text-on-primary">{s.value}</p>
                <p className="text-body-sm text-on-primary/70 mt-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-3xl px-lg bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2xl">
            <h2 className="text-headline-lg text-on-surface">Why Choose LawLink?</h2>
            <p className="text-body-lg text-on-surface-variant mt-md max-w-2xl mx-auto">We combine technology and legal expertise to make justice accessible for everyone in Sri Lanka.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-xl shadow-card hover:shadow-lg transition-shadow border border-surface-container-high group">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-lg group-hover:bg-primary/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-headline-sm text-on-surface mb-sm">{f.title}</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-3xl px-lg bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2xl">
            <h2 className="text-headline-lg text-on-surface">How LawLink Works</h2>
            <p className="text-body-lg text-on-surface-variant mt-md">Get legal help in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
            {[
              { step: '01', title: 'Register', desc: 'Create your free account in minutes.', icon: <UserPlus size={26} /> },
              { step: '02', title: 'File a Complaint', desc: 'Describe your legal issue clearly.', icon: <FileText size={26} /> },
              { step: '03', title: 'Choose a Package', desc: 'Select the plan that suits your needs.', icon: <Package size={26} /> },
              { step: '04', title: 'Get Legal Help', desc: 'A verified lawyer is assigned to your case.', icon: <BadgeCheck size={26} /> },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-surface-container-high" />}
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary ring-8 ring-white flex items-center justify-center mx-auto mb-lg relative z-10">
                  {s.icon}
                </div>
                <div className="text-label-sm text-primary mb-xs">STEP {s.step}</div>
                <h3 className="text-headline-sm text-on-surface mb-sm">{s.title}</h3>
                <p className="text-body-md text-on-surface-variant">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lawyers */}
      <section id="lawyers" className="py-3xl px-lg bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2xl">
            <h2 className="text-headline-lg text-on-surface">Featured Lawyers</h2>
            <p className="text-body-lg text-on-surface-variant mt-md">Top-rated legal professionals ready to help you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {lawyers.map((l, i) => (
              <div key={i} className="bg-white rounded-2xl p-xl shadow-card hover:shadow-lg transition-shadow border border-surface-container-high">
                <div className="flex items-center gap-lg mb-lg">
                  <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-headline-sm font-bold text-on-primary-container">
                    {l.avatar}
                  </div>
                  <div>
                    <h3 className="text-headline-sm text-on-surface">{l.name}</h3>
                    <p className="text-body-sm text-on-surface-variant">{l.spec}</p>
                    <div className="flex items-center gap-xs mt-xs">
                      <MapPin size={12} className="text-on-surface-variant" />
                      <span className="text-body-sm text-on-surface-variant">{l.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-lg border-t border-surface-container-high">
                  <div className="flex items-center gap-xs text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-body-md font-bold text-on-surface">{l.rating}</span>
                    <span className="text-body-sm text-on-surface-variant">/ 5.0</span>
                  </div>
                  <span className="text-body-sm text-on-surface-variant">{l.cases} cases</span>
                  <button className="text-body-sm text-primary hover:underline font-medium">View Profile</button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-xl">
            <button onClick={() => navigate('/register')} className="px-2xl py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity">
              Find Your Lawyer
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-3xl px-lg bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2xl">
            <h2 className="text-headline-lg text-on-surface">What Our Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl p-xl border border-surface-container-high">
                <div className="flex gap-xs mb-md">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-500" fill="currentColor" />
                  ))}
                </div>
                <p className="text-body-md text-on-surface leading-relaxed mb-lg italic">"{t.text}"</p>
                <div>
                  <p className="text-label-md text-on-surface font-semibold">{t.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-3xl px-lg bg-gradient-to-r from-primary to-primary-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline-lg text-on-primary mb-md">Ready to Get Legal Help?</h2>
          <p className="text-body-lg text-on-primary/80 mb-2xl">Join thousands of Srilankans who've found justice through LawLink. Start for free today.</p>
          <button onClick={() => navigate('/register')}
            className="px-2xl py-md rounded-xl bg-white text-primary text-body-lg font-bold hover:bg-on-primary-container transition-colors">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-on-surface text-inverse-on-surface py-2xl px-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-2xl">
            <div>
              <div className="flex items-center gap-sm mb-md">
                <Scale size={24} className="text-inverse-primary" />
                <span className="text-headline-sm font-bold text-inverse-on-surface">LawLink</span>
              </div>
              <p className="text-body-sm text-inverse-on-surface/60 leading-relaxed">Sri Lanka's most trusted platform for accessible legal services.</p>
            </div>
            {[
              { title: 'Platform', links: ['For Users', 'For Lawyers', 'Admin Panel', 'Pricing'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Cookie Policy'] },
              { title: 'Contact', links: ['help@lawlink.in', '+91-80-4567-8901', 'colombo, Sri Lanka'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-label-md text-inverse-on-surface mb-md">{col.title}</h4>
                <ul className="space-y-sm">
                  {col.links.map((l, j) => (
                    <li key={j} className="text-body-sm text-inverse-on-surface/60 hover:text-inverse-on-surface cursor-pointer transition-colors">{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-lg text-center text-body-sm text-inverse-on-surface/40">
            © 2026 LawLink. All rights reserved. Making justice accessible for every Sri Lankan.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
