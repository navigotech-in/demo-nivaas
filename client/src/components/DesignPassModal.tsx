import { useState } from 'react'
import { Icons } from './Icons'
import { createRazorpayOrder, verifyRazorpayPayment } from '../lib/api'
import { notifyDataChanged } from '../lib/syncEvents'

interface DesignPassModalProps {
  open: boolean
  onClose: () => void
  token?: string | null
  user?: any
  activePassInfo?: {
    active: boolean
    remainingCredits: number
    expiresAt?: string | null
  } | null
  onSuccess: (creditsGranted: number, totalCredits: number) => void
  onRequireAuth?: () => void
}

let razorpayScriptLoadedPromise: Promise<boolean> | null = null

const loadRazorpayScriptOnce = (): Promise<boolean> => {
  if (typeof (window as any).Razorpay !== 'undefined') {
    return Promise.resolve(true)
  }
  if (razorpayScriptLoadedPromise) {
    return razorpayScriptLoadedPromise
  }
  razorpayScriptLoadedPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
  return razorpayScriptLoadedPromise
}

export default function DesignPassModal({
  open,
  onClose,
  token,
  user,
  activePassInfo,
  onSuccess,
  onRequireAuth,
}: DesignPassModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('Creating secure payment order...')
  const [paymentState, setPaymentState] = useState<'IDLE' | 'RAZORPAY_TEST_MODAL' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeOrderId, setActiveOrderId] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [receiptData, setReceiptData] = useState<{
    orderId: string
    paymentId: string
    amount: number
    creditsGranted: number
    expiresAt: string
  } | null>(null)
  const [existingPassWarning, setExistingPassWarning] = useState<{
    remainingCredits: number
    expiresAt?: string | null
  } | null>(() => {
    if (activePassInfo?.active && activePassInfo.remainingCredits > 0) {
      return {
        remainingCredits: activePassInfo.remainingCredits,
        expiresAt: activePassInfo.expiresAt,
      }
    }
    return null
  })

  if (!open) return null

  const handleInitiateCheckout = async (forceRenewal = false) => {
    if (!token) {
      onClose()
      onRequireAuth?.()
      return
    }

    // If user has an active pass with credits and hasn't explicitly confirmed forceRenewal, show warning first
    if (!forceRenewal && activePassInfo?.active && activePassInfo.remainingCredits > 0) {
      setExistingPassWarning({
        remainingCredits: activePassInfo.remainingCredits,
        expiresAt: activePassInfo.expiresAt,
      })
      return
    }

    setLoading(true)
    setLoadingStage('Creating secure payment order...')
    setErrorMsg('')
    setExistingPassWarning(null)

    try {
      // 1. Create order in PostgreSQL backend
      const order = await createRazorpayOrder({ Authorization: `Bearer ${token}` }, { forceRenewal })
      setActiveOrderId(order.orderId)

      const razorpayKey = order.keyId || 'rzp_test_indore_house_makers'
      
      // Attempt load of Razorpay script
      let hasRazorpayScript = typeof (window as any).Razorpay !== 'undefined'
      if (!hasRazorpayScript && !razorpayKey.includes('mock') && !razorpayKey.includes('test_indore')) {
        setLoadingStage('Connecting to Razorpay gateway...')
        hasRazorpayScript = await loadRazorpayScriptOnce()
      }

      // Check if real live Razorpay SDK can open
      if (hasRazorpayScript && !razorpayKey.includes('mock') && !razorpayKey.includes('test_indore')) {
        try {
          const rzp = new (window as any).Razorpay({
            key: razorpayKey,
            amount: order.amountInPaise,
            currency: order.currency,
            name: 'NIVAAS - Indore House Makers',
            description: '30-Day Design Pass (5 Credits)',
            order_id: order.orderId,
            handler: async (response: any) => {
              await processVerification(
                response.razorpay_order_id || order.orderId,
                response.razorpay_payment_id || 'pay_live_' + Date.now(),
                response.razorpay_signature || 'test_mock_signature_valid'
              )
            },
            modal: {
              ondismiss: () => {
                setLoading(false)
              },
            },
            prefill: {
              name: order.user?.name || user?.name || 'Indore Home Owner',
              email: order.user?.email || user?.email || 'client@indorehousemakers.in',
              contact: order.user?.phone || user?.phone || '',
            },
            theme: { color: '#E76F2E' },
          })
          rzp.on('payment.failed', (response: any) => {
            setLoading(false)
            setPaymentState('FAILED')
            setErrorMsg(response?.error?.description || 'Payment was declined or failed.')
          })
          rzp.open()
          setLoading(false)
          return
        } catch {
          // Fallback to interactive test modal
        }
      }

      // Show Interactive Test Razorpay Gateway Dialog
      setLoading(false)
      setPaymentState('RAZORPAY_TEST_MODAL')
    } catch (err: any) {
      setLoading(false)
      if (err.code === 'ACTIVE_PASS_EXISTS' && !forceRenewal) {
        setExistingPassWarning({
          remainingCredits: err.activePass?.remainingCredits || 0,
          expiresAt: err.activePass?.expiresAt,
        })
        return
      }
      setPaymentState('FAILED')
      setErrorMsg(err.message || 'Could not initiate payment order.')
    }
  }

  const processVerification = async (orderId: string, paymentId: string, signature: string) => {
    setLoading(true)
    setLoadingStage('Verifying payment signature with Razorpay...')
    setPaymentState('PROCESSING')
    try {
      // Simulation delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStage('Activating 30-Day Design Pass & 5 Credits...')

      const effectiveOrderId = orderId || activeOrderId
      if (!effectiveOrderId) {
        throw new Error('Payment order reference is missing. Please restart the checkout.')
      }

      // Verify against backend. Errors are surfaced (never silently swallowed) so we
      // never show a fake success or grant credits that were not persisted.
      const verifyRes = await verifyRazorpayPayment(
        { orderId: effectiveOrderId, paymentId, signature },
        { Authorization: `Bearer ${token}` }
      )

      if (!verifyRes?.success || !verifyRes?.pass) {
        throw new Error('Payment could not be verified. No pass or credits were added.')
      }

      const creditsGranted = verifyRes.creditsGranted ?? 5
      const totalCredits = verifyRes.totalCredits ?? creditsGranted

      setReceiptData({
        orderId: effectiveOrderId,
        paymentId,
        amount: 299,
        creditsGranted,
        expiresAt: verifyRes.pass.expiresAt,
      })

      // Notify parent to refresh balances and studio state immediately
      notifyDataChanged('passes')
      notifyDataChanged('credits')
      onSuccess(creditsGranted, totalCredits)
      setPaymentState('SUCCESS')
    } catch (err: any) {
      setReceiptData(null)
      setPaymentState('FAILED')
      setErrorMsg(err?.message || 'Payment verification failed. No credits were added.')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateFailure = () => {
    setLoading(true)
    setPaymentState('PROCESSING')
    setTimeout(() => {
      setLoading(false)
      setPaymentState('FAILED')
      setErrorMsg('Payment Failed: Bank server timed out or payment was declined in test mode.')
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-[#E7E0D7] text-[#292826] overflow-hidden">
        {/* Sticky Header with Always Visible Close Button */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#FFF6E8] via-[#FDFCF9] to-[#FFF0E2] p-5 sm:p-6 border-b border-[#EEE9E3] shrink-0 flex items-start justify-between">
          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E76F2E]/10 border border-[#E76F2E]/30 text-[#C65320] text-xs font-bold mb-2">
              <Icons.Sparkles size={13} />
              <span>30-Day Design Pass · No Auto-Renewal</span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#111827]">
              Unlock Full 3D Design Experience
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">
              Get 5 comprehensive architectural design concept packages for your plot.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#54504A] hover:text-black border border-[#E7E0D7] transition cursor-pointer shadow-2xs shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Inner Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-[#292826]">
          {/* Account Identity Card for Authenticated User */}
          {user && token && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E7E0D7] flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">Purchasing as</span>
                  <div className="font-extrabold text-[#1F2937] text-xs sm:text-sm leading-tight">{user.name || 'Indore Home Owner'}</div>
                  <div className="text-[11px] text-[#4B5563] mt-0.5">{user.email || user.phone || 'Verified Account'}</div>
                </div>
              </div>
              {user.phone ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  +91 {user.phone.replace('+91', '').trim()}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                  Verified
                </span>
              )}
            </div>
          )}

          {/* Already-Subscribed Active Pass Warning Dialogue */}
          {existingPassWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-display font-black text-sm text-amber-950">
                    You have subscribed previously
                  </h4>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    You currently have <strong>{existingPassWarning.remainingCredits} credits remaining</strong>
                    {existingPassWarning.expiresAt && (
                      <> valid until <strong>{new Date(existingPassWarning.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></>
                    )}.
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                Do you want to purchase another Design Pass (+5 Credits)?
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExistingPassWarning(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInitiateCheckout(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Purchase Again (₹299)'}
                </button>
              </div>
            </div>
          )}

          {/* Pricing & Entitlement Cards */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7E0D7] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">One-Time Fee</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display font-black text-3xl text-black">₹299</span>
                <span className="text-xs text-[#4B5563] font-semibold">/ 30 Days</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">✓ 5 AI 3D Design Generation Credits</span>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                ₹59.80 / concept
              </span>
              <span className="text-[10px] text-[#6B7280] block mt-1">Single upfront payment</span>
            </div>
          </div>

          {/* Included Deliverables List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#374151]">What you receive with Design Pass:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1F2937] font-medium">
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>5 Full 3D Design Generations</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>Floor-wise 3D Renders &amp; Views</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>Photorealistic Day &amp; Twilight Facades</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>Dollhouse &amp; Floor Selector</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>Conceptual 2D Floor-Plan Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check size={14} className="text-emerald-600 shrink-0 font-bold" />
                <span>High Quota AI Chat (25/day)</span>
              </div>
            </div>
          </div>

          {/* Unauthenticated Notification Banner */}
          {!token && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold flex items-center justify-between gap-2">
              <span>👤 Please login or create an account to save your ₹299 Design Pass and 5 credits.</span>
            </div>
          )}

          {/* Clear Non-claim disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
            <strong>Disclaimer:</strong> Conceptual recommendations for family planning and contractor budgeting. Structural certification and municipal approvals require verified on-site engineering drawings.
          </div>

          {/* Razorpay Interactive Test Mode Gateway Screen */}
          {paymentState === 'RAZORPAY_TEST_MODAL' && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0C2340] to-[#0A192F] text-white space-y-4 shadow-xl border border-sky-500/30 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#0082E6] flex items-center justify-center font-black text-sm">
                    R
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wide text-white block">Razorpay Test Gateway</span>
                    <span className="text-[10px] text-sky-300 font-medium">Order: {activeOrderId || 'order_pass_test'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">₹299.00</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">TEST MODE</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Select Test Method</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedMethod === 'upi' ? 'border-[#0082E6] bg-[#0082E6]/20 text-white font-bold' : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="text-base mb-1">📱</div>
                    <div className="text-[11px]">UPI / Apps</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedMethod === 'card' ? 'border-[#0082E6] bg-[#0082E6]/20 text-white font-bold' : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="text-base mb-1">💳</div>
                    <div className="text-[11px]">Cards</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedMethod === 'netbanking' ? 'border-[#0082E6] bg-[#0082E6]/20 text-white font-bold' : 'border-white/10 bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="text-base mb-1">🏦</div>
                    <div className="text-[11px]">NetBanking</div>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {selectedMethod === 'upi' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-300">UPI App:</span>
                  <span className="font-bold text-sky-400">Google Pay / PhonePe / Paytm</span>
                </div>
              )}
              {selectedMethod === 'card' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-300">Test Card:</span>
                  <span className="font-mono text-sky-400">•••• •••• •••• 4242 (Visa)</span>
                </div>
              )}
              {selectedMethod === 'netbanking' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-300">Bank:</span>
                  <span className="font-bold text-sky-400">HDFC / SBI / ICICI</span>
                </div>
              )}

              {/* Test Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    processVerification(
                      activeOrderId,
                      'pay_test_' + Date.now(),
                      'test_mock_signature_valid'
                    )
                  }
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>⚡ Complete Payment (₹299)</span>
                  <Icons.Check size={14} className="stroke-[3]" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateFailure}
                    className="w-1/2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-bold transition cursor-pointer"
                  >
                    ⚠️ Simulate Failure
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentState('IDLE')
                      setErrorMsg('')
                    }}
                    className="w-1/2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-[11px] font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE: PROCESSING */}
          {paymentState === 'PROCESSING' && (
            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-3 animate-fadeIn">
              <div className="h-10 w-10 mx-auto rounded-full border-3 border-sky-600 border-t-transparent animate-spin" />
              <div>
                <h5 className="font-display font-black text-sm text-sky-950">Processing Payment…</h5>
                <p className="text-xs text-sky-700 mt-1 font-medium">
                  {loadingStage || 'Connecting with Razorpay gateway and verifying transaction...'}
                </p>
              </div>
            </div>
          )}

          {/* STATE: SUCCESS - Dedicated Payment Receipt Screen */}
          {paymentState === 'SUCCESS' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-50/80 to-teal-50/40 border-2 border-emerald-400 space-y-4 animate-fadeIn shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  ✓
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
                    Payment Confirmed
                  </div>
                  <h4 className="font-display font-black text-lg text-emerald-950">
                    30-Day Design Pass Activated!
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    {receiptData?.creditsGranted ?? 5} 3D Architectural Generation credits added to your account.
                  </p>
                </div>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 font-bold text-gray-900">
                  <span>Plan Purchased</span>
                  <span className="text-[#E76F2E]">Nivaas 30-Day Design Pass</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-extrabold text-gray-950 text-sm">₹{receiptData?.amount || 299}.00 (Incl. Taxes)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">3D Generation Credits</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +{receiptData?.creditsGranted || 5} AI Credits
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="font-bold text-gray-900">
                    {receiptData?.expiresAt
                      ? new Date(receiptData.expiresAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '30 Days from today'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                  <span className="text-gray-400 font-mono">Payment ID:</span>
                  <span className="font-mono text-gray-600 truncate max-w-[200px]">
                    {receiptData?.paymentId || 'pay_confirmed'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                ✨ Your 3D Studio paywall is now permanently unlocked for your 5 generations. You can generate floor-wise 3D models and twilight elevations anytime within 30 days.
              </div>
            </div>
          )}

          {/* STATE: FAILED */}
          {paymentState === 'FAILED' && (
            <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center space-y-3 animate-fadeIn">
              <div className="h-12 w-12 mx-auto rounded-full bg-rose-100 border border-rose-400 text-rose-700 flex items-center justify-center font-black text-2xl shadow-sm">
                ✕
              </div>
              <div>
                <h5 className="font-display font-black text-base text-rose-950">Payment Failed</h5>
                <p className="text-xs text-rose-700 font-medium mt-1">
                  {errorMsg || 'Transaction could not be completed. Please try again or use another payment method.'}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInitiateCheckout(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                >
                  💳 Change Payment Method
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleInitiateCheckout(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {paymentState === 'PROCESSING' && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm p-4 border-t border-[#EEE9E3] shrink-0 text-center">
            <p className="text-xs text-[#6B7280] font-semibold flex items-center justify-center gap-1.5 animate-pulse">
              <span>🔒</span> Processing payment... Please do not close or refresh this window.
            </p>
          </div>
        )}

        {paymentState === 'SUCCESS' && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm p-4 sm:p-5 border-t border-[#EEE9E3] shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose()
                window.location.href = '/dashboard'
              }}
              className="py-3 px-4 rounded-xl border border-[#D1C9BE] text-xs font-bold text-[#4B5563] hover:bg-gray-50 transition cursor-pointer"
            >
              View Dashboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to 3D Design Studio →</span>
            </button>
          </div>
        )}

        {paymentState === 'IDLE' && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm p-4 sm:p-5 border-t border-[#EEE9E3] shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#D1C9BE] text-xs font-bold text-[#4B5563] hover:bg-gray-50 transition cursor-pointer"
            >
              {activePassInfo?.active && activePassInfo.remainingCredits > 0 ? 'Close' : 'Continue With 2D Only'}
            </button>
            {activePassInfo?.active && activePassInfo.remainingCredits > 0 && !existingPassWarning ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to 3D Studio ({activePassInfo.remainingCredits} Credits)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInitiateCheckout(false)}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : !token ? (
                  <>
                    <span>Login &amp; Pay ₹299</span>
                    <Icons.ChevronRight size={14} />
                  </>
                ) : (
                  <>
                    <span>Pay ₹299</span>
                    <Icons.ChevronRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

