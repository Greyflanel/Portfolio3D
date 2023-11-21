import {
  Color,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  SphereGeometry,
  AxesHelper,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshLambertMaterial,
  DirectionalLight,
  DirectionalLightHelper,
  RepeatWrapping,
  AmbientLight,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Vector3,
  TorusGeometry,
  ConeGeometry,
  CylinderGeometry,
  Object3D,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Reflector } from 'three/addons/objects/Reflector.js'
// import { WaterRefractionShader } from 'three/addons/shaders/WaterRefractionShader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import Stats from 'stats-js'
import LoaderManager from '@/js/managers/LoaderManager'
import GUI from 'lil-gui'
import vertexShader from '../glsl/main.vert'
import fragmentShader from '../glsl/main.frag'
import { randFloat } from 'three/src/math/MathUtils'
import Satellite from './satellite'
import gsap from 'gsap'



export default class MainScene {
  canvas
  renderer
  scene
  camera
  controls
  stats
  width
  height
  guiObj = {
    skyReflectorColor: '#0d031a',
    reflectorTransmission: 0.7,
    waveStrength: 0.0715,
    waveSpeed: 1.4,
  }

  constructor() {
    this.canvas = document.querySelector('.scene')

    this.init()
  }

  init = async () => {
    // Preload assets before initiating the scene
    const assets = [
      {
        name: 'matcap',
        texture: './img/matcap.png',
      },
      { name: 'robotoSlabFont', font: './fonts/Roboto_Slab_Regular.typeface.json' },
      { name: 'waterdudv', texture: './img/waterdudv.jpg' }, // water texture noise
      { name: 'moon', texture: './img/moon-w2.jpg' }, // moon texture
      { name: 'particle', texture: './img/star32.png' }, // particle texture
      { name: 'boat', gltf: './img/boat3.glb' }, // particle texture
    ]

    await LoaderManager.load(assets)

    // this.addObject()
    this.setStats()
    this.setGUI()
    this.setScene()
    this.setRender()
    this.setCamera()
    this.setControls()
    // this.setAxesHelper()
    // this.setBoat()
    this.setSatellites()
    this.setMoon()
    this.setText()
    this.setReflector()
    this.setLights()
    this.setStars()
    // this.setGroundRefractor()

    this.handleResize()

    // start RAF
    this.events()

    // this.controls.enabled = false
    let tl3 = gsap.timeline({ repeat: 0 })
    // Intro animation of the camera
    tl3.fromTo(
      this.camera.position,
      {
        x: this.camera.position.x - 20,
        z: this.camera.position.z + 4,
      },
      {
        duration: 5,
        ease: 'power2.inOut',
        x: this.camera.position.x,
        z: this.camera.position.z,
        onUpdate: () => {
          this.controls.update()
        },
        onComplete: () => {
          // this.controls.enabled = true
        },
      }
    )
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.scene = new Scene()
    // background color
    this.scene.background = new Color(this.guiObj.skyReflectorColor)
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.width / this.height
    const fieldOfView = 48
    const nearPlane = 0.6
    const farPlane = 1600

    this.camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.y = 0.6
    this.camera.position.x = 9
    this.camera.position.z = 10
    this.camera.lookAt(0, 0, 0)

    this.scene.add(this.camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enablePan = false
    this.controls.enableZoom = false
    // this.controls.dampingFactor = 0.04
    this.controls.maxPolarAngle = 1.55
    this.controls.minPolarAngle = 0.8
  }

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new AxesHelper(3)
    this.scene.add(axesHelper)
  }


