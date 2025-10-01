import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

function BrainHover() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111)

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 100)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const light = new THREE.DirectionalLight(0xffffff, 1.5)
    light.position.set(10, 10, 10)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    // 🎨 Define colors per brain part
    const brainColors = {
      pitua1: 0xfc5c65,
      temp1: 0xfed330,
      pariet1: 0x45aaf2,
      occipit1: 0x0a84ff,
      frontal1: 0x4b6584,
      stem1: 0x8854d0,
      corpus1: 0xffffff,
      cereb1: 0x26de81
    }

    const parts = [] // to track dot + mesh pairs

    const loader = new OBJLoader()
    loader.load('/models/brain-parts-big.obj', (object) => {
      object.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const name = child.name.toLowerCase()
          const key = Object.keys(brainColors).find(k => name.includes(k))
          const color = new THREE.Color(key ? brainColors[key] : 0xaaaaaa)

          // Dots
          const dotMat = new THREE.PointsMaterial({ color, size: 0.6 })
          const points = new THREE.Points(child.geometry, dotMat)
          points.name = name
          scene.add(points)

          // Mesh (initially hidden)
          const meshMat = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0.8,
            visible: false
          })
          const mesh = new THREE.Mesh(child.geometry, meshMat)
          mesh.name = name
          scene.add(mesh)

          parts.push({ points, mesh })
        }
      })
    })

    // 🎯 Mouse hover logic
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    })

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(parts.map(p => p.points))

      parts.forEach(({ mesh }) => {
        mesh.visible = false
      })

      if (intersects.length > 0) {
        const name = intersects[0].object.name
        const match = parts.find(p => p.points.name === name)
        if (match) match.mesh.visible = true
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
}

export default BrainHover
