# Web component design patterns

## The native web components cookbook

"The web component design patterns" is a set of recipes for developing simple and reusable web components. 
This book does not rely on any framework: all patterns are intended to run natively on any browser 
that supports the whatwg HTML spec for web components and vanilla es6. 
However, although different frameworks might require a different mode of implementation, 
most of the patterns described here should be relevant for developers using other frameworks.

WC patterns consists of two types of recipes:
* patterns that explain how to build web components and
* isolated functional mixins that both explain and implement a few key, frequent use-cases.

The isolated functional mixins presented do **not** make a framework. 
In fact, it is the ambition with this book that you no longer need a framework to build
scalable, manageable, simple, yet powerful web apps. Modern browsers now has all the power you desire.
Hence, every mixin strives for no other dependencies than itself and the (polyfilled) platform. 

The following mixins are directly available via rawgit.com and unpkg.com:

**Regular mixins:**
* [EnterViewMixin.js](src/EnterViewMixin.js)
* [FirstConnectedMixin.js](src/FirstConnectedMixin.js)
* [HashChangedMixin.js](src/HashChangedMixin.js)
* [ResizeMixin.js](src/ResizeMixin.js)
* [SlotchangeMixin.js](src/SlotchangeMixin.js)
* [StaticSlotchangeMixin.js](src/StaticSlotchangeMixin.js)

**Gestures:**
* [gestures/DraggingFling.js](src/gestures/DraggingFling.js)
* [gestures/PinchSpin.js](src/gestures/PinchSpin.js)
* [gestures/Swipe.js](src/gestures/Swipe.js)

**Other resources:**
* [polyfill-loader.js](src/polyfill-loader.js)
* [flattenNodes.js](src/flattenNodes.js)

