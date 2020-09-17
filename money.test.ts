import * as assert from 'assert'
import Money from './money'

interface Tests {
  [key: string]: (cb: () => void) => void
}

interface Err {
  name: string
  error: Error
}

const tests: Tests = {}
const DEFAULT_CURRENCY = 'USD'

// `constructor` tests
tests['It should create a Money instance with deafult currency'] = (done) => {
  const res = new Money(2500_00)
  assert.strictEqual(res.getCurrency(), DEFAULT_CURRENCY)
  done()
}

tests['It should not create a Money instance if no amount is provided'] = (done) => {
  // @ts-ignore
  assert.throws(() => new Money(), new Error('Missing required argument.'))
  done()
}

tests['It should not create a Money instance if amount is invalid'] = (done) => {
  // @ts-ignore
  assert.throws(() => new Money('ten'), new Error('Argument "ten" is not a number.'))
  // @ts-ignore
  assert.throws(() => new Money(true), new Error('Argument "true" is not a number.'))
  // @ts-ignore
  assert.throws(() => new Money([]), new Error('Argument "" is not a number.'))
  // @ts-ignore
  assert.throws(() => new Money({}), new Error('Argument "[object Object]" is not a number.'))
  done()
}

tests['It should not create a Money instance if amount is (-)Infinity'] = (done) => {
  assert.throws(() => new Money(Infinity), new Error('Cannot create Money with (-)Infinity'))
  assert.throws(() => new Money(-Infinity), new Error('Cannot create Money with (-)Infinity'))
  done()
}

tests['It should round float to 0 decimals and create Money with resulting int'] = (done) => {
  const res1 = new Money(4.99, 'usd')
  const res2 = new Money(25501.5, 'usd')
  const res3 = new Money(79999.851213)
  const res4 = new Money(79999.451213)
  assert.strictEqual(res1.toString(), '$0.05')
  assert.strictEqual(res2.toString(), '$255.02')
  assert.strictEqual(res3.toString(), '$800.00')
  assert.strictEqual(res4.toString(), '$799.99')
  done()
}

tests['It should create a Money instance from an amount with cents formatted as string'] = (done) => {
  const userInput = '19.99'
  const amountAsMoney = Money.fromUnit(userInput)
  assert.strictEqual(amountAsMoney.getSubunit(), 1999)
  assert.strictEqual(amountAsMoney.toString(), '$19.99')
  done()
}

tests['It should create a Money instance from an amount with cents (not in deafult currency)'] = (done) => {
  const userInput = '19.99'
  const amountAsMoney = Money.fromUnit(userInput, 'eur')
  assert.strictEqual(amountAsMoney.getSubunit(), 1999)
  assert.strictEqual(amountAsMoney.toString(), '€19.99')
  assert.strictEqual(amountAsMoney.getCurrency(), 'EUR') 
  done()
}

tests['It should create a Money instance from user input, rounding to two decimals'] = (done) => {
  const userInputA = '19.1599'
  const amountAsMoneyA = Money.fromUnit(userInputA, 'USD')
  assert.strictEqual(amountAsMoneyA.getSubunit(), 1916)
  assert.strictEqual(amountAsMoneyA.toString(), '$19.16')

  const userInputB = '1469.4950123'
  const amountAsMoneyB = Money.fromUnit(userInputB, 'GBP')
  assert.strictEqual(amountAsMoneyB.getSubunit(), 146950)
  assert.strictEqual(amountAsMoneyB.toString(), '£1,469.50')

  done()
}

tests['It should not create Money instance from float with invalid arguments'] = (done) => {
  const expectedError = (x: any) => new Error(`Unable to convert "${x}" to Money.`)
  assert.throws(() => Money.fromUnit('four'), expectedError('four'))
  assert.throws(() => Money.fromUnit(NaN), expectedError(NaN))
  // @ts-ignore
  assert.throws(() => Money.fromUnit(), expectedError(undefined))
  // @ts-ignore
  assert.throws(() => Money.fromUnit(null), expectedError(null))
  done()
}
// end `constructor` tests

// `plus` tests
tests['It should perform an addition'] = (done) => {
  const res = new Money(200, 'USD').plus(new Money(300, 'USD')).toString()
  assert.strictEqual(res, '$5.00')
  done()
}

tests['It should not add different currencies'] = (done) => {
  const usd = new Money(200, 'USD')
  const eur = new Money(300, 'EUR')
  assert.throws(
    () => usd.plus(eur),
    new Error('Cannot perform operation, Moneys have different currencies (USD != EUR).'),
  )
  done()
}

