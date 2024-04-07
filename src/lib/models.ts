export type UseCaseItem = {
  title: string;
  description: string;
  btn: {text: string; disabled: boolean};
  imgSources: string[];
  position: 'left' | 'right';
};

export type PricingPlanItem = {
  title: string;
  price: string;
  benefits: string[];
  btn: {text: string; disabled: boolean};
};

export type FAQItem = {
  question: string;
  answer: string;
};
