![nuxt-delay-hydration](https://repository-images.githubusercontent.com/343991410/68f83b80-811f-11eb-9638-51aed75785c4)


<h1 align='center'>nuxt-delay-hydration</h1>

<p align='center'>
Improve your Nuxt.js Google Lighthouse score by delaying hydration ⚡️<br>
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/nuxt-delay-hydration'>
<img src='https://img.shields.io/npm/v/nuxt-delay-hydration?color=0EA5E9&label='>
<img src='https://github.com/harlan-zw/nuxt-delay-hydration/actions/workflows/test.yml/badge.svg' >
</a>
</p>


## Features

- ⚡️ Instantly increase your Google Lighthouse score by reducing "Blocking Time"
- 🍃 Pre-configured to minimise user experience issues
- 🧩 Multiple implementation options
- 🔁 (optional) Replay pre-hydration clicks

<br>

<details>
  <summary><b>Should I use this module</b></summary>

The module is tested on simple full-static Nuxt.js (SSG) apps, such as
documentation, blogs and misc content sites. It will not run in any other mode at this stage.

The following optimisations should be done prior to using this module:
- [LCP](https://web.dev/lcp/)
- [CLS](https://web.dev/cls/)
- Non-hydrated functionality, see [testing](#testing)

It's also recommended that you [benchmark](#benchmark) your app in Google Lighthouse before starting.
</details>

<br>

<details>
  <summary><b>Motivation</b></summary>

Hydrating Vue apps is expensive, especially with Vue 2. Google Lighthouse penalises hydration with a high "Total Blocking Time" and "Time to Interactive".

While this is unavoidable in most apps, for static sites which depend on minimal interactivity, it is possible and safe
to delay the hydration to avoid this penalty.

The current solution for delaying hydration is [vue-lazy-hydration](https://github.com/maoberlehner/vue-lazy-hydration) which works well.
However, it can require a lot of tinkering, may break your HMR and add avoidable complexity.

Nuxt Delay Hydration aims to provide optimisations with  minimal tinkering, by making certain assumptions on trade-offs.
</details>

<br>

<details>
  <summary><b>How it works</b></summary>

A promise is injected into your app. 
The promise is resolved as soon as either of these events have fired:

- an interaction event (mouse move, scroll, click, etc)
- an idle callback with a fixed timeout

Depending on which mode you pick, depends on where in your apps lifecycle the promise is awaited.
</details>


## Install

```bash
yarn add nuxt-delay-hydration -D
# npm i nuxt-delay-hydration -D
```

⚠️ This module is beta, use with caution.

## Usage

Within your `nuxt.config.js` add the following.

```js
// nuxt.config.js
export default {
  buildModules: [
    'nuxt-delay-hydration',
  ],
}
```


## Choosing a mode

By default, no mode is selected, you will need to select how you would the module to work.

*Type:* `init` | `mount` | `manual` | `false`

*Default:* `false`

| Type   |      Description    | Use Case |
|----------|:-------------|------:|
| `false` _default_ |  Disable the module | Testing |
| [init](#init-mode) | Delays Nuxt app creation. All code is delayed including plugins and third-party scripts. |  Zero or minimal plugins / modules. |
| [mount](#mount-mode) | Delays Nuxt after creation and before mounting. Plugins and some third-party scripts will work. |   Minimal non-critical plugins and third-party plugins. |
| [manual](#manual-mode) | Delay is provided by the `DelayHydration` component. Extends `vue-lazy-hydration` |  All other apps |

Regardless of the mode you choose, please read [further app optimisations](#further-app-optimisations).

### Init Mode

Delays hydration before the Nuxt app is created. Your entire app, including plugins, will be delayed. 
This will provide the biggest speed improvements however is the riskiest and may increase
other metrics with delayed network requests.

_Pros:_ Provides the biggest blocking time reduction

_Cons:_ Risky if you have critical third party scripts

_Benchmark:_ ~90% reduction

```js
export default {
  delayHydration: {
    mode: 'init'
  }
}
```

### Mount Mode

Delays hydration once your app is created (all plugins and vendor bundle loaded) and is about to be mounted. This delays
your layout and page components.

_Pros:_ Safer and still provides significant good optimisation

_Cons:_ May still break certain layouts if they are js dependent.

_Benchmark:_ ~70% reduction

```js
export default {
  delayHydration: {
    mode: 'mount'
  }
}
```


### Manual Mode

Using the manual mode, you manually specify what part of your app you'd like to delay. Useful for when you need some part of the
page to always hydrate immediately, such as a navigation drawer.

_Pros:_ Safest way to optimise 

_Cons:_ May not provide significant improvements, depends on how you use it


```js
export default {
  delayHydration: {
    mode: 'manual'
  }
}
```

#### DelayHydration component

Once you have set the mode, you need to use the component. It's recommended you use the component within
your layout file.

```vue
<template>
<div>
    <my-header />
    <delay-hydration>
        <!-- You must have a single child node as the slot -->
        <div>
            <main>
                <nuxt />
            </main>
            <my-footer />
        </div>
    </delay-hydration>
</div>
</template>
```

This component is a wrapper for a pre-configured [vue-lazy-hydration](https://github.com/maoberlehner/vue-lazy-hydration) component.

If you're using [nuxt/components](https://github.com/nuxt/components) then no import is required. Otherwise you can import 
the component as:

```js
import { DelayHydration } from 'nuxt-delay-hydration/dist/components'
```

The behaviour of the component should be controlled by the [advanced configuration](#advanced-configuration), however props 
are provided for convenience. 

**Props**

_forever_: `boolean:false` Toggle the hydration delay to last forever

_debug_: `boolean:false` Toggle the debug logging

_replayClick_: `boolean:false` Toggle the click replay

## Guides

### Debugging

<details>
  <summary>Debug mode</summary>
</details>

<details>
  <summary>Delay hydration forever</summary>
</details>

<details>
  <summary>Visualising the hydration status</summary>
</details>


### Benchmarking

<details>
  <summary>How to benchmark your app</summary>
It's important to measure the performance changes this module and any configuration changes you make.

The simplest way to benchmark is to use the Google Lighthouse tool within Google Chrome.

I recommend generating your static app completely in production mode and start it. `nuxt geneeate && nuxt start`

Open a private window and begin the performance tests. You will want to look at the score overall and the Total Blocking Time.
</details>

### Replaying hydration click


## Advanced Configuration

Configuration should be provided on the `delayHydration` key within your nuxt config.

If you're finding the lab or [field data](https://web.dev/lab-and-field-data-differences/) is not performing, you may want to
tinker with this advanced configuration.

### Event Hydration

**hydrateOnEvents**

- Type: `string[]`
- Default: `[ 'mousemove', 'scroll', 'keydown', 'click', 'touchstart', 'wheel' ]`

Controls which browser events should trigger the hydration to resume. By default, it is quite aggressive to avoid
possible user experience issues.

**replayClick**

- Type: `boolean`
- Default: `false`

If the trigger for hydration was a click, you can replay it. Replaying it will re-execute the event when it is presumed your 
app is hydrated. 

For example, if a user clicks a hamburger icon and hydration is required to open the menu, it would replay the click once hydrated.

⚠️ This is experimental, use with caution.

**replayClickMaxEventAge**

- Type: `number` (milliseconds)
- Default: `1000`

The replay click event will not run if the hydration takes more than the limit specified.

This limit is designed to avoid possible user experience issues.


### Idle Hydration

**idleCallbackTimeout**

- Type: `number` (milliseconds)
- Default: `7000`

When waiting for an idle callback, it's possible to define a max amount of time to wait in milliseconds. This is
 useful when there are a lot of network requests happening.

**postIdleTimeout**

- Type: `{ mobile: number, desktop: number }` (milliseconds)
- Default: `{ mobile: 6000, desktop: 5000, }`

How many to wait (in milliseconds) after the idle callback before we resume the hydration. This extra timeout is required
to avoid the standard "blocking", we need to provide real idle time to lighthouse.

Mobile should always be higher than desktop as the CPU capacity will generally be a lot less than a desktop.

_Note: The default will likely be customised in the future based on further benchmarking._

### Debugging

**debug**

- Type: `boolean`
- Default: `false`

Log details in the console on when hydration is blocked and when and why it becomes unblocked.

**forever**

- Type: `boolean`
- Default: `false`

Run the delay forever, useful for testing your app in a non-hydrated state.

## Credits

- [Markus Oberlehner](https://github.com/maoberlehner). Great articles on Vue hydration and vue-lazy-hydration 


## License

MIT License © 2021 [Harlan Wilton](https://github.com/harlan-zw)

