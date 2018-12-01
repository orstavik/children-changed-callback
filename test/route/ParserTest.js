import {HashDots, HashDotMap} from "../../src/router/HashDot.js";

describe("parseHashDot", function () {

  it("empty test", function () {
    expect(HashDots.parse("")).to.deep.equal([]);
  });

  it("basic test: #omg.what.is.'this:!#...#'##wtf/OMG123.123", function () {

    const res = HashDots.parse("#omg.what.is.'this:!#...#'##wtf/OMG123.123")[0];
    expect(res.left).to.deep.equal([
      {
        "tagName": "#omg",
        "tagValue": "omg",
        "args": [".what", ".is", ".'this:!#...#'"],
        flatArgs: ["what", "is", "this:!#...#"]
      }, {
        "tagName": "##wtf",
        "tagValue": "wtf",
        args: [],
        flatArgs: []
      }, {
        "tagName": "/OMG123",
        "tagValue": "OMG123",
        "args": [".123"],
        "flatArgs": ["123"]
      }
    ]);
  });

  it("parameter: !omg:what", function () {
    const res = HashDots.parse("!omg:what")[0];
    expect(res.left).to.deep.equal([
      {
        "tagName": "!omg",
        "tagValue": "omg",
        "args": [":what-1"],
        "flatArgs": [undefined]
      }]);
  });

  it("parameter: #!/wtf::A", function () {
    const res = HashDots.parse("#!/wtf::A")[0];
    expect(res.left).to.deep.equal([
      {
        "tagName": "#!/wtf",
        "tagValue": "wtf",
        "args": "::A-2",
        "flatArgs": []
      }]);
  });
  it("Whitespace", () => {
    const a = HashDots.parse(" #white.abc#inBetween")[0];
    const b = HashDots.parse("#white.abc#inBetween ")[0];
    expect(a).to.deep.equal(b);
    const c = HashDots.parse("#white.abc #inBetween")[0];
    expect(a).to.deep.equal(c);
    const d = HashDots.parse("#white .abc#inBetween")[0];
    expect(a).to.deep.equal(d);

  });
  it(`String: #singlestring.'\\''`, function () {
    const res = HashDots.parse(`#singlestring.'\\''`)[0];
    expect(res.left).to.deep.equal([{
      "tagName": "#singlestring",
      "tagValue": "singlestring",
      "args": [".'\\''"],
      "flatArgs": ["'"]
    }]);
  });
  it(`String: #doublestring."\\""`, function () {
    const res = HashDots.parse(`#doublestring."\\""`)[0];
    expect(res.left).to.deep.equal([{
      "tagName": "#doublestring",
      "tagValue": "doublestring",
      "args": [".\"\\\"\""],
      "flatArgs": ["\""]
    }]);
  });
  it("#one.'a single \\' string?¤#'.end", function () {
    const res = HashDots.parse("#one.'a single \\' string?¤#'.end")[0];
    expect(res.left).to.deep.equal([{
      "tagName": "#one",
      "tagValue": "one",
      "args": [".'a single \\' string?¤#'", ".end"],
      "flatArgs": ["a single ' string?¤#", "end"]
    }]);
  });
  it('#one."a double \\" string?¤#".end', function () {
    const res = HashDots.parse('#one."a double \\" string?¤#".end')[0];
    expect(res.left).to.deep.equal([{
      "tagName": "#one",
      "tagValue": "one",
      "args": [".\"a double \\\" string?¤#\"", ".end"],
      "flatArgs": ["a double \" string?¤#", "end"]
    }]);
  });
  it('#one;#two', function () {
    const res = HashDots.parse('#one;#two');
    expect(res).to.deep.equal([{
      left: [{
        tagName: "#one",
        tagValue: "one",
        args: [],
        flatArgs: []
      }]
    }, {
      left: [{
        tagName: "#two",
        tagValue: "two",
        args: [],
        flatArgs: []
      }]
    }]);
  });
  it(';#one;', function () {
    const res = HashDots.parse(';#one;');
    expect(res).to.deep.equal([{
      left: [{
        tagName: "#one",
        tagValue: "one",
        args: [],
        flatArgs: []
      }]
    }]);
  });
});

