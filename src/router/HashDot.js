function pureSplice(origin, start, stop, added) {
  const tags = [].concat(origin);
  tags.splice(start, stop, ...added);
  return tags;
}

function resolveVariable(key, map) {
  let next;
  while (next = map[key])
    key = next;
  return key;
}

function checkAndAddToVarMap(a, b, varMap) {
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
    if (!checkAndAddToVarMap(as[i], bs[i], varMap))
      return false;
  return true;
}

let variableCounter = 0;

export class HashDots {
  static parse(input) {
    const varCounter = variableCounter++;
    input = input.trim();
    if (!(input.startsWith("#") || input.startsWith("/") || input.startsWith("!")))
      throw new SyntaxError(`HashDot sequence must start with #,!, or /.\nInput:  ${input}\nError:  ↑`);
    const hashOrDot = /[#/!]+([\w]+)|\.([\w]+)|\."((\\.|[^"])*)"|\.'((\\.|[^'])*)'|::?[\w]+|<=>|\s+|(.+)/g;
    const rule = {left: {tags: [], flatTags: [], args: [], flatArgs: []}};
    let tags = rule.left.tags;
    let args = rule.left.args;
    let flatTags = rule.left.flatTags;
    let flatArgs = rule.left.flatArgs;
    let tagPos = -1, argPos = 0;
    for (let next; (next = hashOrDot.exec(input)) !== null;) {
      if (next[7]) {
        const errorPos = hashOrDot.lastIndex - next[7].length + 1;
        throw new SyntaxError(`HashDot syntax error:\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
      }
      let word = next[0];
      let flat = next[1] || next[2] || (next[3] && next[3].replace(/\\"/, '"')) || (next[5] && next[5].replace(/\\'/, "'"));
      if (word[0].match(/\s/))
        continue;
      if (word === "<=>") {
        rule.right = {tags: [], flatTags: [], args: [], flatArgs: []};
        tags = rule.right.tags;
        args = rule.right.args;
        flatTags = rule.right.flatTags;
        flatArgs = rule.right.flatArgs;
        tagPos = -1;
        continue;
      }
      if (word.startsWith("#") || word.startsWith("/") || word.startsWith("!")) {
        ++tagPos;
        tags[tagPos] = word;
        args[tagPos] = [];
        flatTags[tagPos] = flat;
        flatArgs[tagPos] = [];
        argPos = 0;
        continue;
      }
      if (tagPos === -1) {
        const errorPos = hashOrDot.lastIndex - word.length + 1;
        throw new SyntaxError(`HashDot syntax error. HashDot sequence must start with '#':\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
      }
      if (word.startsWith("::")) {
        if (argPos !== 0) {
          const errorPos = hashOrDot.lastIndex - word.length + 1;
          throw new SyntaxError(`HashDot syntax error. DoubleDots '::' must be the only argument:\nInput:  ${input}\nError:  ${Array(errorPos).join(" ")}↑`);
        }
        args[tagPos] = word + "-" + varCounter;
        argPos++;
        continue;
      }
      if (word.startsWith(":")){
        word += "-" + varCounter;
      }
      args[tagPos][argPos] = word;
      flatArgs[tagPos][argPos++] = flat;
    }
    // if (rule.right === undefined)
    //   return rule.left;
    return rule;
  }

  static match(left, right) {
    let start = 0;
    let first = right.tags[0];
    while (true) {
      if (left.tags[start] === first)
        break;
      if (start === left.tags.length - 1)
        return null;
      start++;
    }
    let varMap = {};
    const stop = right.tags.length;
    for (let i = 0; i < stop; i++) {
      let rightTag = right.tags[i];
      let leftTag = left.tags[start + i];
      if (rightTag !== leftTag)
        return null;
      if (!matchArguments(left.args[start + i], right.args[i], varMap))
        return null;
    }
    return {start, stop, varMap};
  }

  static toString({tags, args, varMap}) {
    const allArgs = HashDots.flatten(args, varMap);
    let str = "";
    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i];
      let args = allArgs[i];
      str += tag;
      if (Array.isArray(args))
        for (let arg of args) str += arg;
      else
        str += args.substring(0, args.indexOf("-"));
    }
    return str;
  }

//todo should this be mutable??
  static flatten(arrayOfArgs, varMappings) {
    if (!varMappings)
      return arrayOfArgs;
    const flatArgs = [];
    for (let i = 0; i < arrayOfArgs.length; i++) {
      let args = arrayOfArgs[i];
      if (!Array.isArray(args)) args = resolveVariable(args, varMappings);
      flatArgs[i] = Array.isArray(args) ? args.map(arg => resolveVariable(arg, varMappings)) : args;
    }
    return flatArgs;
  }
}

export class HashDotMap {
  constructor(routeMap) {
    this.rules = routeMap.map(str => HashDots.parse(str));
    this.reverseRules = this.rules.map(rule => ({left: rule.right, right: rule.left}));
  }

  right(hashdots) {
    (typeof hashdots === "string" || hashdots instanceof String) && (hashdots = HashDots.parse(hashdots).left);
    return HashDotMap.resolve(hashdots, this.rules);
  }

  left(hashdots) {
    (typeof hashdots === "string" || hashdots instanceof String) && (hashdots = HashDots.parse(hashdots).left);
    return HashDotMap.resolve(hashdots, this.reverseRules);
  }

  static resolve(leftSide, rules) {
    for (let rule of rules) {
      const match = HashDots.match(leftSide, rule.left);
      if (match) {
        //todo can I avoid merging and HashDots.flattening here??
        let tags = pureSplice(leftSide.tags, match.start, match.stop, rule.right.tags);
        let args = pureSplice(leftSide.args, match.start, match.stop, rule.right.args);
        args = HashDots.flatten(args, match.varMap);
        return HashDotMap.resolve({tags, args}, rules);
      }
    }
    return leftSide;
  }

}

export class HashDotsRouter {
  constructor(routes) {
    this.middle = undefined;
    this.left = undefined;
    this.right = undefined;
    this.lastEvent = null;
    this.map = new HashDotMap(routes);
    window.addEventListener("hashchange", () => this._onHashchange());
    //dispatch an initial routechange event at the first raf after startup
    requestAnimationFrame(() => this._onHashchange());
  }

  _onHashchange() {
    let currentHash = window.location.hash;
    if (this.middle === currentHash || this.left === currentHash || this.right === currentHash)
      return window.location.hash = this.left;
    const middle = HashDots.parse(currentHash).left;
    let left = this.map.left(middle);
    let leftStr = HashDots.toString(left);
    if (leftStr === this.left)
      return window.location.hash = this.left;
    let right = this.map.right(middle);
    let rightStr = HashDots.toString(right);
    this.left = leftStr;
    this.right = rightStr;
    this.middle = currentHash;
    this.lastEvent = {left, middle, right};
    window.location.hash = leftStr;
    window.dispatchEvent(new CustomEvent("routechange", {detail: this.lastEvent}));
  }
}