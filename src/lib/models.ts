export type UseCaseItem = {
  title: string;
  description: string;
  isReady: boolean;
  btn?: {text: string; href: string};
  imgSrc: object;
  position: 'left' | 'right';
  isLast: boolean;
};

export type PricingPlanItem = {
  title: string;
  price: string | undefined;
  isReady: boolean;
  benefits: string[];
  btn: {text: string; href: string} | undefined;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type StatusItem = {
  isReady: boolean;
  readyText?: string;
};
