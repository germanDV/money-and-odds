# INTRO

These are auxiliary `classes` to ease the manipulation of _Money_ and _Odds_ in JS.

Both are immutable, operations won't mutate the instance but return a new one. It's possible to chain operations (specially useful for `Money`).


## MONEY

The `Money` class allows the creation and manipulation of objects that represent money, they have two properties:
- `cents` (amount in subunit, _cents_ for a short and descriptive name)
- `currency` (3-letter ISO code, a default is provided as a private class property).

Amounts are handled in the smallest subunit (cents), but a static method `fromUnit` is provided to parse from _float_ (dollars) to _int_ (cents). This method accepts a `string` since amounts collected from users will typically be "floats as a string".

**TIP**: use `_` to visually separate subunits from units, i.e. to represent 5 dollars, type it as `5_00` instead of `500`.

### **Cheatsheet**
- Create 50 euros: `const m = new Money(50_00, 'EUR')`
- Create 100 of the default currency: `const m = new Money(100_00)`
- Create Money from user input: `const m = Money.fromUnit("199.99")`
- Addition: `const result = new Money(25_00).plus(new Money(80_00))`
- Subtraction: `const result = new Money(25_00).minus(new Money(80_00))`
- Multiplication: `const result = new Money(245_50).times(4)`
- Division: `const result = new Money(245_50).over(4)`
- Get subunit (amount in cents): `const subunits = new Money(300_00).getSubunit()`
- Get unit (amount in dollars): `const units = new Money(300_00).getUnit()`
- Get currency: `const currency = new Money(300_00).getCurrency()`
- Pretty print
  - `toString()`: Returns Money as a formatted string, with symbol and two decimals. Uses `Number.prototype.toLocaleString` under the hood with _style: currency_.
  - `toLocale(locale, options)`: Just a wrapper around `Number.prototype.toLocaleString()` to give you full flexibility.

Chaining:
```javascript
  const m = new Money(10587_00, 'USD')
    .plus(new Money(500_00, 'USD'))
    .times(3)
    .minus(new Money(200_00, 'USD'))
    .perc(40)
    .toString()
  
  // m === '$13,224.40'
````


## ODDS

`Odds` represent a bet's price in the three main formats: _decimal_, _fractional_ and _american_. When creating an `Odds` instance, a `price` and `from format` are required. A default `from format` is provided as a private class property. As part of the instantiation, convertions are made to the other two formats, so that computations do not need to be done for every read.

Create an `Odds` instance:
```javascript
const price = new Odds(3.75, 'd')
// TIP: only the first letter is used to tell the format, 'd' == 'decimal'
// TIP: it's case insensitive, 'D' == 'd'
```

Get `Odds` in all possible formats:
```javascript
const priceDecimal = price.d     // string "3.75"
const priceFractional = price.f  // string "11/4"
const priceAmerican = price.a    // string "+275"
```

## DOCS
Other methods are available. For further details, you may check out intellisense in your editor, hopefully the combination of typescript and JSDoc comments will provide you with all the information you need. More importantly, check out the test suite.

## ERRORS
It throws errors with (hopefully) descriptive messages. So, if there's a risk of performing an invalid operation, like when creating a `Money` instance from unsanitized user input, wrap it in a `try / catch`.
