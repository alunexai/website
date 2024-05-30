export type UseCaseItem = {
  title: string;
  description: string;
  isReady: boolean;
  btn?: {text: string};
  imgSrc: object;
  position: 'left' | 'right';
};

export type PricingPlanItem = {
  title: string;
  price: string | undefined;
  isReady: boolean;
  benefits: string[];
  btn: {text: string} | undefined;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type StatusItem = {
  isReady: boolean;
  readyText?: string;
};
