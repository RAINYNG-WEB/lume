import type {Element3D, Element3DAttributes} from './Element3D'
import type {ReactElementAttributes} from '@lume/element/src/react'

// React users can import this to have appropriate types for the element in their JSX markup.
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-element3d': ReactElementAttributes<Element3D, Element3DAttributes>
		}
	}
}

// TODO move this to the elemet-behaviors package.
declare global {
	namespace React {
		// Attributes for all elements.
		interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
			has?: string
		}
	}
}
