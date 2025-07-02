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
        
        // Add emitter height tracking
        this.emitterHeight = 1.0; // Default height
        
        // Randomly initialize parts and colors
        const pommelOptions = ['basic', 'spiked', 'rounded', 'heavy', 'curved', 'ceremonial', 'coiled', 'layered'];
        const gripOptions = ['smooth', 'ribbed', 'segmented', 'textured', 'curved', 'grooved'];
        const emitterOptions = ['standard', 'wide', 'focused', 'shroud', 'dual', 'crossguard', 'complex', 'layered'];


        const bladeOptions = ['blue', 'red', 'green', 'purple', 'yellow', 'white', 'orange', 'unstable'];
        const colorOptions = ['gray', 'gold', 'silver', 'black', 'bronze', 'brown', 'chrome'];
        
        this.currentBladeColor = bladeOptions[Math.floor(Math.random() * bladeOptions.length)];
        this.currentPommelType = pommelOptions[Math.floor(Math.random() * pommelOptions.length)];
        this.currentGripType = gripOptions[Math.floor(Math.random() * gripOptions.length)];
        this.currentEmitterType = emitterOptions[Math.floor(Math.random() * emitterOptions.length)];
        
        this.glowLayer = null;
        this.unstableFlickerAnimation = null;
        this.partColors = {
            pommel: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            grip: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            emitter: colorOptions[Math.floor(Math.random() * colorOptions.length)]
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
        
        // Create all parts with random selections
        this.createPommel(this.currentPommelType);
        this.createGrip(this.currentGripType);
        this.createEmitter(this.currentEmitterType);
        this.createBlade(this.currentBladeColor);
    }

    getPartColor(section, colorType) {
        const colors = {
            gray: new BABYLON.Color3(0.4, 0.4, 0.4),
            gold: new BABYLON.Color3(0.8, 0.6, 0.2),
            silver: new BABYLON.Color3(0.7, 0.7, 0.8),
            black: new BABYLON.Color3(0.1, 0.1, 0.1),
            bronze: new BABYLON.Color3(0.6, 0.4, 0.2),
            brown: new BABYLON.Color3(0.6, 0.35, 0.15), // More realistic leather brown
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
            case 'coiled':
                pommel = new BABYLON.TransformNode('coiledPommel', this.scene);
                
                // Base section
                const coilBase = BABYLON.MeshBuilder.CreateCylinder('coilBase', {
                    height: 0.4,
                    diameter: 0.6
                }, this.scene);
                coilBase.parent = pommel;
                
                // Create coiled/ribbed section
                for (let i = 0; i < 12; i++) {
                    const coil = BABYLON.MeshBuilder.CreateTorus('coil' + i, {
                        diameter: 0.65,
                        thickness: 0.04,
                        tessellation: 16
                    }, this.scene);
                    coil.position.y = 0.2 + (i * 0.05);
                    coil.parent = pommel;
                }
                
                // End cap
                const endCap = BABYLON.MeshBuilder.CreateCylinder('endCap', {
                    height: 0.15,
                    diameterTop: 0.5,
                    diameterBottom: 0.65
                }, this.scene);
                endCap.position.y = 0.8;
                endCap.parent = pommel;
                break;
            case 'layered':
                pommel = new BABYLON.TransformNode('layeredPommel', this.scene);
                
                // Main base cylinder - largest bottom section
                const mainBase = BABYLON.MeshBuilder.CreateCylinder('pommelMainBase', {
                    height: 0.4,
                    diameter: 0.8
                }, this.scene);
                mainBase.position.y = 0;
                mainBase.parent = pommel;
                
                // Middle section - stepped down
                const middleSection = BABYLON.MeshBuilder.CreateCylinder('pommelMiddle', {
                    height: 0.3,
                    diameter: 0.65
                }, this.scene);
                middleSection.position.y = 0.35;
                middleSection.parent = pommel;
                
                // Upper section - further stepped
                const upperSection = BABYLON.MeshBuilder.CreateCylinder('pommelUpper', {
                    height: 0.25,
                    diameter: 0.5
                }, this.scene);
                upperSection.position.y = 0.625;
                upperSection.parent = pommel;
                
                // Top cap - smallest section
                const topCap = BABYLON.MeshBuilder.CreateCylinder('pommelTopCap', {
                    height: 0.15,
                    diameter: 0.35
                }, this.scene);
                topCap.position.y = 0.825;
                topCap.parent = pommel;
                
                // Add protruding rectangular elements around the main base
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2; // 90 degrees apart
                    const protrusion = BABYLON.MeshBuilder.CreateBox(`pommelProtrusion${i}`, {
                        width: 0.15,
                        height: 0.08,
                        depth: 0.25
                    }, this.scene);
                    
                    const radius = 0.45; // Distance from center
                    protrusion.position.x = Math.cos(angle) * radius;
                    protrusion.position.z = Math.sin(angle) * radius;
                    protrusion.position.y = 0.05;
                    protrusion.rotation.y = angle;
                    protrusion.parent = pommel;
                }
                
                // Add smaller detail rings between sections
                const detailRing1 = BABYLON.MeshBuilder.CreateCylinder('pommelDetailRing1', {
                    height: 0.05,
                    diameter: 0.7
                }, this.scene);
                detailRing1.position.y = 0.225;
                detailRing1.parent = pommel;
                
                const detailRing2 = BABYLON.MeshBuilder.CreateCylinder('pommelDetailRing2', {
                    height: 0.04,
                    diameter: 0.55
                }, this.scene);
                detailRing2.position.y = 0.525;
                detailRing2.parent = pommel;
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
                const ribbedBaseMaterial = new BABYLON.StandardMaterial('baseGripMaterial', this.scene);
                ribbedBaseMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                baseGrip.material = ribbedBaseMaterial;
                
                // Add ribbed rings with selected color
                for (let i = 0; i < 8; i++) {
                    const ring = BABYLON.MeshBuilder.CreateCylinder(`ring${i}`, {
                        height: 0.1,
                        diameter: 0.72
                    }, this.scene);
                    ring.position.y = -0.75 + (i * 0.25);
                    ring.parent = grip;
                }
                
                
                // Add some loose hanging ends for realism
                for (let i = 0; i < 2; i++) {
                    const looseEnd = BABYLON.MeshBuilder.CreateBox(`looseEnd${i}`, {
                        width: 0.06,
                        height: 0.015,
                        depth: 0.15 + Math.random() * 0.1
                    }, this.scene);
                    
                    const angle = Math.random() * Math.PI * 2;
                    looseEnd.position.x = Math.cos(angle) * 0.32;
                    looseEnd.position.z = Math.sin(angle) * 0.32;
                    looseEnd.position.y = -0.9 + Math.random() * 0.15;
                    
                    looseEnd.rotation.y = angle + (Math.random() - 0.5) * 0.3;
                    looseEnd.rotation.x = (Math.random() - 0.5) * 0.2;
                    looseEnd.rotation.z = (Math.random() - 0.5) * 0.15;
                    
                    looseEnd.parent = grip;
                    
                    // Material for loose ends
                    const endMaterial = new BABYLON.StandardMaterial(`endMaterial${i}`, this.scene);
                    const baseColor = this.getPartColor('grip', this.partColors.grip);
                    endMaterial.diffuseColor = new BABYLON.Color3(
                        baseColor.r * 0.85,
                        baseColor.g * 0.85,
                        baseColor.b * 0.85
                    );
                    endMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
                    endMaterial.roughness = 0.95;
                    
                    looseEnd.material = endMaterial;
                }
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
            case 'grooved':
                grip = new BABYLON.TransformNode('groovedGrip', this.scene);
                
                // Main grip cylinder
                const mainGrip = BABYLON.MeshBuilder.CreateCylinder('mainGrip', {
                    height: 2,
                    diameter: 0.62
                }, this.scene);
                mainGrip.parent = grip;
                
                // Create vertical grooves/channels around the grip
                const numGrooves = 8; // Number of vertical grooves
                for (let i = 0; i < numGrooves; i++) {
                    const angle = (i * Math.PI * 2) / numGrooves;
                    
                    // Create groove as a thin cylinder that will be subtracted visually
                    // Instead, we'll create raised sections between grooves
                    const raisedSection = BABYLON.MeshBuilder.CreateCylinder(`raisedSection${i}`, {
                        height: 1.8,
                        diameter: 0.1,
                        tessellation: 6
                    }, this.scene);
                    
                    // Position the raised section around the grip
                    const radius = 0.32;
                    raisedSection.position.x = Math.cos(angle) * radius;
                    raisedSection.position.z = Math.sin(angle) * radius;
                    raisedSection.position.y = 0;
                    raisedSection.parent = grip;
                }
                
                // Add end caps with slightly larger diameter
                const topCap = BABYLON.MeshBuilder.CreateCylinder('topCap', {
                    height: 0.15,
                    diameter: 0.68
                }, this.scene);
                topCap.position.y = 0.925;
                topCap.parent = grip;
                
                const bottomCap = BABYLON.MeshBuilder.CreateCylinder('bottomCap', {
                    height: 0.15,
                    diameter: 0.68
                }, this.scene);
                bottomCap.position.y = -0.925;
                bottomCap.parent = grip;
                
                // Add some detail rings near the ends
                for (let i = 0; i < 3; i++) {
                    const topRing = BABYLON.MeshBuilder.CreateCylinder(`topRing${i}`, {
                        height: 0.03,
                        diameter: 0.66
                    }, this.scene);
                    topRing.position.y = 0.7 + (i * 0.08);
                    topRing.parent = grip;
                    
                    const bottomRing = BABYLON.MeshBuilder.CreateCylinder(`bottomRing${i}`, {
                        height: 0.03,
                        diameter: 0.66
                    }, this.scene);
                    bottomRing.position.y = -0.7 - (i * 0.08);
                    bottomRing.parent = grip;
                }
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
        
        if (grip.material !== undefined) {
            grip.material = material;
        } else {
            grip.getChildMeshes().forEach(child => {
                // Skip base parts and wrapped segments (they have their own materials)
                if (child.name === 'baseGrip' || child.name === 'connector' || 
                    child.name.startsWith('wrap') || child.name === 'baseWrap' ||
                    child.name.startsWith('stripSegment') || child.name.startsWith('looseEnd')) {
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
        let emitterTopY = 0.5; // Default top position relative to emitter base
        
        switch (type) {
            case 'wide':
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1,
                    diameterTop: 0.8,
                    diameterBottom: 0.6
                }, this.scene);
                emitterTopY = 0.5;
                break;
            case 'focused':
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1.2,
                    diameterTop: 0.4,
                    diameterBottom: 0.6
                }, this.scene);
                emitterTopY = 0.6;
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
                emitterTopY = 1.1; // Top of the shroud
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
                emitterTopY = 0.5;
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
                emitterTopY = 0.5;
                break;
            case 'complex':
                emitter = new BABYLON.TransformNode('complexEmitter', this.scene);
                
                // Main base section
                const mainBase = BABYLON.MeshBuilder.CreateCylinder('mainBase', {
                    height: 0.6,
                    diameter: 0.75
                }, this.scene);
                mainBase.position.y = -0.2;
                mainBase.parent = emitter;
                
                // Middle ribbed section
                for (let i = 0; i < 8; i++) {
                    const rib = BABYLON.MeshBuilder.CreateCylinder('rib' + i, {
                        height: 0.03,
                        diameter: 0.8
                    }, this.scene);
                    rib.position.y = 0.1 + (i * 0.04);
                    rib.parent = emitter;
                }
                
                // Upper section with stepped design
                const upperSection = BABYLON.MeshBuilder.CreateCylinder('upperSection', {
                    height: 0.4,
                    diameterTop: 0.6,
                    diameterBottom: 0.75
                }, this.scene);
                upperSection.position.y = 0.55;
                upperSection.parent = emitter;
                
                // Top ring detail
                const topRing = BABYLON.MeshBuilder.CreateCylinder('topRing', {
                    height: 0.08,
                    diameter: 0.65
                }, this.scene);
                topRing.position.y = 0.8;
                topRing.parent = emitter;
                
                // Final narrow emitter tip
                const emitterTip = BABYLON.MeshBuilder.CreateCylinder('emitterTip', {
                    height: 0.2,
                    diameterTop: 0.45,
                    diameterBottom: 0.6
                }, this.scene);
                emitterTip.position.y = 0.95;
                emitterTip.parent = emitter;
                emitterTopY = 1.05; // Top of the tip
                break;
            case 'layered':
                emitter = new BABYLON.TransformNode('layeredEmitter', this.scene);
                
                // Base section - positioned to connect with grip
                const layerBase = BABYLON.MeshBuilder.CreateCylinder('layerBase', {
                    height: 0.2,
                    diameter: 0.5
                }, this.scene);
                layerBase.position.y = -0.4; // Move down to connect with grip
                layerBase.parent = emitter;
                
                // Create multiple stacked rings/discs
                const ringData = [
                    { diameter: 0.3, height: 0.3, y: -0.25 }, // Adjusted y positions
                    { diameter: 0.5, height: 0.08, y: -0.1 },
                    { diameter: 0.3, height: 0.1, y: -0.05 },
                ];
                
                ringData.forEach((ring, index) => {
                    const disc = BABYLON.MeshBuilder.CreateCylinder(`layerRing${index}`, {
                        height: ring.height,
                        diameter: ring.diameter
                    }, this.scene);
                    disc.position.y = ring.y;
                    disc.parent = emitter;
                });
                
                // Final emitter opening
                const emitterOpening = BABYLON.MeshBuilder.CreateCylinder('emitterOpening', {
                    height: 0.2,
                    diameterTop: 0.7,
                    diameterBottom: 0.65
                }, this.scene);
                emitterOpening.position.y = 0.1; // Adjusted to maintain proper height
                emitterOpening.parent = emitter;
                emitterTopY = 0.2; // Top of the opening
                break;
            default: // standard
                emitter = BABYLON.MeshBuilder.CreateCylinder('emitter', {
                    height: 1,
                    diameter: 0.7
                }, this.scene);
                emitterTopY = 0.5;
        }

        // Store the emitter height for blade positioning
        this.emitterHeight = emitterTopY;

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
        
        // Update blade position if blade is on
        if (this.bladeOn && this.lightsaberParts.blade) {
            this.updateBladePosition();
        }
    }

    updateBladePosition() {
        if (this.lightsaberParts.blade) {
            const bladeStartY = 1 + this.emitterHeight; // Emitter position + emitter height
            this.lightsaberParts.blade.position.y = bladeStartY + 2.75; // Center blade above emitter
        }
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

        // Calculate blade start position based on emitter
        const bladeStartY = 1 + this.emitterHeight; // Emitter position + emitter height

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
        blade.position.y = bladeStartY;
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
            bladeStartY,
            bladeStartY + 2.75, // Move blade up by half its height
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
                const bladeStartY = 1 + this.emitterHeight;
                
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
                    bladeStartY + 2.75,
                    bladeStartY,
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
            if (pickInfo.hit && pickInfo.pickedMesh) {
                // Check if the picked mesh belongs to the lightsaber group (including child meshes)
                let parentNode = pickInfo.pickedMesh.parent;
                let isLightsaberPart = false;
                
                // Walk up the parent chain to find if this belongs to the lightsaber
                while (parentNode) {
                    if (parentNode === this.lightsaberGroup) {
                        isLightsaberPart = true;
                        break;
                    }
                    parentNode = parentNode.parent;
                }
                
                // Also check if the picked mesh itself is a direct child
                if (pickInfo.pickedMesh.parent === this.lightsaberGroup) {
                    isLightsaberPart = true;
                }
                
                if (isLightsaberPart) {
                    this.isRotating = true;
                    this.lastPointerX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
                    this.lastPointerY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
                    this.canvas.style.cursor = 'grabbing';
                    evt.preventDefault();
                }
            }
        };

        this.scene.onPointerUp = (evt) => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
            evt.preventDefault();
        };

        this.scene.onPointerMove = (evt) => {
            if (this.isRotating) {
                const currentX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : this.lastPointerX);
                const currentY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : this.lastPointerY);
                
                const deltaX = currentX - this.lastPointerX;
                const deltaY = currentY - this.lastPointerY;
                
                // Rotate the lightsaber based on mouse movement
                this.lightsaberGroup.rotation.y += deltaX * 0.01;
                this.lightsaberGroup.rotation.x += deltaY * 0.01;
                
                this.lastPointerX = currentX;
                this.lastPointerY = currentY;
                evt.preventDefault();
            }
        };

        // Add additional event listeners to handle edge cases
        this.canvas.addEventListener('mouseup', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
        });

        // Touch event handlers for mobile
        this.canvas.addEventListener('touchend', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
        });

        this.canvas.addEventListener('touchcancel', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'default';
        });

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
            if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh && !this.isRotating) {
                // Check if the picked mesh belongs to the lightsaber group
                let parentNode = pointerInfo.pickInfo.pickedMesh.parent;
                let isLightsaberPart = false;
                
                while (parentNode) {
                    if (parentNode === this.lightsaberGroup) {
                        isLightsaberPart = true;
                        break;
                    }
                    parentNode = parentNode.parent;
                }
                
                if (pointerInfo.pickInfo.pickedMesh.parent === this.lightsaberGroup) {
                    isLightsaberPart = true;
                }
                
                if (isLightsaberPart) {
                    this.canvas.style.cursor = 'grab';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            } else if (!this.isRotating) {
                this.canvas.style.cursor = 'default';
            }
        }, BABYLON.PointerEventTypes.POINTERMOVE);
    }

    setupMenu() {
        // Set initial active buttons based on random selections
        this.setActiveButton('pommel', this.currentPommelType);
        this.setActiveButton('grip', this.currentGripType);
        this.setActiveButton('emitter', this.currentEmitterType);
        this.setActiveButton('blade', this.currentBladeColor);
        this.setActiveButton('pommel-color', this.partColors.pommel);
        this.setActiveButton('grip-color', this.partColors.grip);
        this.setActiveButton('emitter-color', this.partColors.emitter);

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

    setActiveButton(section, type) {
        // Remove active class from all buttons in section
        const buttons = document.querySelectorAll(`[data-section="${section}"] .part-button`);
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to the selected button
        const activeButton = document.querySelector(`[data-section="${section}"] [data-type="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
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
