type ValueObjectValue = string | number | boolean | Date | null | undefined;

export interface ValueObjectProps {
  [key: string]: ValueObjectValue;
}

/**
 * @desc ValueObjects are objects that we determine their
 * equality through their structural properties.
 */

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  private valuesEqual(a: ValueObjectValue, b: ValueObjectValue) {
    return a === b;
  }

  private shallowEqual(a: T, b: T): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!this.valuesEqual(a[key], b[key])) return false;
    }
    return true;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return this.shallowEqual(this.props, vo.props);
  }
}
