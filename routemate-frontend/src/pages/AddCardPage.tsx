import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { useCards } from '@/context/CardContext';

const cardTypes = [
  { id: 'adult', label: 'Adult' },
  { id: 'student', label: 'Student' },
  { id: 'senior', label: 'Senior' },
] as const;

export function AddCardPage() {
  const navigate = useNavigate();
  const { createCard } = useCards();
  const [selectedType, setSelectedType] = useState<(typeof cardTypes)[number]['id']>('adult');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateCard() {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await createCard(selectedType);
      navigate('/cards');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create card.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageTopBar title="Add Card" titleAlign="left" showBack showNotifications={false} />

      <section className="empty-state page-section">
        <h2 className="section-title">Create a new card</h2>
        <p className="section-subtitle">
          New users start without a card. Choose a card type to create your first one.
        </p>

        <div className="card-type-list">
          {cardTypes.map((cardType) => (
            <button
              key={cardType.id}
              type="button"
              className={`card-type-option ${selectedType === cardType.id ? 'card-type-option--active' : ''}`}
              onClick={() => setSelectedType(cardType.id)}
            >
              {cardType.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <div className="auth-message auth-message--error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          className="primary-button primary-button--pill"
          onClick={() => void handleCreateCard()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Card'}
        </button>
      </section>
    </div>
  );
}
