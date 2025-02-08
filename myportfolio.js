//
// IMPORTS
//
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//UTILITIES
let canvas = document.querySelector('canvas.webgl');
let sizes = {
    width : window.innerWidth,
    height : window.innerHeight
}
let aspect = sizes.width / sizes.height;

let textureLoader = new THREE.TextureLoader();

let star = textureLoader.load('star_04.png');

//
// SCENE
//
let scene = new THREE.Scene();

//
// OBJECTS
//
let innerobject = new THREE.Mesh(
    new THREE.TorusGeometry(1.5,0.2),
    new THREE.MeshStandardMaterial({
        color: 'white',
        side: THREE.DoubleSide
    })
);
let outerobject = new THREE.Mesh(
    new THREE.TorusGeometry(1.5),
    new THREE.MeshStandardMaterial({
        color: 'white',
        wireframe: true,
        side: THREE.DoubleSide
    })
);

let mainObject = new THREE.Group();
mainObject.add(innerobject, outerobject);
mainObject.position.set(2.5,0,0);
scene.add(mainObject);

const cubes = [];
const size = 0.5;
const spacing = 1;

function removeCubes() {
    cubes.forEach((cube, i) => {
        gsap.to(cube.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                scene.remove(cube);
            }
        });
    });
    cubes.length = 0;
}

//
// Particles
//

let backgroundParticleGeometry = new THREE.BufferGeometry();
let count = 1500;

let particlePositionArr = new Float32Array(count * 3);

for(let i = 0; i< count * 3; i++){
    particlePositionArr[i] = (Math.random() - 0.5) * 10; // [-5 to 5]
}

backgroundParticleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositionArr, 3));

let backgroundparticleMaterial = new THREE.PointsMaterial();
backgroundparticleMaterial.alphaMap = star;
backgroundparticleMaterial.transparent = true;
backgroundparticleMaterial.depthTest = true;
backgroundparticleMaterial.size = 0.15;


let backgroundParticles = new THREE.Points(
    backgroundParticleGeometry,
    backgroundparticleMaterial
)

scene.add(backgroundParticles);

//
// CAMERA
//
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
camera.position.set(0, 0, 7.5);
scene.add(camera);

//
// LIGHTS
//
let ambientLight = new THREE.AmbientLight('white',0.2);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(10,20,10);
scene.add(directionalLight);

let hemisphereLight = new THREE.HemisphereLight("#AAAAAA", "#000000", 0.3);
scene.add(hemisphereLight)

//
// RENDERER
//
let renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

//
// CONTROLS
//
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.01;

//
// RESIZE
//
window.addEventListener('resize', () =>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    if(sizes.width <= 600){
        mainObject.scale.set(0.5, 0.5, 0.5);
    }else{
        mainObject.scale.set(1, 1, 1);
    }

    renderer.setSize(sizes.width, sizes.height);
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
})

if(sizes.width <= 600){
    mainObject.scale.set(0.5, 0.5, 0.5);
}

//
// Mouse moment
//

let mouseX = 0;
let mouseY = 0;

let onDoumentMouseMove = (event) =>{
    mouseX = event.clientX - (sizes.width/2);
    mouseY = event.clientY - (sizes.height/2);
}

document.addEventListener('mousemove', onDoumentMouseMove);



//
// ANIMATION LOOP
//

let clock = new THREE.Clock();