describe("HashDotMatch", function () {
  it("HashDots.subsetMatch(#one:A:B, #one.a.b)", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one:A:B")[0].left, HashDots.parse("#one.a.b")[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.varMap).to.deep.equal({":A-13": ".a", ":B-13": ".b"});
  });
  it(`HashDots.subsetMatch(#one:A:B, #one.'hello'."world")`, function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one:A:B")[0].left, HashDots.parse(`#one.'hello'."world"`)[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.varMap).to.deep.equal({":A-15": ".'hello'", ":B-15": '."world"'});
  });
  it("HashDots.subsetMatch(#one.a.b, #one:A:B)", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one.a.b")[0].left, HashDots.parse("#one:A:B")[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.varMap).to.deep.equal({":A-18": ".a", ":B-18": ".b"});
  });
  it("HashDots.subsetMatch(#one.a.b.с#two.lala, #one:A:B:C#two:LALA)", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one.a.b.c#two.lala")[0].left, HashDots.parse("#one:A:B:C#two:LALA")[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.varMap).to.deep.equal({":A-20": ".a", ":B-20": ".b", ":C-20": ".c", ":LALA-20": ".lala"});
  });
  it("HashDots.subsetMatch(#one.a.b.с#two.lala, #one::ALL)", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one.a.b.c#two.lala")[0].left, HashDots.parse("#one::ALL")[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.stop).to.be.equal(1);
    assert(Object.keys(res.varMap)[0].match(/::ALL-\d+/));
    expect(Object.values(res.varMap)[0]).to.deep.equal([".a", ".b", ".c"]);
  });
  it("HashDots.subsetMatch: equal tag names, but unequal tag length", function () {
    let res = HashDots.subsetMatch(HashDots.parse("#one.a#two.b.error")[0].left, HashDots.parse("#one:A#two:B:C:D")[0].left);
    expect(res).to.be.equal(null);
    res = HashDots.subsetMatch(HashDots.parse("#one.a.b")[0].left, HashDots.parse("#one.a.b.c")[0].left);
    expect(res).to.be.equal(null);
    res = HashDots.subsetMatch(HashDots.parse("#one:A.b")[0].left, HashDots.parse("#one.a:B.c")[0].left);
    expect(res).to.be.equal(null);
    res = HashDots.subsetMatch(HashDots.parse("#one:A:B")[0].left, HashDots.parse("#one.a:B:C")[0].left);
    expect(res).to.be.equal(null);
    res = HashDots.subsetMatch(HashDots.parse("#one")[0].left, HashDots.parse("#one.a")[0].left);
    expect(res).to.be.equal(null);
    res = HashDots.subsetMatch(HashDots.parse("#one")[0].left, HashDots.parse("#one:A")[0].left);
    expect(res).to.be.equal(null);
  });
  it("HashDots.subsetMatch: equal tag names, but unequal parity", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one.a#two.b.error")[0].left, HashDots.parse("#one:A#two:B:C:D")[0].left);
    expect(res).to.be.equal(null);
  });
  it("HashDots.subsetMatch with the same variable name on both sides: #one:A#two.b = #one.c#two:A", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one:A#two.b")[0].left, HashDots.parse("#one.c#two:A")[0].left);
    expect(res.start).to.be.equal(0);
    expect(res.stop).to.be.equal(2);
    expect(res.varMap).to.deep.equal({':A-37': '.c', ':A-38': '.b'});
  });
  it("HashDots.subsetMatch on the second occurence: #one#two#three#one#four, #one#four", function () {
    const res = HashDots.subsetMatch(HashDots.parse("#one#two#three#one#four")[0].left, HashDots.parse("#one#four")[0].left);
    expect(res.start).to.be.equal(3);
    expect(res.stop).to.be.equal(2);
    expect(res.varMap).to.deep.equal({});
  });
});

