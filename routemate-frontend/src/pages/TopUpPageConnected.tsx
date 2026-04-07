import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import applePayLogo from '@/assets/payment-logos/apple-pay.svg';
import dbsPaylahLogo from '@/assets/payment-logos/dbs-paylah.svg';
import stripeLogo from '@/assets/payment-logos/stripe.svg';
import { PageTopBar } from '@/components/common/PageTopBar';
import { TopUpCardPreview } from '@/components/common/TopUpCardPreview';
import { useCards } from '@/context/CardContext';

const amounts = [10, 20, 30, 50, 100];

const paymentOptions = [
  { id: 'stripe', label: 'Stripe', logo: stripeLogo, available: true, selected: true },
  { id: 'paylah', label: 'DBS PayLah!', logo: dbsPaylahLogo, available: false, selected: false },
  { id: 'apple-pay', label: 'Apple Pay', logo: applePayLogo, available: false, selected: false },
];

function parseTopUpAmount(value: string) {
  if (!value || value === '.') {
    return null;
  }

  const parsedAmount = Number(value);
  return Number.isFinite(parsedAmount) ? parsedAmount : null;
}

export function TopUpPageConnected() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards, topUpCard } = useCards();
  const [amount, setAmount] = useState('10');
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCardId =
    typeof location.state === 'object' &&
    location.state !== null &&
    'cardId' in location.state &&
    typeof location.state.cardId === 'string'
      ? location.state.cardId
      : null;
  const currentCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  function handleAmountChange(nextValue: string) {
    if (/^\d*(\.\d{0,2})?$/.test(nextValue)) {
      setAmount(nextValue);
      setAmountError(nextValue ? '' : 'Please enter a top up amount.');
      return;
    }

    setAmountError('Enter a valid amount with up to 2 decimal places.');
  }

  function handlePresetClick(nextAmount: number) {
    setAmount(String(nextAmount));
    setAmountError('');
  }

  async function handleTopUp() {
    if (!currentCard) {
      setAmountError('Create a card before topping up.');
      return;
    }

    if (!amount) {
      setAmountError('Please enter a top up amount.');
      return;
    }

    const parsedAmount = parseTopUpAmount(amount);

    if (parsedAmount === null || parsedAmount <= 0) {
      setAmountError('Top up amount must be more than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await topUpCard(currentCard.id, parsedAmount);
      navigate('/top-up-success', { state: { cardId: currentCard.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to top up card.';
      setAmountError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedAmount = parseTopUpAmount(amount);

  return (
    <div className="page">
      <PageTopBar showBack />
      {currentCard ? <TopUpCardPreview card={currentCard} /> : null}

      {!currentCard ? (
        <section className="empty-state page-section">
          <h2 className="section-title">No card found</h2>
          <p className="section-subtitle">Create a card first before topping up.</p>
          <button type="button" className="primary-button primary-button--pill" onClick={() => navigate('/cards/add')}>
            Add Card
          </button>
        </section>
      ) : null}

      {currentCard ? (
        <section className="top-up-section">
          <h2 className="section-title section-title--center">Top Up Amount</h2>

          <label className="amount-input" htmlFor="top-up-amount">
            <span>$</span>
            <input
              id="top-up-amount"
              className={`amount-box amount-box-input ${amountError ? 'amount-box-input--error' : ''}`}
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(event) => handleAmountChange(event.target.value)}
              aria-invalid={amountError ? 'true' : 'false'}
              aria-describedby={amountError ? 'top-up-amount-error' : undefined}
            />
          </label>

          {amountError ? (
            <div id="top-up-amount-error" className="amount-error" role="alert">
              {amountError}
            </div>
          ) : null}

          <div className="preset-row">
            {amounts.map((presetAmount) => (
              <button
                key={presetAmount}
                type="button"
                className={`preset-chip ${amount === String(presetAmount) ? 'preset-chip--active' : ''}`}
                onClick={() => handlePresetClick(presetAmount)}
              >
                $ {presetAmount.toFixed(2)}
              </button>
            ))}
          </div>

          <h3 className="payment-heading">Select Payment</h3>

          <div className="payment-list">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={[
                  'payment-option',
                  option.selected ? 'payment-option--selected' : '',
                  !option.available ? 'payment-option--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!option.available}
              >
                <span className={`payment-option__radio ${option.selected ? 'payment-option__radio--selected' : ''}`} />
                <img src={option.logo} alt={`${option.label} logo`} className="payment-option__logo" />
                <span className="payment-option__label">
                  {option.label}
                  {!option.available ? ' (Not available)' : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="success-button"
        onClick={() => void handleTopUp()}
        disabled={!currentCard || isSubmitting}
      >
        <span>Top Up</span>
        <span>{selectedAmount !== null ? `$ ${selectedAmount.toFixed(2)}` : '$ --'}</span>
        <span>&rarr;</span>
      </button>
    </div>
  );
}
