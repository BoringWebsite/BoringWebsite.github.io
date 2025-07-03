class SaberMaker {
	constructor() {
		this.canvas = document.getElementById("gameCanvas");
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.scene = null;
		this.camera = null;
		this.saberParts = {
			pommel: null,
			grip: null,
			emitter: null,
			blade: null,
		};
		this.saberGroup = null;
		this.isRotating = false;
		this.lastPointerX = 0;
		this.lastPointerY = 0;
		this.bladeOn = true;

		// Add emitter height tracking
		this.emitterHeight = 1.0; // Default height

		// Randomly initialize parts and colors using SaberDrawer options

		// Try to load saved saber configuration BEFORE initializing defaults
		const savedSaber = this.loadSaberConfiguration();

		if (savedSaber) {
			// Use saved configuration
			this.currentBladeColor = savedSaber.bladeColor;
			this.currentPommelType = savedSaber.pommelType;
			this.currentGripType = savedSaber.gripType;
			this.currentEmitterType = savedSaber.emitterType;
			this.partColors = savedSaber.partColors;
			this.bladeOn =
				savedSaber.bladeOn !== undefined ? savedSaber.bladeOn : true;
			console.log("Loaded saved saber configuration:", savedSaber);
		} else {
			// Use random configuration
			this.currentBladeColor =
				SaberDrawer.options.bladeColors[
					Math.floor(Math.random() * SaberDrawer.options.bladeColors.length)
				];
			this.currentPommelType =
				SaberDrawer.options.pommelTypes[
					Math.floor(Math.random() * SaberDrawer.options.pommelTypes.length)
				];
			this.currentGripType =
				SaberDrawer.options.gripTypes[
					Math.floor(Math.random() * SaberDrawer.options.gripTypes.length)
				];
			this.currentEmitterType =
				SaberDrawer.options.emitterTypes[
					Math.floor(Math.random() * SaberDrawer.options.emitterTypes.length)
				];
			this.partColors = {
				pommel:
					SaberDrawer.options.partColors[
						Math.floor(Math.random() * SaberDrawer.options.partColors.length)
					],
				grip: SaberDrawer.options.partColors[
					Math.floor(Math.random() * SaberDrawer.options.partColors.length)
				],
				emitter:
					SaberDrawer.options.partColors[
						Math.floor(Math.random() * SaberDrawer.options.partColors.length)
					],
			};
			console.log("Using random saber configuration");
		}

		this.glowLayer = null;
		this.unstableFlickerAnimation = null;

		this.init();
	}

	// Save saber configuration to localStorage
	saveSaberConfiguration() {
		const saberConfig = {
			bladeColor: this.currentBladeColor,
			pommelType: this.currentPommelType,
			gripType: this.currentGripType,
			emitterType: this.currentEmitterType,
			partColors: this.partColors,
			bladeOn: this.bladeOn,
			timestamp: Date.now(),
		};

		try {
			localStorage.setItem("customSaberConfig", JSON.stringify(saberConfig));
			console.log("Saber configuration saved successfully:", saberConfig);
			return true;
		} catch (error) {
			console.error("Failed to save saber configuration:", error);
			return false;
		}
	}

	// Load saber configuration from localStorage
	loadSaberConfiguration() {
		try {
			const savedConfig = localStorage.getItem("customSaberConfig");
			if (savedConfig) {
				const config = JSON.parse(savedConfig);
				console.log("Saber configuration found in localStorage:", config);
				return config;
			} else {
				console.log("No saved saber configuration found");
			}
		} catch (error) {
			console.error("Failed to load saber configuration:", error);
		}
		return null;
	}

	// Apply loaded configuration to the saber
	applySaberConfiguration(config) {
		if (!config) return false;

		try {
			// Update current properties
			this.currentBladeColor = config.bladeColor || "blue";
			this.currentPommelType = config.pommelType || "basic";
			this.currentGripType = config.gripType || "smooth";
			this.currentEmitterType = config.emitterType || "standard";
			this.partColors = config.partColors || {
				pommel: "gray",
				grip: "gray",
				emitter: "gray",
			};
			this.bladeOn = config.bladeOn !== undefined ? config.bladeOn : true;

			// Rebuild the saber with new configuration
			this.createSaber();

			// Update UI to reflect loaded configuration
			this.updateUIFromConfiguration();

			console.log("Applied saber configuration successfully");
			return true;
		} catch (error) {
			console.error("Failed to apply saber configuration:", error);
			return false;
		}
	}

	// Update UI buttons to match current configuration
	updateUIFromConfiguration() {
		// Update part type buttons
		this.setActiveButton("pommel", this.currentPommelType);
		this.setActiveButton("grip", this.currentGripType);
		this.setActiveButton("emitter", this.currentEmitterType);
		this.setActiveButton("blade", this.currentBladeColor);

		// Update color buttons
		this.setActiveButton("pommel-color", this.partColors.pommel);
		this.setActiveButton("grip-color", this.partColors.grip);
		this.setActiveButton("emitter-color", this.partColors.emitter);

		// Update power button
		const powerButton = document.getElementById("powerToggle");
		if (powerButton) {
			powerButton.textContent = this.bladeOn ? "ON" : "OFF";
			if (this.bladeOn) {
				powerButton.classList.add("active");
			} else {
				powerButton.classList.remove("active");
			}
		}
	}

	init() {
		this.createScene();
		this.createSaber();
		this.setupControls();
		this.setupMenu();
		this.startRenderLoop();

		// Handle window resize
		window.addEventListener("resize", () => {
			this.engine.resize();
		});

		// Auto-save when page is about to unload
		window.addEventListener("beforeunload", () => {
			this.saveSaberConfiguration();
		});
	}

	createScene() {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2);

		// Create camera positioned to show saber on right side of screen
		this.camera = new BABYLON.ArcRotateCamera(
			"camera",
			Math.PI / 2,
			Math.PI / 2,
			10,
			new BABYLON.Vector3(2, 0, 0), // Offset target to the right
			this.scene
		);
		this.camera.setTarget(new BABYLON.Vector3(2, 0, 0)); // Center on right side
		this.camera.lowerRadiusLimit = 3;
		this.camera.upperRadiusLimit = 20;

		// Create lights
		const hemisphericLight = new BABYLON.HemisphericLight(
			"hemiLight",
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		hemisphericLight.intensity = 0.7;

		const directionalLight = new BABYLON.DirectionalLight(
			"dirLight",
			new BABYLON.Vector3(-1, -1, -1),
			this.scene
		);
		directionalLight.intensity = 0.5;

		// Create glow layer
		this.glowLayer = new BABYLON.GlowLayer("glowLayer", this.scene);
		this.glowLayer.intensity = 1.5;
	}

	createSaber() {
		// Dispose of existing saber if it exists
		if (this.saberGroup) {
			this.saberGroup.dispose();
		}

		// Create a group to hold all saber parts
		this.saberGroup = new BABYLON.TransformNode("saberGroup", this.scene);

		// Position the saber group to the right to avoid menu overlap
		this.saberGroup.position.x = 2;

		// Create all parts with current configuration
		this.createPommel(this.currentPommelType);
		this.createGrip(this.currentGripType);
		this.createEmitter(this.currentEmitterType);

		// Only create blade if it should be on
		if (this.bladeOn) {
			this.createBlade(this.currentBladeColor);
		}
	}

	createPommel(type) {
		if (this.saberParts.pommel) {
			this.saberParts.pommel.dispose();
		}

		const pommel = SaberDrawer.createPommel(
			type,
			this.scene,
			this.partColors.pommel
		);
		pommel.position.y = -1.7;
		pommel.parent = this.saberGroup;
		this.saberParts.pommel = pommel;
	}

	createGrip(type) {
		if (this.saberParts.grip) {
			this.saberParts.grip.dispose();
		}

		const grip = SaberDrawer.createGrip(type, this.scene, this.partColors.grip);
		grip.position.y = -0.5;
		grip.parent = this.saberGroup;
		this.saberParts.grip = grip;
	}

	createEmitter(type) {
		if (this.saberParts.emitter) {
			this.saberParts.emitter.dispose();
		}

		const emitterData = SaberDrawer.createEmitter(
			type,
			this.scene,
			this.partColors.emitter
		);
		const emitter = emitterData.mesh;
		this.emitterHeight = emitterData.height;

		emitter.position.y = 1;
		emitter.parent = this.saberGroup;
		this.saberParts.emitter = emitter;

		// Update blade position if blade is on
		if (this.bladeOn && this.saberParts.blade) {
			this.updateBladePosition();
		}
	}

	updateBladePosition() {
		if (this.saberParts.blade) {
			const bladeStartY = 1 + this.emitterHeight; // Emitter position + emitter height
			this.saberParts.blade.position.y = bladeStartY + 2.75; // Center blade above emitter
		}
	}

	createBlade(color) {
		if (this.saberParts.blade) {
			this.saberParts.blade.dispose();
		}

		// Stop any existing flicker animation
		if (this.unstableFlickerAnimation) {
			this.scene.stopAnimation(this.saberParts.blade);
			this.unstableFlickerAnimation = null;
		}

		this.currentBladeColor = color;

		if (!this.bladeOn) {
			return;
		}

		// Calculate blade start position based on emitter
		const bladeStartY = 1 + this.emitterHeight; // Emitter position + emitter height

		// Create blade using SaberDrawer
		const blade = SaberDrawer.createBlade(color, this.scene, this.glowLayer);
		blade.parent = this.saberGroup;

		// Create blade extension animation
		const animations = SaberDrawer.createBladeExtensionAnimation(
			blade,
			bladeStartY,
			bladeStartY + 2.75,
			() => {
				// Start flicker animation for unstable blade after extension completes
				if (color === "unstable") {
					this.startUnstableFlicker(blade);
				}
			}
		);

		this.saberParts.blade = blade;
	}

	startUnstableFlicker(blade) {
		// Get the blade material from the first child mesh
		const material = blade.getChildMeshes()[0]?.material;
		if (material) {
			this.unstableFlickerAnimation = SaberDrawer.createUnstableFlicker(
				blade,
				material,
				this.scene
			);
		}
	}

	toggleBlade() {
		this.bladeOn = !this.bladeOn;
		const powerButton = document.getElementById("powerToggle");

		if (this.bladeOn) {
			powerButton.textContent = "ON";
			powerButton.classList.add("active");
			this.createBlade(this.currentBladeColor);
		} else {
			powerButton.textContent = "OFF";
			powerButton.classList.remove("active");

			if (this.saberParts.blade) {
				const blade = this.saberParts.blade;
				const bladeStartY = 1 + this.emitterHeight;

				// Use SaberDrawer's retraction animation
				SaberDrawer.createBladeRetractionAnimation(
					blade,
					bladeStartY + 2.75,
					bladeStartY,
					() => {
						// Dispose blade after animation completes
						blade.dispose();
						this.saberParts.blade = null;
					}
				);
			}
		}
	}

	setupControls() {
		// Mouse/touch rotation controls
		this.scene.onPointerDown = (evt, pickInfo) => {
			if (pickInfo.hit && pickInfo.pickedMesh) {
				// Check if the picked mesh belongs to the saber group (including child meshes)
				let parentNode = pickInfo.pickedMesh.parent;
				let isSaberPart = false;

				// Walk up the parent chain to find if this belongs to the saber
				while (parentNode) {
					if (parentNode === this.saberGroup) {
						isSaberPart = true;
						break;
					}
					parentNode = parentNode.parent;
				}

				// Also check if the picked mesh itself is a direct child
				if (pickInfo.pickedMesh.parent === this.saberGroup) {
					isSaberPart = true;
				}

				if (isSaberPart) {
					this.isRotating = true;
					this.lastPointerX =
						evt.clientX ||
						(evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
					this.lastPointerY =
						evt.clientY ||
						(evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
					this.canvas.style.cursor = "grabbing";
					evt.preventDefault();
				}
			}
		};

		this.scene.onPointerUp = (evt) => {
			this.isRotating = false;
			this.canvas.style.cursor = "default";
			evt.preventDefault();
		};

		this.scene.onPointerMove = (evt) => {
			if (this.isRotating) {
				const currentX =
					evt.clientX ||
					(evt.touches && evt.touches[0]
						? evt.touches[0].clientX
						: this.lastPointerX);
				const currentY =
					evt.clientY ||
					(evt.touches && evt.touches[0]
						? evt.touches[0].clientY
						: this.lastPointerY);

				const deltaX = currentX - this.lastPointerX;
				const deltaY = currentY - this.lastPointerY;

				// Rotate the saber based on mouse movement
				this.saberGroup.rotation.y += deltaX * 0.01;
				this.saberGroup.rotation.x += deltaY * 0.01;

				this.lastPointerX = currentX;
				this.lastPointerY = currentY;
				evt.preventDefault();
			}
		};

		// Add additional event listeners to handle edge cases
		this.canvas.addEventListener("mouseup", () => {
			this.isRotating = false;
			this.canvas.style.cursor = "default";
		});

		this.canvas.addEventListener("mouseleave", () => {
			this.isRotating = false;
			this.canvas.style.cursor = "default";
		});

		// Touch event handlers for mobile
		this.canvas.addEventListener("touchend", () => {
			this.isRotating = false;
			this.canvas.style.cursor = "default";
		});

		this.canvas.addEventListener("touchcancel", () => {
			this.isRotating = false;
			this.canvas.style.cursor = "default";
		});

		// Zoom controls with mouse wheel
		this.canvas.addEventListener(
			"wheel",
			(evt) => {
				evt.preventDefault();
				const delta = evt.deltaY;
				const zoomSpeed = 0.1;

				if (delta > 0) {
					// Zoom out
					this.camera.radius = Math.min(
						this.camera.radius + zoomSpeed,
						this.camera.upperRadiusLimit
					);
				} else {
					// Zoom in
					this.camera.radius = Math.max(
						this.camera.radius - zoomSpeed,
						this.camera.lowerRadiusLimit
					);
				}
			},
			{ passive: false }
		);

		// Hover effect
		this.scene.onPointerObservable.add((pointerInfo) => {
			if (
				pointerInfo.pickInfo.hit &&
				pointerInfo.pickInfo.pickedMesh &&
				!this.isRotating
			) {
				// Check if the picked mesh belongs to the saber group
				let parentNode = pointerInfo.pickInfo.pickedMesh.parent;
				let isSaberPart = false;

				while (parentNode) {
					if (parentNode === this.saberGroup) {
						isSaberPart = true;
						break;
					}
					parentNode = parentNode.parent;
				}

				if (pointerInfo.pickInfo.pickedMesh.parent === this.saberGroup) {
					isSaberPart = true;
				}

				if (isSaberPart) {
					this.canvas.style.cursor = "grab";
				} else {
					this.canvas.style.cursor = "default";
				}
			} else if (!this.isRotating) {
				this.canvas.style.cursor = "default";
			}
		}, BABYLON.PointerEventTypes.POINTERMOVE);
	}

	setupMenu() {
		// Set initial active buttons based on current selections (loaded or random)
		this.updateUIFromConfiguration();

		const menuSections = document.querySelectorAll(".part-buttons");

		menuSections.forEach((section) => {
			const sectionName = section.dataset.section;
			const buttons = section.querySelectorAll(".part-button");

			buttons.forEach((button) => {
				button.addEventListener("click", () => {
					// Remove active class from all buttons in this section
					buttons.forEach((btn) => btn.classList.remove("active"));
					// Add active class to clicked button
					button.classList.add("active");

					// Update the saber part
					const partType = button.dataset.type;
					this.updatePart(sectionName, partType);

					// Auto-save after each change
					this.saveSaberConfiguration();
				});
			});
		});

		// Setup power toggle button
		const powerToggle = document.getElementById("powerToggle");
		if (powerToggle) {
			powerToggle.addEventListener("click", () => {
				this.toggleBlade();
				this.saveSaberConfiguration();
			});
		}

		// Setup shuffle button
		const shuffleButton = document.getElementById("shuffleButton");
		if (shuffleButton) {
			shuffleButton.addEventListener("click", () => {
				this.shuffleSaber();
			});
		}

		// Setup fight button
		const fightButton = document.getElementById("fightButton");
		if (fightButton) {
			fightButton.addEventListener("click", () => {
				this.startFightingGame();
			});
		}

		// Setup reset button (delete saved data)
		const resetButton = document.getElementById("resetButton");
		if (resetButton) {
			resetButton.addEventListener("click", () => {
				this.confirmDeleteSavedData();
			});
		}

		// Setup privacy button and modal
		const privacyButton = document.getElementById("privacyButton");
		if (privacyButton) {
			privacyButton.addEventListener("click", () => {
				this.showPrivacyModal();
			});
		}

		const privacyClose = document.getElementById("privacyClose");
		if (privacyClose) {
			privacyClose.addEventListener("click", () => {
				this.hidePrivacyModal();
			});
		}

		const privacyModal = document.getElementById("privacyModal");
		if (privacyModal) {
			privacyModal.addEventListener("click", (e) => {
				if (e.target.id === "privacyModal") {
					this.hidePrivacyModal();
				}
			});
		}
	}

	shuffleSaber() {
		// Generate new random configuration
		this.generateRandomConfiguration();

		// Rebuild saber with new configuration
		this.createSaber();

		// Update UI to reflect new configuration
		this.updateUIFromConfiguration();

		// Auto-save the new configuration
		this.saveSaberConfiguration();

		// Show shuffle effect
		this.showFloatingText(
			document.getElementById("shuffleButton") || document.body,
			"🎲 Saber Shuffled!",
			"#9b59b6"
		);

		// Visual feedback on the shuffle button
		const shuffleButton = document.getElementById("shuffleButton");
		if (shuffleButton) {
			const originalText = shuffleButton.innerHTML;
			shuffleButton.innerHTML = "✨ SHUFFLED! ✨";
			shuffleButton.style.background =
				"linear-gradient(45deg, #e74c3c, #f39c12)";
			setTimeout(() => {
				shuffleButton.innerHTML = originalText;
				shuffleButton.style.background = "";
			}, 1500);
		}

		console.log("Saber shuffled to new random configuration:", {
			blade: this.currentBladeColor,
			pommel: this.currentPommelType,
			grip: this.currentGripType,
			emitter: this.currentEmitterType,
			colors: this.partColors,
		});
	}

	setActiveButton(section, type) {
		// Remove active class from all buttons in section
		const buttons = document.querySelectorAll(
			`[data-section="${section}"] .part-button`
		);
		buttons.forEach((btn) => btn.classList.remove("active"));

		// Add active class to the selected button
		const activeButton = document.querySelector(
			`[data-section="${section}"] [data-type="${type}"]`
		);
		if (activeButton) {
			activeButton.classList.add("active");
		}
	}

	updatePart(section, type) {
		switch (section) {
			case "pommel":
				this.currentPommelType = type;
				this.createPommel(type);
				break;
			case "grip":
				this.currentGripType = type;
				this.createGrip(type);
				break;
			case "emitter":
				this.currentEmitterType = type;
				this.createEmitter(type);
				break;
			case "blade":
				this.currentBladeColor = type;
				if (this.bladeOn) {
					this.createBlade(type);
				}
				break;
			case "pommel-color":
				this.partColors.pommel = type;
				this.createPommel(this.currentPommelType);
				break;
			case "grip-color":
				this.partColors.grip = type;
				this.createGrip(this.currentGripType);
				break;
			case "emitter-color":
				this.partColors.emitter = type;
				this.createEmitter(this.currentEmitterType);
				break;
		}
	}

	getCurrentPartType(section) {
		const activeButton = document.querySelector(
			`[data-section="${section}"] .part-button.active`
		);
		return activeButton ? activeButton.dataset.type : "basic";
	}

	// Method to start fighting game with current saber
	startFightingGame() {
		// Save current configuration before starting fight
		this.saveSaberConfiguration();

		// Get current saber configuration
		const saberConfig = this.getCurrentSaberConfiguration();

		console.log("Starting fighting game with saber:", saberConfig);

		// Navigate to combat game
		window.location.href = "combat.html";
	}

	// Get current saber configuration for fighting game
	getCurrentSaberConfiguration() {
		return {
			bladeColor: this.currentBladeColor,
			pommelType: this.currentPommelType,
			gripType: this.currentGripType,
			emitterType: this.currentEmitterType,
			partColors: this.partColors,
			bladeOn: this.bladeOn,
		};
	}

	// Privacy modal methods
	showPrivacyModal() {
		const modal = document.getElementById("privacyModal");
		if (modal) {
			modal.classList.add("show");
		}
	}

	hidePrivacyModal() {
		const modal = document.getElementById("privacyModal");
		if (modal) {
			modal.classList.remove("show");
		}
	}

	// Reset/delete saved data methods
	confirmDeleteSavedData() {
		const savedConfig = this.loadSaberConfiguration();

		if (!savedConfig) {
			// No saved data exists
			this.showFloatingText(
				document.getElementById("clickButton") || document.body,
				"No saved data found!",
				"#feca57"
			);
			return;
		}

		const confirmed = confirm(
			"🗑️ Delete Saved Saber Data?\n\n" +
				"This will permanently delete your saved saber configuration:\n" +
				`• Blade: ${savedConfig.bladeColor || "Unknown"}\n` +
				`• Pommel: ${savedConfig.pommelType || "Unknown"} (${
					savedConfig.partColors?.pommel || "Unknown"
				})\n` +
				`• Grip: ${savedConfig.gripType || "Unknown"} (${
					savedConfig.partColors?.grip || "Unknown"
				})\n` +
				`• Emitter: ${savedConfig.emitterType || "Unknown"} (${
					savedConfig.partColors?.emitter || "Unknown"
				})\n\n` +
				"Your current saber will be replaced with a new random design.\n\n" +
				"This action cannot be undone!"
		);

		if (confirmed) {
			this.deleteSavedData();
		}
	}

	deleteSavedData() {
		try {
			localStorage.removeItem("customSaberConfig");
			console.log("Saved saber data deleted successfully");

			// Generate new random configuration after deleting save data
			this.generateRandomConfiguration();

			// Rebuild saber with new random configuration
			this.createSaber();

			// Update UI to reflect new configuration
			this.updateUIFromConfiguration();

			// Show confirmation
			this.showFloatingText(
				document.getElementById("resetButton") || document.body,
				"🗑️ Saved data deleted!",
				"#ff6b6b"
			);

			// Visual feedback on the reset button
			const resetButton = document.getElementById("resetButton");
			if (resetButton) {
				const originalTitle = resetButton.title;
				resetButton.title = "Data Deleted!";
				resetButton.style.background = "#ff6b6b";
				setTimeout(() => {
					resetButton.title = originalTitle;
					resetButton.style.background = "";
				}, 2000);
			}
		} catch (error) {
			console.error("Failed to delete saved data:", error);
			this.showFloatingText(
				document.getElementById("resetButton") || document.body,
				"Error deleting data!",
				"#ff6b6b"
			);
		}
	}

	// New method to generate random configuration
	generateRandomConfiguration() {
		// Generate new random selections using SaberDrawer options
		this.currentBladeColor =
			SaberDrawer.options.bladeColors[
				Math.floor(Math.random() * SaberDrawer.options.bladeColors.length)
			];
		this.currentPommelType =
			SaberDrawer.options.pommelTypes[
				Math.floor(Math.random() * SaberDrawer.options.pommelTypes.length)
			];
		this.currentGripType =
			SaberDrawer.options.gripTypes[
				Math.floor(Math.random() * SaberDrawer.options.gripTypes.length)
			];
		this.currentEmitterType =
			SaberDrawer.options.emitterTypes[
				Math.floor(Math.random() * SaberDrawer.options.emitterTypes.length)
			];
		this.partColors = {
			pommel:
				SaberDrawer.options.partColors[
					Math.floor(Math.random() * SaberDrawer.options.partColors.length)
				],
			grip: SaberDrawer.options.partColors[
				Math.floor(Math.random() * SaberDrawer.options.partColors.length)
			],
			emitter:
				SaberDrawer.options.partColors[
					Math.floor(Math.random() * SaberDrawer.options.partColors.length)
				],
		};
		this.bladeOn = true; // Reset to blade on

		console.log("Generated new random saber configuration:", {
			blade: this.currentBladeColor,
			pommel: this.currentPommelType,
			grip: this.currentGripType,
			emitter: this.currentEmitterType,
			colors: this.partColors,
			bladeOn: this.bladeOn,
		});
	}

	// Enhanced floating text method for better positioning
	showFloatingText(element, text, color = "#4ecdc4") {
		const floatingText = document.createElement("div");
		floatingText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${color};
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            animation: floatUp 2s ease-out forwards;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            background: rgba(0,0,0,0.7);
            padding: 10px 20px;
            border-radius: 10px;
            border: 1px solid ${color};
        `;

		floatingText.textContent = text;
		document.body.appendChild(floatingText);

		// Add CSS animation if it doesn't exist
		if (!document.querySelector("#floatUpAnimation")) {
			const style = document.createElement("style");
			style.id = "floatUpAnimation";
			style.textContent = `
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: translate(-50%, -60%) scale(1.1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -80%) scale(0.8);
                    }
                }
            `;
			document.head.appendChild(style);
		}

		setTimeout(() => {
			if (document.body.contains(floatingText)) {
				document.body.removeChild(floatingText);
			}
		}, 2000);
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
window.addEventListener("DOMContentLoaded", () => {
	new SaberMaker();
});
