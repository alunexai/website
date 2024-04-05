export const getImgSrc = async (name: string) =>
  await import(`../assets/img/${name}.png`);