  /**
   * Create a SphereGeometry
   * https://threejs.org/docs/?q=box#api/en/geometries/SphereGeometry
   * with a Basic material
   * https://threejs.org/docs/?q=mesh#api/en/materials/MeshBasicMaterial
   */
  setSatellites() {
    this.satellites = []
    // Create differents shapes called "satellites" that are continuously moving
    const sphereGeo = new SphereGeometry(1, 32, 32)
    const torusGeo = new TorusGeometry(1, 0.3, 16, 100)
    const coneGeo = new ConeGeometry(1, 3, 32)
    const cylinderGeo = new CylinderGeometry(1, 1, 3, 32)
    const material = new MeshLambertMaterial({ color: new Color(0xffffff) })

    // const satellite1 = new Satellite({
    //   geo: sphereGeo,
    //   mat: material,
    //   pos: new Vector3(6, 2, 7),
    //   speed: 1,
    //   rangeY: 1,
    //   scale: 0.8,
    //   scene: this.scene,
    //   index: 3,
    // })

    // const satellite2 = new Satellite({
    //   geo: torusGeo,
    //   mat: material,
    //   pos: new Vector3(-4, 3, 4),
    //   speed: 1.2,
    //   rangeY: 0.6,
    //   scale: 1,
    //   scene: this.scene,
    //   index: 1,
    // })

    // const satellite3 = new Satellite({
    //   geo: coneGeo,
    //   mat: material,
    //   pos: new Vector3(-12, 2, -6),
    //   speed: 0.6,
    //   rangeY: 0.5,
    //   scale: 0.8,
    //   scene: this.scene,
    //   index: 0,
    // })

    // const satellite4 = new Satellite({
    //   geo: cylinderGeo,
    //   mat: material,
    //   pos: new Vector3(2, 4, -6),
    //   speed: 1.1,
    //   rangeY: 1.2,
    //   scale: 0.7,
    //   scene: this.scene,
    //   index: 2,
    // })

    // this.satellites.push(satellite1)
    // this.satellites.push(satellite2)
    // this.satellites.push(satellite3)
    // this.satellites.push(satellite4)
  }

  /**
   * TextGeometry
   * https://threejs.org/docs/?q=text#examples/en/geometries/TextGeometry
   */
  // setBoat() {
  //   const boat = LoaderManager.assets['boat'].gltf
  //   boat.scene.position.y = -0.7
  //   boat.scene.position.x = -35
  //   boat.scene.position.z = -14
    
  //   this.scene.add(boat.scene)
  //   let tl4 = gsap.timeline({ repeat: 0, delay: 3 })
   
  //   tl4.fromTo(
  //     boat.scene.position,
  //     {
  //       x: boat.scene.position.x - 100,
  //       z: boat.scene.position.z + 10,
  //     },
  //     {
  //       duration: 5,
  //       ease: 'power3.out',
  //       x: boat.scene.position.x,
  //       z: boat.scene.position.z,
  //     }
  //   )
    
  // }

  setText() {
    // One of the best way to use flat texts in Three.JS is to use MSDF Fonts, I'll write a tutorial about it
    // but for the purpose of this example, TextGeometry is great enough
    const textGeo = new TextGeometry('Richard Lovelace', {
      font: LoaderManager.assets['robotoSlabFont'].font,
      size: 1.38,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: false,
    })

    textGeo.computeBoundingBox()
    
    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x * 6)

    // Get CSS var color
    const style = window.getComputedStyle(document.body)
    const color = style.getPropertyValue('--color-orange').replace(' ', '')

    const textMat = new MeshLambertMaterial({ color: new Color(0x777777) })
    this.textMesh = new Mesh(textGeo, textMat)

    this.textMesh.position.x = centerOffset
    this.textMesh.position.y = 0
    this.textMesh.position.z = -0.8

    this.scene.add(this.textMesh)

