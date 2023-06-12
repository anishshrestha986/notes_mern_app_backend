/**
 * @description
 *
 * @param val
 */
export const isObject = (val: unknown): boolean => typeof val === 'object';

/**
 * @description converts key1:value1, key2:value2 to { key1: value1, key2: value2 }
 *
 * @param value
 */
export const colonToObject = (value: string): object => {
  const order = {};
  value?.split(',').forEach(function (key_val) {
    const [key, val] = key_val.split(':');
    order[key] = val;
  });
  return order;
};

export function omit<T, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, (typeof keys)[number]> {
  const result = { ...obj };
  keys.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

export function pick<T, Key extends keyof T>(key: Key): (o: T) => T[Key] {
  return (object) => object[key];
}

export function getKeyByValue<T>(object: T, value: string) {
  return Object.keys(object).find((key) => object[key] === value);
}
