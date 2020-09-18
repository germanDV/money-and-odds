export default class Money {
  private DEFAULT_CURRENCY = 'USD'

  private ERRORS = {
    missingArg: () => new Error('Missing required argument.'),
    nan: (arg: any) => new Error(`Argument "${arg}" is not a number.`),
    infinity: () => new Error('Cannot create Money with (-)Infinity'),
    zeroDivision: () => new Error('Division by zero.'),
    invalidType: (type: string) =>
      new Error(`Cannot perform operation with argument of type ${type}, it must be an instance of Money.`),
    currencyMismatch: (currA: string, currB: string) =>
      new Error(`Cannot perform operation, Moneys have different currencies (${currA} != ${currB}).`),
    portionsSum: (portions: number[]) =>
      new Error(`The portions "${portions}" do not add up to 100.`),
    comparison: (currA: string, currB: string) =>
      new Error(`Cannot compare ${currA} to ${currB}.`),
  }

  private validateInfinity(n: number) {
    if (!isFinite(n)) {
      throw this.ERRORS.infinity()
    }
  }

  private validateMoneyInstance(a: any) {
    if (!(a instanceof Money)) {
      throw this.ERRORS.invalidType(typeof a)
    }
  }

  private validateCurrency(a: Money, b: Money) {
    if (a.currency !== b.currency) {
      throw this.ERRORS.currencyMismatch(a.currency, b.currency)
    }
  }

  private validateNumber(n: any) {
    if ((typeof n !== 'number' && typeof n !== 'string') || isNaN(+n)) {
      throw this.ERRORS.nan(n)
    }
  }

  /**
   * Helper function to create a Money instance from an amount that includes cents, useful to parse user input
   * `Money.fromUnit("10.50") == new Money(1050)`
   */
  static fromUnit(f: number | string, currency?: string): Money {
    if ((!f && f !== 0) || isNaN(+f)) throw new Error(`Unable to convert "${f}" to Money.`)
    const cents = +((+f * 100).toFixed(0));
    return new Money(cents, currency)
  }

  /**
   * Creates a `Money` instance
   * @param cents provide amount as an integer representing the smallest currency sub-unit (i.e.: `500` represents `$5.00`)
   * TIP: use `_` to visually separate subunits from units, i.e.: new Money(100_99) to represet $100.99
   * @param currency currency ISO string (defaults to USD)
   */
  constructor(private cents: number, private currency?: string) {
    if (!cents && cents !== 0) throw this.ERRORS.missingArg()
    this.validateNumber(cents)
    this.validateInfinity(cents)
    this.cents = +cents.toFixed(0)

    if (currency && currency.trim().length > 0) {
      this.currency = currency.trim().toUpperCase()
    } else {
      this.currency = this.DEFAULT_CURRENCY
    }
  }

  /** 
   * Adds Money to another Money, must be same currency
   */
  plus(m: Money): Money {
    if (!m) throw this.ERRORS.missingArg()
    this.validateMoneyInstance(m)
    this.validateCurrency(this, m)
    return new Money(this.cents + m.cents, this.currency)
  }

  /** 
   * Substracts Money from another Money, must be same currency
   */
  minus(m: Money): Money {
    if (!m) throw this.ERRORS.missingArg()
    this.validateMoneyInstance(m)
    this.validateCurrency(this, m)
    return new Money(this.cents - m.cents, this.currency)
  }

  /** 
   * Multiplies Money by a number
   */
  times(n: number): Money {
    if (!n && n !== 0) throw this.ERRORS.missingArg()
    this.validateNumber(n)
    return new Money(this.cents * n, this.currency)
  }

  /** 
   * Divides Money by a number
   */
  divide(n: number): Money {
    if (!n && n !== 0) throw this.ERRORS.missingArg()
    this.validateNumber(n)
    if (+n === 0) {
      throw this.ERRORS.zeroDivision()
    }
    return new Money(this.cents / n, this.currency)
  }

  /** 
   * Calculates a given percentage of Money.
   * Percentage should be in base 100 (i.e.: 21 for 21%, not 0.21)
   */
  perc(n: number): Money {
    if (!n && n !== 0) throw this.ERRORS.missingArg()
    this.validateNumber(n)
    const result = +(((this.cents * n) / 100).toFixed(0))
    return new Money(result, this.currency)
  }

  /** 
   * Splits Money into portions.
   * The sum of all portions must be 100.
   * It's safer than `percentage` because it ensures the sum of allocations equals total Money
   */
  split(portions: number[]): Money[] {
    if (!portions || !(portions instanceof Array) || portions.length === 0) {
      throw this.ERRORS.missingArg()
    }

    let portionsSum = 0
    let available = this.cents
    const results: Money[] = []

    portions.forEach(portion => {
      portionsSum += portion
      const result = +(((this.cents * portion) / 100).toFixed(0))

      if (result > available) {
        results.push(new Money(available, this.currency))
      } else {
        available -= result
        results.push(new Money(result, this.currency))
      }
    });

    if (portionsSum !== 100) {
      throw this.ERRORS.portionsSum(portions)
    }

    return results
  }

  /**
   * Returns Money as a formatted string, with symbol and two decimals
   */
  toString(): string {
    const amount = this.cents / 100
    const options = {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
    return amount.toLocaleString('en-US', options)
  }

  /**
   * Wrapper around `Number.prototype.toLocaleString()` that returns Money as a string
   */
  toLocale(locale: string, options: object = {}): string {
    const amount = this.cents / 100
    return amount.toLocaleString(locale, options);
  }

  /**
   * Returns Money as number in sub-units (i.e.: cents for dollars)
   */
  getSubunit(): number {
    return this.cents
  }

  /**
   * Returns Money as number in main unit, rounded to two decimals
   */
  getUnit(): number {
    return Number((this.cents / 100).toFixed(2))
  }

  /**
   * Returns currency
   */
  getCurrency(): string {
    return this.currency
  }

  /**
   * Compares two Money instances for equality, both amount and currency.
   */
  eq(m: Money): boolean {
    return this.getUnit() === m.getUnit() && this.currency === m.currency
  }

  /**
   * Checks if a Money instance is `less than` another. Throws if instances are of different currency.
   */
  lt(m: Money): boolean {
    if (this.currency !== m.currency) {
      throw this.ERRORS.comparison(this.currency, m.currency)
    }
    return this.getUnit() < m.getUnit()
  }

  /**
   * Checks if a Money instance is `greater than` another. Throws if instances are of different currency.
   */
  gt(m: Money): boolean {
    if (this.currency !== m.currency) {
      throw this.ERRORS.comparison(this.currency, m.currency)
    }
    return this.getUnit() > m.getUnit()
  }

  /**
   * Checks if a Money instance is `less than or equal to` another. Throws if instances are of different currency.
   */
  lte(m: Money): boolean {
    if (this.currency !== m.currency) {
      throw this.ERRORS.comparison(this.currency, m.currency)
    }
    return this.getUnit() <= m.getUnit()
  }

  /**
   * Checks if a Money instance is `greater than or equal to` another. Throws if instances are of different currency.
   */
  gte(m: Money): boolean {
    if (this.currency !== m.currency) {
      throw this.ERRORS.comparison(this.currency, m.currency)
    }
    return this.getUnit() >= m.getUnit()
  }
}
