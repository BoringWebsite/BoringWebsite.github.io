class CombatGame {
	constructor() {
		this.canvas = document.getElementById("gameCanvas");
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.scene = null;
		this.camera = null;
		this.player = null;
		this.saberParts = {
			pommel: null,
			grip: null,
			emitter: null,
			blade: null,
		};
		this.saberGroup = null;
		this.glowLayer = null;
		this.unstableFlickerAnimation = null;

		// Add emitter height tracking
		this.emitterHeight = 1.0; // Default height

		// Player movement
		this.inputMap = {};
		this.playerSpeed = 0.1;
		this.runMultiplier = 2;
		this.jumpPower = 0.15;
		this.isGrounded = true;
		this.velocity = new BABYLON.Vector3(0, 0, 0);
		this.gravity = -0.01;

		// Mouse look
		this.mouseSensitivity = 0.002;
		this.isPointerLocked = false;

		// Saber configuration
		this.saberConfig = null;

		this.init();
	}

	init() {
		this.loadSaberConfiguration();
		this.createScene();
		this.createPlayer();
		this.createSaber();
		this.setupControls();
		this.setupHUD();
		this.startRenderLoop();

		// Hide loading screen
		document.getElementById("loading").style.display = "none";

		// Handle window resize
		window.addEventListener("resize", () => {
			this.engine.resize();
		});
	}

	loadSaberConfiguration() {
		try {
			const savedConfig = localStorage.getItem("customSaberConfig");
			if (savedConfig) {
				this.saberConfig = JSON.parse(savedConfig);
				console.log("Loaded saber configuration for combat:", this.saberConfig);
			} else {
				// Fallback to default saber
				this.saberConfig = {
					bladeColor: "blue",
					pommelType: "basic",
					gripType: "smooth",
					emitterType: "standard",
					partColors: {
						pommel: "gray",
						grip: "gray",
						emitter: "gray",
					},
					bladeOn: true,
				};
				console.log("No saved saber found, using default configuration");
			}
		} catch (error) {
			console.error("Failed to load saber configuration:", error);
			// Use default configuration
			this.saberConfig = {
				bladeColor: "blue",
				pommelType: "basic",
				gripType: "smooth",
				emitterType: "standard",
				partColors: {
					pommel: "gray",
					grip: "gray",
					emitter: "gray",
				},
				bladeOn: true,
			};
		}
	}

	createScene() {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);
		this.scene.gravity = new BABYLON.Vector3(0, this.gravity, 0);

		// Create lights
		const hemisphericLight = new BABYLON.HemisphericLight(
			"hemiLight",
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		hemisphericLight.intensity = 0.6;

		const directionalLight = new BABYLON.DirectionalLight(
			"dirLight",
			new BABYLON.Vector3(-1, -1, -1),
			this.scene
		);
		directionalLight.intensity = 0.4;

		// Create glow layer for saber
		this.glowLayer = new BABYLON.GlowLayer("glowLayer", this.scene);
		this.glowLayer.intensity = 1.5;

		// Create ground
		const ground = BABYLON.MeshBuilder.CreateGround(
			"ground",
			{
				width: 50,
				height: 50,
			},
			this.scene
		);

		const groundMaterial = new BABYLON.StandardMaterial(
			"groundMaterial",
			this.scene
		);
		groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
		groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
		ground.material = groundMaterial;

		// Create some basic environment elements
		this.createEnvironment();
	}

	createEnvironment() {
		// Create some pillars for visual reference
		for (let i = 0; i < 8; i++) {
			const pillar = BABYLON.MeshBuilder.CreateCylinder(
				`pillar${i}`,
				{
					height: 8,
					diameterTop: 1,
					diameterBottom: 1.5,
				},
				this.scene
			);

			const angle = (i / 8) * Math.PI * 2;
			const radius = 15;
			pillar.position.x = Math.cos(angle) * radius;
			pillar.position.z = Math.sin(angle) * radius;
			pillar.position.y = 4;

			const pillarMaterial = new BABYLON.StandardMaterial(
				`pillarMaterial${i}`,
				this.scene
			);
			pillarMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
			pillar.material = pillarMaterial;
		}

		// Create a central platform
		const platform = BABYLON.MeshBuilder.CreateCylinder(
			"platform",
			{
				height: 0.5,
				diameter: 10,
			},
			this.scene
		);
		platform.position.y = 0.25;

		const platformMaterial = new BABYLON.StandardMaterial(
			"platformMaterial",
			this.scene
		);
		platformMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.5);
		platform.material = platformMaterial;
	}

	createPlayer() {
		// Create invisible player body for collision
		this.player = BABYLON.MeshBuilder.CreateCapsule(
			"player",
			{
				radius: 0.5,
				height: 2,
			},
			this.scene
		);
		this.player.position.y = 2;
		this.player.visibility = 0; // Make invisible

		// Create first-person camera
		this.camera = new BABYLON.FreeCamera(
			"camera",
			new BABYLON.Vector3(0, 1.7, 0),
			this.scene
		);
		this.camera.parent = this.player;
		this.camera.setTarget(BABYLON.Vector3.Zero());

		// Camera collision
		this.camera.checkCollisions = true;
		this.camera.applyGravity = false; // We'll handle gravity manually

		console.log("Camera created and parented to player");
		console.log("Camera position:", this.camera.position);
		console.log("Player position:", this.player.position);
	}

	createSaber() {
		// Create a group to hold all saber parts
		this.saberGroup = new BABYLON.TransformNode("saberGroup", this.scene);

		// Position saber relative to camera/player - move it further out and down
		this.saberGroup.parent = this.camera;
		this.saberGroup.position = new BABYLON.Vector3(1.2, -1.0, 3.0); // Further right, lower, much further forward
		this.saberGroup.rotation = new BABYLON.Vector3(-0.5, 0.3, 0.4); // Better angle for viewing the whole saber
		this.saberGroup.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5); // Slightly smaller but still visible

		console.log("Creating saber with config:", this.saberConfig);

		// Create pommel using SaberDrawer
		const pommel = SaberDrawer.createPommel(
			this.saberConfig.pommelType,
			this.scene,
			this.saberConfig.partColors.pommel
		);
		pommel.position.y = -1.7;
		pommel.parent = this.saberGroup;
		this.saberParts.pommel = pommel;

		// Create grip using SaberDrawer
		const grip = SaberDrawer.createGrip(
			this.saberConfig.gripType,
			this.scene,
			this.saberConfig.partColors.grip
		);
		grip.position.y = -0.5;
		grip.parent = this.saberGroup;
		this.saberParts.grip = grip;

		// Create emitter using SaberDrawer
		const emitterData = SaberDrawer.createEmitter(
			this.saberConfig.emitterType,
			this.scene,
			this.saberConfig.partColors.emitter
		);
		const emitter = emitterData.mesh;
		this.emitterHeight = emitterData.height;
		emitter.position.y = 1;
		emitter.parent = this.saberGroup;
		this.saberParts.emitter = emitter;

		// Only create blade if it should be on
		if (this.saberConfig.bladeOn) {
			const blade = SaberDrawer.createBlade(
				this.saberConfig.bladeColor,
				this.scene,
				this.glowLayer
			);
			blade.position.y = 1 + this.emitterHeight + 2.75;
			blade.parent = this.saberGroup;
			this.saberParts.blade = blade;

			// Start unstable flicker if needed
			if (this.saberConfig.bladeColor === "unstable") {
				const material = blade.getChildMeshes()[0]?.material;
				if (material) {
					this.startUnstableFlicker(blade, material);
				}
			}
			console.log("Blade created with color:", this.saberConfig.bladeColor);
		} else {
			console.log("Blade is turned off");
		}
	}

	startUnstableFlicker(blade, material) {
		// Use SaberDrawer's unstable flicker function
		this.unstableFlickerAnimation = SaberDrawer.createUnstableFlicker(
			blade,
			material,
			this.scene
		);
	}

	setupControls() {
		// Keyboard input using Babylon's observable
		this.scene.onKeyboardObservable.add((kbInfo) => {
			switch (kbInfo.type) {
				case BABYLON.KeyboardEventTypes.KEYDOWN:
					this.inputMap[kbInfo.event.code] = true;
					break;
				case BABYLON.KeyboardEventTypes.KEYUP:
					this.inputMap[kbInfo.event.code] = false;
					break;
			}
		});

		// Mouse look (pointer lock)
		this.canvas.addEventListener("click", () => {
			if (!this.isPointerLocked) {
				this.canvas.requestPointerLock();
			}
		});

		document.addEventListener("pointerlockchange", () => {
			this.isPointerLocked = document.pointerLockElement === this.canvas;
		});

		this.scene.onPointerObservable.add((pointerInfo) => {
			if (
				this.isPointerLocked &&
				pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE
			) {
				const deltaX = pointerInfo.event.movementX * this.mouseSensitivity;
				const deltaY = pointerInfo.event.movementY * this.mouseSensitivity;

				// Rotate player horizontally
				this.player.rotation.y += deltaX;

				// Rotate camera vertically
				this.camera.rotation.x += deltaY;
				this.camera.rotation.x = Math.max(
					-Math.PI / 2,
					Math.min(Math.PI / 2, this.camera.rotation.x)
				);
			}
		});

		// Mouse click for attacks
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (
				this.isPointerLocked &&
				pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN
			) {
				this.performAttack();
			}
		});

		// Back button
		const backButton = document.getElementById("backButton");
		if (backButton) {
			backButton.addEventListener("click", () => {
				window.location.href = "index.html";
			});
		}
	}

	performAttack() {
		// Simple attack animation - swing the saber
		if (this.saberGroup) {
			const originalRotation = this.saberGroup.rotation.clone();

			// Quick swing animation
			BABYLON.Animation.CreateAndStartAnimation(
				"saberSwing",
				this.saberGroup,
				"rotation.z",
				30,
				10,
				originalRotation.z,
				originalRotation.z + Math.PI / 3,
				BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
				null,
				() => {
					// Swing back
					BABYLON.Animation.CreateAndStartAnimation(
						"saberSwingBack",
						this.saberGroup,
						"rotation.z",
						30,
						10,
						this.saberGroup.rotation.z,
						originalRotation.z,
						BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
					);
				}
			);
		}
	}

	setupHUD() {
		// Update saber info in HUD
		const saberStatus = document.getElementById("saberStatus");
		if (saberStatus && this.saberConfig) {
			saberStatus.textContent = this.saberConfig.bladeOn
				? `${this.saberConfig.bladeColor.toUpperCase()} - ON`
				: "OFF";
		}
	}

	performAttack() {
		if (this.isAttacking) return;

		this.isAttacking = true;

		// Create attack animation
		const originalRotation = this.saberGroup.rotation.clone();

		// Swing animation
		const swingAnimation = BABYLON.Animation.CreateAndStartAnimation(
			"saberSwing",
			this.saberGroup,
			"rotation.z",
			60,
			30,
			originalRotation.z,
			originalRotation.z + Math.PI / 3,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
			null,
			() => {
				// Return swing
				BABYLON.Animation.CreateAndStartAnimation(
					"saberReturn",
					this.saberGroup,
					"rotation.z",
					60,
					20,
					this.saberGroup.rotation.z,
					originalRotation.z,
					BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
					null,
					() => {
						this.isAttacking = false;
					}
				);
			}
		);

		console.log("Performing lightsaber attack!");
	}

	updatePlayer() {
		if (!this.player) return;

		// Movement
		let moveVector = new BABYLON.Vector3(0, 0, 0);
		const speed =
			this.inputMap["ShiftLeft"] || this.inputMap["ShiftRight"]
				? this.playerSpeed * this.runMultiplier
				: this.playerSpeed;

		if (this.inputMap["KeyW"]) moveVector.z -= speed; // Forward
		if (this.inputMap["KeyS"]) moveVector.z += speed; // Backward
		if (this.inputMap["KeyA"]) moveVector.x += speed; // Left
		if (this.inputMap["KeyD"]) moveVector.x -= speed; // Right

		// Apply movement relative to player rotation
		if (moveVector.length() > 0) {
			moveVector = moveVector.rotateByQuaternionToRef(
				this.player.rotationQuaternion ||
					BABYLON.Quaternion.FromEulerAngles(0, this.player.rotation.y, 0),
				moveVector
			);
			this.player.position.addInPlace(moveVector);
		}

		// Jumping
		if (this.inputMap["Space"] && this.isGrounded) {
			this.velocity.y = this.jumpPower;
			this.isGrounded = false;
		}

		// Apply gravity
		this.velocity.y += this.gravity;
		this.player.position.y += this.velocity.y;

		// Ground collision
		if (this.player.position.y <= 2) {
			this.player.position.y = 2;
			this.velocity.y = 0;
			this.isGrounded = true;
		}
	}

	startRenderLoop() {
		this.engine.runRenderLoop(() => {
			if (this.scene) {
				this.updatePlayer();
				this.scene.render();
			}
		});
	}
}

// Initialize the combat game when the page loads
window.addEventListener("DOMContentLoaded", () => {
	new CombatGame();
});