Example of complete links:
 * [https://unpkg.com/joicomponents@1.2.0/src/SlotchangeMixin.js](https://unpkg.com/joicomponents@1.2.0/src/SlotchangeMixin.js)
 * [https://cdn.rawgit.com/orstavik/JoiComponents/master/src/EnterViewMixin.js](https://rawgit.com/orstavik/JoiComponents/master/src/EnterViewMixin.js)

|            | Atomic  | Composed |
| ---------- |-------- | -------- |
| lifecycle<br>sequential  | **constructor()**<br>**connectedCallback()**<br>**disconnectedCallback()**<br>firstConnectedCallback()<br>enterViewCallback()<br>setupCallback() |  |
| event<br>random      | **attributeChangedCallback(name, oldValue, newValue)**<br>**adoptedCallback()**<br>slotchangeCallback(name, newFlattenedChildNodes, oldFlattenedChildNodes)<br>resizeCallback(contentRect)<br>hashchangedCallback("hash")<br> | dragFlingCallbacks<br>pinchCallbacks<br>swipeCallbacks|

## Chapter 1: How to make a web component?
1. [Define, load and use custom elements](book/chapter1/Pattern1_CreateElement.md)
2. [How to shadowDOM](book/chapter1/HowTo_shadowDOM.md)
3. [How to `<slot>`](book/chapter1/HowTo_slot.md)
4. [How to name `<slot>`s](book/chapter1/HowTo_namedSlots.md)
5. [How to chain `<slot>`s](book/chapter1/HowTo_chainSlots.md)
6. [Pattern: createShadowDOM](book/chapter1/Pattern1_shadowDomStrategies.md)
7. [Pattern: `slotchange`](book/chapter1/Pattern2_slotchange.md)
8. [How to `MutationObserver`](book/chapter1/HowTo_MutationObserver.md)
<!--9. [Discussion: slotchange](book/chapter1/Old_slotchange.md)-->

## Chapter 1b: How to make mixins
1. [Reactive method](book/chapter1b_HowToMakeMixins/Pattern1_ReactiveMethod.md)
2. [Isolated functional mixin](book/chapter1b_HowToMakeMixins/Pattern2_FunctionalMixin.md)
3. [StaticSetting](book/chapter1b_HowToMakeMixins/Pattern3_StaticSettings.md)
4. [EventRecording](book/chapter1b_HowToMakeMixins/Pattern4_EventRecording.md)
5. [DebounceCallbacks](book/chapter1b_HowToMakeMixins/Pattern5_DebounceCallbacks.md)
6. [OptionalCallbacksEvents](book/chapter1b_HowToMakeMixins/Pattern6_OptionalCallbacksEvents.md)
7. [MixinPrivateAndGlobal](book/chapter1b_HowToMakeMixins/Pattern7_MixinPrivateAndGlobal.md)
8. [Discussion: isolate FunctionalMixins](book/chapter1b_HowToMakeMixins/Discussion_IsolatedFunctionalMixin.md)
<!--9. [MixinPrivateAndGlobal](book/chapter1b_HowToMakeMixins/PatternY_second-level-function-mixin.md)-->

## Chapter 2a: Lifecycle callbacks
1. [Intro: native callbacks](book/chapter2a_basicMixins_LifeCycle/Intro_native_lifecycle_hooks.md)
2. [.firstConnectedCallback()](book/chapter2a_basicMixins_LifeCycle/Mixin4_FirstConnectedMixin.md)
3. [.firstOpportunityCallback()](book/chapter2a_basicMixins_LifeCycle/chapterSetup/Mixin6_FirstOpportunityMixin.md)
4. [.enterViewCallback()](book/chapter2a_basicMixins_LifeCycle/Mixin5_EnterViewMixin.md)

## Chapter 2b: Event callbacks
1. [.attributeChangedCallback()](book/chapter2b_basicMixins_whileConnected/HowTo_attributeChangedCallback.md)
5. [.slotchangedCallback()](book/chapter2b_basicMixins_whileConnected/Mixin1_SlotchangeMixin.md)
6. [.resizeCallback()](book/chapter2b_basicMixins_whileConnected/Mixin2_ResizeMixin.md)

## Chapter 3: Gestures
1. [Sloppy fingers](book/chapter3_gestures/Problem1_sloppy_fingers.md)
2. [Gesture stuttering](book/chapter3_gestures/Problem2_gesture_stuttering.md)
3. [Touch makes mouse](book/chapter3_gestures/Problem3_touch_the_mouse.md)
4. [Conflicting gestures](book/chapter3_gestures/Problem4_conflicting_gestures.md)
5. [InvadeAndRetreat!](book/chapter3_gestures/Pattern5_InvadeAndRetreat.md)
6. [Coarse sensors](book/chapter3_gestures/Problem5_coarse_sensors.md)
7. [DragFlingMixin](book/chapter3_gestures/Mixin1_DraggingFlingGesture.md) (PointerGesture)
8. [SwipeFlingMixin](book/chapter3_gestures/Mixin2_FlingEventMixin.md) (MultiFingerGesture)
9. [PinchGesture](book/chapter3_gestures/Mixin3_PinchSpinGesture.md) (TwoFingerGesture)

## Chapter 4: Patterns for HTML Composition
1. [Introduction: HTML is list](book/chapter4/Intro_HTML-Lists.md)
2. [FosterParentChild (`<ul-li>`)](book/chapter4/Pattern1_FosterParentChild.md)
3. [HelicopterParentChild (`<ol>+<li>`)](book/chapter4/Pattern2_HelicopterParentChild.md)
4. [CulDeSacElements (`<img>`)](book/chapter4/Pattern3_CulDeSacElements.md)
5. [MiniMeDOM (make the index in `<the-book>+<a-chapter>`)](book/chapter4/Pattern4_MiniMe.md)
6. [Pattern: JSONAttributes](book/chapter4/Pattern_jsonAttributes.md)
7. [Discussion: HTML composition](book/chapter4/Discussion_HTML_composition.md)


<!--
A. Polymer BaseElement with just mapping properties to attributes.
B. LitElement and its ._render() method.

Put A and B in the chapter 1?

Y. Lazy-img 
Dont know where to put this one. :Chapter on use-case examples??
Element to wrap methods for lazy-loading image. 
Sometimes, this needs to be inlined. But often not, only loaded first.
Look at the lighthouse presentation Google/IO

Z. Sibling based ordered list.

-->

## Chapter 5: Style                                   
1. [`this.style` is not my style](book/chapter5/Pattern1_this_style_is_not_my_style.md) 
2. [`:host()` with `<style>`](book/chapter5/Pattern2_host_with_style.md) 
3. [CSS variables](book/chapter5/Pattern3_css_variables.md) 
4. [Compound elements, replace CSS pseudo elements](book/chapter5/Pattern4_css_pseudo_elements.md) 
5. [ResponsiveLayout, extend CSS media queries](book/chapter5/Pattern5_ResponsiveLayout.md)
6. [Discussion about CSS pseudo elements and CSS media queries](book/chapter5/Discussion_mediaqueries_pseudoelements.md) 
<!---
7. Discussion. Coherence and style
* How to handle app-wide styling. Local coherence (cohesion), thematic coherence, global coherence.
When and why to put the content of an element in the lightDom? In app-specific elements where you want 
to apply global/thematic styles to the element. And when you have control of the use of that element.
Don't split this piece of the app into too many pieces. These pieces of the app should mostly be about 
template composition. And only minor event composition. If you need to apply a lot of UI logic, 
you probably need a generic UI web component.

8. keep it light. App specific components and style. Non-composable, but universally stylable.

9. Path based styling. Changing the path in the stylesheet, and not the class or attribute on the element.
Sometimes you have a tree structure in your DOM that reflects a tree structure in you state data.
When you have such a mapping, and you have everything in the same lightDOM accessible to the same stylesheets,
you can instead of changing each element, change the css paths that attribute styles to each element.
This is not for beginners. This is not necessarily a good pattern. But it is a pattern.
-->
## Chapter 6: How to polyfill web components?
1. [Introduction: What's a polyfill?](book/chapter6/Intro_Polyfills.md)
2. [FeatureDetection](book/chapter6/Pattern1_FeatureDetection.md)
3. [Dynamically loading scripts](book/chapter6/Pattern2_LoadScript.md)
4. [FeatureDetectAndPolyfill](book/chapter6/Pattern3_FeatureDetectAndPolyfill.md)
5. [Batch calls to customElements polyfill](book/chapter6/Pattern4_BatchCustomElementUpgrades.md)
6. [QueAndRecallFunctions](book/chapter6/Pattern5_QueAndRecallFunctions.md)
7. [SuperFun](book/chapter6/Pattern6_SuperFun.md)
8. [Polyfill loader](book/chapter6/Pattern7_PolyfillLoader.md)
9. [Polyfill loader generator](book/chapter6/Pattern8_PolyfillLoaderGenerator.md)
10. [Sync vs async polyfills](book/chapter6/Discussion_sync_vs_async_polyfilling.md)
11. [Webcomponentsjs](book/chapter6/Pattern9_webcomponentsjsCousin.md)
<!---
5. [Transpile web components to es5](tutorials/chapter1/PatternX_HowToPolyfillOnClient.md)
explain that custom elements with content in the lightDom should be considered app-specific components.
-->

<!---
## Chapter 8: Composition of app-specific web components
1. 
2. props down, (custom) events up
((ATT!! In generic custom elements, it is more children and attributes down, events up)).

3. dispatch and observe, in a joiState

2. MVC. Catching app events on window (or another element event bus 
(https://stackoverflow.com/questions/42757051/web-components-design-pattern)
).

<!--6. [KeepItLight - benefits of adding dom to the lightDom in app specific components is ](book/chapter4/Pattern5_KeepItLight.md)--> 

<!--
## Chapter 9: Single state management
1. Using an event bus. With a state mananger.
2. dispatching directly on an element. 
3. the concept of immutability. and the benefits of dirty checking.
4. what are reducers? and the benefit of pure functions.
5. what are computer functions? and the problem of either nesting reducers or redundant functionality.
6. why use observers? and the problem of managing async actions in a sync centralized state.
7. what is joiState and how to use it?
-->

<!--
### What do you mean "web component"?

Many different frameworks such as React and Angular enable developers to make components for the web.
However, components tailored and dependent on a framework we call by that frameworks name, such as 
"React component" or "Angular component". They are components made to be used on the web, 
but they are not what is commonly refered to as "web components".

"Web components" means a components that can run *natively* in a modern browser. 
"Web components" always imply "*native* web components".
They do not rely on a framework in browsers compliant with the whatwg and es6 specification.

Still, "web components" can mean many different things. 
On the one hand, when we say "web components", we might refer to the simplest custom element. 
A custom element that uses neither shadowDom nor HTML template, and that is directly defined before use in the app (no es6 module loading).
On the other hand, a "web component" might refer to a most advanced custom element.
A custom element with a HTML template based shadowDom, written by someone else and loaded as an es6 module.

To clarify this myriad of terms, I think it is wise to apply the following taxonomy.
If you intend for a web component to be reused, it should be made available as an importable module.
You should also highlight that the web component is intended to be "reusable", generic to many apps and 
complying more thoroughly with HTML standards. You often should add the label "reusable" to that component.

If you are talking about a `custom element` that uses neither shadowDom nor 

Web components provide an excellent interface for integrating custom HTML+JS+CSS modules. 
Once familiar with the makeup of web components, it is my contention that you no longer will need a framework.
Web components is enough. They provide a great means both to organize and stabilize your own work and 
collaborate with others. It might not be perfect. And it needs to be polyfilled in old browsers. 
But it will still provides you with the only, cleanest and simplest API for making native HTML+JS+CSS modules.
-->