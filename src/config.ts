/** Single place for the things you'll want to edit. */
export const site = {
  name: 'Chai Overflow',
  tagline: 'Chai experiments, tastings and the science behind the cup.',
  description: 'Chai experiments, blend tastings and the science behind the cup.',
  contactEmail: 'hello@example.com', // PLACEHOLDER — replace with a real address
};

export const product = {
  name: 'Chai Overflow Masala', // PLACEHOLDER
  size: '', // e.g. '100 g tin' — hidden until filled in
  price: '', // e.g. '$12' — hidden until filled in
  ingredients: '', // e.g. 'Cardamom, ginger, …' — hidden until filled in
  /** Paste your Stripe Payment Link here (https://buy.stripe.com/...). While empty, the button shows "Coming soon". */
  stripeUrl: '',
};

export const nav = [
  { href: 'calculator', label: 'Calculator' },
  { href: 'shop', label: 'Masala' },
  { href: 'about', label: 'About' },
];
