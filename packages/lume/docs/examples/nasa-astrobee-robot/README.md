# NASA Astrobee Robot

<div id="example"></div>
<script type="application/javascript">
  new Vue({
    el: '#example',
    template: '<live-code class="full" :template="code" mode="html>iframe" :debounce="200" />',
    data: {
      code:
`
<!--
  Collada model of NASA's Astrobee robot loaded into a space station scene.
  Model from https://github.com/nasa/astrobee_media/tree/master/astrobee_freeflyer/meshes.
-->

<script src="${location.origin+location.pathname}global.js"><\/script>

<style>
  html,
  body {
    width: 100%;
    height: 100%;
    margin: 0;
    background: black;
  }
  lume-scene {
    touch-action: none;
  }
</style>

<astrobee-app>

<script>
const {useDefaultNames, booleanAttribute, Element, element, attribute, html} = LUME

const bodyModelUrl = '${location.origin+location.pathname}examples/nasa-astrobee-robot/astrobee/body.dae'
const pmcModelUrl = '${location.origin+location.pathname}examples/nasa-astrobee-robot/astrobee/pmc.dae'
const pmcSkinModelUrl = '${location.origin+location.pathname}examples/nasa-astrobee-robot/astrobee/pmc_skin_.dae'
const pmcBumperModelUrl = '${location.origin+location.pathname}examples/nasa-astrobee-robot/astrobee/pmc_bumper.dae'

// Find more at https://blog.kuula.co/360-images-ruben-frosali
const lunaStation = '${location.origin+location.pathname}examples/nasa-astrobee-robot/luna-station.jpg'

// Registers the LUME elements with their default tag names.
useDefaultNames()

// Long live HTML elements!

element('astrobee-app')(
  class App extends Element {
    static observedAttributes = {
      rotationDirection: attribute.number(1),
      rotationAmount: attribute.number(1),
      rotationEnabled: attribute.boolean(true),
      view: attribute.string('free'),
    }

    rotationDirection = 1 // clockwise
    rotationAmount = 0.2 // degrees

    rotationEnabled = true
    view = 'free'

    astrobee

    template = () => html\`
      <>
        <lume-scene webgl css-enabled="false" environment=\${() => lunaStation}>
          <lume-node align-point="0.5 0.5 0.5">
            <lume-camera-rig
              active=\${() => this.view === 'free'}
              initial-polar-angle="30"
              min-distance="0.4"
              max-distance="2"
              dolly-speed="0.002"
              initial-distance="1"
            />
            <lume-node rotation=\${() => [this.view === 'top' ? -90 : 0, 0, 0]}>
              <lume-perspective-camera active=\${() => this.view !== 'free'} position="0 0 0.7" />
            </lume-node>
          </lume-node>

          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="0 90 0" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="0 -90 0" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="0 0 90" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="0 0 -90" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="90 80 0" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="90 -80 0" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="-90 80 0" />
          <lume-point-light intensity="0.3" align-point="0.5 0.5 0.5" color="#a3ffff" position="-90 -80 0" />

          <lume-node ref=\${el => this.astrobee = el} align-point="0.5 0.5 0.5" rotation=\${() => this.astrobeeRotation}>
            <lume-collada-model src=\${() => bodyModelUrl} />
            <lume-collada-model src=\${() => pmcModelUrl} />
            <lume-collada-model src=\${() => pmcSkinModelUrl} />
            <lume-collada-model src=\${() => pmcBumperModelUrl} />

            <comment style="display:none">The other side.</comment>
            <lume-node scale="1 1 -1">
              <lume-collada-model src=\${() => pmcModelUrl} />
              <lume-collada-model src=\${() => pmcSkinModelUrl} />
              <lume-collada-model src=\${() => pmcBumperModelUrl} />
            </lume-node>
          </lume-node>

          <lume-sphere
            has="basic-material"
            texture=\${() => lunaStation}
            color="white"
            align-point="0.5 0.5 0.5"
            mount-point="0.5 0.5 0.5"
            size="100 100 100"
            sidedness="double"
            cast-shadow="false"
            receive-shadow="false"
          />
        </lume-scene>

        <div class="ui">
          <fieldset>
            <legend>Rotation</legend>
            <label>
              <input type="checkbox" checked=\${() => this.rotationEnabled} onChange=\${this.toggleRotation} />&nbsp;
              Enable rotation.
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked=\${() => this.rotationDirection < 0}
                onChange=\${this.toggleRotationDirection}
              />&nbsp;
              Clockwise rotation.
            </label>
          </fieldset>
          <fieldset>
            <legend>View</legend>
            <label>
              <input type="radio" name="side" checked=\${() => this.view === 'side'} onChange=\${this.changeView} />&nbsp;
              Side view.
            </label>
            <br />
            <label>
              <input type="radio" name="top" checked=\${() => this.view === 'top'} onChange=\${this.changeView} />&nbsp;
              Top view
            </label>
            <br />
            <label>
              <input type="radio" name="free" checked=\${() => this.view === 'free'} onChange=\${this.changeView} />&nbsp;
              Free view
            </label>
          </fieldset>
        </div>
      </>
    \`

    css = /*css*/ \`
      :host {
        width: 100%;
        height: 100%;
      }
      .ui {
        position: absolute;
        margin: 15px;
        padding: 10px;
        top: 0;
        left: 0;
        color: white;
              font-family: sans-serif;
              background: rgba(0, 0, 0, 0.6);
              border-radius: 7px;
      }
          fieldset legend {
              color: #75c7c7;
          }
          fieldset {
              border-color: #75c7c7;
              border-radius: 4px;
          }
          fieldset:nth-child(2) legend {
              color: #c595c9;
          }
          fieldset:nth-child(2) {
              border-color: #c595c9;
          }
    \`

    astrobeeRotation = (x, y, z, _time) => [
      x,
      y + this.rotationAmount * this.rotationDirection,
      z,
    ]

    toggleRotation = () => {
      this.rotationEnabled = !this.rotationEnabled

      if (this.rotationEnabled) this.astrobee.rotation = this.astrobeeRotation
      else this.astrobee.rotation = () => false // stops rotation
    }

    toggleRotationDirection = () => (this.rotationDirection *= -1)

    changeView = (event) => {
      const input = event.target

      if (input.checked) this.view = input.name
    }
  }
)

<\/script>
`
},
})
</script>