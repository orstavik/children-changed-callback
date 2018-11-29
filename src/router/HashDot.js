function resolveVariable(key, map) {
  let next;
  while (next = map[key])
    key = next;
  return key;
}

function matchArgument(a, b, varMap) {
  a = resolveVariable(a, varMap);
  if (a.startsWith(":"))
    return varMap[a] = b;
  b = resolveVariable(b, varMap);
  if (b.startsWith(":"))
    return varMap[b] = a;
  return a === b;
}

function matchArguments(as, bs, varMap) {
  as = resolveVariable(as, varMap);
  if (!Array.isArray(as))
    return varMap[as] = bs;
  bs = resolveVariable(bs, varMap);
  if (!Array.isArray(bs))
    return varMap[bs] = as;
  if (as.length !== bs.length)
    return false;
  for (let i = 0; i < as.length; i++)
    if (!matchArgument(as[i], bs[i], varMap))
      return false;
  return true;
}

class HashDot {
  constructor(full, flat) {
    this.tagName = full;
    this.tagValue = flat;
    this.args = [];
    this.flatArgs = [];
  }

  addArgument(full, flat, varCounter) {
    if (!this.args.length && full.startsWith("::"))
      return this.args = full + "-" + varCounter;
    if (this.args.length && (full.startsWith("::") || !Array.isArray(this.args)))
      throw new Error(`DoubleDots '::' must be the only argument.`);
    if (full.startsWith(":"))
      full += "-" + varCounter;
    this.args.push(full);
    this.flatArgs.push(flat);
  }