    // animate
    let tl4 = gsap.timeline({ repeat: 0 })
    tl4.fromTo(this.textMesh.scale, { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 1.2, duration: 1.4, ease: 'expo.out' })
  }

  setLights() {
    const dirLight1 = new DirectionalLight(0xfffffff)
    dirLight1.position.set(2, 10, -10)
    dirLight1.intensity = 1.5
    this.scene.add(dirLight1)
    const dirLight2 = new DirectionalLight(0xfffffff)
    dirLight2.position.set(2, 10, 10)
    dirLight2.intensity = 1.4
    this.scene.add(dirLight2)
    const dirLight3 = new DirectionalLight(0xfffffff)
    dirLight3.position.set(40, 10, 0)
    dirLight3.intensity = 3.4
    this.scene.add(dirLight3)
    // const helper = new DirectionalLightHelper(dirLight3, 1)
    // this.scene.add(helper)

    this.scene.add(dirLight3.target)
    dirLight3.target.position.set(37, -190, 80)
    const light = new AmbientLight(0xffffff) // soft white light
    this.scene.add(light)
    
  }

  setReflector() {
    // use a plane for the ground
    const geometry = new PlaneGeometry(700, 700)
    // Use Reflector
    // https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Reflector.js
    // https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/WaterRefractionShader.js

    // Override the reflector shader
    const customShader = Reflector.ReflectorShader
    customShader.vertexShader = vertexShader
    customShader.fragmentShader = fragmentShader

    // get water texture and apply the correct uniforms to the new reflector shader
    const dudvMap = LoaderManager.assets['waterdudv'].texture
    dudvMap.wrapS = dudvMap.wrapT = RepeatWrapping
    customShader.uniforms.tDudv = { value: dudvMap }
    customShader.uniforms.waveStrength = { value: this.guiObj.waveStrength } // wave strenght
    customShader.uniforms.time = { value: 4 } // increasing time value
    customShader.uniforms.transmission = { value: this.guiObj.reflectorTransmission } // reflection
    customShader.uniforms.waveSpeed = { value: this.guiObj.waveSpeed / 1000 } // wavespeed

    this.reflector = new Reflector(geometry, {
      // Use the Reflector from Threejs.
      clipBias: 0.1,
      textureWidth: window.innerWidth,
      textureHeight: window.innerHeight,
      shader: customShader,
      color: this.guiObj.skyReflectorColor,
    })
    this.reflector.position.y = 0
    this.reflector.rotateX(-Math.PI / 2)
    this.scene.add(this.reflector)
  }

  setStars() {
    const geometry = new BufferGeometry()
    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.

    const vertices = []
    const nb = 14500

    const range = 1000

    for (let i = 0; i < nb; i++) {
      const point = [randFloat(-range, range), randFloat(28, 1000), randFloat(-range, range)]
      vertices.push(...point)
      // vertices.push(point[0], point[1], point[2])
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
    const material = new PointsMaterial({
      color: 0xffffff,
      size: 12,
      transparent: true,
      map: LoaderManager.assets['particle'].texture,
    })

    const mesh = new Points(geometry, material)

    mesh.renderOrder = -1
    this.scene.add(mesh)
  }

  setMoon() {
    // use a sphere and a 360 moon texture
    const geometry = new SphereGeometry(28, 32, 32)
    const material = new MeshBasicMaterial({ map: LoaderManager.assets['moon'].texture, color: new Color(0xffffff) })

    this.moonMesh = new Mesh(geometry, material)
    this.moonMesh.position.y = 37
    this.moonMesh.position.x = -190
    this.moonMesh.position.z = -80
    this.scene.add(this.moonMesh)
  }

  /**
   * Build stats to display fps
   */
  setStats() {
    this.stats = new Stats()
  }

  setGUI() {
    const gui = new GUI()
    gui
      .addColor(this.guiObj, 'skyReflectorColor')
      .name('sky color')
      .onChange(() => {
        this.scene.background = new Color(this.guiObj.skyReflectorColor)
        this.reflector.material.uniforms.color.value = new Color(this.guiObj.skyReflectorColor)
      })

    // gui.add(this.guiObj, 'reflectorTransmission', 0, 1).onChange(() => {
    //   this.reflector.material.uniforms.transmission.value = this.guiObj.reflectorTransmission
    // })

    // gui.add(this.guiObj, 'waveStrength', 0, 0.5).onChange(() => {
    //   this.reflector.material.uniforms.waveStrength.value = this.guiObj.waveStrength
    // })

    // gui.add(this.guiObj, 'waveSpeed', 0, 5).onChange(() => {
    //   this.reflector.material.uniforms.waveSpeed.value = this.guiObj.waveSpeed / 1000
    // })
  }
  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, { passive: true })
    this.draw(0)
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = (time) => {
    // now: time in ms
    this.stats.begin()
    
    if (this.controls) this.controls.update() // for damping
    this.renderer.render(this.scene, this.camera)

    for (let i = 0; i < this.satellites.length; i++) {
      // render all satellites
      const satellite = this.satellites[i]
      satellite.render(time)
    }

    if (this.reflector.material.uniforms) {
      this.reflector.material.uniforms.time.value += 1
    }

    this.stats.end()
    this.raf = window.requestAnimationFrame(this.draw)
  }

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 2

    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.width, this.height)
  }

  guiChange = () => {
    if (this.mesh) this.mesh.position.y = this.guiObj.y
  }
}
