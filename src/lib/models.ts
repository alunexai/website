export type UseCaseModel = {
  title: string;
  description: string;
  btn: {text: string; disabled: boolean};
  imgSources: string[];
  position: 'left' | 'right';
};

export type PricingPlanModel = {
  title: string;
  price: string;
  benefits: string[];
  btn: {text: string; disabled: boolean};
};
