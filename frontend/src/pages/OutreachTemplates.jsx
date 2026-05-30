import React, { useState } from 'react'
import { Mail, MessageSquare, Copy, Check, FileText } from 'lucide-react'

const TEMPLATES = {
  preforeclosure: {
    label: 'Preforeclosure Relief Letter',
    icon: '🏠',
    subject: 'Important Notice — Your Home at {{address}}',
    body: `Dear {{ownerName}},

My name is [Your Name], and I'm a local real estate investor in the {{city}} area.

I understand you may be facing a difficult situation with your property at {{address}}. I'm not here to add pressure — I want to offer a genuine solution.

I specialize in helping homeowners in preforeclosure find a way out before the auction date{{auctionDate}}. I can:

• Close quickly — often in 7–21 days
• Pay your arrears to stop the foreclosure
• Take the property as-is — no repairs needed
• Handle all closing costs

You keep your dignity and walk away without a foreclosure on your record.

If you'd like to talk — no obligation, no pressure — please call or text me at [Your Phone] or reply to this letter.

Time is limited. I'd like to help if I can.

Sincerely,
[Your Name]
[Your Company]
[Phone] | [Email]`,
  },
  probate: {
    label: 'Probate / Inherited Property Letter',
    icon: '📋',
    subject: 'Regarding the Property at {{address}}',
    body: `Dear {{ownerName}},

I'm writing to you about the property located at {{address}} in {{city}}, {{state}}.

I understand that dealing with an inherited or estate property can be overwhelming — especially on top of everything else that comes with losing a loved one. I want to make this process as simple as possible for you and your family.

I'm a local real estate investor and I buy inherited properties in any condition, often with:

• A fair all-cash offer within 48 hours
• Fast closing on your timeline
• No need for repairs, clean-out, or showings
• We handle all probate coordination with your attorney

If you haven't decided what to do with the property yet, there's no rush. But if selling is something you're considering, I'd love to have a brief conversation.

Please reach out at your convenience:
[Your Phone] | [Your Email]

With respect,
[Your Name]`,
  },
  absentee: {
    label: 'Absentee Owner Postcard',
    icon: '📮',
    subject: 'Cash Offer for Your {{city}} Property',
    body: `Hi {{ownerName}},

I'm interested in purchasing your property at {{address}}, {{city}}, {{state}} {{zip}}.

I buy homes in any condition for cash, close fast, and cover all closing costs. No agents, no fees, no repairs.

Interested? Call/text: [Your Phone]

[Your Name] — Local Investor`,
  },
  taxDelinquent: {
    label: 'Tax Delinquent Owner Letter',
    icon: '💰',
    subject: 'We Can Help With Your Property Tax Situation — {{address}}',
    body: `Dear {{ownerName}},

I noticed that the property at {{address}} has outstanding tax obligations. I know tax delinquency can snowball quickly, and I want to reach out before things escalate further.

I'm a local investor and I regularly help homeowners in this situation by:

• Paying off the delinquent taxes at closing
• Offering a fair cash price for the property
• Closing fast — often in under 30 days
• Taking the property completely as-is

You'd walk away with cash in hand and the tax burden completely resolved.

If you'd like to explore your options, I'm happy to talk — no pressure, no obligation.

[Your Name]
[Phone] | [Email]`,
  },
  failedListing: {
    label: 'Failed Listing Outreach',
    icon: '🔁',
    subject: 'Your Home at {{address}} — Still Available?',
    body: `Hi {{ownerName}},

I noticed your home at {{address}} was recently listed but didn't sell. That can be frustrating, especially after the time and effort of preparing a listing.

As a local real estate investor, I can offer you an alternative path:

• Cash offer — no financing contingencies
• No agent commissions or fees
• Close in as little as 14 days, or on your schedule
• Buy the home as-is — no repairs or updates required

If you're open to a conversation about what I can offer, I'd love to connect. No pressure — just options.

[Your Name]
[Phone] | [Email]`,
  },
  sms: {
    label: 'General Motivated Seller SMS',
    icon: '📱',
    subject: 'SMS',
    body: `Hi {{ownerName}}, this is [Name], a local home buyer in {{city}}. I saw your property at {{address}} and may be interested in making a cash offer. Would you be open to a quick chat? No obligation. Text or call: [Phone]`,
  },
}

function fillTemplate(template, data) {
  return template
    .replace(/{{ownerName}}/g, data.ownerName || '[Owner Name]')
    .replace(/{{address}}/g, data.address || '[Address]')
    .replace(/{{city}}/g, data.city || '[City]')
    .replace(/{{state}}/g, data.state || '[State]')
    .replace(/{{zip}}/g, data.zip || '[ZIP]')
    .replace(/{{auctionDate}}/g, data.auctionDate ? ` (auction scheduled for ${data.auctionDate})` : '')
}

export default function OutreachTemplates({ propertyData = {}, onClose }) {
  const [selected, setSelected] = useState('preforeclosure')
  const [customized, setCustomized] = useState({})
  const [copied, setCopied] = useState(false)

  const tpl = TEMPLATES[selected]
  const filled = fillTemplate(customized[selected] ?? tpl.body, propertyData)
  const filledSubject = fillTemplate(tpl.subject, propertyData)

  function handleEdit(val) {
    setCustomized(prev => ({ ...prev, [selected]: val }))
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(filled)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setCustomized(prev => { const n = { ...prev }; delete n[selected]; return n })
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-blue-400" />
            <h2 className="text-white font-bold text-lg">Outreach Templates</h2>
            {propertyData.address && (
              <span className="text-slate-400 text-sm">— {propertyData.address}</span>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">&times;</button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Template selector */}
          <div className="w-56 border-r border-slate-700 p-3 space-y-1 overflow-y-auto flex-shrink-0">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  selected === key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{t.icon}</span>
                <span className="leading-snug">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            <div className="flex items-center gap-2">
              {tpl.subject !== 'SMS' && (
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Subject Line</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-medium">
                    {filledSubject}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 self-end">
                {customized[selected] && (
                  <button onClick={handleReset} className="text-xs text-slate-400 hover:text-yellow-400 transition-colors">
                    Reset to default
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <label className="block text-xs text-slate-400 mb-1">
                Message Body <span className="text-slate-600">(edit freely — placeholders auto-filled)</span>
              </label>
              <textarea
                value={customized[selected] ?? tpl.body}
                onChange={e => handleEdit(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                <FileText size={11} />
                Preview (filled with property data)
              </div>
              <pre className="text-white text-xs whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{filled}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
