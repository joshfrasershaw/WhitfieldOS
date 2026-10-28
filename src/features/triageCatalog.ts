/** Curated decision-support index derived from Whitfield call scripts.
 * Original source documents and full internal playbooks are NOT committed to this public repository.
 * Displayed prices are indications only, always subject to confirmation in ServiceM8/current price list.
 */
export type GroupId =
  | 'boilers'
  | 'leaks'
  | 'toilets'
  | 'taps'
  | 'radiators'
  | 'showers'
  | 'services'
  | 'installations'
  | 'controls'
  | 'other'
export type OutcomeId =
  'diagnostic' | 'service' | 'fixed' | 'quote' | 'photos' | 'george' | 'decline'
export type Topic = {
  id: string
  title: string
  group: GroupId
  source: string
  outcome: OutcomeId
  price?: string
  priceStatus?: 'review'
  questions?: string[]
  message?: string
  note?: string
}
type Short = [
  id: string,
  title: string,
  source: string,
  outcome: OutcomeId,
  price?: string,
  questions?: string[],
  message?: string,
  note?: string,
]
function entries(group: GroupId, items: Short[]): Topic[] {
  return items.map(
    ([id, title, source, outcome, price, questions, message, note]) => ({
      id,
      title,
      group,
      source,
      outcome,
      price,
      questions,
      message,
      note,
      priceStatus:
        id === 'gas-service' ||
        id === 'kitchen-tap' ||
        id === 'kitchen-tap-leak'
          ? 'review'
          : undefined,
    }),
  )
}
const diagnosticQuestions = [
  'What is the boiler make and model?',
  'Do you have an error or fault code?',
  'Is it a combi or regular boiler with a hot water cylinder?',
  'How old is it and when did it last work?',
  'Did Whitfield install it? If so, when?',
]
const serviceQuestions = [
  'Is the appliance currently working correctly?',
  'How old is it?',
  'What make and model is it?',
  'When would you like the service?',
  'Would you like any other appliances serviced at the same time?',
]
const leakQuestions = [
  'Can you see exactly where the water is coming from?',
  'Is the leak continuous or only when the fitting is used?',
  'Can the water be isolated safely?',
  'Is it urgent or causing damage?',
]
const tapQuestions = [
  'How old are the taps: 1–5 years, 5–10 years or older?',
  'Mixer tap or two individual taps?',
  'Do they fit through one or two holes?',
  'Quarter-turn lever or multi-turn handles?',
  'Is the customer asking for repair or replacement?',
]
const installQuestions = [
  'What would you like installed or replaced?',
  'What is currently in place?',
  'Where is it located and is access straightforward?',
  'When were you hoping to have the work done?',
]
const normalDiagnostic =
  'We would arrange a diagnostic visit to investigate the fault. The script includes the first hour of labour; additional parts or labour would be estimated separately. Let me check the diary before offering an appointment.'
const newInstall =
  'Thank you. I will pass the details to George for an installation assessment and a discussion about prices and availability. I will confirm his availability rather than promise a callback time.'
