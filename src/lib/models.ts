export type UseCaseItem = {
  title: string;
  description: string;
  isReady: boolean;
  btn?: {text: string};
  imgSource: string;
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

export type StatusItem = {
  isReady: boolean;
};
