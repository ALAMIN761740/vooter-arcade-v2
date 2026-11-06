export interface LocalizedString {
  bn: string;
  en: string;
}

export const STR = {
  bn: {
    title: 'ভোটের ফাঁদ',
    subtitle: 'ভোট দিতে যাওয়া এত সহজ না!',
    tagline: 'ছোট্ট ভোটার ভোটু ভোটকেন্দ্রে পৌঁছাতে পারবে তো? প্রতিটা পদক্ষেপে ফাঁদ!',
    rulesTitle: 'খেলার নিয়ম',
    rules: [
      ['🎯', 'লক্ষ্য', 'ভোটুকে ফাঁদ এড়িয়ে ভোটকেন্দ্রে (সবুজ বাতিওয়ালা ব্যালট বাক্স) পৌঁছে দাও।'],
      ['🎮', 'চালনা', 'ডানে-বামে: ← → অথবা A D। লাফ: ↑ / W / স্পেস (লম্বা চাপলে উঁচু লাফ)। মোবাইলে স্ক্রিনের বাটন।'],
      ['⚠️', 'কাউকে বিশ্বাস নেই', 'মেঝে ভেঙে পড়তে পারে, কাঁটা হঠাৎ গজাতে পারে, ইট আকাশ থেকে ঝরতে পারে। কিছু মেঝে আসলে আছেই না!'],
      ['🗳️', 'ব্যালট ও তারা', 'প্রতি লেভেলে ৩টি ব্যালট লুকিয়ে আছে। সবগুলো তুললে ৩ তারা — তবে প্রাণ বাজি রেখে!'],
      ['👞', 'ক্যাডার', 'ক্যাডারের গায়ে লাগলে মৃত্যু। কিন্তু মাথায় লাফ দিয়ে পড়লে সে কাবু!'],
      ['💀', 'মরলে ভয় নেই', 'সঙ্গে সঙ্গে আবার শুরু। যেখানে মরেছ সেখানে সমাধি-চিহ্ন থাকবে — সেখান থেকেই শিক্ষা নাও।'],
      ['🚪', 'সব দরজা আসল নয়', 'ভুয়া কেন্দ্র থেকে সাবধান! আসল কেন্দ্রের বাতি সবুজ।'],
    ],
    disclaimer: 'এটি সম্পূর্ণ কাল্পনিক ব্যঙ্গাত্মক খেলা। কোনো প্রকৃত ব্যক্তি, দল বা প্রতিষ্ঠানের সাথে এর সম্পর্ক নেই।',
    understood: 'বুঝেছি — শুরু করি!',
    levelSelect: 'লেভেল বেছে নাও',
    level: 'লেভেল',
    locked: 'বন্ধ',
    deaths: 'মৃত্যু',
    time: 'সময়',
    ballots: 'ব্যালট',
    pause: 'বিরতি',
    paused: 'খেলা থেমে আছে',
    resume: 'চালিয়ে যাও',
    restart: 'আবার শুরু',
    menu: 'লেভেল তালিকা',
    next: 'পরের লেভেল ▶',
    replay: 'আবার খেলি',
    cleared: 'কেন্দ্রে পৌঁছেছ!',
    allDone: 'অভিনন্দন! সব কেন্দ্রে ভোট দেওয়া হলো!',
    endText: 'ফলাফল ঘোষণা: ভোটার জিতেছে। (ফলাফল পুনর্গণনা চলছে…)',
    totalDeaths: 'মোট মৃত্যু',
    rules_btn: 'নিয়ম',
    mute: 'শব্দ বন্ধ',
    unmute: 'শব্দ চালু',
    lang: 'English',
    touchHint: 'কিবোর্ড: ← → ও ↑ / স্পেস',
    best: 'সেরা',
    resetProgress: 'অগ্রগতি মুছে ফেলো',
  },
  en: {
    title: 'Ballot Trap',
    subtitle: 'Going to vote was never this easy!',
    tagline: 'Can little voter Vootu reach the polling center? Every step is a trap!',
    rulesTitle: 'How to Play',
    rules: [
      ['🎯', 'Goal', 'Guide Vootu past the traps to the polling center (the ballot box with the green lamp).'],
      ['🎮', 'Controls', 'Move: ← → or A D. Jump: ↑ / W / Space (hold for a higher jump). On mobile, use the on-screen buttons.'],
      ['⚠️', 'Trust no one', 'Floors can crumble, spikes can pop up, bricks can rain down. Some floors are not even there!'],
      ['🗳️', 'Ballots & stars', 'Each level hides 3 ballots. Collect all for 3 stars — at your own risk!'],
      ['👞', 'Cadres', 'Touching a cadre is deadly. But land on their head and they are done for!'],
      ['💀', 'Dying is fine', 'You restart instantly. A grave marks where you fell — learn from it.'],
      ['🚪', 'Not every door is real', 'Beware of fake centers! The real one has a green lamp.'],
    ],
    disclaimer: 'This is a purely fictional satirical game. It has no connection to any real person, party or organization.',
    understood: 'Got it — let’s go!',
    levelSelect: 'Choose a level',
    level: 'Level',
    locked: 'Locked',
    deaths: 'Deaths',
    time: 'Time',
    ballots: 'Ballots',
    pause: 'Pause',
    paused: 'Game paused',
    resume: 'Resume',
    restart: 'Restart',
    menu: 'Levels',
    next: 'Next level ▶',
    replay: 'Play again',
    cleared: 'Center reached!',
    allDone: 'Congratulations! You voted at every center!',
    endText: 'Result: the voter wins. (A recount is underway…)',
    totalDeaths: 'Total deaths',
    rules_btn: 'Rules',
    mute: 'Mute',
    unmute: 'Unmute',
    lang: 'বাংলা',
    touchHint: 'Keyboard: ← → and ↑ / Space',
    best: 'Best',
    resetProgress: 'Reset progress',
  },
};