  static _flattenArgs(args) {
    return args.map(arg => {
      if (arg.startsWith(":"))
        return arg;
      if (arg.startsWith(".'"))
        return arg.substring(2, arg.length - 1).replace(/\\'/, "'");
      if (arg.startsWith('."'))
        return arg.substring(2, arg.length - 1).replace(/\\"/, '"');
      return arg.substring(1);
    });
  }

  flatten(varMap) {
    let flat = new HashDot(this.tagName, this.tagValue);
    flat.args = this.args;
    if (!Array.isArray(flat.args))
      flat.args = resolveVariable(flat.args, varMap);
    if (!Array.isArray(flat.args)) {
      flat.flatArgs = flat.args;
      return flat;
    }
    flat.args = flat.args.map(arg => resolveVariable(arg, varMap));
    flat.flatArgs = HashDot._flattenArgs(flat.args);
    return flat;
  }

  //todo 1: make match return a new hybrid HashDot?
  //todo 2: this hybrid uses the args of the left, but fills its flatArg values for variables with the right side?
  //todo 3: or does this hybrid object use a varMap?
  //todo make varMap immutable?
  //todo should matchArguments use the flatValues??
  match(otherDot, varMap) {
    return this.tagValue === otherDot.tagValue && matchArguments(this.args, otherDot.args, varMap);
  }

  toString() {
    return this.tagName + (Array.isArray(this.args) ? this.args.join("") : this.args);
  }
}

let variableCounter = 0;

export class HashDots {
  static parse(input) {
    input = input.trim();
    if (input.length === 0)
      return [];
    if (!(input.startsWith("#") || input.startsWith("/") || input.startsWith("!") || input.startsWith(";")))
      throw new SyntaxError(`HashDot sequence must start with #,!,/ or ;.\nInput:  ${input}\nError:  ↑`);

    const varCounter = variableCounter++;
    const hashOrDot = /[#/!]+([\w]+)|\.([\w]+)|\."((\\.|[^"])*)"|\.'((\\.|[^'])*)'|::?[\w]+|=|;|\s+|(.+)/g;
    const rules = [];
    let rule = {left: []};
    let dots = rule.left;
    let dot;
    for (let next; (next = hashOrDot.exec(input)) !== null;) {
      if (next[7]) {
        const errorPos = hashOrDot.lastIndex - next[7].length + 1;
        throw new SyntaxError(`HashDot syntax error:\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
      }
      let word = next[0];
      let flat = next[1] || next[2] || (next[3] && next[3].replace(/\\"/, '"')) || (next[5] && next[5].replace(/\\'/, "'"));
      if (word[0].match(/\s/))
        continue;
      if (word === "=") {
        rule.right = [];
        dots = rule.right;
        dot = undefined;
        continue;
      }
      if (word === ";") {
        if (rule.left.length !== 0) {
          rules.push(rule);
          rule = {left: []};
          dots = rule.left;
        }
        continue;
      }
      if (word.startsWith("#") || word.startsWith("/") || word.startsWith("!")) {
        dots.push(dot = new HashDot(word, flat));
        continue;
      }
      if (dot === undefined) {
        const errorPos = hashOrDot.lastIndex - word.length + 1;
        throw new SyntaxError(`HashDot syntax error. HashDot sequence must start with '#':\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
      }
      try {
        dot.addArgument(word, flat, varCounter);
      } catch (err) {
        const errorPos = hashOrDot.lastIndex - word.length + 1;
        throw new SyntaxError(`HashDot syntax error: ${err.message}\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
      }
    }
    if (rule.left.length !== 0)
      rules.push(rule);
    return rules;
  }

  static subsetMatch(left, right) {
    for (let i = 0; i < left.length; i++) {
      for (let j = 0; j < right.length; j++) {
        let varMap = {};
        if (HashDots.headMatch(left, right, i, j, varMap))
          return {start: i, stop: right.length, varMap};
      }
    }
    return null;
  }

  static headMatch(left, right, i, j, varMap) {
    if (right.length > left.length - i)
      return false;
    for (let k = 0; k < right.length; k++) {
      if (!left[i + k].match(right[j + k], varMap))
        return false;
    }
    return true;
  }

  static exactMatch(left, right) {
    let varMap = {};
    if (left.length === right.length && HashDots.headMatch(left, right, 0, 0, varMap))
      return {start: 0, stop: left.length, varMap};
    return null;
  }
}

//todo Should queries get their own symbols like:
//     "#book ??" would ask for the rightmost resolution of #book, ie. HashDotMap.query("#book ??") instead of HashDotMap.right("#book")
//     "?? #book" would ask for the leftmost resolution of #book
//     "#book ?" would ask for a single right resolution of #book
//     "? #book" would ask for a single left resolution of #book

export class HashDotMap {
  constructor(routeMap) {
    this.rules = HashDots.parse(routeMap);
    this.reverseRules = this.rules.map(rule => ({left: rule.right, right: rule.left}));
  }

  right(hashdots) {
    return HashDotMap.resolve(HashDotMap.parseHashDots(hashdots), this.rules);
  }

  left(hashdots) {
    return HashDotMap.resolve(HashDotMap.parseHashDots(hashdots), this.reverseRules);
  }

  interpret(newLocation) {
    const middle = HashDots.parse(newLocation)[0].left;
    let left = this.left(middle);
    let right = this.right(middle);
    let rootLink = left.map(dot => dot.toString()).join("");
    return {rootLink, left, middle, right};
  };

  static resolve(main, rules) {
    let next = main;
    while (next) {
      const resolver = HashDotMap.resolver(HashDots.subsetMatch, main, rules);
      next = resolver.next().value;
      if (!next)
        return main;
      main = next.inputReplaced();
    }
  }

  matchEquals(hashdots) {
    return HashDotMap.resolver(HashDots.exactMatch, HashDotMap.parseHashDots(hashdots), this.rules);
  }

  matchSubset(hashdots) {
    return HashDotMap.resolver(HashDots.subsetMatch, HashDotMap.parseHashDots(hashdots), this.rules);
  }

  static parseHashDots(hashdots) {
    if (typeof hashdots === "string" || hashdots instanceof String)
      return HashDots.parse(hashdots)[0].left;
    return hashdots;
  }

  static resolver(matchFunction, input, rules) {
    return {
      i: 0,
      next() {
        while (this.i < rules.length) {
          let rule = rules[this.i++];
          let hitSide = rule.left;
          let replaceSide = rule.right;
          let res = matchFunction(input, hitSide, replaceSide);
          if (res)
            return {done: false, value: new MatchResult(input, hitSide, replaceSide, res)};
        }
        return {done: true};
      },
      [Symbol.iterator]: function () {
        return this;
      }
    };
  }
}

class MatchResult {
  constructor(input, hitSide, replaceSide, result) {
    this.input = input;
    this.hitSide = hitSide;
    this.replaceSide = replaceSide;
    this.varMap = result.varMap;
    this.result = result;
    this.start = result.start;
    this.stop = result.stop;
  }

  res() {
    return this.input.map(dot => dot.flatten(this.varMap));
  }

  replaceSideFlat() {
    return this.replaceSide.map(dot => dot.flatten(this.varMap));
  }

  inputReplaced() {
    let res = [].concat(this.input);
    res.splice(this.start, this.stop, ...this.replaceSide);
    return res.map(dot => dot.flatten(this.varMap));
  }
}