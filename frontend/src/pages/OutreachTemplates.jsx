import React, { useState } from 'react'
import { Mail, MessageSquare, Copy, Check, FileText, Users, Instagram, Linkedin } from 'lucide-react'

// ─── SELLER-FACING TEMPLATES ───────────────────────────────────────────────
const SELLER_TEMPLATES = {
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

// ─── TRACK DEALOS COLD OUTREACH TEMPLATES ──────────────────────────────────
const COLD_TEMPLATES = {
  cold_email_1: {
    label: 'Cold Email #1 — Bad Lead Pain',
    icon: '📧',
    category: 'Email',
    subject: 'quick thought on your property leads',
    body: `Hey {{firstName}},

Most wholesalers don't have a lead problem.

They have a bad lead filtering problem.

They're pulling lists, running skip traces, making calls — spending real time on properties that were never deals. No equity. No urgency. No motivated seller. Just noise.

I built Track DealOS to help fix that. It analyzes distressed properties and scores each lead based on equity, seller motivation, auction urgency, distress signals, and the most likely exit strategy — before you waste a call on it.

Want me to show you what it catches on a sample property?

— [Your Name]`,
  },
  cold_email_2: {
    label: 'Cold Email #2 — Deal Scoring Angle',
    icon: '📧',
    category: 'Email',
    subject: 'what does your lead scoring process actually look like',
    body: `Hey {{firstName}},

Genuine question — when a new property lead comes in, how do you decide if it's worth chasing?

Most teams I talk to say something like: "we look at the equity, check PropStream, maybe pull comps." Which works. But it's slow, inconsistent, and easy to get wrong when you're moving through a big list.

Track DealOS automates that scoring layer. Every lead gets analyzed across equity, urgency, distress score, auction timeline, seller motivation, and realistic deal strategy — wholesale, creative finance, BRRRR, or pass.

What if you knew a lead was dead before the first call?

Want me to send a quick breakdown of how it works?

— [Your Name]`,
  },
  cold_email_3: {
    label: 'Cold Email #3 — Auction Urgency',
    icon: '📧',
    category: 'Email',
    subject: 'are your auction leads sitting in the same pile as everything else',
    body: `Hey {{firstName}},

If you're working preforeclosure or auction leads, urgency is everything.

A property with 9 days to auction should not be sitting in the same spreadsheet row as a cold absentee owner lead from 6 months ago. They are completely different plays with completely different timelines.

Track DealOS flags urgent auctions automatically — countdown, equity position, recommended action, state-specific redemption rules. The deal either gets escalated or it doesn't. No guessing.

If your current system doesn't separate urgent from cold, you're probably missing deals that had a window.

Want me to run one of your preforeclosure leads through it?

— [Your Name]`,
  },
  linkedin_1: {
    label: 'LinkedIn DM #1 — Filtering Pain',
    icon: '💼',
    category: 'LinkedIn',
    subject: 'LinkedIn DM',
    body: `Hey {{firstName}} — noticed you're in the wholesale space.

Quick question: how are you currently filtering bad leads before they waste your time?

I'm building Track DealOS — it scores distressed properties by equity, urgency, seller motivation, and deal viability so you know what's worth chasing before you make a single call.

Worth taking a look?`,
  },
  linkedin_2: {
    label: 'LinkedIn DM #2 — Spreadsheet Pain',
    icon: '💼',
    category: 'LinkedIn',
    subject: 'LinkedIn DM',
    body: `Hey {{firstName}},

If your deal analysis is still happening in spreadsheets or manually in PropStream, this might be relevant.

Track DealOS scores leads automatically — equity, distress, auction urgency, motivation, exit strategy. You get a ranked list of what to chase instead of a flat list of addresses.

Want me to show you what it does on a real property?`,
  },
  instagram_1: {
    label: 'Instagram DM #1 — Pain Hook',
    icon: '📸',
    category: 'Instagram',
    subject: 'Instagram DM',
    body: `Hey {{firstName}} — love the content. Quick one:

How do you decide which leads on your list are actually worth calling?

I built a tool called Track DealOS that scores distressed properties before you waste time on them — equity, urgency, motivation, strategy.

Want me to send a quick walkthrough?`,
  },
  instagram_2: {
    label: 'Instagram DM #2 — Direct Offer',
    icon: '📸',
    category: 'Instagram',
    subject: 'Instagram DM',
    body: `Hey {{firstName}},

Saw your post on [topic]. You clearly know the wholesale game.

I'm building Track DealOS — basically a deal decision system for operators like you. It tells you if a lead is a wholesale deal, creative finance play, buy-and-hold, or trash — before you waste a call.

Would you want me to run one of your current leads through it?`,
  },
  followup_1: {
    label: 'Follow-Up #1 — Urgency Insight',
    icon: '🔄',
    category: 'Follow-Up',
    subject: 're: quick thought on your property leads',
    body: `Hey {{firstName}},

One thing I forgot to mention:

Track DealOS is built around the idea that not all distressed leads deserve the same urgency.

A preforeclosure with 10 days to auction, strong equity, and absentee ownership is a completely different situation than a tired landlord lead with no equity and no timeline pressure.

Most people's systems don't separate those. They sit in the same list. They get the same call cadence. Which means the urgent one gets missed or gets the same lazy follow-up as the cold one.

That's exactly what the analyzer is built to catch.

Want me to send over an example?

— [Your Name]`,
  },
  followup_2: {
    label: 'Follow-Up #2 — Rookie Mistake',
    icon: '🔄',
    category: 'Follow-Up',
    subject: 'the mistake most wholesalers make on distressed leads',
    body: `Hey {{firstName}},

Last one from me.

One mistake I see constantly: treating every "distressed" property like it's equally worth chasing.

The ones that actually convert tend to share the same profile — high equity, real urgency signal, motivated seller, clean enough title to exit fast. The ones that waste your time usually have one of those missing.

Track DealOS scores each lead across all of those before you ever pick up the phone. So your time goes to the top 10% of your list instead of the whole thing.

Want me to run a sample property through it and show you the output?

— [Your Name]`,
  },
  yes_reply: {
    label: '"Yes" Reply Message',
    icon: '✅',
    category: 'Reply',
    subject: 're: [previous subject]',
    body: `Hey {{firstName}},

Awesome — here's what I'll send over:

1. A quick walkthrough of how Track DealOS scores a property (equity, distress, urgency, strategy)
2. A sample analysis output so you can see exactly what it flags
3. A look at the batch lead scoring — where you upload a list and it ranks every row

One question before I do: what does your current lead stack look like? Are you pulling from PropStream, Zillow, BatchData, a list service, or something else?

That'll help me show you the most relevant part first.

— [Your Name]`,
  },
  brutal_check: {
    label: 'Brutal Quality Check',
    icon: '🔥',
    category: 'Reference',
    subject: 'Quality Check — Read Before Sending',
    body: `BRUTAL QUALITY CHECK — Run every message through this before sending.

─── RED FLAGS (rewrite if any of these are present) ───

❌ "Can we hop on a quick 15-minute call?"
   → Too early. You haven't earned the call yet. Replace with curiosity CTA.

❌ "Would you be interested in learning more?"
   → Weak. Of course they might be. Make them want to say yes to something specific.

❌ "Just following up / just checking in / bumping this"
   → Lazy. Every follow-up must add something: an insight, a mistake, a real estate fact.

❌ Generic opener: "Hope you're doing well" / "I came across your profile"
   → No. Get to the point. Lead with the pain or the question.

❌ Feature-dumping: "Track DealOS has a dashboard, CRM, pipeline, buyer list..."
   → Nobody cares about features in a cold message. Lead with the outcome or the pain.

❌ Hype language: "revolutionary," "game-changing," "the best tool"
   → Cut it. Real operators don't trust hype. Specificity builds credibility.

❌ Asking for too much too fast: demo call, 30-minute walkthrough, Zoom invite
   → Cold = earn the reply first. Warm = then earn the call.

─── GREEN FLAGS (these make the message work) ───

✅ Opens with a specific pain wholesalers actually feel
✅ Mentions PropStream, Zillow, spreadsheets, or their actual workflow
✅ CTA asks for a small yes: "want me to show you?" / "want me to run a lead?"
✅ Sounds like a real person, not a software company
✅ Follow-ups add a real insight, not "just checking in"
✅ Never overpromises — says "helps prioritize" not "guarantees deals"

─── BEST CTAs TO USE ───

→ "Want me to run one of your leads through it?"
→ "Want me to show you what it catches?"
→ "Want me to send a quick breakdown?"
→ "Worth taking a look?"
→ "Want me to show you the output on a sample property?"

─── ONE-LINERS TO KEEP NEARBY ───

"Most wholesalers don't have a lead problem. They have a filtering problem."
"A distressed property is not automatically a deal."
"Score the lead before you chase it."
"Every lead should not get the same attention."
"Know the deal before you waste the call."
"Stop chasing fries." (dead/cooked deals)
"Equity, urgency, and exit strategy decide the deal."`,
  },
}

const ALL_SECTIONS = [
  { key: 'seller', label: 'Seller Outreach', templates: SELLER_TEMPLATES },
  { key: 'cold', label: 'Track DealOS Cold Outreach', templates: COLD_TEMPLATES },
]

function fillTemplate(template, data) {
  return template
    .replace(/{{ownerName}}/g, data.ownerName || '[Owner Name]')
    .replace(/{{firstName}}/g, data.ownerName?.split(' ')[0] || '[First Name]')
    .replace(/{{address}}/g, data.address || '[Address]')
    .replace(/{{city}}/g, data.city || '[City]')
    .replace(/{{state}}/g, data.state || '[State]')
    .replace(/{{zip}}/g, data.zip || '[ZIP]')
    .replace(/{{auctionDate}}/g, data.auctionDate ? ` (auction scheduled for ${data.auctionDate})` : '')
}

const CATEGORY_COLORS = {
  Email: 'bg-blue-900/40 text-blue-300 border-blue-700',
  LinkedIn: 'bg-sky-900/40 text-sky-300 border-sky-700',
  Instagram: 'bg-pink-900/40 text-pink-300 border-pink-700',
  'Follow-Up': 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  Reply: 'bg-green-900/40 text-green-300 border-green-700',
  Reference: 'bg-red-900/40 text-red-300 border-red-700',
}

export default function OutreachTemplates({ propertyData = {}, onClose }) {
  const [activeSection, setActiveSection] = useState('seller')
  const [selected, setSelected] = useState('preforeclosure')
  const [customized, setCustomized] = useState({})
  const [copied, setCopied] = useState(false)

  const currentSection = ALL_SECTIONS.find(s => s.key === activeSection)
  const templates = currentSection.templates
  const tpl = templates[selected] || Object.values(templates)[0]
  const filled = fillTemplate(customized[selected] ?? tpl.body, propertyData)
  const filledSubject = fillTemplate(tpl.subject, propertyData)

  function handleSectionSwitch(key) {
    setActiveSection(key)
    const section = ALL_SECTIONS.find(s => s.key === key)
    setSelected(Object.keys(section.templates)[0])
  }

  function handleSelect(key) {
    setSelected(key)
  }

  function handleEdit(val) {
    setCustomized(prev => ({ ...prev, [selected]: val }))
  }

  function handleReset() {
    setCustomized(prev => { const n = { ...prev }; delete n[selected]; return n })
  }

  async function handleCopy() {
    const textToCopy = tpl.subject !== 'SMS' && tpl.subject !== 'LinkedIn DM' && tpl.subject !== 'Instagram DM'
      ? `Subject: ${filledSubject}\n\n${filled}`
      : filled
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={onClose ? "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" : "p-6"}>
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden ${onClose ? 'w-full max-w-5xl max-h-[92vh]' : 'h-[85vh]'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
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

        {/* Section tabs */}
        <div className="flex border-b border-slate-700 flex-shrink-0">
          {ALL_SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => handleSectionSwitch(s.key)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeSection === s.key
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Template list */}
          <div className="w-60 border-r border-slate-700 p-3 space-y-1 overflow-y-auto flex-shrink-0">
            {Object.entries(templates).map(([key, t]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected === key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">{t.icon}</span>
                  <div>
                    <div className="leading-snug">{t.label}</div>
                    {t.category && (
                      <span className={`text-xs px-1.5 py-0.5 rounded border mt-1 inline-block ${CATEGORY_COLORS[t.category] || 'text-slate-400'}`}>
                        {t.category}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            {/* Subject + actions */}
            <div className="flex items-start gap-2 flex-shrink-0">
              {tpl.subject !== 'SMS' && tpl.subject !== 'LinkedIn DM' && tpl.subject !== 'Instagram DM' && (
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Subject Line</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-medium">
                    {filledSubject}
                  </div>
                </div>
              )}
              {(tpl.subject === 'LinkedIn DM' || tpl.subject === 'Instagram DM') && (
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold ${
                    tpl.subject === 'LinkedIn DM'
                      ? 'bg-sky-900/40 text-sky-300 border-sky-700'
                      : 'bg-pink-900/40 text-pink-300 border-pink-700'
                  }`}>
                    {tpl.subject === 'LinkedIn DM' ? <Linkedin size={12} /> : <Instagram size={12} />}
                    {tpl.subject}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 self-end flex-shrink-0">
                {customized[selected] && (
                  <button onClick={handleReset} className="text-xs text-slate-400 hover:text-yellow-400 transition-colors">
                    Reset
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

            {/* Textarea */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <label className="block text-xs text-slate-400 mb-1 flex-shrink-0">
                Message Body
                {activeSection === 'seller' && (
                  <span className="text-slate-600 ml-1">(placeholders auto-filled from property data)</span>
                )}
              </label>
              <textarea
                value={customized[selected] ?? tpl.body}
                onChange={e => handleEdit(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500 font-mono leading-relaxed min-h-0"
              />
            </div>

            {/* Preview (seller templates only) */}
            {activeSection === 'seller' && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex-shrink-0">
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <FileText size={11} />
                  Preview (filled with property data)
                </div>
                <pre className="text-white text-xs whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">{filled}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