export const DEATH: Record<string, LocalizedString[]> = {
  pit: [
    { bn: 'প্রতিশ্রুতি ছিল সেতুর — পেলেন গর্ত!', en: 'Promised: a bridge. Delivered: a hole.' },
    { bn: 'এই মেঝেটা শুধু কাগজে ছিল।', en: 'That floor only existed on paper.' },
  ],
  spike: [
    { bn: 'কাঁটা ছিল না? এখন আছে!', en: 'No spikes there? There are now.' },
    { bn: 'উন্নয়নের কাঁটা — হঠাৎ গজায়!', en: 'Development spikes — they sprout overnight!' },
  ],
  drop: [
    { bn: 'ইট খসে পড়ল — উন্নয়নের আওয়াজ!', en: 'A brick fell — the sound of progress!' },
    { bn: 'ওপরে তাকিয়ে চলুন, ভাই!', en: 'Always look up, friend!' },
  ],
  walker: [
    { bn: 'ক্যাডারের সাথে মোলাকাত — ভালো লাগেনি।', en: 'Met a cadre. It did not go well.' },
    { bn: 'মাথায় লাফ দিন, গায়ে না!', en: 'Jump on the head, not the shoulder!' },
  ],
  brick: [
    { bn: 'ইট-পাটকেল: হরতালের ডাক!', en: 'Flying bricks: the hartal calls!' },
    { bn: 'ব্যারিকেডের আড়ালে লুকাও!', en: 'Hide behind the barricades!' },
  ],
  water: [
    { bn: 'বানের পানিতে ভেসে গেলেন।', en: 'Swept away by the flood.' },
    { bn: 'ত্রাণ এখনও আসেনি…', en: 'The relief hasn’t arrived yet…' },
  ],
  fakedoor: [
    { bn: 'ভুয়া কেন্দ্র! সব দরজা আসল নয়।', en: 'A fake center! Not every door is real.' },
    { bn: 'লাল বাতি মানেই বিপদ!', en: 'A red lamp means trouble!' },
  ],
  generic: [{ bn: 'আবার চেষ্টা করুন — ভোট আপনার অধিকার।', en: 'Try again — your vote is your right.' }],
};

export function pickDeath(cause: string, n: number): LocalizedString {
  const list = DEATH[cause] || DEATH.generic;
  return list[n % list.length];
}
