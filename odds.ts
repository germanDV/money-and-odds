export type Format = 'd' | 'f' | 'a'

export default class Odds {
  public readonly d: string
  public readonly f: string
  public readonly a: string

  private ERRORS = {
    unknownFormat: (format: string) => new Error(`Unknown odds format: "${format}".`),
    invalidPrice: (v: unknown) => new Error(`Invalid value provided for price: "${v}".`),
    invalidFraction: (v: unknown) => new Error(`Invalid value provided for fractional odds: "${v}".`),
    invalidAmerican: (v: unknown) => new Error(`Invalid value provided for american odds: "${v}".`),
    nan: (p: number) => new Error(`Decimal odds expect a finite number, received: "${p}"`),
    negative: () => new Error('Decimal odds must be a number greater than 0.'),
  }

  private validateD(p: string | number) {
    if (typeof p !== 'string' && typeof p !== 'number') {
      throw this.ERRORS.invalidPrice(p)
    }
    if (isNaN(+p) || !isFinite(+p)) {
      throw this.ERRORS.nan(+p)
    }
    if (+p <= 0) {
      throw this.ERRORS.negative()
    }
  }

  private validateF(p: string) {
    if (typeof p !== 'string') {
      throw this.ERRORS.invalidPrice(p)
    }
    const parts = p.split('/');
    if (parts.length !== 2 || isNaN(+parts[0]) || isNaN(+parts[1])) {
      throw this.ERRORS.invalidFraction(p)
    }
  }

  private validateA(p: string) {
    if (typeof p !== 'string' || p.length < 2) {
      throw this.ERRORS.invalidPrice(p)
    }
    if (!['-', '+'].includes(p[0]) || isNaN(+p.slice(1))) {
      throw this.ERRORS.invalidAmerican(p)
    }
  }

  private simplifyFraction(num: number, den: number): string {
    if (!den || isNaN(num) || isNaN(den)) {
      return null
    }

    const findGreatestCommonDen = (a: number, b: number): number => {
      return b ? findGreatestCommonDen(b, a % b) : a
    }

    const greatestCommonDen = findGreatestCommonDen(num, den)
    const simplifiedNum = num / greatestCommonDen
    const simplifiedDen = den / greatestCommonDen
    return `${simplifiedNum}/${simplifiedDen}`
  }

  // Decimal to Fractional
  private dToF (p: string): string {
    const n = +p
    const dec = Number(n.toFixed(2))
    const num = Math.round(dec * 100) - 100
    const den = 100
    const f = this.simplifyFraction(num, den)
    return f
  }

  // Decimal to American
  private dToA(p: string): string {
    const n = +p
    if (n === 1) return '-'
    if (n < 2) return Math.round(((-100) / (n - 1))).toString()
    return `+${Math.round(((n - 1) * 100))}`
  }

  // Fractional to Decimal
  private fToD(p: string): string {
    const parts = p.split('/')
    const num = +parts[0]
    const den = +parts[1]
    const dec =  (num / den) + 1
    return dec.toFixed(2)
  }

  // American to Decimal
  private aToD(p: string): string {
    const pos = p[0] === '+'
    const n = +p.slice(1)
    const dec = pos ? 1 + (n / 100) : 1 - (100 / -n)
    return dec.toFixed(2)
  }

  /**
   * Creates an `Odds` instance
   * @param price price in one of the three valid formats (d: decimal, f: fractinal, a: american)
   * @param format format in which the `price` is being provided
   */
  constructor(price: string | number, format?: Format) {
    if (!format || format.toLowerCase().charAt(0) === 'd') {
      this.validateD(price)
      this.d = (+price).toFixed(2)
      this.f = this.dToF((+price).toFixed(3))
      this.a = this.dToA((+price).toFixed(3))
    } else if (format.toLowerCase().charAt(0) === 'f') {
      this.validateF(price.toString())
      this.f = price.toString()
      this.d = this.fToD(price.toString())
      this.a = this.dToA(this.d)
    } else if (format.toLowerCase().charAt(0) === 'a') {
      this.validateA(price.toString())
      this.a = price.toString()
      this.d = this.aToD(price.toString())
      this.f = this.dToF((+this.d).toFixed(3))
    } else {
      throw this.ERRORS.unknownFormat(format)
    }
  }
}

