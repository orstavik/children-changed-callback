# Pattern two-faced-collection (OlLi)

Two-faced-collection is a pattern for creating a certain type of custom element collections.
An HTML collection element is defined as an HTML element that needs to handle a group of items (children) **of unknown quantity**.
The two-faced-collection pattern is needed for HTML collection elements that need to either:
1. control changes for individual child elements based on information from the group as a whole, or
2. work with the spaces between each element.
When making two-faced-collections, use [ChildrenChangedMixin](ChildrenChangedMixin.md) to 
a) simplify the act of listening for dynamic changes to the DOM, and 
b) process slotted items on par with normal items.

HTML collections that do not need to interact with individual children based on group status, 
or work with the conceptual space between children elements, 
can simply put all such elements into a single slot and be done with it. 
HTML collections that handles a group of items (children) *of known quantity* 
can simply use named slots.

The container and the item type in the two-faced-collection pattern are strongly codependent.
Do not attempt to generalize the usage of each type to function independently, but treat them as 
inseperable and use them together as a pair.

### Example: custom OL + LI

#### Defining two custom element types
```javascript
import { ChildrenChangedMixin } from "https://unpkg.com/joicompontents@1.1.0/src/ChildrenChangedMixin.js";

class OlWc extends ChildrenChangedMixin(HTMLElement) {
                                                                                
  connectedCallback() {                                           
    super.connectedCallback();
    this.style.paddingLeft = "20px";
    this.style.display = "block";
  }
  childrenChangedCallback(oldChildren, newChildren, isSlot) {     //[2]
    newChildren
      .filter(item => item instanceof LiWc)
      .forEach((el, i) => el.updateNumber(i + 1));
  }
}

class LiWc extends HTMLElement {

  connectedCallback() {
    super.connectedCallback();
    this.attachShadow({ mode: "open" });
    this.style.display = "inherit";                      
    this.shadowRoot.innerHTML = `<span>#.</span><slot></slot>`;   //[1]
  }
  updateNumber(num) {                                             
    this.shadowRoot.children[0].innerText = num + ". ";           //[3]
  }
}

customElements.define("ol-wc", OlWc);
customElements.define("li-wc", LiWc);
```
1. The LiWc item element (LI) sets up a default shadowDom in which the number of the LI element thus far
is unspecified (`#. `).
2. When the OL is first connected, or whenever the list of visible children changes, 
the `childrenChangedCallback(...)` is triggered. This method iterates the list of children 
and notifies all LI children about their LI-only order in the list by calling `el.updateNumber(i+1)`.
3. When the LI element is notified about an updated position in its list, 
it updates it shadowDom to display that position.

#### Using two custom element types
The OlWc container element (OL) can contain several LiWc item elements (LI) as children.
These elements can be added in the template (as in the example below), added dynamically via 
`querySelector("ol-wc"").appendChild(newLiChild)`, or as a slot inside another custom element.
```
<ol-wc>
  <li-wc>one</li-wc>
  <li-wc>two</li-wc>
  <li-wc>three</li-wc>
</ol-wc>
```
Which looks like so:

```text
  1. one
  2. two
  3. three
```
[Custom Ol Li example on codepen.io](https://codepen.io/orstavik/pen/KoeLme).

### Example: custom columns
In this example, a set of columns is created by:
1. making a grid in the parent container, 
2. adding a left border on all the children items, and
3. hiding the left border only on the first item inside the container at all times.

[Custom column example on codepen.io](https://codepen.io/orstavik/pen/BrPKNp).

## Why do we need a component pair for this type of lists?
1. We do not want the collection element (OL) to neither alter the lightDom around itself nor its children.
Such changes would be extremely hard to manage. Such added content would look and feel the same as
content in the original template and content added dynamically.
The item element (LI) serves as a placeholder for the dynamic alterations 
that the container element needs to perform, so that the changes are isolated in the shadowDom and style 
of this item element so that they don't get confused with other parts of the DOM.

2. This pattern becomes more important when you need to:
    1. add more complex functionality such as custom UIX event handling to the element,
    2. add more complex template or style to the shadowDom, or
    3. handle the children differently either based on a) their content, 
    b) their type and/or c) their position in the collection.

### Opinion
This pattern feels a bit wrong at first, especially if you are a javascript developer.
In JS, such a pattern would be wrong. You should not create two types (two classes) like this 
in order to create a custom collection with custom behavior into which to put objects: 
you don't need to create an ItemClass in order to wrap objects you put in a CustomCollection.

However, in HTML, you don't have the same imperative logic as in JS. You don't have `for`-loops. 
You don't have variables. Therefore, designing HTML templates require a different logic than what 
you would do in JS. Using a wrapper element in HTML gives you both a) a different way to specify 
which children elements are to be iterated over how and when, and b) an alterable container into 
which data can vary from time to time.

#### References
* https://dom.spec.whatwg.org/#shadow-tree-slots