tests['It should not add a number to a Money instance'] = (done) => {
  const m = new Money(550)
  assert.throws(
    // @ts-ignore
    () => m.plus(1),
    new Error('Cannot perform operation with argument of type number, it must be an instance of Money.'),
  )
  done()
}

tests['It should not add a stringified number to a Money instance'] = (done) => {
  const m = new Money(550)
  assert.throws(
    // @ts-ignore
    () => m.plus('1'),
    new Error('Cannot perform operation with argument of type string, it must be an instance of Money.'),
  )
  done()
}

tests['It should not add a `null` nor `undefined` to a Money instance'] = (done) => {
  const m = new Money(550)
  // @ts-ignore
  assert.throws(() => m.plus(null), new Error('Missing required argument.'))
  // @ts-ignore
  assert.throws(() => m.plus(undefined), new Error('Missing required argument.'))
  // @ts-ignore
  assert.throws(() => m.plus(), new Error('Missing required argument.'))
  done()
}
// end `plus` tests

// `minus` tests
tests['It should perform a substruction'] = (done) => {
  const res = new Money(200, 'EUR').minus(new Money(50, 'EUR')).toString()
  assert.strictEqual(res, '€1.50')
  done()
}

tests['It should not substract different currencies'] = (done) => {
  const usd = new Money(200, 'USD')
  const eur = new Money(300, 'EUR')
  assert.throws(
    () => usd.minus(eur),
    new Error('Cannot perform operation, Moneys have different currencies (USD != EUR).'),
  )
  done()
}

tests['It should not substract a number from a Money instance'] = (done) => {
  const m = new Money(550)
  assert.throws(
    // @ts-ignore
    () => m.minus(1),
    new Error('Cannot perform operation with argument of type number, it must be an instance of Money.'),
  )
  done()
}

tests['It should not substract a `null` nor `undefined` from a Money instance'] = (done) => {
  const m = new Money(550)
  // @ts-ignore
  assert.throws(() => m.minus(null), new Error('Missing required argument.'))
  // @ts-ignore
  assert.throws(() => m.minus(undefined), new Error('Missing required argument.'))
  // @ts-ignore
  assert.throws(() => m.minus(), new Error('Missing required argument.'))
  done()
}
// end `minus` tests

// `times` tests
tests['It should perform a multiplication'] = (done) => {
  const res = new Money(500, 'EUR').times(2).getSubunit()
  assert.strictEqual(res, 1000)
  done()
}

tests['It should multiply by zero'] = (done) => {
  const res = new Money(500).times(0).getSubunit()
  assert.strictEqual(res, 0)
  done()
}

tests['It should multiply by a negative amount'] = (done) => {
  const res = new Money(500).times(-2).getSubunit()
  assert.strictEqual(res, -1000)
  done()
}

tests['It should throw if argument is missing in multiplication'] = (done) => {
  const m = new Money(12345_67)
  const expectedError = new Error('Missing required argument.')
  // @ts-ignore
  assert.throws(() => m.times(), expectedError)
  // @ts-ignore
  assert.throws(() => m.times(null), expectedError)
  // @ts-ignore
  assert.throws(() => m.times(undefined), expectedError)
  // @ts-ignore
  assert.throws(() => m.times(''), expectedError)
  // @ts-ignore
  assert.throws(() => m.times(false), expectedError)
  done()
}

tests['It should throw if argument is invalid in multiplication'] = (done) => {
  const m = new Money(12345_67)
  // @ts-ignore
  assert.throws(() => m.times('bad'), new Error('Argument "bad" is not a number.'))
  // @ts-ignore
  assert.throws(() => m.times({}), new Error('Argument "[object Object]" is not a number.'))
  done()
}
// end `times` tests

// `over` tests
tests['It should perform a division'] = (done) => {
  const res = new Money(800).over(4).getSubunit()
  assert.strictEqual(res, 200)
  done()
}

tests['It should not divide by zero'] = (done) => {
  assert.throws(() => new Money(100).over(0), new Error('Division by zero.'))
  done()
}

tests['It should divide by a negative amount'] = (done) => {
  const res = new Money(900).over(-3).getSubunit()
  assert.strictEqual(res, -300)
  done()
}