let animation = () => {
    let time = clock.getElapsedTime();

    outerobject.rotation.z += 0.005;
    innerobject.rotation.z -= 0.005;

    backgroundParticles.rotation.z += 0.002;
    backgroundParticles.rotation.x += 0.002;
    
    backgroundParticles.rotation.y += 0.25 * (mouseX * 0.001 - backgroundParticles.rotation.y);
    backgroundParticles.rotation.x += 0.25 * (mouseY * 0.001 - backgroundParticles.rotation.x);

    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

animation();

//
// GSAP
//

// UTILITY VAR

// Animation state management
let currViewnum = 0;
let nextRequestingView = -1;
let viewAnimatingFlag = false;
let isAnimating = false;

// Animation timing constants
const ANIMATION_DURATION = 0.4;
const SCALE_DURATION = 0.5;
const VIEW_DELAY = 0.3;

// Animation state handlers
function viewanimationEnd() {
    viewAnimatingFlag = true;
    isAnimating = false;
}

function viewanimationStart() {
    viewAnimatingFlag = false;
    isAnimating = true;
    if(nextRequestingView !== -1) {
        requestAnimationFrame(() => {
            switchanimationRequest(nextRequestingView);
            nextRequestingView = -1;
        });
    }
}

// Cube removal utility
// function removeCubes() {
//     cubes.forEach(cube => scene.remove(cube));
//     cubes = [];
// }

// View animations
function animateView0() {
    removeCubes();
    
    gsap.to(innerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        onStart: viewanimationStart
    });
    
    innerobject.geometry = new THREE.TorusGeometry(1.5, 0.2);
    gsap.to(innerobject.scale, {
        x: 1, y: 1, z: 1, 
        duration: SCALE_DURATION
    });
    
    innerobject.material.flatShading = false;
    innerobject.material.needsUpdate = true;
    
    gsap.to(outerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION
    });
    
    gsap.to(camera.position, {
        x: 0, y: 0, z: 7.5, 
        duration: ANIMATION_DURATION, 
        delay: VIEW_DELAY
    });
    console.log(mainObject.position);
    mainObject.position.set(2.5,0,0);

    setTimeout(() => {
        outerobject.geometry = new THREE.TorusGeometry(1.5);
        outerobject.material.color.setHSL(0, 0, 1);
        outerobject.material.needsUpdate = true;
        gsap.to(outerobject.scale, {
            x: 1, y: 1, z: 1, 
            duration: ANIMATION_DURATION, 
            onComplete: viewanimationEnd
        });
    }, 250);
}

function animateView1() {
    removeCubes();

    gsap.to(innerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        onStart: viewanimationStart
    });
    
    innerobject.geometry = new THREE.IcosahedronGeometry(1, 1);
    gsap.to(innerobject.scale, {
        x: 1, y: 1, z: 1, 
        duration: SCALE_DURATION
    });
    
    innerobject.material.flatShading = true;
    innerobject.material.needsUpdate = true;
    
    gsap.to(outerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION
    });
    
    gsap.to(camera.position, {
        x: 10, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        delay: VIEW_DELAY
    });

    console.log(mainObject.position);
    mainObject.position.set(2.5,0,2.5);
    gsap.to(mainObject.scale, {x:1, y:1, z:1});   
    setTimeout(() => {
        outerobject.geometry = new THREE.DodecahedronGeometry(2, 2);
        outerobject.material.color.setHSL(0, 0, 0);
        outerobject.material.needsUpdate = true;
        gsap.to(outerobject.scale, {
            x: 1, y: 1, z: 1, 
            duration: ANIMATION_DURATION, 
            onComplete: viewanimationEnd
        });
    }, 250);
}

function animateView2() {
    gsap.to(innerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        onStart: viewanimationStart
    });
    gsap.to(outerobject.scale, {x:0, y:0, z:0}); 
    
    setTimeout(() => {
        for (let i = 0; i < 9; i++) {
            let cube = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size),
                new THREE.MeshStandardMaterial({ color: 'white' })
            );
            cube.position.set(0, 0, 0);
            cubes.push(cube);
            scene.add(cube);
        }
        
        cubes.forEach((cube, i) => {
            let row = Math.floor(i / 3);
            let col = i % 3;
            
            let targetX = (col - 1) * spacing;
            let targetY = (1 - row) * spacing;
            let targetZ = 0;
            
            gsap.to(cube.position, {
                x: targetX-2,
                y: targetY,
                z: targetZ,
                duration: SCALE_DURATION,
                ease: "power2.out",
                delay: i * 0.05 // Reduced from 0.1
            });
        });
    }, 500);
    
    gsap.to(camera.position, {
        x: 0, y: 0, z: -10, 
        duration: ANIMATION_DURATION, 
        delay: VIEW_DELAY, 
        onComplete: viewanimationEnd
    });
}

