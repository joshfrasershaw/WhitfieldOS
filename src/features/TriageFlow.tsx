import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Clipboard,
  ClipboardCheck,
  Camera,
  Check,
  ChevronRight,
  CircleAlert,
  Flame,
  MessageCircle,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { PageHeader } from '../components/ui'
import {
  DISPATCH_SCRIPT,
  GAS_SAFETY_SCRIPT,
  PHOTO_SCRIPT,
  REVIEW_SCRIPT,
  groups,
  topicById,
  topics,
} from './triageCatalog'
import type { GroupId, Topic } from './triageCatalog'
import {
  WHATSAPP_PHOTO_MESSAGE,
  WHITFIELD_BUSINESS_WHATSAPP,
  whatsappPhotoUrl,
} from './triageWhatsapp'

type View =
  | 'home'
  | 'choose'
  | 'fuel'
  | 'boiler-work'
  | 'questions'
  | 'result'
  | 'gas-alert'
type Step = {
  key: string
  prompt: string
  options?: string[]
  required?: boolean
  type?: 'text' | 'tel'
}

const groupIcons: Record<GroupId, string> = {
  boilers: 'Boiler',
  leaks: 'Water',
  toilets: 'Toilet',
  taps: 'Tap',
  radiators: 'Heat',
  showers: 'Shower',
  services: 'Service',
  installations: 'Install',
  controls: 'Controls',
  other: 'Other',
}
const boilerFuels = ['Gas', 'Oil', 'LPG', 'Electric', 'Back boiler', 'Not sure']
const boilerWork = [
  'Fault or breakdown',
  'Service',
  'New installation',
  'Leaking boiler',
]
const leakLocations: Array<{ label: string; topic: string }> = [
  { label: 'Toilet', topic: 'toilet-leak-main' },
  { label: 'Radiator or valve', topic: 'radiator-leak' },
  { label: 'Boiler', topic: 'boiler-leak' },
  { label: 'Hot water cylinder', topic: 'cylinder-leak' },
  { label: 'Unvented cylinder', topic: 'unvented-leak' },
  { label: 'Kitchen tap', topic: 'kitchen-tap-leak' },
  { label: 'Exposed pipe', topic: 'water-emergency' },
  { label: 'Ceiling, floor or hidden pipe', topic: 'water-emergency' },
  { label: 'Gas pipe / gas smell', topic: 'gas-emergency' },
  { label: 'Not sure', topic: 'water-emergency' },
]
const commonFields: Step[] = [
  { key: 'postcode', prompt: 'What is the property postcode?', required: true },
  { key: 'name', prompt: 'May I take your name, please?' },
  { key: 'phone', prompt: 'What is the best contact number?', type: 'tel' },
  { key: 'issue', prompt: 'Can you briefly describe what is happening?' },
]