tests['It should throw if argument is missing in division'] = (done) => {
  const m = new Money(789)
  const expectedError = new Error('Missing required argument.')
  // @ts-ignore
  assert.throws(() => m.over(), expectedError)
  // @ts-ignore
  assert.throws(() => m.over(null), expectedError)
  // @ts-ignore
  assert.throws(() => m.over(undefined), expectedError)
  // @ts-ignore
  assert.throws(() => m.over(''), expectedError)
  // @ts-ignore
  assert.throws(() => m.over(false), expectedError)
  done()
}

tests['It should throw if argument is invalid in division'] = (done) => {
  const m = new Money(789)
  // @ts-ignore
  assert.throws(() => m.over('bad'), new Error('Argument "bad" is not a number.'))
  // @ts-ignore
  assert.throws(() => m.over({}), new Error('Argument "[object Object]" is not a number.'))
  done()
}

tests['It should round when division results in number with decimals'] = (done) => {
  const res = new Money(10, 'USD').over(3)
  assert.strictEqual(res.getSubunit(), 3)
  assert.strictEqual(res.getUnit(), 0.03)
  assert.strictEqual(res.toString(), '$0.03')
  done()
}
// end `over` tests

// `perc` tests
tests['It should return % of Money'] = (done) => {
  const res = new Money(450_00, 'usd').perc(21).toString()
  assert.strictEqual(res, '$94.50')
  done()
}

tests['It should return rounded % of Money'] = (done) => {
  const res = new Money(900, 'usd').perc(3.33).toString()
  assert.strictEqual(res, '$0.30')
  done()
}

tests['It should not compute percentage with missing argument'] = (done) => {
  // @ts-ignore
  assert.throws(() => new Money(1).perc(), new Error('Missing required argument.'))
  done()
}

tests['It should not compute percentage with invalid argument'] = (done) => {
  // @ts-ignore
  assert.throws(() => new Money(1).perc('twenty'), new Error('Argument "twenty" is not a number.'))
  done()
}
// end `perc` tests

// `split` tests
tests['It should split Money into several portions'] = (done) => {
  const [res1, res2] = new Money(40_00).split([75, 25])
  assert.strictEqual(res1.getUnit(), 30)
  assert.strictEqual(res2.getUnit(), 10)
  done()
}

tests['It should split into portions that add up to the original number'] = (done) => {
  const [x, y, z] = new Money(225).split([50, 25, 25])
  assert.strictEqual(x.getSubunit(), 113)
  assert.strictEqual(y.getSubunit(), 56)
  assert.strictEqual(z.getSubunit(), 56)
  assert.strictEqual(x.plus(y).plus(z).getSubunit(), 225)
  done()
}

tests['It should split into portions with decimal places'] = (done) => {
  const [fee, rest] = new Money(950_00, 'USD').split([33.33, 66.67])
  assert.strictEqual(fee.toString(), '$316.64')
  assert.strictEqual(rest.toString(), '$633.36')
  done()
}

tests['It should not split if portions do not add up to 100'] = (done) => {
  assert.throws(
    () => new Money(950_00, 'USD').split([33.33, 66.66]),
    new Error('The portions "33.33,66.66" do not add up to 100.'),
  )

  done()
}
// end `split` tests

// `toString` tests
tests['It should return Money as a formatted string with GBP symbol'] = (done) => {
  const res = new Money(100_00, 'GBP').toString()
  assert.strictEqual(res, '£100.00')
  done()
}

tests['It should return Money as a formatted string with default (USD) symbol'] = (done) => {
  const res = new Money(100_00).toString()
  assert.strictEqual(res, '$100.00')
  done()
}

tests['It should return Money as a formatted string with "," separator'] = (done) => {
  const res = new Money(1000000_00).toString()
  assert.strictEqual(res, '$1,000,000.00')
  done()
}
// end `toString` tests

// `toLocale` tests
tests['It should return Money as a formatted string with 4 decimals'] = (done) => {
  const res = new Money(5_00).toLocale(undefined, { minimumFractionDigits: 4 })
  assert.strictEqual(res, '5.0000')
  done()
}
// end `toLocale` tests

// comparison tests
tests['It should return `true` for equivalent Money intances'] = (done) => {
  const res = new Money(1234567_89).eq(new Money(1234567_89))
  assert.strictEqual(res, true)
  done()
}

tests['It should return `false` for intances with same amount but different currency'] = (done) => {
  const res = new Money(1234567_89, 'NGN').eq(new Money(1234567_89, 'ZAR'))
  assert.strictEqual(res, false)
  done()
}

tests['It should return `true` if they are rounded to the same value'] = (done) => {
  const res = new Money(2.99, 'EUR').eq(new Money(3, 'EUR'))
  assert.strictEqual(res, true)
  done()
}