function animateView3() {
    removeCubes();

    gsap.to(innerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        onStart: viewanimationStart
    });
    
    gsap.to(outerobject.scale, {x:1.5, y:1.5, z:1.5});
    mainObject.position.set(2.5,0,-4.5);

    setTimeout(() => {
        innerobject.geometry = new THREE.IcosahedronGeometry(1.5,2);
        innerobject.material.flatShading = true;
        innerobject.material.needsUpdate = true;
        gsap.to(innerobject.scale, {
            x: 1, y: 1, z: 1, 
            duration: SCALE_DURATION
        });
        outerobject.geometry = new THREE.DodecahedronGeometry(2, 2);
        outerobject.material.color.setHSL(0, 0, 0);
        outerobject.material.needsUpdate = true;
        gsap.to(camera.position, {
            x: -10, y: 0, z: 0, 
            duration: ANIMATION_DURATION, 
            delay: VIEW_DELAY, 
            onComplete: viewanimationEnd
        });
    }, 500);
}

function animateView4() {
    removeCubes();

    gsap.to(innerobject.scale, {
        x: 0, y: 0, z: 0, 
        duration: ANIMATION_DURATION, 
        onStart: viewanimationStart
    });
    
    console.log(mainObject.position);
    mainObject.position.set(4.5,0,-4.5);
    
    setTimeout(() => {
        innerobject.geometry = new THREE.TorusKnotGeometry(1, 0.15, 300, 20, 4, 3);
        gsap.to(innerobject.scale, {
            x: 1, y: 1, z: 1, 
            duration: SCALE_DURATION
        });
        outerobject.geometry = new THREE.DodecahedronGeometry(2, 2);
        outerobject.material.color.setHSL(0, 0, 0);
        outerobject.material.needsUpdate = true;
        gsap.to(camera.position, {
            x: 0, y: 0, z: 10, 
            duration: ANIMATION_DURATION, 
            delay: VIEW_DELAY, 
            onComplete: viewanimationEnd
        });
    }, 500);
}

// Animation switching logic
function switchanimationRequest(viewNumParam) {
    if (currViewnum === viewNumParam || isAnimating) {
        nextRequestingView = viewNumParam;
        return;
    }

    gsap.killTweensOf([camera.position, innerobject.scale, outerobject.scale]);

    const animations = [animateView0, animateView1, animateView2, animateView3, animateView4];
    if (animations[viewNumParam]) {
        animations[viewNumParam]();
        currViewnum = viewNumParam;
    }
}

// Throttle scroll events
let lastScrollTime = 0;
const SCROLL_THROTTLE = 16; // ~60fps

// Use IntersectionObserver for view detection
const viewSections = document.querySelectorAll('.view-section');
const viewObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const viewIndex = parseInt(entry.target.dataset.view);
            if (!isNaN(viewIndex)) {
                switchanimationRequest(viewIndex);
            }
        }
    });
}, {
    threshold: 0.5,
    rootMargin: '-10% 0px -10% 0px'
});

viewSections.forEach(section => viewObserver.observe(section));

// Optimized scroll handler
const handleScroll = () => {
    const now = performance.now();
    if (now - lastScrollTime < SCROLL_THROTTLE) return;
    lastScrollTime = now;

    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    // Use RequestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
        const viewIndex = Math.floor(scrollPercent / 20);
        if (viewIndex !== currViewnum && viewIndex >= 0 && viewIndex <= 4) {
            switchanimationRequest(viewIndex);
        }
    });
};

// Event listener with passive flag
window.addEventListener('scroll', handleScroll, { passive: true });

// Optional: Add resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        viewObserver.disconnect();
        viewSections.forEach(section => viewObserver.observe(section));
    }, 250);
}, { passive: true });



// let viewNum = 0;

// document.getElementById('next-view').addEventListener("click", () => {
//     if (viewNum === 4) return;
//     viewNum += 1;

//     switchAnimation()
// })


// document.getElementById('prev-view').addEventListener("click", () => {
//     if (viewNum === 0) return;
//     viewNum -= 1;

//     switchAnimation()
// })