describe("HashDotMap.transform & .transform(..).first()", function () {
  it("HashDotMap.make()", function () {
    const map = HashDotMap.make("#one:A:B = #two:A#three:B");
    // expect(map.rules[0]).to.deep.equal({
    //   "left": [{
    //     "tagName": "#one",
    //     "tagValue": "one",
    //     "args": [":A-41", ":B-41"],
    //     "flatArgs": [undefined, undefined]
    //   }],
    //   "right": [{
    //     "tagName": "#two",
    //     "tagValue": "two",
    //     "args": [":A-41"],
    //     "flatArgs": [undefined]
    //   }, {
    //     "tagName": "#three",
    //     "tagValue": "three",
    //     "args": [":B-41"],
    //     "flatArgs": [undefined]
    //   }]
    // });
  });

  it("#one:A:B = #two:A#three:B", function () {
    const routeMap = HashDotMap.make("#one:A:B = #two:A#three:B");
    const right = routeMap.ruleIsSubsetOfQuery("#one.a.b").transform().first();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#two.a#three.b");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#two.a#three.b").transform().first();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#one.a.b");
  });
  it("#one:A:B = #two:A#three:B; #alpha = #one::X#x", function () {
    const routeMap = HashDotMap.make("#one:A:B = #two:A#three:B; #alpha = #one::X#x");
    const left = routeMap.reverse().queryIsSubsetOfRule("#three.b").translate().first();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#one:A-45.b");
  });
  it("#one:A:B = #two:A#three:B", function () {
    const routeMap = HashDotMap.make("#one:A:B = #two:A#three:B");
    const right = routeMap.ruleEqualsQuery(`#one.'hello'."world"`).transform().first();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal(`#two.'hello'#three."world"`);
    const left = routeMap.reverse().ruleEqualsQuery(`#two.'hello'#three."world"`).transform().first();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal(`#one.'hello'."world"`);
    expect(left[0].flatArgs).to.deep.equal(["hello", "world"]);
  });
  it("#nothing#one:A:B = #two:A#three:B", function () {
    const routeMap = HashDotMap.make("#nothing#one:A:B = #two:A#three:B");
    const right = routeMap.ruleIsSubsetOfQuery("#nothing#one.a.b").transform().first();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#two.a#three.b");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#two.a#three.b").transform().first();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#nothing#one.a.b");
  });
  it("#one::A = #two::A", function () {
    const routeMap = HashDotMap.make("#one::A = #two::A");
    const right = routeMap.ruleIsSubsetOfQuery("#one.a.b").transform().first();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#two.a.b");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#two.a.b.c").transform().first();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#one.a.b.c");
  });
  it("#red:A = #orange:A ; #orange:B = #yellow:B", function () {
    const routeMap = HashDotMap.make("#red:A = #orange:A; #orange:B = #yellow:B");
    const right = routeMap.ruleIsSubsetOfQuery("#red.re").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#yellow.re");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#yellow.ye").transform().tillTheEnd().pop();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#red.ye");
  });
  it("#red:A = #orange:A ; #orange:A = #yellow:A   (Same variable name across different HashDot statements)", function () {
    const routeMap = HashDotMap.make("#red:A = #orange:A; #orange:A = #yellow:A");
    const right = routeMap.ruleIsSubsetOfQuery("#red.re").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#yellow.re");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#yellow.ye").transform().tillTheEnd().pop();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#red.ye");
  });
  it("#a:X = #aa:X ; #b:X = #bb:X ; #a:X#b:Y = #cc:X:Y  (Rule order is preserved and given priority)", function () {
    const routeMap = HashDotMap.make("#a:A = #aa:A; #b:B = #bb:B; #a:A#b:B = #cc:A:B");
    const right = routeMap.ruleIsSubsetOfQuery("#a.1#b.2").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#aa.1#bb.2");
    const left = routeMap.reverse().ruleIsSubsetOfQuery("#cc.1.2").transform().tillTheEnd().pop();
    expect(left.map(dot => dot.toString()).join("")).to.be.equal("#a.1#b.2");
  });
  it("#b:X = #c:X ; #a:X = #b:X  (Rule order problem for variables)", function () {
    const routeMap = HashDotMap.make("#b:A = #c:A; #a:A = #b:A");
    const right = routeMap.ruleIsSubsetOfQuery("#a.1").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#c.1");
  });
  it("#x = #y ; #a = #x ; #b = #a  (Need to run the same rule twice)", function () {
    const routeMap = HashDotMap.make("#x = #y; #a = #x; #b = #a");
    const right = routeMap.ruleIsSubsetOfQuery("#a#b").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#y#y");
  });
  it("#a#x = #y.1 ; #c#x = #y.2 ; #b = #x ; #d = #x  (Need to output the same hashtag with different parameters)", function () {
    const routeMap = HashDotMap.make("#a#x = #y.1; #c#x = #y.2; #b = #x; #d = #x");
    const right = routeMap.ruleIsSubsetOfQuery("#a#b#c#d").transform().tillTheEnd().pop();
    expect(right.map(dot => dot.toString()).join("")).to.be.equal("#y.1#y.2");
  });
});