tests['It should return true for an instance `lt` another'] = (done) => {
  const res = new Money(2_00).lt(new Money(2_01))
  assert.strictEqual(res, true)
  done()
}

tests['It should return false for an instance not `lt` another (equal)'] = (done) => {
  const res = new Money(2_00).lt(new Money(2_00))
  assert.strictEqual(res, false)
  done()
}

tests['It should return false for an instance not `lt` another (greater)'] = (done) => {
  const res = new Money(2_00).lt(new Money(1_99))
  assert.strictEqual(res, false)
  done()
}

tests['It throws when comparing instances of a different currency (lt)'] = (done) => {
  assert.throws(
    () => new Money(2_00, 'COL').lt(new Money(2_00, 'CAD')),
    new Error('Cannot compare COL to CAD.'),
  )
  done()
}

tests['It should return true for an instance `lte` another'] = (done) => {
  const res = new Money(2_00).lte(new Money(2_01))
  assert.strictEqual(res, true)
  done()
}

tests['It should return true for an instance not `lte` another (equal)'] = (done) => {
  const res = new Money(2_00).lte(new Money(2_00))
  assert.strictEqual(res, true)
  done()
}

tests['It should return false for an instance not `lte` another (greater)'] = (done) => {
  const res = new Money(2_00).lte(new Money(1_99))
  assert.strictEqual(res, false)
  done()
}

tests['It throws when comparing instances of a different currency (lte)'] = (done) => {
  assert.throws(
    () => new Money(2_00, 'COL').lte(new Money(2_00, 'CAD')),
    new Error('Cannot compare COL to CAD.'),
  )
  done()
}

tests['It should return true for an instance `gt` another'] = (done) => {
  const res = new Money(2_02).gt(new Money(2_01))
  assert.strictEqual(res, true)
  done()
}

tests['It should return false for an instance not `gt` another (equal)'] = (done) => {
  const res = new Money(2_00).gt(new Money(2_00))
  assert.strictEqual(res, false)
  done()
}

tests['It should return false for an instance not `gt` another (less)'] = (done) => {
  const res = new Money(1_98).gt(new Money(1_99))
  assert.strictEqual(res, false)
  done()
}

tests['It throws when comparing instances of a different currency (gt)'] = (done) => {
  assert.throws(
    () => new Money(4_00, 'COL').gt(new Money(2_00, 'CAD')),
    new Error('Cannot compare COL to CAD.'),
  )
  done()
}

tests['It should return true for an instance `gte` another'] = (done) => {
  const res = new Money(2_02).gte(new Money(2_01))
  assert.strictEqual(res, true)
  done()
}

tests['It should return true for an instance not `gte` another (equal)'] = (done) => {
  const res = new Money(2_00).gte(new Money(2_00))
  assert.strictEqual(res, true)
  done()
}

tests['It should return false for an instance not `gte` another (less)'] = (done) => {
  const res = new Money(1_98).gte(new Money(1_99))
  assert.strictEqual(res, false)
  done()
}

tests['It throws when comparing instances of a different currency (gte)'] = (done) => {
  assert.throws(
    () => new Money(4_00, 'COL').gte(new Money(2_00, 'CAD')),
    new Error('Cannot compare COL to CAD.'),
  )
  done()
}
// end comparison tests

// chaining tests
tests['It should chain operations'] = (done) => {
  const res = new Money(1058700, 'USD')
    .plus(new Money(50000, 'USD'))
    .times(3)
    .minus(new Money(20000, 'USD'))
    .perc(40)
    .toString()
  
  assert.strictEqual(res, '$13,224.40')
  done()
}
// end chaining tests

(function() {
  const errors: Err[] = []
  let pass = 0
  let counter = 0
  console.log()

  Object.keys(tests).forEach(test => {
    const name = test;
    try {
      tests[test](() => {
        pass++
        console.log('\x1b[32m%s\x1b[0m', name)
      })
    } catch (error) {
      errors.push({ name, error })
      console.log('\x1b[31m%s\x1b[0m', name)
    } finally {
      counter++
    }
  })

  console.log('')
  console.log('\x1b[32m%s\x1b[0m', `PASSED: ${pass}`)
  console.log('\x1b[31m%s\x1b[0m', `FAILED: ${errors.length}`)
  console.log(`TOTAL: ${counter}`)
  console.log('')

  if(errors.length > 0){
    errors.forEach(err => {
      console.log('\x1b[31m%s\x1b[0m', err.name)
      console.log(err.error)
      console.log('')
    })
  }
})()
