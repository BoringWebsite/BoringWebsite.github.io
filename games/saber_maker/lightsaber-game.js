class LightsaberMaker {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.lightsaberParts = {
            pommel: null,
            grip: null,
            emitter: null,
            blade: null
        };
        this.lightsaberGroup = null;
        this.isRotating = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.bladeOn = true;
        this.currentBladeColor = 'blue';
        this.glowLayer = null;
        this.unstableFlickerAnimation = null;
        this.partColors = {
            pommel: 'gray',
            grip: 'gray',
            emitter: 'gray'
        };
        
        this.init();
    }

    init() {
        this.createScene();
        this.createLightsaber();
        this.setupControls();
        this.setupMenu();
        this.startRenderLoop();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2);

        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            Math.PI / 2,
            Math.PI / 2,
            10,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.lowerRadiusLimit = 3;
        this.camera.upperRadiusLimit = 20;

        // Create lights
        const hemisphericLight = new BABYLON.HemisphericLight(
            'hemiLight',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        hemisphericLight.intensity = 0.7;

        const directionalLight = new BABYLON.DirectionalLight(
            'dirLight',
            new BABYLON.Vector3(-1, -1, -1),
            this.scene
        );
        directionalLight.intensity = 0.5;

        // Create glow layer
        this.glowLayer = new BABYLON.GlowLayer('glowLayer', this.scene);
        this.glowLayer.intensity = 1.5;
    }

    createLightsaber() {
        // Create a group to hold all lightsaber parts
        this.lightsaberGroup = new BABYLON.TransformNode('lightsaberGroup', this.scene);
        
        // Create all parts
        this.createPommel('basic');
        this.createGrip('smooth');
        this.createEmitter('standard');
        this.createBlade('blue');
    }

    getPartColor(section, colorType) {
        const colors = {
            gray: new BABYLON.Color3(0.4, 0.4, 0.4),
            gold: new BABYLON.Color3(0.8, 0.6, 0.2),
            silver: new BABYLON.Color3(0.7, 0.7, 0.8),
            black: new BABYLON.Color3(0.1, 0.1, 0.1),
            bronze: new BABYLON.Color3(0.6, 0.4, 0.2),
            brown: new BABYLON.Color3(0.4, 0.2, 0.1),
            chrome: new BABYLON.Color3(0.9, 0.9, 1.0)
        };
        return colors[colorType] || colors.gray;
    }

    createPommel(type) {
        if (this.lightsaberParts.pommel) {
            this.lightsaberParts.pommel.dispose();
        }

        let pommel;
        switch (type) {
            case 'spiked':
                pommel = BABYLON.MeshBuilder.CreateCylinder('pommel', {
                    height: 0.8,
                    diameterTop: 0.6,
                    diameterBottom: 0.4,
                    tessellation: 8
                }, this.scene);
                break;
            case 'rounded':
                pommel = BABYLON.MeshBuilder.CreateSphere('pommel', {
                    diameter: 0.7
                }, this.scene);
                break;
            case 'heavy':
                pommel = BABYLON.MeshBuilder.CreateCylinder('pommel', {
                    height: 1.2,
                    diameterTop: 0.8,
                    diameterBottom: 0.6,
                    tessellation: 12
                }, this.scene);
                break;
            case 'curved':
                // Create a curved pommel using multiple segments
                pommel = new BABYLON.TransformNode('curvedPommel', this.scene);
                const base = BABYLON.MeshBuilder.CreateCylinder('pommelBase', {
                    height: 0.4,
                    diameter: 0.6
                }, this.scene);
                const curve = BABYLON.MeshBuilder.CreateTorus('pommelCurve', {
                    diameter: 0.8,
                    thickness: 0.15,
                    tessellation: 16
                }, this.scene);
                curve.rotation.x = Math.PI / 2;
                curve.position.y = 0.3;
                base.parent = pommel;
                curve.parent = pommel;
                break;
            case 'ceremonial':
                pommel = BABYLON.MeshBuilder.CreateCylinder('pommel', {
                    height: 1.0,
                    diameterTop: 0.9,
                    diameterBottom: 0.5,
                    tessellation: 16
                }, this.scene);
                break;
            default: // basic
                pommel = BABYLON.MeshBuilder.CreateCylinder('pommel', {
                    height: 0.6,
                    diameter: 0.6
                }, this.scene);
        }

        const material = new BABYLON.StandardMaterial('pommelMaterial', this.scene);
        const baseColor = this.getPartColor('pommel', this.partColors.pommel);
        material.diffuseColor = baseColor;
        material.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        
        // Override for specific types if needed
        if (type === 'ceremonial' && this.partColors.pommel === 'gray') {
            material.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.2); // Keep gold for ceremonial if gray selected
        }
        
        if (pommel.material !== undefined) {
            pommel.material = material;
        } else {
            pommel.getChildMeshes().forEach(child => {
                child.material = material;
            });
        }
        
        pommel.position.y = -1.7;
        pommel.parent = this.lightsaberGroup;
        this.lightsaberParts.pommel = pommel;
    }

    createGrip(type) {
        if (this.lightsaberParts.grip) {
            this.lightsaberParts.grip.dispose();
        }

        let grip;
        switch (type) {
            case 'ribbed':
                grip = new BABYLON.TransformNode('ribbedGrip', this.scene);
                
                const baseGrip = BABYLON.MeshBuilder.CreateCylinder('baseGrip', {
                    height: 2,
                    diameter: 0.6
                }, this.scene);
                baseGrip.parent = grip;
                
                // Create base material (always gray)
                const baseMaterial = new BABYLON.StandardMaterial('baseGripMaterial', this.scene);
                baseMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                baseGrip.material = baseMaterial;
                
                // Add ribbed rings with selected color
                for (let i = 0; i < 8; i++) {
                    const ring = BABYLON.MeshBuilder.CreateCylinder(`ring${i}`, {
                        height: 0.1,
                        diameter: 0.72
                    }, this.scene);
                    ring.position.y = -0.75 + (i * 0.25);
                    ring.parent = grip;
                }
                break;
            case 'wrapped':
                grip = BABYLON.MeshBuilder.CreateCylinder('grip', {
                    height: 2,
                    diameter: 0.65,
                    tessellation: 16
                }, this.scene);
                break;
            case 'segmented':
                grip = new BABYLON.TransformNode('segmentedGrip', this.scene);
                
                const connector = BABYLON.MeshBuilder.CreateCylinder('connector', {
                    height: 2,
                    diameter: 0.55
                }, this.scene);
                connector.parent = grip;
                
                // Create base material (always gray)
                const connectorMaterial = new BABYLON.StandardMaterial('connectorMaterial', this.scene);
                connectorMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                connector.material = connectorMaterial;
                
                const segments = 4;
                for (let i = 0; i < segments; i++) {
                    const segment = BABYLON.MeshBuilder.CreateCylinder(`segment${i}`, {
                        height: 0.35,
                        diameter: 0.62 + (i % 2) * 0.08
                    }, this.scene);
                    segment.position.y = -0.75 + (i * 0.5);
                    segment.parent = grip;
                }
                break;
            case 'textured':
                grip = BABYLON.MeshBuilder.CreateCylinder('grip', {
                    height: 2,
                    diameter: 0.62,
                    tessellation: 12
                }, this.scene);
                break;
            case 'curved':
                grip = BABYLON.MeshBuilder.CreateCylinder('grip', {
                    height: 2,
                    diameterTop: 0.55,
                    diameterBottom: 0.7,
                    tessellation: 16
                }, this.scene);
                break;
            default: // smooth
                grip = BABYLON.MeshBuilder.CreateCylinder('grip', {
                    height: 2,
                    diameter: 0.6
                }, this.scene);
        }

        const material = new BABYLON.StandardMaterial('gripMaterial', this.scene);
        const baseColor = this.getPartColor('grip', this.partColors.grip);
        material.diffuseColor = baseColor;
        
        if (type === 'wrapped') {
            material.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.05);
        }
        
        if (grip.material !== undefined) {
            grip.material = material;
        } else {
            grip.getChildMeshes().forEach(child => {
                // Skip base parts for ribbed and segmented
                if (child.name === 'baseGrip' || child.name === 'connector') {
                    return;
                }
                child.material = material;
            });
        }
        
        grip.position.y = -0.5;
        grip.parent = this.lightsaberGroup;
        this.lightsaberParts.grip = grip;
    }

    createEmitter(type) {
        if (this.lightsaberParts.emitter) {
            this.lightsaberParts.emitter.dispose();
        }

        let emitter;
        switch (type) {
            case 'wide':
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1,
                    diameterTop: 0.8,
                    diameterBottom: 0.6
                }, this.scene);
                break;
            case 'focused':
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1.2,
                    diameterTop: 0.4,
                    diameterBottom: 0.6
                }, this.scene);
                break;
            case 'shroud':
                emitter = new BABYLON.TransformNode('shroudEmitter', this.scene);
                const base = BABYLON.MeshBuilder.CreateCylinder('emitterBase', {
                    height: 1.2,
                    diameter: 0.7
                }, this.scene);
                const shroud = BABYLON.MeshBuilder.CreateCylinder('shroud', {
                    height: 1.0,
                    diameterTop: 0.5,
                    diameterBottom: 0.8
                }, this.scene);
                shroud.position.y = 0.6;
                base.parent = emitter;
                shroud.parent = emitter;
                break;
            case 'dual':
                emitter = new BABYLON.TransformNode('dualEmitter', this.scene);
                const main = BABYLON.MeshBuilder.CreateCylinder('mainEmitter', {
                    height: 1,
                    diameter: 0.7
                }, this.scene);
                const side1 = BABYLON.MeshBuilder.CreateCylinder('sideEmitter1', {
                    height: 0.6,
                    diameter: 0.3
                }, this.scene);
                const side2 = BABYLON.MeshBuilder.CreateCylinder('sideEmitter2', {
                    height: 0.6,
                    diameter: 0.3
                }, this.scene);
                side1.position.set(0.4, 0, 0);
                side2.position.set(-0.4, 0, 0);
                main.parent = emitter;
                side1.parent = emitter;
                side2.parent = emitter;
                break;
            case 'crossguard':
                emitter = new BABYLON.TransformNode('crossguardEmitter', this.scene);
                const mainEmitter = BABYLON.MeshBuilder.CreateCylinder('mainEmitter', {
                    height: 1,
                    diameter: 0.7
                }, this.scene);
                const guard1 = BABYLON.MeshBuilder.CreateCylinder('guard1', {
                    height: 0.8,
                    diameter: 0.25
                }, this.scene);
                const guard2 = BABYLON.MeshBuilder.CreateCylinder('guard2', {
                    height: 0.8,
                    diameter: 0.25
                }, this.scene);
                guard1.position.set(0.5, 0.3, 0);
                guard1.rotation.z = Math.PI / 4;
                guard2.position.set(-0.5, 0.3, 0);
                guard2.rotation.z = -Math.PI / 4;
                mainEmitter.parent = emitter;
                guard1.parent = emitter;
                guard2.parent = emitter;
                break;
            default: // standard
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1,
                    diameter: 0.7
                }, this.scene);
        }

        const material = new BABYLON.StandardMaterial('emitterMaterial', this.scene);
        const baseColor = this.getPartColor('emitter', this.partColors.emitter);
        material.diffuseColor = baseColor;
        material.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        
        if (emitter.material !== undefined) {
            emitter.material = material;
        } else {
            emitter.getChildMeshes().forEach(child => {
                child.material = material;
            });
        }
        
        emitter.position.y = 1;
        emitter.parent = this.lightsaberGroup;
        this.lightsaberParts.emitter = emitter;
    }

    createBlade(color) {
        if (this.lightsaberParts.blade) {
            this.lightsaberParts.blade.dispose();
        }

        // Stop any existing flicker animation
        if (this.unstableFlickerAnimation) {
            this.scene.stopAnimation(this.lightsaberParts.blade);
            this.unstableFlickerAnimation = null;
        }

        this.currentBladeColor = color;

        if (!this.bladeOn) {
            return;
        }

        let blade;
        if (color === 'unstable') {
            // Create unstable blade with flickering effect
            blade = new BABYLON.TransformNode('unstableBlade', this.scene);
            const mainBlade = BABYLON.MeshBuilder.CreateCylinder('mainBlade', {
                height: 5.5,
                diameter: 0.25,
                tessellation: 16
            }, this.scene);
            
            // Rounded top for main blade
            const bladeTop = BABYLON.MeshBuilder.CreateSphere('bladeTop', {
                diameter: 0.25
            }, this.scene);
            bladeTop.position.y = 2.75;
            bladeTop.parent = blade;
            
            // Add some random energy spikes
            for (let i = 0; i < 5; i++) {
                const spike = BABYLON.MeshBuilder.CreateCylinder(`spike${i}`, {
                    height: 0.3,
                    diameter: 0.08
                }, this.scene);
                spike.position.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 4 - 2,
                    (Math.random() - 0.5) * 0.3
                );
                spike.parent = blade;
            }
            mainBlade.parent = blade;
        } else {
            // Create main blade group
            blade = new BABYLON.TransformNode('blade', this.scene);
            
            // Main blade cylinder
            const mainBlade = BABYLON.MeshBuilder.CreateCylinder('mainBlade', {
                height: 5.5,
                diameter: 0.25,
                tessellation: 16
            }, this.scene);
            
            // Rounded top
            const bladeTop = BABYLON.MeshBuilder.CreateSphere('bladeTop', {
                diameter: 0.25
            }, this.scene);
            bladeTop.position.y = 2.75;
            
            mainBlade.parent = blade;
            bladeTop.parent = blade;
        }

        // Main blade material with glow
        const material = new BABYLON.StandardMaterial('bladeMaterial', this.scene);
        const bladeColor = this.getBladeColor(color);
        material.emissiveColor = bladeColor.scale(0.8);
        material.diffuseColor = bladeColor.scale(0.3);
        material.alpha = 0.9;
        
        if (color === 'unstable') {
            material.emissiveColor = new BABYLON.Color3(1, 0.3, 0.3);
            material.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
        }
        
        // Apply materials and glow to all blade parts
        if (blade.material !== undefined) {
            blade.material = material;
            this.glowLayer.addIncludedOnlyMesh(blade);
        } else {
            blade.getChildMeshes().forEach(child => {
                child.material = material;
                this.glowLayer.addIncludedOnlyMesh(child);
            });
        }
        
        blade.parent = this.lightsaberGroup;
        
        // Start blade retracted into emitter
        blade.position.y = 1.5;
        blade.scaling = new BABYLON.Vector3(1, 0, 1);
        
        // Animate blade extension - both position and scale
        const scaleAnimation = BABYLON.Animation.CreateAndStartAnimation(
            'bladeExtension',
            blade,
            'scaling.y',
            30,
            15,
            0,
            1,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const positionAnimation = BABYLON.Animation.CreateAndStartAnimation(
            'bladePositionExtension',
            blade,
            'position.y',
            30,
            15,
            1.5,
            4.25,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            null,
            () => {
                // Start flicker animation for unstable blade after extension completes
                if (color === 'unstable') {
                    this.startUnstableFlicker(blade, material);
                }
            }
        );
        
        this.lightsaberParts.blade = blade;
    }

    startUnstableFlicker(blade, material) {
        // Create flickering animation for emissive color intensity
        const flickerAnimation = new BABYLON.Animation(
            'unstableFlicker',
            'emissiveColor',
            60,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [];
        // Create random flicker keyframes
        for (let i = 0; i <= 60; i++) {
            const intensity = 0.5 + Math.random() * 0.8; // Random intensity between 0.5 and 1.3
            const redIntensity = 0.8 + Math.random() * 0.4; // Red varies between 0.8 and 1.2
            const flickerColor = new BABYLON.Color3(
                redIntensity * intensity,
                0.2 * intensity,
                0.1 * intensity
            );
            keys.push({
                frame: i,
                value: flickerColor
            });
        }

        flickerAnimation.setKeys(keys);

        // Add the animation to the material
        material.animations = [flickerAnimation];

        // Start the animation
        this.unstableFlickerAnimation = this.scene.beginAnimation(
            material,
            0,
            60,
            true, // Loop
            2 // Speed ratio - make it flicker faster
        );

        // Also add random scaling flicker to the blade itself
        const scaleFlickerAnimation = new BABYLON.Animation(
            'unstableScaleFlicker',
            'scaling',
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const scaleKeys = [];
        for (let i = 0; i <= 60; i++) {
            const scaleVariation = 0.95 + Math.random() * 0.1; // Scale varies between 0.95 and 1.05
            scaleKeys.push({
                frame: i,
                value: new BABYLON.Vector3(scaleVariation, 1, scaleVariation)
            });
        }

        scaleFlickerAnimation.setKeys(scaleKeys);
        blade.animations = [scaleFlickerAnimation];

        this.scene.beginAnimation(blade, 0, 60, true, 3); // Speed ratio of 3 for faster flicker
    }

    toggleBlade() {
        this.bladeOn = !this.bladeOn;
        const powerButton = document.getElementById('powerToggle');
        
        if (this.bladeOn) {
            powerButton.textContent = 'ON';
            powerButton.classList.add('active');
            this.createBlade(this.currentBladeColor);
        } else {
            powerButton.textContent = 'OFF';
            powerButton.classList.remove('active');
            
            if (this.lightsaberParts.blade) {
                // Animate blade retraction by scaling down and moving position
                const blade = this.lightsaberParts.blade;
                
                // Animate scaling down
                const scaleAnimation = BABYLON.Animation.CreateAndStartAnimation(
                    'bladeRetraction',
                    blade,
                    'scaling.y',
                    30,
                    15,
                    1,
                    0,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
                
                // Animate position moving down into emitter
                const positionAnimation = BABYLON.Animation.CreateAndStartAnimation(
                    'bladePositionRetraction',
                    blade,
                    'position.y',
                    30,
                    15,
                    4.25,
                    1.5,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
                    null,
                    () => {
                        // Dispose blade after animation completes
                        blade.dispose();
                        this.lightsaberParts.blade = null;
                    }
                );
            }
        }
    }

    getBladeColor(color) {
        switch (color) {
            case 'red':
                return new BABYLON.Color3(1, 0, 0);
            case 'green':
                return new BABYLON.Color3(0, 1, 0);
            case 'purple':
                return new BABYLON.Color3(0.8, 0, 1);
            case 'yellow':
                return new BABYLON.Color3(1, 1, 0);
            case 'white':
                return new BABYLON.Color3(1, 1, 1);
            case 'orange':
                return new BABYLON.Color3(1, 0.5, 0);
            case 'unstable':
                return new BABYLON.Color3(1, 0.2, 0.2);
            default: // blue
                return new BABYLON.Color3(0, 0.5, 1);
        }
    }

    setupControls() {
        // Mouse/touch rotation controls
        this.scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit && pickInfo.pickedMesh && pickInfo.pickedMesh.parent === this.lightsaberGroup) {
                this.isRotating = true;
                this.lastPointerX = evt.clientX;
                this.lastPointerY = evt.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        };

        this.scene.onPointerUp = () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
        };

        this.scene.onPointerMove = (evt) => {
            if (this.isRotating) {
                const deltaX = evt.clientX - this.lastPointerX;
                const deltaY = evt.clientY - this.lastPointerY;
                
                // Rotate the lightsaber based on mouse movement
                this.lightsaberGroup.rotation.y += deltaX * 0.01;
                this.lightsaberGroup.rotation.x += deltaY * 0.01;
                
                this.lastPointerX = evt.clientX;
                this.lastPointerY = evt.clientY;
            }
        };

        // Zoom controls with mouse wheel
        this.canvas.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            const delta = evt.deltaY;
            const zoomSpeed = 0.1;
            
            if (delta > 0) {
                // Zoom out
                this.camera.radius = Math.min(this.camera.radius + zoomSpeed, this.camera.upperRadiusLimit);
            } else {
                // Zoom in
                this.camera.radius = Math.max(this.camera.radius - zoomSpeed, this.camera.lowerRadiusLimit);
            }
        }, { passive: false });

        // Hover effect
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh && 
                pointerInfo.pickInfo.pickedMesh.parent === this.lightsaberGroup) {
                this.canvas.style.cursor = 'grab';
            } else if (!this.isRotating) {
                this.canvas.style.cursor = 'default';
            }
        }, BABYLON.PointerEventTypes.POINTERMOVE);
    }

    setupMenu() {
        const menuSections = document.querySelectorAll('.part-buttons');
        
        menuSections.forEach(section => {
            const sectionName = section.dataset.section;
            const buttons = section.querySelectorAll('.part-button');
            
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons in this section
                    buttons.forEach(btn => btn.classList.remove('active'));
                    // Add active class to clicked button
                    button.classList.add('active');
                    
                    // Update the lightsaber part
                    const partType = button.dataset.type;
                    this.updatePart(sectionName, partType);
                });
            });
        });

        // Setup power toggle button
        const powerToggle = document.getElementById('powerToggle');
        powerToggle.addEventListener('click', () => {
            this.toggleBlade();
        });
    }

    updatePart(section, type) {
        switch (section) {
            case 'pommel':
                this.createPommel(type);
                break;
            case 'grip':
                this.createGrip(type);
                break;
            case 'emitter':
                this.createEmitter(type);
                break;
            case 'blade':
                if (this.bladeOn) {
                    this.createBlade(type);
                } else {
                    this.currentBladeColor = type;
                }
                break;
            case 'pommel-color':
                this.partColors.pommel = type;
                this.createPommel(this.getCurrentPartType('pommel'));
                break;
            case 'grip-color':
                this.partColors.grip = type;
                this.createGrip(this.getCurrentPartType('grip'));
                break;
            case 'emitter-color':
                this.partColors.emitter = type;
                this.createEmitter(this.getCurrentPartType('emitter'));
                break;
        }
    }

    getCurrentPartType(section) {
        const activeButton = document.querySelector(`[data-section="${section}"] .part-button.active`);
        return activeButton ? activeButton.dataset.type : 'basic';
    }

    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new LightsaberMaker();
});
