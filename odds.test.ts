import * as assert from 'assert'
import Odds, { Format } from './odds'

type Expectable = Error | { d: string, f: string, a: string };

interface Test {
  price: number | string;
  format?: Format;
  expected: Expectable;
}

const tests: Test[] = [
  {
    price: 3.75,
    format: 'd',
    expected: { d: '3.75', f: '11/4', a: '+275' },
  },
  {
    price: '1/5',
    format: 'f',
    expected: { d: '1.20', f: '1/5', a: '-500' },
  },
  {
    price: '+125',
    format: 'a',
    expected: { d: '2.25', f: '5/4', a: '+125' },
  },
  {
    price: '1.01',
    expected: { d: '1.01', f: '1/100', a: '-10000' },
  },
  {
    price: '1/100',
    format: 'f',
    expected: { d: '1.01', f: '1/100', a: '-10000' },
  },
  {
    price: '1/4',
    format: 'f',
    expected: { d: '1.25', f: '1/4', a: '-400' },
  },
  {
    price: 1,
    format: 'd',
    expected: { d: '1.00', f: '0/1', a: '-' },
  },
  {
    price: 'bad input',
    format: 'd',
    expected: new Error('Decimal odds expect a finite number, received: "NaN"'),
  },
  {
    price: 4,
    // @ts-ignore
    format: '?',
    expected: new Error('Unknown odds format: "?".'),
  },
  {
    price: '200',
    format: 'a',
    expected: new Error('Invalid value provided for american odds: "200".'),
  },
  {
    price: '1',
    format: 'f',
    expected: new Error('Invalid value provided for fractional odds: "1".'),
  },
  {
    price: 0,
    expected: new Error('Decimal odds must be a number greater than 0.'),
  },
  {
    price: -2,
    expected: new Error('Decimal odds must be a number greater than 0.'),
  },
  {
    price: null,
    expected: new Error('Invalid value provided for price: "null".'),
  },
  {
    price: undefined,
    expected: new Error('Invalid value provided for price: "undefined".'),
  },
  {
    // @ts-ignore
    price: false,
    expected: new Error('Invalid value provided for price: "false".'),
  },
  {
    price: 1.005,
    format: 'd',
    expected: { d: '1.00', f: '0/1', a: '-20000' },
  },
  {
    price: '40/85',
    format: 'f',
    expected: { d: '1.47', f: '40/85', a: '-213' },
  },
  {
    price: 2.6,
    format: 'd',
    expected: { d: '2.60', f: '8/5', a: '+160' },
  },
  {
    price: 2.59999999,
    format: 'd',
    expected: { d: '2.60', f: '8/5', a: '+160' },
  },
];

(function() {
  let pass = 0;
  let errors: string[] = [];

  for (const test of tests) {
    if (test.expected instanceof Error) {
      try {
        assert.throws(() => new Odds(test.price, test.format), test.expected)
        pass++
      } catch (err) {
        errors.push(`Conversion of "${test.price} ${test.format}" did not throw or threw with the wrong message.`)
      }
    } else {
      try {
        const odds = new Odds(test.price, test.format)
        assert.strictEqual(odds.d, test.expected.d)
        assert.strictEqual(odds.f, test.expected.f)
        assert.strictEqual(odds.a, test.expected.a)
        pass++
      } catch (err) {
        errors.push(`Error converting "${test.price} ${test.format}": expected "${err.expected}", but got "${err.actual}"`)
      }
    }
  }

  // Print errors (if any)
  errors.forEach(e => console.log('\x1b[31m%s\x1b[0m', e))

  // Print summary
  console.log('')
  console.log('\x1b[32m%s\x1b[0m', `PASSED: ${pass}`)
  console.log('\x1b[31m%s\x1b[0m', `FAILED: ${errors.length}`)
  console.log(`TOTAL: ${tests.length}`)
  console.log('')
})()