describe("new Resolvers", function () {
  it("resolveRight: #book = #chp.1#chp.2#chp.3 ; #chp.1 = #chp.1.1#chp.1.2#chp.1.3", function () {
    const routeMap = HashDotMap.make("#book = #chp.1#chp.2#chp.3; #chp.1 = #chp.1.1#chp.1.2#chp.1.3");

    for (let r of routeMap.ruleEqualsQuery("#book").translate())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal("#chp.1#chp.2#chp.3");

    for (let r of routeMap.ruleIsSubsetOfQuery("#book#test.abc").transform())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal("#chp.1#chp.2#chp.3#test.abc");

    for (let r of routeMap.ruleIsSubsetOfQuery("#test.abc#book").transform())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal("#test.abc#chp.1#chp.2#chp.3");
  });

  it("HashDotMap.resolver('#chp:X')", function () {
    const rules = `
      #chp.1 = #txt.hello; 
      #chp.2 = #txt.world; 
      
      #chp.1.1 = #txt.go; 
      #chp.1.2 = #txt.figure`;
    const routeMap = HashDotMap.make(rules);

    let res = ["#chp.1", "#chp.2"];
    for (let r of routeMap.ruleEqualsQuery("#chp:X").find())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal(res.shift());

    res = ["#chp.1.1", "#chp.1.2"];
    for (let r of routeMap.ruleEqualsQuery("#chp:X:Y").find())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal(res.shift());

    res = ["#chp.1.1"];
    for (let r of routeMap.ruleEqualsQuery("#chp:X:X").find())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal(res.shift());

    res = ["#chp.1.1", "#chp.1.2"];
    for (let r of routeMap.ruleEqualsQuery("#chp.1:Y").find())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal(res.shift());

    res = ["#chp.1", "#chp.2", "#chp.1.1", "#chp.1.2"];
    for (let r of routeMap.ruleEqualsQuery("#chp::X").find())
      expect(r.map(dot => dot.toString()).join("")).to.be.equal(res.shift());

    for (let r of routeMap.ruleEqualsQuery("#chp.2:Y").find())
      assert(false);
  });
});

describe("HashDotMap.resolver 2", function () {
  const rules = `
    #book = #chp1#chp2;
    
    #chp.1 = #txt.hello#h1.something; 
    #chp.2 = #txt.world; 
    
    #chp.1.1 = #txt.go; 
    #chp.1.2 = #txt.figure;
                                                          
    #title#chp.1 = #long.'hello world';
    
    `;


  // #chp.1 ?< ...
  //
  //All the operations are described looking at the map from left to right.
  //But everything can be performed right to left, in reverse.

  //We have the matching first:
  // a) match exactly                             .matchAsEquals("#chp1")       => #chp.1
  // c) match the input as a subset of the rule   .matchAsSub("#chp1")          => #title#chp.1 & #chp.1
  // b) match the rule as a subset of the input   .matchAsSuper("#title#chp1")  => #title#chp.1 & #chp.1

  //                                              .matchAsEquals("#chp1", true)       => #chp.1
  //                                              .matchAsSub("#chp1", true)          => #title#chp.1 & #chp.1
  //                                              .matchAsSuper("#title#chp1", true)  => #title#chp.1 & #chp.1

  //The match returned is an:
  // x) an iterable result.
  // y) when we have the result, we can ask for the input, rule hit side, rule replace side (both original and flattened).
  // z) we can also ask for the input with the matching rule replaced within it as a subset.
  //    The match result must here internally contain the start and stop position and the variable map of the input where the match occurs.
  // w) when we want to run to completion, we simply make a loop that says,
  //    while there is a new result, use this result to make a new query from scratch until there are no more results available.
  //    This probably should not be part of the HashDotMap?? Just a pattern of how to use it??
  //    But how heavy is this thing?? Should I do as told and not consider performance until later?? yes, probably..
});

describe("Syntactic errors (HashDots.parse())", function () {
  it("Several universal parameters", () => {
    try {
      HashDots.parse("#a::B::C");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot syntax error: DoubleDots '::' must be the only argument.\nInput:  #a::B::C\nError:       ↑");
    }
  });
  it("Line start with different symbol", () => {
    try {
      HashDots.parse(".error");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot sequence must start with #,!,/ or ;.\nInput:  .error\nError:  ↑");
    }
  });
  it("Line start without # and ends with different symbol", () => {
    try {
      HashDots.parse("error@");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot sequence must start with #,!,/ or ;.\nInput:  error@\nError:  ↑");
    }
  });
  it("Empty #", () => {
    try {
      HashDots.parse("#empty#");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot syntax error:\nInput:  #empty#\nError:        ↑");
    }
  });
  it("Empty .", () => {
    try {
      HashDots.parse("#empty.");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot syntax error:\nInput:  #empty.\nError:        ↑");
    }
    try {
      HashDots.parse("#no.missing.#args");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot syntax error:\nInput:  #no.missing.#args\nError:             ↑");
    }
  });
  it("HashDot wrong sequence", () => {
    try {
      HashDots.parse("#a.b c#d");
      assert(false);
    } catch (err) {
      expect(err.message).to.deep.equal("HashDot syntax error:\nInput:  #a.b c#d\nError:       ↑");
    }
  });
  it("Different number of the arguments in the exactMatch()", function () {
    const routeMap = HashDotMap.make("#one:A:B = #two:A#three:B");
    const right = routeMap.ruleEqualsQuery(`#one.'hello'."world" #two.'goodbye'`).transform().first();
    expect(right).to.be.equal(undefined);
    const left = routeMap.reverse().ruleEqualsQuery(`#two.'hello'."world" #three."world"."abc"`).transform().first();
    expect(left).to.be.equal(undefined);
  });
});