export const groups: Array<{
  id: GroupId
  title: string
  description: string
}> = [
  {
    id: 'boilers',
    title: 'Boilers & faults',
    description: 'Faults, fuel type, leaks and diagnostics',
  },
  {
    id: 'leaks',
    title: 'Leaks',
    description: 'Find the source and check urgency',
  },
  {
    id: 'toilets',
    title: 'Toilets',
    description: 'Leaking, blocked, flushing and installation',
  },
  {
    id: 'taps',
    title: 'Taps',
    description: 'Kitchen, bath, basin and outdoor taps',
  },
  {
    id: 'radiators',
    title: 'Radiators & heating',
    description: 'Cold or leaking radiators and power flushing',
  },
  {
    id: 'showers',
    title: 'Showers',
    description: 'Electric, mixer and rainfall installations',
  },
  {
    id: 'services',
    title: 'Servicing',
    description: 'Boilers, cylinders, fires, air conditioning and more',
  },
  {
    id: 'installations',
    title: 'New installations',
    description: 'Boilers, air conditioning, cylinders and other work',
  },
  {
    id: 'controls',
    title: 'Heating controls',
    description: 'Thermostats, programmers and Hive',
  },
  {
    id: 'other',
    title: 'Other enquiries',
    description: 'General, pumps and specialist requests',
  },
]
export const topics: Topic[] = [
  ...entries('boilers', [
    [
      'gas-diagnostic',
      'Gas boiler fault',
      'Diagnostics/Gas Boiler Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      diagnosticQuestions,
      normalDiagnostic,
    ],
    [
      'oil-diagnostic',
      'Oil boiler fault',
      'Diagnostics/Oil Boiler Diagnostic .docx',
      'diagnostic',
      '£199 + VAT',
      diagnosticQuestions,
      normalDiagnostic,
    ],
    [
      'lpg-diagnostic',
      'LPG boiler fault',
      'Diagnostics/LPG Boiler Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      diagnosticQuestions,
      normalDiagnostic,
    ],
    [
      'electric-diagnostic',
      'Electric boiler fault',
      'Diagnostics/Electric Boiler Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      diagnosticQuestions,
      normalDiagnostic,
    ],
    [
      'back-diagnostic',
      'Back boiler fault',
      'Diagnostics/Back Boiler Diagnostic.docx',
      'diagnostic',
      '£299 + VAT',
      diagnosticQuestions,
      normalDiagnostic,
    ],
    [
      'gas-fire-diagnostic',
      'Gas fire fault',
      'Diagnostics/Gas Fire Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'What make and model is the fire?',
        'What fault is occurring?',
        'How old is the fire?',
      ],
      normalDiagnostic,
    ],
    [
      'heat-pump-diagnostic',
      'Air source heat pump fault',
      'Diagnostics/Air Source Heat Pump Diagnostic.docx',
      'george',
      undefined,
      [
        'What make/model is the heat pump?',
        'What fault or code is displayed?',
        'When did it last work?',
      ],
      'Let me take the details and refer this to George for advice before quoting or booking.',
    ],
    [
      'noise-diagnostic',
      'Whistling, banging or groaning',
      'Diagnostics/Whistling Banging Groaning Noise.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'Where is the noise coming from?',
        'When does it happen: heating, hot water or both?',
        'Any fault codes?',
      ],
      normalDiagnostic,
    ],
    [
      'general-diagnostic',
      'Other diagnostic',
      'Diagnostics/Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'Which appliance is affected?',
        'What is happening?',
        'Any error codes?',
      ],
      normalDiagnostic,
    ],
  ]),
  ...entries('leaks', [
    [
      'water-emergency',
      'Urgent water leak',
      'Leaks/Emergency Water Leak.docx',
      'photos',
      undefined,
      leakQuestions,
      'If safe, turn off the water at the main stop tap to limit damage. Let me identify where the leak is coming from before arranging anything.',
    ],
    [
      'gas-emergency',
      'Suspected gas leak',
      'Leaks/Emergency Gas Leak.docx',
      'decline',
      undefined,
      ['Can anyone smell gas?'],
      'Suspected gas escape: leave the building and call the National Gas Emergency Service on 0800 111 999. Do not operate electrical switches or use naked flames.',
    ],
    [
      'boiler-leak',
      'Leaking boiler',
      'Leaks/Leak Boiler Gas Oil LPG Electric.docx',
      'diagnostic',
      '£199 + VAT',
      [
        ...leakQuestions,
        'Gas, oil, LPG or electric boiler?',
        'Did Whitfield install it, and when?',
      ],
      normalDiagnostic,
    ],
    [
      'cylinder-leak',
      'Leaking hot water cylinder',
      'Leaks/Leak Hot Water Cylinder.docx',
      'diagnostic',
      '£199 + VAT',
      leakQuestions,
      normalDiagnostic,
    ],
    [
      'unvented-leak',
      'Leaking unvented cylinder',
      'Leaks/Leak Unvented Cylinder.docx',
      'diagnostic',
      '£199 + VAT',
      leakQuestions,
      normalDiagnostic,
    ],
    [
      'water-heater-leak',
      'Leaking water heater',
      'Leaks/Leak Hot Water Heater.docx',
      'diagnostic',
      '£199 + VAT',
      leakQuestions,
      normalDiagnostic,
    ],
    [
      'radiator-leak',
      'Leaking radiator or valve',
      'Leaks/Leak Radiator.docx',
      'diagnostic',
      '£199 + VAT',
      [
        ...leakQuestions,
        'Upstairs or downstairs?',
        'Carpet or hard flooring?',
        'Combi or cylinder system?',
      ],
      normalDiagnostic,
    ],
    [
      'toilet-leak',
      'Leaking toilet',
      'Leaks/Leak Toilet.docx',
      'diagnostic',
      '£199 + VAT',
      [...leakQuestions, 'Exposed toilet or concealed cistern?'],
      normalDiagnostic,
    ],
    [
      'concealed-toilet-leak',
      'Leaking concealed toilet',
      'Leaks/Leak Toilet Built In Cupboard Conceal.docx',
      'george',
      undefined,
      leakQuestions,
      'We need clear photographs and George to review the access and source before accepting this work.',
    ],
    [
      'kitchen-tap-leak',
      'Leaking kitchen tap',
      'Leaks/Leak Kitchen Tap .docx',
      'fixed',
      '£390 + VAT',
      [...leakQuestions, ...tapQuestions],
      'We can discuss supplying and fitting a replacement kitchen tap, subject to confirming the current price and suitability.',
      'Current verbal figure is £390 + VAT; uploaded leak script says £290 + VAT. Verify before quoting.',
    ],
  ]),
  ...entries('toilets', [
    [
      'toilet-leak-main',
      'Leaking exposed toilet',
      'Toilets/Leaking Toilet.docx',
      'diagnostic',
      '£199 + VAT',
      [
        ...leakQuestions,
        'Is the toilet exposed or concealed?',
        'Is the leak from the waste pipe, supply pipe, or base?',
      ],
      normalDiagnostic,
    ],
    [
      'toilet-repair',
      'Not flushing or filling',
      'Toilets/Toilet Repair.docx',
      'fixed',
      '£190–£250 + VAT',
      [
        'Is the cistern exposed or concealed?',
        'Is it overflowing, not filling, or not flushing?',
        'Is water leaking onto the floor?',
        'Is the toilet blocked?',
      ],
      'The script gives an indicative range of £190–£250 + VAT depending on the parts required.',
    ],
    [
      'toilet-concealed',
      'Concealed toilet or cistern',
      'Toilets/Concealed Toilet Diagnostic.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'Is the cistern behind tiles or in a cupboard?',
        'Is the leak from the base or into a ceiling?',
        'Is there an access panel?',
      ],
      'Concealed access needs review; some leaks and inaccessible configurations are declined under the scripts.',
    ],
    [
      'toilet-blocked',
      'Blocked toilet',
      'Toilets/Blocked Toilet.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'How long has it been blocked?',
        'Was it blocked by anything other than tissue?',
        'Is it leaking or concealed?',
      ],
      normalDiagnostic,
    ],
    [
      'toilet-install',
      'New toilet installation',
      'Toilets/Toilet Install.docx',
      'quote',
      undefined,
      [
        'How old is the existing toilet?',
        'Is it an exposed or concealed installation?',
        'Is the position changing?',
      ],
      'Let me take the details and check the suitability before confirming a price.',
    ],
  ]),
  ...entries('taps', [
    [
      'kitchen-tap',
      'Kitchen tap replacement / repair',
      'Taps Repair & Replace/Kitchen Taps.docx',
      'fixed',
      '£390 + VAT',
      tapQuestions,
      'We can discuss replacing the kitchen tap with a suitable quality option, subject to confirming the current price.',
      'Current verbal figure is £390 + VAT; uploaded script says £290 + VAT. Verify before quoting.',
    ],
    [
      'bath-taps',
      'Bath tap replacement',
      'Taps Repair & Replace/Bath Taps.docx',
      'fixed',
      '£290 + VAT',
      tapQuestions,
      'We can offer suitable bath tap replacements. Access and any desire to match existing tap designs should be reviewed.',
    ],
    [
      'basin-taps',
      'Basin tap replacement',
      'Taps Repair & Replace/Basin Taps .docx',
      'fixed',
      '£190 + VAT',
      tapQuestions,
      'We can discuss replacement taps and check the fixing and access before arranging a visit.',
    ],
    [
      'outdoor-tap',
      'Outdoor tap installation / replacement',
      'Taps Repair & Replace/Outdoor Tap Install.docx',
      'fixed',
      '£199 + VAT',
      [
        'Is this a new outside tap or replacement of an existing one?',
        'Can the tap be placed outside the kitchen sink wall?',
        'Is there access to the supply pipe?',
      ],
      'New outdoor tap: £199 + VAT in the script. Replacement only: £99 + VAT. Confirm which applies.',
    ],
  ]),
  ...entries('radiators', [
    [
      'radiator-cold',
      'Cold radiators',
      'Radiators/Cold Radiators.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'How many radiators are there in total, and how many are cold?',
        'Is the boiler working normally?',
        'Gas, oil or LPG boiler?',
        'Are any fault codes displayed?',
      ],
      normalDiagnostic,
    ],
    [
      'radiator-new',
      'New radiator installation',
      'Radiators/New Radiators Install.docx',
      'quote',
      undefined,
      [
        'How many radiators are being fitted?',
        'Where are they located?',
        'Are existing radiators being replaced?',
      ],
      newInstall,
    ],
    [
      'radiator-leaking',
      'Leaking radiator',
      'Radiators/Leaking Radiator.docx',
      'diagnostic',
      '£199 + VAT',
      [...leakQuestions, 'Which room and floor?', 'Carpet or hard flooring?'],
      'A diagnostic visit can investigate a leaking radiator. Parts or additional work would be quoted separately.',
    ],
    [
      'powerflush',
      'Power flush enquiry',
      'Powerflushing/Powerflush Enquiry.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'What problem is the heating system showing?',
        'How many radiators are affected?',
        'Any error codes?',
        'Gas, oil or LPG boiler?',
      ],
      'The script recommends a diagnostic first rather than committing to a power flush. Other work would be estimated after assessment.',
    ],
    [
      'underfloor-diagnostic',
      'Underfloor heating fault',
      'Diagnostics/Underfloor Diagnosis.docx',
      'diagnostic',
      '£199 + VAT',
      [
        'Is the underfloor heating electric or wet?',
        'Which zones are affected?',
        'Is the boiler functioning normally?',
      ],
      normalDiagnostic,
    ],
  ]),
  ...entries('showers', [
    [
      'electric-shower',
      'Electric shower installation',
      'Showers/Electric Shower Install.docx',
      'fixed',
      '£290 + VAT',
      [
        'Is the existing shower electric or mixer?',
        'Is it a white box mounted on the wall?',
        'Is the shower concealed behind tiles?',
        'Is there a large rainfall head?',
      ],
      'An electric shower replacement is listed at £290 + VAT in the script, subject to suitability.',
    ],
    [
      'rainfall-shower',
      'Rainfall / waterfall shower',
      'Showers/Waterfall Rainfall Shower Install.docx',
      'fixed',
      '£490 + VAT',
      [
        'Is the shower electric or mixer?',
        'Is the mixer bar visible or concealed?',
        'Does it have a large rainfall head?',
        'Are photographs available?',
      ],
      'The script lists £490 + VAT for a rainfall installation, subject to the existing setup.',
    ],
    [
      'shower-pump',
      'Low water pressure / shower pump',
      'Shower Pump.docx',
      'photos',
      undefined,
      [
        'Which outlets have low pressure?',
        'Do you have a gravity-fed tank or a pressurised system?',
      ],
      'Let me obtain photos/details of the current arrangement and refer this for review.',
    ],
  ]),
  ...entries('services', [
    [
      'gas-service',
      'Gas boiler service',
      'Servicing/Gas Boiler Service.docx',
      'service',
      '£249 + VAT',
      serviceQuestions,
      'A full strip-down and cleaning service with flue gas and safety checks, as appropriate. Let me check availability and confirm the current price.',
      'Uploaded script states £179 + VAT; later operations price is £249 + VAT. Manager confirmation required.',
    ],
    [
      'oil-service',
      'Oil boiler service',
      'Servicing/Oil Boiler Service.docx',
      'service',
      '£249 + VAT',
      serviceQuestions,
      'The oil service script includes cleaning, nozzle inspection/replacement as required, flue gas analysis and a service certificate.',
    ],
    [
      'lpg-service',
      'LPG boiler service',
      'Servicing/LPG Boiler Service.docx',
      'service',
      '£199 + VAT',
      serviceQuestions,
      'Let me check availability for an LPG boiler service.',
    ],
    [
      'back-service',
      'Gas back boiler service',
      'Servicing/Gas Back boiler Service.docx',
      'service',
      '£299 + VAT',
      serviceQuestions,
      'This includes the built-in fire according to the script, subject to engineer review.',
    ],
    [
      'gas-fire-service',
      'Gas fire service',
      'Servicing/Gas Fire Service.docx',
      'service',
      '£179 + VAT',
      serviceQuestions,
      'Let me check availability for the fire service.',
    ],
    [
      'aircon-service',
      'Air conditioning service',
      'Servicing/Air Conditioning Service.docx',
      'service',
      '£179 + VAT',
      [
        'Is the system working normally?',
        'How many indoor and outdoor units are there?',
        'What make and age are the units?',
      ],
      'Let me check the number of units and current service pricing before quoting.',
    ],
    [
      'heat-pump-service',
      'Air source heat pump service',
      'Servicing/Air Source Heat Pump Service.docx',
      'service',
      '£399 + VAT',
      serviceQuestions,
      'Let me check heat pump servicing arrangements and availability.',
    ],
    [
      'unvented-service',
      'Unvented cylinder service',
      'Servicing/Unvented Cylinder Service.docx',
      'service',
      '£179 + VAT',
      serviceQuestions,
      'Let me check the cylinder type, make and service availability.',
    ],
    [
      'underfloor-service',
      'Underfloor heating service',
      'Servicing/Underfloor Heating Service.docx',
      'service',
      '£199 + VAT per floor',
      [
        'Does the underfloor system work normally?',
        'Is it upstairs, downstairs or both?',
        'What heat source serves it?',
      ],
      'The uploaded script lists £199 + VAT per floor.',
    ],
    [
      'cooker-service',
      'Gas cooker safety check',
      'Servicing/Gas Cooker Safety Check.docx',
      'service',
      '£149 + VAT',
      [
        'Is the appliance gas or LPG?',
        'Is it working properly?',
        'Will this be alongside another appliance service?',
      ],
      'Standalone safety check: £149 + VAT; additional appliance alongside servicing: £49 + VAT in the script. Oil cookers and cooker repairs are not covered.',
    ],
    [
      'homebuyer',
      'Home buyer report',
      'Servicing/Home Buyers Report.docx',
      'quote',
      undefined,
      [
        'Which appliances require inspection?',
        'How many bedrooms and bathrooms?',
        'What heating fuel and boiler type?',
      ],
      'Let me take the property details and confirm the inspection scope and quote.',
    ],
  ]),
  ...entries('installations', [
    [
      'new-boiler',
      'New boiler installation',
      'New Install Enquiries/New Boiler Install Gas LPG Oil.docx',
      'george',
      undefined,
      [
        'Is the existing boiler gas, LPG or oil?',
        'Combi or cylinder system?',
        'What new installation would you like?',
        'When do you need the work?',
      ],
      newInstall,
    ],
    [
      'new-aircon',
      'New air conditioning installation',
      'New Install Enquiries/New Air Conditioning.docx',
      'george',
      undefined,
      [
        'How many rooms need air conditioning?',
        'What are the room sizes and locations?',
        'When would you like it installed?',
      ],
      newInstall,
    ],
    [
      'new-cylinder',
      'New hot water cylinder',
      'New Install Enquiries/New Hot Water Cylinder Install.docx',
      'george',
      undefined,
      installQuestions,
      newInstall,
    ],
    [
      'new-unvented',
      'New unvented cylinder',
      'New Install Enquiries/New Unvented HW Cylinder.docx',
      'george',
      undefined,
      installQuestions,
      newInstall,
    ],
    [
      'new-heatpump',
      'New air source heat pump',
      'New Install Enquiries/New Air Source Heat Pump.docx',
      'george',
      undefined,
      installQuestions,
      newInstall,
    ],
    [
      'new-immersion',
      'New immersion heater',
      'New Install Enquiries/New Immersion Heater.docx',
      'photos',
      undefined,
      [
        'Is the hot water working currently?',
        'Can you send a photo of the cylinder and immersion arrangement?',
        'When is the work required?',
      ],
      'Please send clear photographs of the existing cylinder and immersion heater for review.',
    ],
    [
      'new-softener',
      'New water softener',
      'New Install Enquiries/New Water Softener.docx',
      'quote',
      undefined,
      installQuestions,
      newInstall,
    ],
    [
      'new-underfloor',
      'New underfloor heating installation',
      'New Install Enquiries/New Underfloor Heating .docx',
      'quote',
      undefined,
      [
        'Electric or wet underfloor heating?',
        'Approximate area and rooms?',
        'What is the current heating source?',
        'When is the work planned?',
      ],
      newInstall,
    ],
    [
      'new-oiltank',
      'Replacement oil tank',
      'Replacement Oil Tank Installation/Replacement Oil Tank Installation.docx',
      'george',
      undefined,
      [
        'What is the existing tank type and location?',
        'What capacity is required?',
        'Is access available for removal and fitting?',
      ],
      newInstall,
    ],
  ]),
  ...entries('controls', [
    [
      'hive',
      'Hive smart thermostat',
      'Hive Smart Thermostat/New Hive Smart Thermostat.docx',
      'fixed',
      '£490 + VAT',
      [
        'Does the property currently have a room thermostat?',
        'Is hot water controlled separately?',
        'Gas, oil or LPG boiler?',
      ],
      'The uploaded script lists £490 + VAT for the Hive installation, subject to compatibility.',
    ],
    [
      'wireless-thermostat',
      'Wireless room thermostat',
      'Wireless Thermostat Progr/New Wireless Thermostat.docx',
      'fixed',
      '£390 + VAT',
      [
        'What heating system is present?',
        'What make and type is the existing thermostat?',
        'Is the current thermostat wired or wireless?',
      ],
      'The uploaded script lists £390 + VAT, subject to compatibility.',
    ],
    [
      'wired-thermostat',
      'Wired room thermostat',
      'Wired Thermostat Programmers/New Wired Room Thermostat .docx',
      'fixed',
      '£290 + VAT',
      [
        'What heating system is present?',
        'Can you describe or photograph the existing thermostat?',
      ],
      'The uploaded script lists £290 + VAT, subject to compatibility.',
    ],
    [
      'programmer',
      'New heating programmer',
      'Wired Thermostat Programmers/New Programmer .docx',
      'fixed',
      '£290 + VAT',
      [
        'What is the current programmer make/model?',
        'What functions are not working?',
      ],
      'The uploaded script lists £290 + VAT, subject to compatibility.',
    ],
  ]),
  ...entries('other', [
    [
      'remove-fire',
      'Remove existing gas fire',
      'Removing Fire.docx',
      'quote',
      undefined,
      [
        'Why is the fire being removed?',
        'Is it connected to a back boiler?',
        'Can you send pictures of the installation?',
      ],
      'Let me take the details and check engineer suitability before accepting.',
    ],
    [
      'bathroom-refit',
      'Bathroom refurbishment',
      'Bathroom Refits.docx',
      'george',
      undefined,
      [
        'What work and budget are you considering?',
        'What timeframe are you working to?',
      ],
      'Please confirm current bathroom-refit capacity; the uploaded script has outdated dates.',
    ],
  ]),
]
export const topicById = new Map(topics.map((topic) => [topic.id, topic]))
export const PHOTO_SCRIPT =
  'Would you mind sending us a close-up photograph of the problem and a wider photograph showing the surrounding working area on WhatsApp? Please include a description of the issue and confirm your postcode so that whoever picks this up has the full context.'
export const REVIEW_SCRIPT =
  'I would like George to have a look at the details before I give you the wrong information. I can take the information and arrange for it to be reviewed.'
export const DISPATCH_SCRIPT =
  'I am checking our diary now. If we can rearrange the schedule, we may be able to arrange attendance today; otherwise I will confirm the earliest available appointment. I will not confirm a time until the diary has been checked.'
export const GAS_SAFETY_SCRIPT =
  'If you smell gas or suspect an escape, leave the property and call the National Gas Emergency Service on 0800 111 999 from a safe place. Do not use electrical switches, naked flames or attempt to investigate. Do not wait for Whitfield to attend.'
