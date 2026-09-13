const asset = name => import.meta.env.BASE_URL + 'assets/full-screen/' + name;

const dragonImg = asset('dragon.png');
const forestImg = asset('forest.png');
const shadowImg = asset('shadow.png');
const sirenImg = asset('siren.png');

// Only 4 illustrations exist so far (POC) — reused across every beat until
// dedicated art is added for each option.
const PLACEHOLDERS = [dragonImg, forestImg, shadowImg, sirenImg];
const placeholder = i => PLACEHOLDERS[i % PLACEHOLDERS.length];

export const BEATS = [
  {
    id: 'challenge',
    label: 'Challenge',
    options: [
      { id: 'challenge-external', title: 'Dragon', image: dragonImg },
      { id: 'challenge-environment', title: 'Dark Forest', image: forestImg },
      { id: 'challenge-internal', title: 'Shadow', image: shadowImg },
      { id: 'challenge-gravity', title: "Siren's Call", image: sirenImg },
    ],
  },
  {
    id: 'protagonist',
    label: 'Protagonist',
    options: [
      { id: 'protagonist-world', title: 'Torchbearer', image: placeholder(0) },
      { id: 'protagonist-role', title: 'Knight', image: placeholder(1) },
      { id: 'protagonist-wound', title: 'Exile', image: placeholder(2) },
      { id: 'protagonist-belief', title: 'Pilgrim', image: placeholder(3) },
    ],
  },
  {
    id: 'shift',
    label: 'Shift',
    options: [
      { id: 'shift-broke', title: 'Something Broke', image: placeholder(0) },
      { id: 'shift-accumulated', title: 'An Accumulation', image: placeholder(1) },
      { id: 'shift-revealed', title: 'A Revelation', image: placeholder(2) },
      { id: 'shift-drifted', title: 'A Drifting', image: placeholder(3) },
    ],
  },
  {
    id: 'quest',
    label: 'Quest',
    options: [
      { id: 'quest-escape', title: 'Escape', image: placeholder(0) },
      { id: 'quest-becoming', title: 'Becoming', image: placeholder(1) },
      { id: 'quest-justice', title: 'Purpose', image: placeholder(2) },
      { id: 'quest-belonging', title: 'Belonging', image: placeholder(3) },
    ],
  },
  {
    id: 'allies',
    label: 'Allies',
    options: [
      { id: 'allies-reflects', title: 'An Oracle', image: placeholder(0) },
      { id: 'allies-expands', title: 'A Pathfinder', image: placeholder(1) },
      { id: 'allies-holds', title: 'A Hearth', image: placeholder(2) },
    ],
  },
  {
    id: 'transformation',
    label: 'Transformation',
    options: [
      { id: 'transformation-rupture', title: 'Release', image: placeholder(0) },
      { id: 'transformation-integration', title: 'Integration', image: placeholder(1) },
      { id: 'transformation-contact', title: 'Contact', image: placeholder(2) },
      { id: 'transformation-loss', title: 'Forging', image: placeholder(3) },
    ],
  },
  {
    id: 'legacy',
    label: 'Legacy',
    options: [
      { id: 'legacy-healing', title: 'Healing', image: placeholder(0) },
      { id: 'legacy-witnessing', title: 'Witnessing', image: placeholder(1) },
      { id: 'legacy-creating', title: 'Creating', image: placeholder(2) },
      { id: 'legacy-resisting', title: 'Resisting', image: placeholder(3) },
    ],
  },
];

// Poetic line + placement for each illustration's empty space, keyed by image src.
export const BEAT_CAPTIONS = {
  [dragonImg]: {
    text: 'Some fears only loosen their grip once you finally turn and face the dragon.',
    top: '38%',
    left: '60%',
    width: '34%',
    align: 'left',
    color: 'var(--ink)',
    shadow: '0 1px 4px rgba(255, 255, 255, 0.7)',
  },
  [forestImg]: {
    text: "The lantern couldn't clear the whole forest — it only had to light the very next step.",
    top: '12%',
    left: '5%',
    width: '36%',
    align: 'left',
    color: '#f3ede0',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
  },
  [shadowImg]: {
    text: "The shadow behind me had been mine all along — I'd just never sat still long enough to see it.",
    top: '30%',
    left: '60%',
    width: '34%',
    align: 'left',
    color: '#f3ede0',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
  },
  [sirenImg]: {
    text: "I kept answering the siren's call, reaching for a light that always drifted just out of reach.",
    top: '55%',
    left: '56%',
    width: '38%',
    align: 'left',
    color: '#f3ede0',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
  },
};

export const beatOptionMap = new Map(
  BEATS.flatMap(category =>
    category.options.map(option => [
      option.id,
      { ...option, categoryId: category.id, categoryLabel: category.label },
    ]),
  ),
);
