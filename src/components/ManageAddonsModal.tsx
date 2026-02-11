import { useState, useEffect } from 'react'
import { getPlanDisplayName } from '../utils/planNames'
import type { AddonDefinition } from '../../shared/addonConfig'

interface Subscription {
  id: string
  planId: string
  status: string
  planAmount: number
  billingPeriodUnit: string
  subscriptionItems?: Array<{
    itemPriceId: string
    itemType: string
    quantity: number
    amount: number
    unitPrice: number
  }>
}

interface ManageAddonsModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription
  token: string
  onAddonChangeComplete: () => void
}

type ModalStep =
  | 'browse'
  | 'confirm_add'
  | 'confirm_remove'
  | 'processing'
  | 'success'
  | 'error'

interface CurrentAddon {
  itemPriceId: string
  amount: number
  quantity: number
}

const AddonIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case 'travel':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'speed':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
  }
}

export function ManageAddonsModal({ isOpen, onClose, subscription, token, onAddonChangeComplete }: ManageAddonsModalProps) {
  const [step, setStep] = useState<ModalStep>('browse')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableAddons, setAvailableAddons] = useState<AddonDefinition[]>([])
  const [activeAddons, setActiveAddons] = useState<AddonDefinition[]>([])
  const [currentAddons, setCurrentAddons] = useState<CurrentAddon[]>([])
  const [selectedAddon, setSelectedAddon] = useState<AddonDefinition | null>(null)
  const [actionType, setActionType] = useState<'add' | 'remove'>('add')
  const [successMessage, setSuccessMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAddons()
      setStep('browse')
      setSelectedAddon(null)
      setError('')
      setSuccessMessage('')
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [isOpen, subscription.id])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const fetchAvailableAddons = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/subscription/addons/available?subscriptionId=${encodeURIComponent(subscription.id)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableAddons(data.available || [])
        setActiveAddons(data.alreadyActive || [])
        setCurrentAddons(data.currentAddons || [])
      } else {
        setError(data.error || 'Failed to load add-ons')
      }
    } catch (err) {
      setError('Failed to load add-on options')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddon = (addon: AddonDefinition) => {
    setSelectedAddon(addon)
    setActionType('add')
    setStep('confirm_add')
    setError('')
  }

  const handleRemoveAddon = (addon: AddonDefinition) => {
    setSelectedAddon(addon)
    setActionType('remove')
    setStep('confirm_remove')
    setError('')
  }

  const executeAction = async () => {
    if (!selectedAddon) return
    setStep('processing')
    setError('')

    try {
      const endpoint = actionType === 'add'
        ? '/api/subscription/addons/add'
        : '/api/subscription/addons/remove'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          addonFamily: selectedAddon.family
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMessage(
          actionType === 'add'
            ? `${selectedAddon.displayName} has been added to your subscription!`
            : `${selectedAddon.displayName} has been removed from your subscription.`
        )
        setStep('success')
      } else {
        setError(data.error || `Failed to ${actionType} add-on`)
        setStep('error')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setStep('error')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getActiveAddonPrice = (addon: AddonDefinition): number => {
    const match = currentAddons.find(ca => {
      const lower = ca.itemPriceId.toLowerCase()
      if (addon.family === 'travel') {
        return lower.includes('travel-upgrade') || lower.includes('travel-modem') || lower.includes('nomad-travel') || lower.includes('travel-pause')
      }
      if (addon.family === 'prime') {
        return lower.includes('nomad-prime') || lower.includes('prime-upgrade') || lower.includes('prime-founders')
      }
      return ca.itemPriceId === addon.itemPriceId
    })
    return match ? match.amount : addon.price
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        }}
      >
        <div
          className="relative px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #0d9668 0%, #10a37f 50%, #34d399 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Manage Add-ons</h2>
              <p className="text-emerald-100 text-sm mt-0.5">{getPlanDisplayName(subscription.planId)}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin' }}>

          {step === 'browse' && (
            <>
              {loading ? (
                <div className="flex flex-col items-center py-14">
                  <div className="relative w-12 h-12 mb-5">
                    <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: 'rgba(16,163,127,0.2)' }} />
                    <div className="absolute inset-0 rounded-full border-[3px] animate-spin" style={{ borderColor: '#e5e7eb', borderTopColor: '#10a37f' }} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Loading add-ons...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-semibold mb-1">Something went wrong</p>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeAddons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10a37f' }} />
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active</p>
                      </div>
                      <div className="space-y-3">
                        {activeAddons.map((addon) => {
                          const price = getActiveAddonPrice(addon)
                          return (
                            <div
                              key={addon.id}
                              className="group relative rounded-2xl p-[1px] overflow-hidden"
                              style={{ background: 'linear-gradient(135deg, #10a37f, #34d399, #10a37f)' }}
                            >
                              <div className="rounded-2xl bg-white p-4">
                                <div className="flex items-start gap-3.5">
                                  <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.1), rgba(52,211,153,0.15))' }}
                                  >
                                    <AddonIcon type={addon.icon} className="w-5.5 h-5.5 text-emerald-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="font-semibold text-gray-900 text-[15px]">{addon.displayName}</p>
                                          <span
                                            className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                                            style={{ backgroundColor: 'rgba(16,163,127,0.1)', color: '#0d8c6d' }}
                                          >Active</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">{addon.headline}</p>
                                      </div>
                                      <p className="text-sm font-bold flex-shrink-0 tabular-nums" style={{ color: '#10a37f' }}>{formatCurrency(price)}<span className="text-gray-400 font-normal text-xs">/mo</span></p>
                                    </div>
                                    <div className="mt-3 space-y-1.5">
                                      {addon.bullets.slice(0, 2).map((bullet, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10a37f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span className="text-xs text-gray-500">{bullet}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveAddon(addon)}
                                      className="mt-3 text-[11px] font-medium text-gray-300 hover:text-red-400 transition-colors duration-200"
                                    >
                                      Remove add-on
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {availableAddons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Available to Add</p>
                      </div>
                      <div className="space-y-3">
                        {availableAddons.map((addon) => (
                          <div
                            key={addon.id}
                            className="group rounded-2xl border border-gray-100 hover:border-emerald-200 bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/30 transition-all duration-300 overflow-hidden"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3.5">
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 group-hover:bg-emerald-50 transition-colors duration-300"
                                >
                                  <AddonIcon type={addon.icon} className="w-5.5 h-5.5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-gray-900 text-[15px]">{addon.displayName}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">{addon.headline}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-lg font-bold tabular-nums" style={{ color: '#10a37f' }}>{formatCurrency(addon.price)}</p>
                                      <p className="text-[10px] text-gray-400 -mt-0.5">per {addon.billingPeriod}</p>
                                    </div>
                                  </div>
                                  <div className="mt-3 space-y-1.5">
                                    {addon.bullets.map((bullet, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-xs text-gray-500">{bullet}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {addon.upsellMessage && (
                                <div
                                  className="mt-3.5 mx-0.5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl"
                                  style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.06), rgba(52,211,153,0.08))' }}
                                >
                                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">{addon.upsellMessage}</p>
                                </div>
                              )}
                              <button
                                onClick={() => handleAddAddon(addon)}
                                className="mt-4 w-full py-2.5 text-white font-semibold rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #10a37f 0%, #0d8c6d 100%)' }}
                              >
                                Add to My Subscription
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableAddons.length === 0 && activeAddons.length === 0 && (
                    <div className="text-center py-14">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-semibold">No add-ons available</p>
                      <p className="text-sm text-gray-400 mt-1">Check back later for new options.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'confirm_add' && selectedAddon && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.1), rgba(52,211,153,0.15))' }}
                >
                  <AddonIcon type={selectedAddon.icon} className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Add {selectedAddon.displayName}?</h4>
                <p className="text-sm text-gray-400 mt-1 text-center">Billed immediately with prorated charges.</p>
              </div>

              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.04), rgba(52,211,153,0.06))', border: '1px solid rgba(16,163,127,0.12)' }}
              >
                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid rgba(16,163,127,0.1)' }}>
                  <p className="font-semibold text-gray-800">{selectedAddon.displayName}</p>
                  <p className="text-lg font-bold" style={{ color: '#10a37f' }}>{formatCurrency(selectedAddon.price)}<span className="text-gray-400 font-normal text-xs">/mo</span></p>
                </div>
                <div className="space-y-2">
                  {selectedAddon.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16,163,127,0.1)' }}>
                        <svg className="w-3 h-3" style={{ color: '#10a37f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl px-4 py-3.5 mb-6 bg-blue-50/70 border border-blue-100">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    A prorated charge applies for this billing cycle. Starting next cycle, <strong>{formatCurrency(selectedAddon.price)}</strong> will be added to your monthly bill.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('browse')}
                  className="flex-1 px-4 py-3 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={executeAction}
                  className="flex-[1.5] px-4 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] text-sm"
                  style={{ background: 'linear-gradient(135deg, #10a37f, #0d8c6d)' }}
                >
                  Confirm & Add Now
                </button>
              </div>
            </div>
          )}

          {step === 'confirm_remove' && selectedAddon && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-50 mb-4">
                  <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900">Remove {selectedAddon.displayName}?</h4>
                <p className="text-sm text-gray-400 mt-1 text-center max-w-sm">{selectedAddon.retentionMessage}</p>
              </div>

              <div className="rounded-2xl p-4 mb-4 bg-red-50/70 border border-red-100">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-3">What you'll lose</p>
                <div className="space-y-2.5">
                  {selectedAddon.retentionBullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 mt-0.5">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-sm text-red-700">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-4 mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.04), rgba(52,211,153,0.06))', border: '1px solid rgba(16,163,127,0.12)' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.15), rgba(52,211,153,0.2))' }}
                  >
                    <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Keep {selectedAddon.displayName}</p>
                    <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
                      For just <strong>{formatCurrency(getActiveAddonPrice(selectedAddon))}/mo</strong>, you keep all benefits.
                      Most customers who remove this end up re-purchasing later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setStep('browse')}
                  className="w-full px-4 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] text-sm"
                  style={{ background: 'linear-gradient(135deg, #10a37f, #0d8c6d)' }}
                >
                  Keep My Add-on
                </button>
                <button
                  onClick={executeAction}
                  className="w-full px-4 py-2.5 text-gray-400 font-medium text-xs hover:text-red-500 transition-colors duration-200"
                >
                  Remove anyway
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-16">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 rounded-full" style={{ border: '3px solid #f3f4f6' }} />
                <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '3px solid transparent', borderTopColor: '#10a37f' }} />
                <div className="absolute inset-2 rounded-full flex items-center justify-center">
                  {actionType === 'add' ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-gray-800 font-semibold mb-1">
                {actionType === 'add' ? 'Adding' : 'Removing'} {selectedAddon?.displayName}...
              </p>
              <p className="text-gray-400 text-sm">This may take a moment.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(16,163,127,0.1), rgba(52,211,153,0.15))' }}
              >
                <svg className="w-8 h-8" style={{ color: '#10a37f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">{actionType === 'add' ? 'Added Successfully' : 'Removed Successfully'}</p>
              <p className="text-gray-400 text-sm text-center max-w-xs mb-8">{successMessage}</p>
              <button
                onClick={() => {
                  onAddonChangeComplete()
                  handleClose()
                }}
                className="px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] text-sm"
                style={{ background: 'linear-gradient(135deg, #10a37f, #0d8c6d)' }}
              >
                Done
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-gray-400 text-sm text-center max-w-xs mb-8">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('browse')}
                  className="px-6 py-2.5 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={executeAction}
                  className="px-6 py-2.5 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-sm"
                  style={{ background: 'linear-gradient(135deg, #10a37f, #0d8c6d)' }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