function guessOptions(question: string): string[] | undefined {
  const q = question.toLowerCase()
  if (
    q.includes('working') &&
    (q.includes('correctly') || q.includes('normally') || q.includes('ok'))
  )
    return ['Yes, working normally', 'No, there is a fault', 'Not sure']
  if (q.includes('installed') && q.includes('whitfield'))
    return ['Yes', 'No', 'Not sure']
  if (
    q.includes('gas, oil') ||
    q.includes('gas, lpg') ||
    q.includes('gas or oil')
  )
    return ['Gas', 'Oil', 'LPG', 'Electric', 'Not sure']
  if (q.includes('combi') && q.includes('cylinder'))
    return ['Combi', 'Regular boiler and cylinder', 'Not sure']
  if (q.includes('mixer tap') || q.includes('two individual'))
    return ['Mixer tap', 'Two separate taps', 'Not sure']
  if (q.includes('quarter-turn') || q.includes('multi-turn'))
    return ['Quarter-turn lever', 'Multi-turn knob', 'Not sure']
  if (q.includes('repair or replacement') || q.includes('repair or replace'))
    return ['Repair', 'Replacement', 'Not sure']
  if (q.includes('one or two holes')) return ['One', 'Two', 'Not sure']
  if (q.includes('rainfall head')) return ['Yes', 'No', 'Not sure']
  if (q.includes('causing damage to the property'))
    return ['Yes', 'No', 'Not sure']
  if (
    q.includes('leaking continuously') ||
    q.includes('leak continuous') ||
    q.includes('continuous or')
  )
    return ['All the time', 'Only when used/flushed', 'Not sure']
  if (
    q.includes('urgency') ||
    q.includes('urgent') ||
    q.includes('when is the work')
  )
    return ['Today if possible', 'Within a week', 'Flexible', 'Not sure']
  if (
    q.includes('blocked?') ||
    q.includes('any fault codes') ||
    q.includes('any error codes')
  )
    return ['Yes', 'No', 'Not sure']
  return undefined
}
function makeSteps(topic: Topic, inferredShowerType = ''): Step[] {
  const base = [...commonFields]
  const isToiletLeak =
    topic.id === 'toilet-leak-main' ||
    topic.id === 'toilet-leak' ||
    topic.id === 'concealed-toilet-leak'
  if (
    topic.group === 'boilers' ||
    topic.group === 'leaks' ||
    topic.id.includes('gas')
  )
    base.unshift({
      key: 'safety',
      prompt:
        'Before we continue: does anyone smell gas or suspect a gas escape?',
      required: true,
      options: ['No', 'Yes', 'Not sure'],
    })
  if (topic.id === 'shower-unknown') {
    base.push({
      key: 'shower-appearance',
      prompt: 'How would the customer describe the shower?',
      options: [
        'White electric-looking box on the wall',
        'Exposed mixer bar or separate temperature and flow controls',
        'Large overhead rainfall / waterfall head',
        'Controls concealed behind tiles',
        'Not sure — request photographs',
      ],
    })
    return base
  }
  if (
    topic.id === 'electric-shower' ||
    topic.id === 'rainfall-shower' ||
    topic.id === 'mixer-shower'
  ) {
    if (inferredShowerType) {
      base.push({
        key: 'shower-type-confirm',
        prompt:
          'That appearance is only a clue. Can the customer confirm which type of shower they have?',
        options: [
          'Yes, the selected type is confirmed',
          'No / still unsure — request photos',
        ],
      })
    }
    base.push({
      key: 'shower-intent',
      prompt: 'What does the customer want us to do?',
      options: [
        'Repair a fault / temperature problem',
        'Replace the existing shower',
        'Install a shower where there is not one',
        'Not sure yet',
      ],
      required: true,
    })
  }
  if (isToiletLeak) {
    base.push({
      key: 'toilet-cistern',
      prompt: 'Is the toilet cistern exposed or concealed?',
      options: [
        'Exposed ceramic cistern',
        'Concealed in cupboard / behind tiles',
        'Not sure',
      ],
    })
    base.push({
      key: 'toilet-source',
      prompt: 'Where does the leak appear to come from?',
      options: [
        'Water supply / cistern',
        'Waste pipe at back',
        'Base of toilet',
        'Not sure',
      ],
    })
    base.push({
      key: 'toilet-when',
      prompt: 'Is it leaking constantly, or only when flushed?',
      options: ['All the time', 'Only when flushed', 'Not sure'],
    })
  }
  if (topic.id === 'toilet-repair')
    base.push({
      key: 'toilet-repair-issue',
      prompt: 'Is it blocked, leaking or simply not filling / flushing?',
      options: ['Blocked', 'Leaking', 'Not filling or flushing', 'Not sure'],
    })
  if (topic.id === 'toilet-blocked')
    base.push({
      key: 'blocked-by',
      prompt: 'Do you know what caused the blockage?',
      options: ['Toilet tissue', 'Other object', 'Not sure'],
    })
  if (topic.id === 'water-emergency')
    base.push({
      key: 'pipe-source',
      prompt: 'Where is the leak actually coming from?',
      options: ['Visible exposed pipe', 'Under floor or in ceiling', 'Unknown'],
    })
  if (
    topic.outcome === 'diagnostic' &&
    topic.title.toLowerCase().includes('boiler')
  )
    base.push({
      key: 'installed',
      prompt: 'Did Whitfield install this boiler?',
      options: [
        'Yes — within the last 12 months',
        'Yes — over 12 months ago',
        'No',
        'Not sure',
      ],
    })
  const questions = (topic.questions || [])
    .filter((prompt) => {
      if (!isToiletLeak) return true
      const question = prompt.toLowerCase()
      // The dedicated clickable cistern/source/timing questions already ask these.
      return !(
        (question.includes('exposed') && question.includes('concealed')) ||
        (question.includes('leak from') && question.includes('waste pipe')) ||
        (question.includes('continuous') && question.includes('fitting')) ||
        question.includes('can you see exactly where the water')
      )
    })
    .map((prompt) =>
      prompt === 'Is it urgent or causing damage?'
        ? 'Is the leak causing damage to the property?'
        : prompt,
    )
  base.push(
    ...questions.map((prompt, i) => ({
      key: 'specific-' + i,
      prompt,
      options: guessOptions(prompt),
    })),
  )
  base.push({
    key: 'urgency',
    prompt: 'How soon does the customer need the work?',
    options: [
      'Today if possible',
      'Tomorrow',
      'Within a week',
      'Flexible',
      'Not sure',
    ],
  })
  return base
}
function nextTopicForAnswer(
  key: string,
  value: string,
  topic: Topic,
): string | null {
  if (key === 'shower-appearance') {
    if (value.startsWith('White electric-looking')) return 'electric-shower'
    if (value.startsWith('Exposed mixer')) return 'mixer-shower'
    if (value.startsWith('Large overhead')) return 'rainfall-shower'
    if (value.startsWith('Controls concealed')) return 'mixer-shower'
  }
  if (key === 'toilet-cistern' && value.startsWith('Concealed'))
    return 'toilet-concealed'
  if (key === 'toilet-repair-issue') {
    if (value === 'Blocked') return 'toilet-blocked'
    if (value === 'Leaking') return 'toilet-leak-main'
  }
  if (
    key.startsWith('specific-') &&
    topic.outcome === 'service' &&
    value === 'No, there is a fault'
  ) {
    if (topic.id === 'gas-service') return 'gas-diagnostic'
    if (topic.id === 'oil-service') return 'oil-diagnostic'
    if (topic.id === 'lpg-service') return 'lpg-diagnostic'
  }
  return null
}
function getDecision(
  topic: Topic,
  answers: Record<string, string>,
): {
  kind: Topic['outcome']
  title: string
  detail: string
  price?: string
  note?: string
} {
  if (topic.group === 'showers' && topic.id !== 'shower-pump') {
    const intent = answers['shower-intent']
    if (
      topic.id === 'shower-unknown' ||
      intent === 'Not sure yet' ||
      intent === undefined
    ) {
      return {
        kind: 'photos',
        title: 'Confirm shower type and request photographs',
        detail:
          'The shower type or intended work has not been confirmed. Request photos and refer the request for assessment. Do not quote an installation price.',
      }
    }
    if (intent === 'Repair a fault / temperature problem') {
      return {
        kind: 'george',
        title: 'Shower fault — refer for assessment',
        detail:
          'The caller reports an existing shower fault. Record the symptoms and make/model, request close-up and wider photographs and have George review the work required. The installation price does not apply to fault investigation or repair.',
      }
    }
    if (intent === 'Install a shower where there is not one') {
      return {
        kind: 'quote',
        title: 'New shower installation — assess before quoting',
        detail:
          'This is not a like-for-like replacement. Confirm location, water/electrical provision, type and access with George before offering a price or appointment.',
      }
    }
    if (topic.id === 'mixer-shower') {
      return {
        kind: 'photos',
        title: 'Mixer shower replacement — photos and quote review',
        detail:
          'The scripts do not provide a general fixed price for a mixer shower replacement. Obtain photographs and refer for a suitable quote.',
      }
    }
    if (intent === 'Replace the existing shower') {
      return {
        kind: 'fixed',
        title:
          topic.id === 'electric-shower'
            ? 'Electric shower replacement enquiry'
            : 'Rainfall shower replacement enquiry',
        detail:
          topic.message ||
          'Check suitability, current pricing and availability before offering a booking.',
        price: topic.price,
        note: 'Script price indication only. Confirm like-for-like suitability and the current approved price before quoting.',
      }
    }
  }
  if (answers.installed === 'Yes — within the last 12 months')
    return {
      kind: 'george',
      title: 'Refer possible callback to George',
      detail:
        'Check original installation date, work covered and liability before booking a chargeable visit.',
    }
  if (
    answers['toilet-source'] === 'Waste pipe at back' ||
    answers['toilet-source'] === 'Base of toilet'
  )
    return {
      kind: 'decline',
      title: 'Outside current script scope',
      detail:
        'The uploaded leaking-toilet script says Whitfield does not take on base/waste-pipe leaks. Do not book without George approving.',
    }
  if (answers['blocked-by'] === 'Other object')
    return {
      kind: 'george',
      title: 'Ask George before booking',
      detail:
        'The blocked-toilet script requires referral if an object other than tissue caused the blockage.',
    }
  if (topic.id === 'water-emergency')
    return answers['pipe-source'] === 'Under floor or in ceiling'
      ? {
          kind: 'decline',
          title: 'Hidden leak / ceiling: outside current script scope',
          detail:
            'The water-leak script says not to accept concealed ceiling or under-floor pipework work. Advise the caller to seek urgent assistance from an appropriate professional.',
        }
      : {
          kind: 'photos',
          title: 'Request WhatsApp photographs',
          detail:
            'Ask for close-up and wider views of the visible leak, together with the postcode and description.',
        }
  if (topic.id === 'gas-emergency')
    return {
      kind: 'decline',
      title: 'Gas emergency — do not book as routine work',
      detail: GAS_SAFETY_SCRIPT,
    }
  if (topic.id === 'toilet-concealed' || topic.id === 'concealed-toilet-leak')
    return {
      kind: 'george',
      title: 'Check concealed toilet access with George',
      detail:
        'Some concealed-cistern and inaccessible leaks are outside the uploaded scripts. Photographs and manager review are required.',
    }
  if (topic.outcome === 'diagnostic')
    return {
      kind: 'diagnostic',
      title: 'Diagnostic enquiry',
      detail: topic.message || 'Investigate the fault before quoting repairs.',
      price: topic.price,
      note: topic.note,
    }
  if (topic.outcome === 'service')
    return {
      kind: 'service',
      title: 'Service enquiry',
      detail:
        topic.message ||
        'Check service availability and the current approved price.',
      price: topic.price,
      note: topic.note,
    }
  if (topic.outcome === 'fixed')
    return {
      kind: 'fixed',
      title: 'Indicative installation / replacement price',
      detail:
        topic.message ||
        'Confirm scope, price and diary before offering a booking.',
      price: topic.price,
      note: topic.note,
    }
  if (topic.outcome === 'george')
    return {
      kind: 'george',
      title: 'Refer to George',
      detail: topic.message || REVIEW_SCRIPT,
      note: topic.note,
    }
  if (topic.outcome === 'photos')
    return {
      kind: 'photos',
      title: 'Request photographs',
      detail: topic.message || PHOTO_SCRIPT,
      note: topic.note,
    }
  if (topic.outcome === 'decline')
    return {
      kind: 'decline',
      title: 'Check suitability / decline',
      detail:
        topic.message || 'Do not book before a manager reviews the request.',
    }
  return {
    kind: 'quote',
    title: 'Quotation enquiry',
    detail:
      topic.message ||
      'Take the details, obtain photographs where helpful, and arrange a quotation.',
    price: topic.price,
    note: topic.note,
  }
}
export default function TriageFlow() {
  const [view, setView] = useState<View>('home')
  const [group, setGroup] = useState<GroupId | null>(null)
  const [fuel, setFuel] = useState('')
  const [topicId, setTopicId] = useState('')
  const [stepIndex, setStepIndex] = useState(0)
  const [value, setValue] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [handoff, setHandoff] = useState<'photos' | 'george' | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedPhotos, setCopiedPhotos] = useState(false)
  const [safetyReturn, setSafetyReturn] = useState<View>('home')
  const [diaryConfirmed, setDiaryConfirmed] = useState(false)
  const topic = topicById.get(topicId)
  const inferredShowerType = answers['shower-inferred'] || ''
  const steps = useMemo(
    () => (topic ? makeSteps(topic, inferredShowerType) : []),
    [topic, inferredShowerType],
  )
  const step = steps[stepIndex]
  const photoLink = whatsappPhotoUrl(answers.phone || '')
  const rawDecision = topic ? getDecision(topic, answers) : null
  const decision =
    handoff && topic
      ? {
          kind: handoff,
          title:
            handoff === 'photos'
              ? 'Request photographs before progressing'
              : 'Refer enquiry to George',
          detail: handoff === 'photos' ? PHOTO_SCRIPT : REVIEW_SCRIPT,
        }
      : rawDecision

  function chooseGroup(next: GroupId) {
    setGroup(next)
    setTopicId('')
    setFuel('')
    setHandoff(null)
    setCopied(false)
    if (next === 'boilers') setView('fuel')
    else setView('choose')
  }
  function selectTopic(
    id: string,
    carriedAnswers: Record<string, string> = {},
  ) {
    if (id === 'gas-emergency') {
      setTopicId(id)
      setView('gas-alert')
      setSafetyReturn('home')
      return
    }
    setTopicId(id)
    setView('questions')
    // The appearance helper has already collected the customer's details.
    // Don't repeat that information when moving into the identified type.
    setStepIndex(carriedAnswers['shower-inferred'] ? commonFields.length : 0)
    setValue('')
    setAnswers((previous) => ({
      postcode: previous.postcode || '',
      name: previous.name || '',
      phone: previous.phone || '',
      issue: previous.issue || '',
      ...carriedAnswers,
    }))
    setHandoff(null)
    setCopied(false)
    setDiaryConfirmed(false)
  }
  function chooseBoilerWork(item: string) {
    const diag: Record<string, string> = {
      Gas: 'gas-diagnostic',
      Oil: 'oil-diagnostic',
      LPG: 'lpg-diagnostic',
      Electric: 'electric-diagnostic',
      'Back boiler': 'back-diagnostic',
    }
    const service: Record<string, string> = {
      Gas: 'gas-service',
      Oil: 'oil-service',
      LPG: 'lpg-service',
      'Back boiler': 'back-service',
    }
    if (fuel === 'Not sure') {
      selectTopic('general-diagnostic')
      return
    }
    if (item === 'New installation') {
      selectTopic('new-boiler')
      return
    }
    if (item === 'Leaking boiler') {
      selectTopic('boiler-leak')
      return
    }
    selectTopic(
      item === 'Service'
        ? service[fuel] || 'general-diagnostic'
        : diag[fuel] || 'general-diagnostic',
    )
  }
  function routeAnswer(key: string, answer: string) {
    if (key === 'safety' && answer !== 'No') {
      setAnswers((a) => ({ ...a, [key]: answer }))
      setSafetyReturn('questions')
      setView('gas-alert')
      return
    }
    const next = { ...answers, [key]: answer }
    setAnswers(next)
    // Waste/base toilet leaks have an existing exclusion: don't keep asking
    // unrelated questions after this critical answer.
    if (
      key === 'toilet-source' &&
      (answer === 'Waste pipe at back' || answer === 'Base of toilet')
    ) {
      setView('result')
      setValue('')
      return
    }
    if (key === 'shower-type-confirm' && answer.startsWith('No /')) {
      setHandoff('photos')
      setView('result')
      setValue('')
      return
    }
    if (topic) {
      const reroute = nextTopicForAnswer(key, answer, topic)
      if (reroute) {
        selectTopic(
          reroute,
          key === 'shower-appearance' ? { 'shower-inferred': answer } : {},
        )
        return
      }
      if (key === 'shower-appearance') {
        setHandoff('photos')
        setView('result')
        setValue('')
        return
      }
    }
    if (stepIndex + 1 >= steps.length) {
      setView('result')
      setValue('')
    } else {
      setStepIndex(stepIndex + 1)
      setValue(next[steps[stepIndex + 1].key] || '')
    }
  }
  function goBack() {
    if (view === 'gas-alert') {
      setView(safetyReturn)
      return
    }
    if (view === 'result') {
      setView('questions')
      setStepIndex(steps.length - 1)
      setValue(answers[steps[steps.length - 1]?.key] || '')
      return
    }
    if (view === 'questions' && stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      setValue(answers[steps[stepIndex - 1].key] || '')
      return
    }
    if (view === 'boiler-work') {
      setView('fuel')
      return
    }
    if (view === 'fuel' || view === 'choose') {
      setView('home')
      return
    }
    if (view === 'questions') {
      setView(group === 'boilers' ? 'fuel' : 'choose')
      return
    }
    setView('home')
  }
  function reset() {
    setView('home')
    setGroup(null)
    setFuel('')
    setTopicId('')
    setStepIndex(0)
    setAnswers({})
    setValue('')
    setHandoff(null)
    setCopied(false)
    setCopiedPhotos(false)
    setDiaryConfirmed(false)
  }
  async function copy(text: string, kind: 'summary' | 'photos') {
    try {
      await navigator.clipboard.writeText(text)
      if (kind === 'summary') setCopied(true)
      else setCopiedPhotos(true)
    } catch {
      if (kind === 'summary') setCopied(false)
      else setCopiedPhotos(false)
    }
  }
  const summary = [
    'WHITFIELDOS TRIAGE — NOT A CONFIRMED BOOKING',
    'Enquiry: ' + (topic?.title || 'Not selected'),
    'Name: ' + (answers.name || 'Not supplied'),
    'Telephone: ' + (answers.phone || 'Not supplied'),
    'Postcode: ' + (answers.postcode || 'Not supplied'),
    'Issue: ' + (answers.issue || 'Not supplied'),
    ...(answers['shower-inferred']
      ? ['Shower appearance (unconfirmed): ' + answers['shower-inferred']]
      : []),
    ...steps
      .filter(
        (s) =>
          answers[s.key] &&
          !['name', 'phone', 'postcode', 'issue'].includes(s.key),
      )
      .map((s) => s.prompt + ' ' + answers[s.key]),
    decision ? 'Suggested outcome: ' + decision.title : '',
    decision?.price ? 'Indicative, not verified price: ' + decision.price : '',
    'Action: confirm with current ServiceM8 price list and diary. No booking has been made.',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="triage-app">
      <PageHeader
        title="Triage & Diagnostics"
        kicker="OPERATIONS"
        description="Call-handling decisions guided by Whitfield scripts. Click the answer, capture details and finish with a clear next step."
      />
      <div className="foundation-notice">
        <PhoneCall size={15} />
        <span>Live call guide · local only</span>
        <span className="notice-divider">/</span>
        <p>
          Decision-support, not an engineer diagnosis. No ServiceM8 sync,
          customer storage or payment capture.
        </p>
      </div>
      <section className="triage-safety-strip">
        <ShieldAlert size={19} />
        <span>
          <strong>Caller smells gas?</strong> Stop routine triage. Follow
          emergency instructions.
        </span>
        <button
          type="button"
          onClick={() => {
            setSafetyReturn(view)
            setView('gas-alert')
          }}
        >
          Gas emergency <ArrowRight size={14} />
        </button>
      </section>
      <div className="triage-top-actions">
        {view !== 'home' && (
          <button className="button secondary" onClick={goBack}>
            <ArrowLeft size={15} /> Back
          </button>
        )}
        {view !== 'home' && (
          <button className="button secondary" onClick={reset}>
            <RotateCcw size={15} /> New enquiry
          </button>
        )}
        <span className="triage-privacy">
          Details remain in this tab only · refresh to clear
        </span>
      </div>

      {view === 'home' && (
        <div className="triage-main">
          <h2>What is the customer calling about?</h2>
          <p className="tool-help">
            Start with their description — “boiler”, “leak” and “toilet” all
            lead to related scripts.
          </p>
          <div className="triage-topic-grid">
            {groups.map((item) => (
              <button
                key={item.id}
                className="triage-choice"
                type="button"
                onClick={() => chooseGroup(item.id)}
              >
                <span className="triage-choice-category">
                  {groupIcons[item.id]}
                </span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'fuel' && (
        <div className="triage-main">
          <h2>What sort of boiler is it?</h2>
          <p className="tool-help">
            Ask the customer which fuel it uses. If they don't know, choose Not
            sure and collect details for review.
          </p>
          <div className="triage-options">
            {boilerFuels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setFuel(item)
                  setView('boiler-work')
                }}
              >
                {item}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
      {view === 'boiler-work' && (
        <div className="triage-main">
          <span className="triage-eyebrow">{fuel} boiler</span>
          <h2>What does the customer need?</h2>
          <div className="triage-options">
            {boilerWork.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseBoilerWork(item)}
              >
                {item}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'choose' && group && (
        <div className="triage-main">
          <h2>
            {group === 'leaks'
              ? 'Where is the leak coming from?'
              : groups.find((g) => g.id === group)?.title}
          </h2>
          <p className="tool-help">
            Choose the closest match. If the source is unclear, use the photo or
            George handover.
          </p>
          <div className="triage-options">
            {(group === 'leaks'
              ? leakLocations.map((loc) => ({
                  ...loc,
                  id: loc.topic,
                  title: loc.label,
                }))
              : topics.filter((item) => item.group === group)
            ).map((item, i) => (
              <button
                key={item.id + '-' + i}
                type="button"
                onClick={() => selectTopic(item.id)}
              >
                {item.title}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          <button
            className="triage-inline-option"
            onClick={() => selectTopic('general-diagnostic')}
          >
            None of these — general diagnostic / refer
          </button>
        </div>
      )}

      {view === 'questions' && topic && step && (
        <div className="triage-main">
          <div className="triage-progress">
            <span>{topic.title}</span>
            <span>
              Question {stepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="triage-progress-bar">
            <span
              style={{ width: ((stepIndex + 1) / steps.length) * 100 + '%' }}
            />
          </div>
          <div className="triage-question">
            <span className="triage-eyebrow">ASK THE CALLER</span>
            <h2>{step.prompt}</h2>
            {step.options ? (
              <div className="triage-options">
                {step.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => routeAnswer(step.key, option)}
                  >
                    {option}
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  routeAnswer(step.key, value.trim() || 'Not supplied')
                }}
              >
                <input
                  autoFocus={false}
                  type={step.type || 'text'}
                  aria-label="Answer"
                  value={value}
                  placeholder="Type the caller's answer…"
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  className="button"
                  type="submit"
                  disabled={!!step.required && !value.trim()}
                >
                  Continue <ArrowRight size={15} />
                </button>
              </form>
            )}
            {!step.required && (
              <button
                className="triage-inline-option"
                type="button"
                onClick={() => routeAnswer(step.key, 'Not sure')}
              >
                Not sure / not provided — continue
              </button>
            )}
          </div>
          <div className="triage-live-help">
            <strong>Useful wording</strong>
            <p>
              {topic.group === 'showers'
                ? answers['shower-intent'] ===
                  'Repair a fault / temperature problem'
                  ? 'This is a fault enquiry, not a replacement quote. Let me take the details and arrange a review before suggesting a repair or price.'
                  : topic.id === 'shower-unknown'
                    ? 'If they do not know the shower type, ask whether they see a white wall unit, an exposed mixer bar, a large rainfall head or concealed controls. These are clues rather than confirmation; photos may be needed.'
                    : 'We have established the type of shower. Let me confirm whether the customer wants a fault assessed, an existing unit replaced, or a completely new installation before discussing prices.'
                : topic.outcome === 'diagnostic'
                  ? DISPATCH_SCRIPT
                  : topic.message || REVIEW_SCRIPT}
            </p>
          </div>
        </div>
      )}

      {view === 'gas-alert' && (
        <div className="triage-main triage-emergency" role="alert">
          <ShieldAlert size={35} />
          <span className="triage-eyebrow">STOP ROUTINE TRIAGE</span>
          <h2>Possible gas escape — immediate safety action</h2>
          <p>{GAS_SAFETY_SCRIPT}</p>
          <a href="tel:0800111999" className="button">
            Call 0800 111 999
          </a>
          <p className="tool-help">
            Do not make this an ordinary Whitfield diagnostic booking in place
            of the emergency service.
          </p>
          <button className="button secondary" type="button" onClick={reset}>
            Start a new enquiry
          </button>
        </div>
      )}

      {view === 'result' && topic && decision && (
        <div className="triage-main triage-outcome">
          <div className="triage-outcome-head">
            <ClipboardCheck size={25} />
            <div>
              <span className="triage-eyebrow">SCRIPT-GUIDED NEXT STEP</span>
              <h2>{decision.title}</h2>
            </div>
          </div>
          {decision.price && (
            <div className="triage-price">
              <span>Script price indication — ex VAT</span>
              <strong>{decision.price}</strong>
            </div>
          )}
          {(topic.priceStatus === 'review' || decision.note) && (
            <div className="triage-price-warning">
              <CircleAlert size={18} />
              <div>
                <strong>
                  Check price / script applicability before quoting
                </strong>
                <p>
                  {decision.note ||
                    'Verify with the current approved price list.'}
                </p>
              </div>
            </div>
          )}
          <p className="triage-readout">{decision.detail}</p>
          {['diagnostic', 'service', 'fixed', 'quote'].includes(
            decision.kind,
          ) && (
            <div className="triage-live-help">
              <strong>Booking / timing wording</strong>
              <p>{DISPATCH_SCRIPT}</p>
              <p>
                Confirm pricing and availability in ServiceM8. Do not tell the
                customer a job is booked until it is recorded there.
              </p>
              <label className="triage-confirmed">
                <input
                  type="checkbox"
                  checked={diaryConfirmed}
                  onChange={(event) => setDiaryConfirmed(event.target.checked)}
                />{' '}
                Diary checked: attendance TODAY is genuinely available
              </label>
              {diaryConfirmed && (
                <blockquote className="triage-call-script">
                  “Ok so I’m just looking at the diary now if I move a few
                  things around I can get an engineer to you TODAY. Yes I can
                  get an engineer to you TODAY.”
                </blockquote>
              )}
            </div>
          )}
          {decision.kind === 'decline' && (
            <div className="triage-live-help">
              <strong>Customer wording</strong>
              <p>
                I'm sorry, this looks outside the work we can confidently accept
                from the information supplied. Let me confirm the right next
                step, rather than arrange the wrong type of visit.
              </p>
            </div>
          )}
          <div className="triage-handoff-actions">
            <button
              className="button"
              onClick={() => void copy(summary, 'summary')}
            >
              {copied ? <Check size={15} /> : <Clipboard size={15} />}{' '}
              {copied ? 'Brief copied' : 'Copy enquiry / booking brief'}
            </button>
            <Link to="/call-desk" className="button secondary">
              <UserRound size={15} /> Open Call Desk
            </Link>
          </div>
          <div className="triage-brief-preview">
            <strong>Captured enquiry</strong>
            <pre>{summary}</pre>
          </div>
          <p className="tool-help">
            Source: {topic.source} · Uploaded scripts reviewed 28 October 2026.
            The source files are not stored in this public repository.
          </p>
        </div>
      )}

      {view !== 'gas-alert' && view !== 'home' && (
        <div className="triage-fallbacks">
          <h3>Need to defer this enquiry?</h3>
          <p>
            You can request photographs or refer to George at any point, even
            when a scripted path is incomplete.
          </p>
          <div className="triage-fallback-buttons">
            {photoLink ? (
              <a
                className="button secondary"
                href={photoLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setHandoff('photos')
                  setCopiedPhotos(false)
                }}
              >
                <Camera size={15} /> Request WhatsApp photos
              </a>
            ) : (
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setHandoff(handoff === 'photos' ? null : 'photos')
                }
              >
                <Camera size={15} /> Request WhatsApp photos
              </button>
            )}
            <button
              type="button"
              className="button secondary"
              onClick={() => setHandoff(handoff === 'george' ? null : 'george')}
            >
              <PhoneCall size={15} /> Refer to George
            </button>
          </div>
          {handoff && (
            <div className="triage-handoff-panel">
              <strong>
                {handoff === 'photos'
                  ? 'Read to the caller — photo request'
                  : 'Read to the caller — manager review'}
              </strong>
              <p>{handoff === 'photos' ? PHOTO_SCRIPT : REVIEW_SCRIPT}</p>
              {handoff === 'photos' && (
                <>
                  {!photoLink && (
                    <label className="triage-whatsapp-number">
                      Customer's WhatsApp number
                      <input
                        type="tel"
                        aria-label="Customer WhatsApp number"
                        value={answers.phone || ''}
                        placeholder="e.g. 07..."
                        onChange={(event) => {
                          setAnswers((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                          setCopiedPhotos(false)
                        }}
                      />
                      <small>
                        Enter the customer's number, not Whitfield's business
                        number.
                      </small>
                    </label>
                  )}
                  <div className="triage-message-preview">
                    <strong>WhatsApp message to customer</strong>
                    <p>{WHATSAPP_PHOTO_MESSAGE}</p>
                  </div>
                  <div className="triage-handoff-actions">
                    {photoLink && (
                      <a
                        className="button"
                        href={photoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={15} /> Open WhatsApp draft to
                        customer
                      </a>
                    )}
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() =>
                        void copy(WHATSAPP_PHOTO_MESSAGE, 'photos')
                      }
                    >
                      <Clipboard size={15} />
                      {copiedPhotos ? 'Message copied' : 'Copy message'}
                    </button>
                  </div>
                  <p className="tool-help">
                    WhatsApp will use whichever account is currently logged in.
                    To send from Whitfield, use the WhatsApp Business account
                    linked to {WHITFIELD_BUSINESS_WHATSAPP}. The draft is not
                    sent automatically.
                  </p>
                </>
              )}
              {topic && (
                <button
                  className="button secondary"
                  onClick={() => setView('result')}
                >
                  Complete triage with this handover <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <p className="triage-footer-warning">
        <Flame size={14} /> Never type card details into WhitfieldOS; use your
        approved payment system. Never promise attendance until the diary is
        checked.
      </p>
    </div>
  )
}
