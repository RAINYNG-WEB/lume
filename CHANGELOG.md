## 0.0.4

**General**

- ADD samsara.css, samsara.js, samsara.min.js bundles
- ADD `dom` directory
- ADD `index.js` files for concatenation
- MOVE `Surface`, `Context`, `ContainerSurface` to `dom` directory
- MOVE `EventHandler` and `EventEmitter` to `events` directory
- UPDATE `samsara.css` for streamlining. Delete from `core` directory
- UPDATE require.js paths to be relative
 
**Core**

- UPDATE `Engine` to private class. Strip DOM dependency.
- UPDATE `Context` with `mount` method and new API use
- UPDATE `Transitionable.halt` emits events
- UPDATE `LayoutNode` and `SizeNode` created with JSON automatically
- FIX `Timer` clearing

**Layouts**

- UPDATE `SequentialLayout` to output length stream
- ADD Desktop version of `Scrollview`

## 0.0.3

**General**

- UPDATE documentation. Many more examples. 
- UPDATE Samsara.css. `samsara-surface` no longer has `preserve-3d` and
 `samsara-context` doesn't assume full-screen mode.

**Core**

- UPDATE `Context` to support taking pre-existing DOM elements 
- UPDATE `SizeNode` and `Surface` to accept aspect ratios
- UPDATE Commit functions removed. Stream all the things!
- UPDATE `resize` event emitted in `Surface`
- RENAME `SceneGraphNode` is now `RenderNode`
- FIX debounce method in `Timer`
- FIX reference bug for `DEFAULT_OPTIONS`

**Inputs**

- UPDATE `ScrollInput` calls `event.preventDefault()`

**Streams**

- UPDATE `Accumulator` has a `set` method and emits `start`, `end` events

**Layouts**

- UPDATE `DrawerLayout` default velocityThreshold to Infinity

## 0.0.2

**General**

- UPDATE documentation
	
**Core**

- ADD `Engine.size` property
- ADD `Engine.createRoot` method
- ADD `Transform.scaleX/Y/Z` methods
- FIX `Surface` dirtying
- FIX `Surface` overriding content of pre-existing elements
	
**Layouts**

- ADD `GridLayout`

## 0.0.1

- Initial release