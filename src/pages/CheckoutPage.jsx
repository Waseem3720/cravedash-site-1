import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CheckoutSteps from '../components/checkout/CheckoutSteps'
import YourInformation from '../components/checkout/YourInformation'
import OrderTypeCard from '../components/checkout/OrderTypeCard'
import WhenCard from '../components/checkout/WhenCard'
import OrderSummaryPanel from '../components/checkout/OrderSummaryPanel'
import PaymentStep from '../components/checkout/PaymentStep'
import ConfirmOrderCard from '../components/checkout/ConfirmOrderCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { useToast } from '../context/ToastContext'
import { useStorefront } from '../context/StorefrontContext'
import { getBranchProductIds } from '../api/catalog'
import BranchMismatchModal from '../components/checkout/BranchMismatchModal'
import { formatPrice, isValidUkPostcode, normalisePostcode } from '../utils/format'
import { closingNotice, isRestaurantOpen } from '../utils/serviceHours'

const EMPTY_CARD = { number: '', name: '', expiry: '', cvv: '', save: false }

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    items,
    mode,
    address,
    notes,
    tip,
    cutlery,
    coupon,
    discount,
    schedule,
    subtotal,
    deliveryCharge,
    serviceFee,
    bagCharge,
    total,
    clear,
    removeItem,
    setSchedule,
    minimumOrder,
    isBelowMinimum
  } = useCart()
  const { user, isSignedIn, placeOrder } = useAuth()
  const { branchId, branches, products, selectBranch, selectedBranch, isLoading } = useStorefront()
  const { openAuth } = useUI()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [payment, setPayment] = useState('cash')
  const [card, setCard] = useState(EMPTY_CARD)
  const [agreed, setAgreed] = useState(false)
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', phone: '' })
  const [error, setError] = useState('')
  const [placed, setPlaced] = useState(null)
  const [placing, setPlacing] = useState(false)
  // Basket items that the selected branch does not have: { lines, missing, candidates } when the popup is open.
  const [mismatch, setMismatch] = useState(null)

  /** Basket lines (not deals) whose product is not on the selected branch's menu. */
  const missingLines = () => {
    if (isLoading) return []
    const onMenu = new Set(products.map((product) => String(product.id)))
    return items.filter((item) => !item.isDeal && !onMenu.has(String(item.productId)))
  }

  /** Works out which other branches have every missing item, and opens the popup. */
  const openMismatch = async (lines) => {
    const others = branches.filter((branch) => branch.id !== branchId)
    const idSets = await Promise.all(others.map((branch) => getBranchProductIds(branch.id)))
    const needed = [...new Set(lines.map((line) => String(line.productId)))]
    const candidates = others.filter((_, index) => needed.every((id) => idSets[index].has(id)))
    setMismatch({ lines, missing: [...new Set(lines.map((line) => line.name))], candidates })
  }

  const switchBranch = (id) => {
    selectBranch(id)
    setMismatch(null)
    toast('Branch changed. Check your basket, then place the order.')
  }

  const removeMissing = () => {
    mismatch.lines.forEach((line) => removeItem(line.lineId || String(line.productId)))
    setMismatch(null)
  }

  useEffect(() => {
    if (!schedule.date) setSchedule({ date: new Date().toISOString().slice(0, 10) })
  }, [schedule.date, setSchedule])

  // An emptied basket drops the flow back to the details step.
  useEffect(() => {
    if (items.length === 0 && !placed) setStep(1)
  }, [items.length, placed])

  const paymentLabel = payment === 'card' ? 'Card Payment' : mode === 'delivery' ? 'Cash on Delivery' : 'Pay at Collection'

  const validateCheckout = () => {
    if (items.length === 0) return 'Your cart is empty — add something from the menu.'
    if (isBelowMinimum) return `Minimum order is ${formatPrice(minimumOrder)}.`
    if (!customer.firstName?.trim()) return 'Add your first name.'
    if (!customer.phone?.trim()) return 'Add a phone number so we can reach you.'

    if (mode === 'delivery') {
      if (!address.house.trim() || !address.road.trim() || !address.town.trim()) {
        return 'Add the house/flat, street, and town/city for delivery.'
      }
      if (!isValidUkPostcode(normalisePostcode(address.postcode))) {
        return 'Enter a valid UK postcode (e.g. G41 3YN).'
      }
    }

    if (!isRestaurantOpen() && !schedule.time) return closingNotice()

    return ''
  }

  const validatePayment = () => {
    if (payment === 'cash') return ''

    const digits = card.number.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) return 'Enter a valid card number.'
    if (!card.name.trim()) return 'Enter the name as it appears on the card.'
    if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(card.expiry.trim())) return 'Enter the expiry date as MM / YY.'
    if (!/^\d{3,4}$/.test(card.cvv.trim())) return 'Enter the 3-digit CVV from the back of your card.'

    return ''
  }

  /** Step 1 → Step 2 */
  const proceed = () => {
    if (!isSignedIn) {
      openAuth('login')
      return
    }
    const message = validateCheckout()
    if (message) {
      setError(message)
      toast(message, 'error')
      return
    }
    setError('')
    setAgreed(false)
    setStep(2)
  }

  /** Step 2 → Step 3 */
  const confirmPayment = () => {
    const message = validatePayment()
    if (message) {
      setError(message)
      toast(message, 'error')
      return
    }
    setError('')
    setAgreed(false)
    setStep(3)
  }

  /** Step 3 → place the order (Step 4 is the receipt). */
  const submitOrder = async () => {
    if (placing) return

    const message = validateCheckout() || validatePayment()
    if (message) {
      setError(message)
      setStep(message === validatePayment() ? 2 : 1)
      toast(message, 'error')
      return
    }
    if (!agreed) {
      setError('Please confirm that your order is correct before completing it.')
      return
    }

    const lines = missingLines()
    if (lines.length) {
      await openMismatch(lines)
      return
    }

    setError('')
    setPlacing(true)
    let order
    try {
      order = await placeOrder({
        branchId,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          optionPath: item.optionPath || '',
          quantity: item.quantity,
          isDeal: item.isDeal || false,
          selections: item.selections || []
        })),
        status: 'pending',
        mode,
        orderType: mode,
        payment,
        paymentLabel,
        customer: {
          name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
          phone: customer.phone,
          email: user?.email || '',
          address:
            mode === 'delivery'
              ? [address.house, address.floor, address.road, address.town].filter(Boolean).join(', ')
              : '',
          postcode: mode === 'delivery' ? normalisePostcode(address.postcode) : '',
          company: address.company,
          instructions: address.instructions,
          deliveryNotes: address.deliveryNotes
        },
        schedule,
        cutlery,
        coupon: coupon?.code || null,
        discount,
        notes,
        tip,
        subtotal,
        deliveryCharge,
        serviceFee,
        bagCharge,
        total
      })
    } catch (placeError) {
      setError(placeError?.message || 'We could not place your order. Please try again.')
      toast(placeError?.message || 'Order could not be placed', 'error')
      setPlacing(false)
      return
    }

    setPlacing(false)
    setPlaced(order)
    clear()
    setStep(4)
    toast('Order placed — thank you!')
  }

  const isEmpty = items.length === 0 && !placed

  return (
    <>
      <Header />
      <BranchMismatchModal
        open={Boolean(mismatch)}
        currentBranch={selectedBranch?.name}
        missing={mismatch?.missing || []}
        candidates={mismatch?.candidates || []}
        onSwitch={switchBranch}
        onRemove={removeMissing}
        onClose={() => setMismatch(null)}
      />
      <CheckoutSteps step={placed ? 4 : step} />

      <div className="page checkout-page">
        <div className="container">
          {isEmpty ? (
            <div className="success">
              <h1>Your cart is empty</h1>
              <p>Add something delicious from the menu to start your order.</p>
              <Link className="btn btn--primary btn--block btn--lg" to="/menu">
                Browse the menu
              </Link>
            </div>
          ) : placed ? (
            <div className="success">
              <span className="success__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h1>Order placed</h1>
              <p>
                Thanks {placed.customer?.name?.split(' ')[0] || 'again'}! Your food is on its way to the
                kitchen.
              </p>

              <dl className="receipt">
                <div className="receipt__row">
                  <dt>Reference</dt>
                  <dd>{placed.id}</dd>
                </div>
                <div className="receipt__row">
                  <dt>Order type</dt>
                  <dd>{placed.mode === 'delivery' ? 'Delivery' : 'Collection'}</dd>
                </div>
                <div className="receipt__row">
                  <dt>Payment</dt>
                  <dd>{placed.paymentLabel || (placed.payment === 'card' ? 'Card Payment' : 'Cash on Delivery')}</dd>
                </div>
                {placed.schedule?.date ? (
                  <div className="receipt__row">
                    <dt>Scheduled</dt>
                    <dd>
                      {placed.schedule.date} {placed.schedule.time || ''}
                    </dd>
                  </div>
                ) : null}
                {placed.mode === 'delivery' ? (
                  <div className="receipt__row">
                    <dt>Delivering to</dt>
                    <dd>
                      {placed.customer.address}
                      {placed.customer.postcode ? `, ${placed.customer.postcode}` : ''}
                    </dd>
                  </div>
                ) : null}
                <div className="receipt__row">
                  <dt>Total</dt>
                  <dd>{formatPrice(placed.total)}</dd>
                </div>
              </dl>

              <div className="success__actions" style={{ marginTop: 22 }}>
                <Link className="btn btn--primary btn--block btn--lg" to="/menu">
                  Back to the menu
                </Link>
                <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/')}>
                  Go to home
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            <ConfirmOrderCard
              paymentLabel={paymentLabel}
              agreed={agreed}
              onAgreedChange={(value) => {
                setAgreed(value)
                if (value) setError('')
              }}
              error={error}
              onComplete={submitOrder}
              onBack={() => {
                setError('')
                setStep(2)
              }}
            />
          ) : (
            <div className="page__grid">
              <div>
                {step === 1 ? (
                  <>
                    <YourInformation onChange={setCustomer} />
                    <OrderTypeCard />
                    <WhenCard />
                    {error && <p className="pp-form-error">{error}</p>}
                  </>
                ) : (
                  <>
                    <PaymentStep
                      method={payment}
                      onMethodChange={(value) => {
                        setPayment(value)
                        setError('')
                      }}
                      card={card}
                      onCardChange={setCard}
                      error={error}
                      total={total}
                      onContinue={confirmPayment}
                    />
                    <button
                      type="button"
                      className="btn btn--ghost btn--block checkout-back"
                      onClick={() => {
                        setError('')
                        setStep(1)
                      }}
                    >
                      Back to details
                    </button>
                  </>
                )}
              </div>

              <OrderSummaryPanel
                onAddMore={() => navigate('/menu')}
                onProceed={proceed}
                showCta={step === 1}
                ctaLabel="Proceed to payment"
                onScheduleClick={() => {
                  const target = document.getElementById('checkout-when')
                  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
