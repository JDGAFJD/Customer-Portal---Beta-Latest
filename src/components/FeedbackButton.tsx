import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackButtonProps {
  token: string;
}

export function FeedbackButton({ token }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackTypes = [
    { value: 'feature_request', label: 'Feature Request', icon: '💡' },
    { value: 'bug_report', label: 'Bug Report', icon: '🐛' },
    { value: 'general', label: 'General Feedback', icon: '💬' },
    { value: 'compliment', label: 'Compliment', icon: '⭐' },
  ];

  const handleSubmit = async () => {
    if (!feedbackType || !message.trim()) {
      setError('Please select a feedback type and enter your message');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackType,
          message: message.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setSubmitted(false);
          setFeedbackType('');
          setMessage('');
        }, 300);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 rounded-full shadow-lg text-white font-medium flex items-center gap-2 transition-all hover:shadow-xl hover:scale-105"
        style={{ backgroundColor: '#10a37f' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="hidden sm:inline">Submit Feedback</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {!submitted ? (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>Share Your Feedback</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          We'd love to hear from you! Request new features or let us know how we're doing.
                        </p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-3" style={{ color: '#0f172a' }}>
                        What type of feedback is this?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setFeedbackType(type.value)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              feedbackType === type.value
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={feedbackType === type.value ? { borderColor: '#10a37f' } : {}}
                          >
                            <span className="text-lg mb-1 block">{type.icon}</span>
                            <span className="text-sm font-medium" style={{ color: '#0f172a' }}>{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                        Your Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          feedbackType === 'feature_request'
                            ? "Describe the feature you'd like to see..."
                            : feedbackType === 'bug_report'
                            ? "Describe the issue you encountered..."
                            : "Share your thoughts with us..."
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        style={{ minHeight: '120px' }}
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 rounded-lg font-medium transition-all border border-gray-300 hover:bg-gray-50"
                        style={{ color: '#0f172a' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !feedbackType || !message.trim()}
                        className="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
                        style={{ backgroundColor: '#10a37f' }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10a37f20' }}>
                    <svg className="w-8 h-8" style={{ color: '#10a37f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>Thank You!</h3>
                  <p className="text-gray-500">
                    Your feedback has been submitted. We appreciate you taking the time to help us improve!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
