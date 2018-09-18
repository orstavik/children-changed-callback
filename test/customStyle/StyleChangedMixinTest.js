import {StyleChangedMixin} from "../../src/StyleChangedMixin.js";

const raf_x = (counter, cb) => requestAnimationFrame(counter === 1 ? cb : () => raf_x(counter - 1, cb));

class StyleCallback extends StyleChangedMixin(HTMLElement) {

  static get observedStyles() {
    return ["--custom-css-prop-1"];
  }

  styleChangedCallback(name, newValue, oldValue) {
    this.testValue = this.testValue || [];
    this.testValue.push({name, newValue, oldValue});
  }
}

customElements.define("style-callback", StyleCallback);


describe('StyleChangedMixin basics', function () {

  it("extend HTMLElement class and make an element", function () {
    const StyleChangedElement = StyleChangedMixin(HTMLElement);
    customElements.define("must-use-custom-elements-define-to-enable-constructor-style", StyleChangedElement);
    const el = new StyleChangedElement();
    expect(el.constructor.name).to.be.equal("StyleChangedMixin");
  });

  it("subclass StyleChangedMixin", function () {
    const SubclassStyleChangedElement = class SubclassStyleChanged extends StyleChangedMixin(HTMLElement) {
      test() {
        return "abc";
      }
    };
    customElements.define("subclass-size-changed", SubclassStyleChangedElement);
    const el = new SubclassStyleChangedElement();
    expect(el.constructor.name).to.be.equal("SubclassStyleChanged");
    expect(el.test()).to.be.equal("abc");
  });

  it("subclass StyleChangedMixin anonymous", function () {
    const SubclassStyleChangedElement = class extends StyleChangedMixin(HTMLElement) {
      test() {
        return "abc";
      }
    };
    customElements.define("subclass-size-changed-element", SubclassStyleChangedElement);
    const el = new SubclassStyleChangedElement();
    expect(el.constructor.name).to.be.equal("SubclassStyleChangedElement");
    expect(el.test()).to.be.equal("abc");
  });
  it("extend HTMLElement class correctly and make an element", function () {
    const el = new StyleCallback();
    let proto = el.constructor;
    expect(proto.name).to.be.equal("StyleCallback");
    proto = Object.getPrototypeOf(proto);
    expect(proto.name).to.be.equal(StyleChangedMixin.name);
    proto = Object.getPrototypeOf(proto);
    expect(proto.name).to.be.equal("HTMLElement");
  });
});

describe("StyleChangedMixin change  the style", function () {

  it("Set default css property value and startup trigger", function (done) {
    let el = new StyleCallback();
    el.style.setProperty("--custom-css-prop-1", "one");
    document.querySelector("body").appendChild(el);
    requestAnimationFrame(function () {
      expect(el.testValue[0].name).to.be.equal("--custom-css-prop-1");
      expect(el.testValue[0].newValue).to.be.equal("one");
      expect(el.testValue[0].oldValue).to.be.equal(undefined);
      document.querySelector("body").removeChild(el);
      done();
    })
  });


  it("Change css property value and check new values several times", function (done) {
    let el = new StyleCallback();
    el.style.setProperty("--custom-css-prop-1", "one");
    document.querySelector("body").appendChild(el);
    setTimeout(() => el.style.setProperty("--custom-css-prop-1", "two"), 50);
    setTimeout(() => el.style.setProperty("--custom-css-prop-1", "three"), 100);
    setTimeout(() => {
      Promise.resolve().then(() => {
        expect(el.testValue[0].name).to.be.equal("--custom-css-prop-1");
        expect(el.testValue[0].oldValue).to.be.equal(undefined);
        expect(el.testValue[0].newValue).to.be.equal("one");
        expect(el.testValue[1].name).to.be.equal("--custom-css-prop-1");
        expect(el.testValue[1].oldValue).to.be.equal("one");
        expect(el.testValue[1].newValue).to.be.equal("two");
        expect(el.testValue[2].name).to.be.equal("--custom-css-prop-1");
        expect(el.testValue[2].oldValue).to.be.equal("two");
        expect(el.testValue[2].newValue).to.be.equal("three");
        document.querySelector("body").removeChild(el);
        done();
      });
    }, 150)
  });
});