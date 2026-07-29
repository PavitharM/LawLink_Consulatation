import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPackages } from '../../services/package.service';
import { createNotification } from '../../services/notification.service';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  const complaintId = searchParams.get('complaintId');
  
  const [method, setMethod] = useState('card');
  const [paid, setPaid] = useState(false);
  const [form, setForm] = useState({ name: '', card: '', expiry: '', cvv: '', upi: '' });
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPkg = async () => {
      try {
        const response = await getPackages();
        if (response.success) {
          const selectedPkg = response.data.find(p => p.id === packageId) || response.data[0];
          setPkg(selectedPkg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPkg();
  }, [packageId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaid(true);

    try {
      await createNotification({
        title: 'Payment Confirmed',
        message: `Your payment of ${formatCurrency(pkg?.price)} for the ${pkg?.name} Package was successfully processed.`,
        type: 'payment'
      });
    } catch (err) {
      console.error('Failed to create payment notification', err);
    }

    setTimeout(() => {
      if (complaintId) {
        navigate(`/user/complaints/${complaintId}`);
      } else {
        navigate('/user');
      }
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('en-LK', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date());
  };

  if (loading) return <div className="flex justify-center py-3xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;


  if (paid) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center py-3xl text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-xl animate-pulse">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-headline-lg text-on-surface mb-md">Payment Successful!</h2>
        {complaintId && (
          <div className="bg-primary/10 border border-primary/20 text-primary font-bold rounded-xl px-lg py-md mb-lg">
            🎉 Your complaint was submitted successfully!
          </div>
        )}
        <p className="text-body-lg text-on-surface-variant mb-xl">Your payment of <strong>{formatCurrency(pkg?.price)}</strong> was received. You'll be redirected shortly...</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-lg w-full text-left">
          <p className="text-label-md text-green-700">Transaction ID: TXN-{Date.now()}-LLK</p>
          <p className="text-body-sm text-green-600 mt-xs">{pkg?.name} Package — {formatDate()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Secure Payment</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Complete your payment to activate your legal package.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl">
        {/* Payment Form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            {/* Method Toggle */}
            <div className="flex gap-sm mb-xl">
              {[
                { id: 'card', label: '💳 Card' },
                { id: 'upi', label: '📱 UPI' },
                { id: 'netbanking', label: '🏦 Net Banking' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 py-sm rounded-lg text-label-sm font-semibold transition-colors
                    ${method === m.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePay} className="space-y-md">
              {method === 'card' && (
                <>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Cardholder Name</label>
                    <input type="text" placeholder="Name as on card" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required />
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Card Number</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={form.card} onChange={e => setForm({ ...form, card: e.target.value })}
                        className="w-full pl-10 pr-md border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="text-label-sm text-on-surface-variant mb-xs block">Expiry Date</label>
                      <input type="text" placeholder="MM / YY" maxLength={7} value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant mb-xs block">CVV</label>
                      <input type="password" placeholder="•••" maxLength={4} value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })}
                        className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required />
                    </div>
                  </div>
                </>
              )}
              {method === 'upi' && (
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">UPI ID</label>
                  <input type="text" placeholder="yourname@upi" value={form.upi} onChange={e => setForm({ ...form, upi: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required />
                  <p className="text-body-sm text-on-surface-variant mt-xs">e.g., yourname@okaxis, yourname@paytm</p>
                </div>
              )}
              {method === 'netbanking' && (
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Select Your Bank</label>
                  <select className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:outline-none focus:border-primary" required>
                    <option value="">Choose a bank...</option>
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Bank of Baroda', 'Punjab National Bank'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}

              <button type="submit"
                className="w-full flex items-center justify-center gap-sm py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity mt-lg">
                <Lock size={18} /> Pay {formatCurrency(pkg?.price)} Securely <ArrowRight size={18} />
              </button>

              <p className="text-body-sm text-on-surface-variant text-center flex items-center justify-center gap-xs">
                <Lock size={12} /> 256-bit SSL encrypted. Your details are secure.
              </p>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card mb-lg">
            <h3 className="text-headline-sm text-on-surface mb-lg">Order Summary</h3>
            <div className="space-y-sm">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Package</span>
                <span className="font-semibold text-on-surface">{pkg?.name}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Base Price</span>
                <span>{formatCurrency(pkg?.price)}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">GST (18%)</span>
                <span>{formatCurrency(pkg?.price * 0.18)}</span>
              </div>
              <div className="flex justify-between text-body-md text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(pkg?.price * 0.18)}</span>
              </div>
              <div className="border-t border-surface-container-high pt-sm flex justify-between text-headline-sm font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(pkg?.price)}</span>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg">
            <p className="text-label-md text-primary mb-sm">✅ What's Included</p>
            <ul className="text-body-sm text-on-surface-variant space-y-xs">
              {pkg?.features?.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
