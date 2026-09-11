type Getters<Values extends object> = { readonly [Key in keyof Values]: () => Values[Key] };

export const withGetters = <Base extends object, Values extends object>(
  base: Base,
  getters: Getters<Values>,
): Base & Values =>
  Object.defineProperties(
    base,
    Object.fromEntries(
      Object.entries(getters).map(([key, get]) => [
        key,
        { get, enumerable: true, configurable: true },
      ]),
    ) as PropertyDescriptorMap,
  ) as Base & Values;
