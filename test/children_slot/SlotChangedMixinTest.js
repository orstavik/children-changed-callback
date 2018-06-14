import {SlotChangeMixin} from "../../src/SlotChangedMixin.js";

const raf_x = (counter, cb) => requestAnimationFrame(counter === 1 ? cb : () => raf_x(counter - 1, cb));

describe('SlotChangeMixin basics', function () {

  var slotDIV;

  before(function () {
    slotDIV = document.createElement("div");
    slotDIV.id = "slot";
    document.querySelector("body").appendChild(slotDIV);
  });

  it("instanceof HTMLElement + constructor() working + can be inputed to customElements.define()", function () {
    const SizeChangedElement = SlotChangeMixin(HTMLElement);
    customElements.define("must-use-custom-elements-define-to-enable-constructor-slot", SizeChangedElement);
    const el = new SizeChangedElement();
    expect(el.constructor.name).to.be.equal("SlotChangeMixin");
    assert(el instanceof HTMLElement);
  });

  it("class extends SlotChangeMixin(HTMLElement) + has method", function () {
    const SubclassSizeChangedElement = class SubclassSizeChanged extends SlotChangeMixin(HTMLElement) {
      test() {
        return "abc";
      }
    };
    customElements.define("subclass-slot-changed", SubclassSizeChangedElement);
    const el = new SubclassSizeChangedElement();
    expect(el.constructor.name).to.be.equal("SubclassSizeChanged");
    assert(el instanceof HTMLElement);
    expect(el.test()).to.be.equal("abc");
  });

  //todo make mocha test for TypeError!! stupid mocha..
  // it("class extends SlotChangeMixin(HTMLElement) fails if it does not have shadowDOM when connected", function () {
  //   const SubclassSizeChangedElement = class SubclassSizeChanged extends SlotChangeMixin(HTMLElement) {
  //   };
  //   customElements.define("slotchange-fails", SubclassSizeChangedElement);
  //   const el = new SubclassSizeChangedElement();
  //   const b = slotDIV;
  //   expect(()=> b.appendChild(el)).to.throw("wtf");
  // });

  it("subclass SlotChangeMixin anonymous", function () {
    const SubclassSizeChangedElement = class extends SlotChangeMixin(HTMLElement) {
      test() {
        return "abc";
      }
    };
    customElements.define("subclass-slot-changed-element", SubclassSizeChangedElement);
    const el = new SubclassSizeChangedElement();
    expect(el.constructor.name).to.be.equal("SubclassSizeChangedElement");
    assert(el instanceof HTMLElement);
    expect(el.test()).to.be.equal("abc");
  });

  it("imperatively trigger SlotChangeMixin", function (done) {
    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <div>
            <slot></slot>
          </div>
        `;
      }

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
        expect(oldFlattenedChildren).to.be.equal(undefined);
        done();
      }
    };
    customElements.define("children-slot-div-added", Subclass);
    const el = new Subclass();
    el.appendChild(document.createElement("div"));
    slotDIV.appendChild(el);
    //todo test if this breaks when we are testing and using polyfills
    // Promise.resolve().then(() => slotDIV.removeChild(el));
  });

  it("imperatively trigger SlotChangeMixin, check that slots with no assigned value are considered empty", function (done) {
    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <div>
            <slot></slot>
          </div>
        `;
      }

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        expect(oldFlattenedChildren).to.be.equal(undefined);
        expect(newFlattenedChildren.length).to.be.equal(1);
        expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
        done();
      }
    };
    customElements.define("slot-changed-div-and-slot-added", Subclass);
    const el = new Subclass();
    el.appendChild(document.createElement("div"));
    el.appendChild(document.createElement("slot"));
    slotDIV.appendChild(el);
    //todo test if this breaks when we are testing and using polyfills
    // Promise.resolve().then(() => slotDIV.removeChild(el));
  });

  it("The super inner-outer-slot test", function (done) {

    var counter = 0;
    var counter2 = 0;
    var checks = 0;
    const InnerElementThatObserveChildren = class extends SlotChangeMixin(HTMLElement) {

      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <div><slot></slot></div>
        `;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        console.log("inner", checks);
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(2);
          expect(newFlattenedChildren[0].id).to.be.equal("a");
          expect(newFlattenedChildren[1].id).to.be.equal("b");
          counter++;
        } else if (counter === 1) {
          expect(oldFlattenedChildren.length).to.be.equal(2);
          expect(newFlattenedChildren.length).to.be.equal(3);
          expect(newFlattenedChildren[0].id).to.be.equal("a");
          expect(newFlattenedChildren[1].id).to.be.equal("b");
          expect(newFlattenedChildren[2].id).to.be.equal("c");
        }
        if (++checks === 4)
          done();
      }
    };

    const OuterElementThatSlotsStuff = class extends SlotChangeMixin(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <inner-component-slot><slot></slot></inner-component-slot>
        `;
      }

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        console.log("outer", checks);
        if (counter2 === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(2);
          expect(newFlattenedChildren[0].id).to.be.equal("a");
          expect(newFlattenedChildren[1].id).to.be.equal("b");
          counter2++;
        } else if (counter2 === 1) {
          expect(oldFlattenedChildren.length).to.be.equal(2);
          expect(newFlattenedChildren.length).to.be.equal(3);
          expect(newFlattenedChildren[0].id).to.be.equal("a");
          expect(newFlattenedChildren[1].id).to.be.equal("b");
          expect(newFlattenedChildren[2].id).to.be.equal("c");
        }
        if (++checks === 4)
          done();
      }
    };

    customElements.define("inner-component-slot", InnerElementThatObserveChildren);
    customElements.define("outer-component-slot", OuterElementThatSlotsStuff);
    const el = document.createElement("outer-component-slot");
    //no slotchange event until el is connected to the DOM
    el.innerHTML = `<div id="a">a</div><div id="b">b</div>`;
    slotDIV.appendChild(el);
    let c = document.createElement("div");
    c.id = "c";
    el.appendChild(c);
    // Promise.resolve().then(() => slotDIV.removeChild(el));
  });

  it("not listening for slotChange on slots that are not a direct child", function (done) {

    const InnerElementThatObserveChildren = class extends SlotChangeMixin(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        expect(oldFlattenedChildren).to.be.equal(undefined);
        expect(newFlattenedChildren.length).to.be.equal(3);
        expect(newFlattenedChildren[0].nodeType).to.be.equal(3);
        expect(newFlattenedChildren[1].nodeName).to.be.equal("DIV");
        expect(newFlattenedChildren[2].nodeType).to.be.equal(3);
        done();
      }
    };

    const OuterElementThatSlotsStuff = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <inner-listener-slot>
            <div>
              <slot></slot>
            </div>
          </inner-listener-slot>`;
      }
    };

    customElements.define("inner-listener-slot", InnerElementThatObserveChildren);
    customElements.define("outer-with-grandchild-slot-2", OuterElementThatSlotsStuff);

    const el = new OuterElementThatSlotsStuff();
    slotDIV.appendChild(el);
    //slotchangeCallback should be triggered here, because it is triggered at connectedCallback..
    el.appendChild(document.createElement("p"));
    //but slotchangeCallback should not be triggered here, since "p" is not a slotable node for inner-listener-slot
    // Promise.resolve().then(() => slotDIV.removeChild(el));
  });

  it("Event slotchange", function (done) {

    let counter = 0;

    const InnerElementIsSlot = class extends SlotChangeMixin(HTMLElement) {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(0);
          counter++;
          return;
        }
        if (counter === 1) {
          expect(oldFlattenedChildren).to.deep.equal([]);
          expect(newFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("P");
          done();
        }
      }
    };

    const OuterElementIsSlot = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
          <inner-slot><slot></slot></inner-slot>`;
      }
    };

    customElements.define("inner-slot", InnerElementIsSlot);
    customElements.define("outer-slot", OuterElementIsSlot);

    const el = new OuterElementIsSlot();
    slotDIV.appendChild(el);
    Promise.resolve().then(() => {
      el.appendChild(document.createElement("p"));
      // Promise.resolve().then(() => {
      //   slotDIV.removeChild(el);
      // });
    });
  });

  it("slotchangeCallback triggered on connect and re-connect, but NOT when the node is NOT connected to the DOM", function (done) {
    let counter = 0;

    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {


      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
          counter++;
        } else if (counter === 1) {
          expect(newFlattenedChildren.length).to.be.equal(3);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
          expect(newFlattenedChildren[1].nodeName).to.be.equal("DIV");
          expect(newFlattenedChildren[2].nodeName).to.be.equal("DIV");
          done();
        }
      }
    };

    customElements.define("connected-disconnected-connected-slot", Subclass);
    const el = new Subclass();
    el.appendChild(document.createElement("div"));    //is not triggered.
    slotDIV.appendChild(el);   //slotchangeCallback triggered on connect
    slotDIV.removeChild(el);   //disconnect
    el.appendChild(document.createElement("div"));    //is not triggered.
    el.appendChild(document.createElement("div"));    //is not triggered.
    slotDIV.appendChild(el);   //childrenChangedCallback triggered on connect
    Promise.resolve().then(() => slotDIV.removeChild(el));
  });

  it("slotchangeCallback triggered on connect and re-connect with wait.", function (done) {
    let counter = 0;

    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {

      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
          counter++;
          return;
        }
        if (counter === 1) {
          expect(oldFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren.length).to.be.equal(3);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("DIV");
          expect(newFlattenedChildren[1].nodeName).to.be.equal("DIV");
          expect(newFlattenedChildren[2].nodeName).to.be.equal("DIV");
          done();
        }
      }
    };
    customElements.define("connected-settimeout-disconnected-connected-slot", Subclass);
    const el = new Subclass();
    el.appendChild(document.createElement("div"));    //is not triggered.
    slotDIV.appendChild(el);   //slotchangeCallback triggered on connect
    Promise.resolve().then(() => slotDIV.removeChild(el));   //disconnect
    setTimeout(() => {
      el.appendChild(document.createElement("div"));    //is not triggered.
      el.appendChild(document.createElement("div"));    //is not triggered.
      slotDIV.appendChild(el);   //slotchangeCallback triggered on re-connect
      Promise.resolve().then(() => slotDIV.removeChild(el));   //disconnect
    }, 50);
  });

  it("slotchangeCallback is not triggered when grandchildren of host changes.", function (done) {

    let counter = 0;

    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {

      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren[0].id).to.be.equal("one");
          counter++;
        } else if (counter === 1) {
          expect(oldFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren.length).to.be.equal(2);
          done();
        }
      }
    };
    customElements.define("grandchildren-not-slotchange", Subclass);
    const el = new Subclass();
    el.innerHTML = "<div id='one'></div>";
    slotDIV.appendChild(el);   //slotchangeCallback triggered on connect
    el.querySelector("#one").appendChild(document.createElement("p")); //should not trigger slotchange as it is a grandchild of host
    el.appendChild(document.createElement("span")); //should trigger slotchange as it is a child of host
  });

  it("slotchangeCallback is not triggered when grandchildren with relevant slot='name' of host changes.", function (done) {

    let counter = 0;

    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {

      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot name="abc"></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        if (counter === 0) {
          expect(oldFlattenedChildren).to.be.equal(undefined);
          expect(newFlattenedChildren.length).to.be.equal(0);
          // expect(newFlattenedChildren[0].id).to.be.equal("one");
          counter++;
        } else if (counter === 1) {
          expect(oldFlattenedChildren.length).to.be.equal(0);
          expect(newFlattenedChildren.length).to.be.equal(1);
          expect(newFlattenedChildren[0].nodeName).to.be.equal("P");
          done();
        }
      }
    };
    customElements.define("grandchildren-named-not-slotchange", Subclass);
    const el = new Subclass();
    el.innerHTML = "<div id='one'></div>";
    slotDIV.appendChild(el);   //slotchangeCallback triggered on connect
    let newChild = document.createElement("p");
    newChild.setAttribute("slot", "abc");
    el.querySelector("#one").appendChild(newChild); //should not trigger slotchange as it is a grandchild of host
    el.querySelector("#one").removeChild(newChild);
    el.appendChild(newChild);                       //should trigger slotchange as it is a child of host
  });

  it("no name slot does not slot a named host's child element", function (done) {

    const Subclass = class Subclass extends SlotChangeMixin(HTMLElement) {

      constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `<slot></slot>`;
      };

      slotchangeCallback(slot, newFlattenedChildren, oldFlattenedChildren) {
        expect(slot).to.be.equal(this.shadowRoot.querySelector("slot"));
        expect(oldFlattenedChildren).to.be.equal(undefined);
        expect(newFlattenedChildren.length).to.be.equal(1);
        expect(newFlattenedChildren[0].id).to.be.equal("aaa");
        done();
      }
    };
    customElements.define("named-slot-not-into-no-named-slot", Subclass);
    const el = new Subclass();
    el.innerHTML = "<div id='aaa'></div>";
    slotDIV.appendChild(el);   //slotchangeCallback triggered on connect
    let newChild = document.createElement("p");
    newChild.setAttribute("slot", "abc");
    el.querySelector("#aaa").appendChild(newChild); //should not trigger slotchange as it is a grandchild of host
    el.querySelector("#aaa").removeChild(newChild);
    el.appendChild(newChild);                       //should not trigger slotchange as name and slot differs
    el.removeChild(newChild);
  });
});
