/**
 * SaberDrawer - A reusable JavaScript object for creating 3D lightsaber parts
 * using Babylon.js. This can be used in other projects for lightsaber rendering.
 */
const SaberDrawer = {
	// Available options for saber parts
	options: {
		pommelTypes: [
			"basic",
			"spiked",
			"rounded",
			"heavy",
			"curved",
			"ceremonial",
			"coiled",
			"layered",
		],
		gripTypes: [
			"smooth",
			"ribbed",
			"segmented",
			"textured",
			"curved",
			"grooved",
		],
		emitterTypes: [
			"standard",
			"wide",
			"focused",
			"shroud",
			"dual",
			"crossguard",
			"complex",
			"layered",
		],
		bladeColors: [
			"blue",
			"red",
			"green",
			"purple",
			"yellow",
			"white",
			"orange",
			"unstable",
		],
		partColors: [
			"gray",
			"gold",
			"silver",
			"black",
			"bronze",
			"brown",
			"chrome",
		],
	},

	/**
	 * Get color values for saber parts
	 * @param {string} colorType - The color type (gray, gold, silver, etc.)
	 * @returns {BABYLON.Color3} The color object
	 */
	getPartColor: function (colorType) {
		const colors = {
			gray: new BABYLON.Color3(0.4, 0.4, 0.4),
			gold: new BABYLON.Color3(0.8, 0.6, 0.2),
			silver: new BABYLON.Color3(0.7, 0.7, 0.8),
			black: new BABYLON.Color3(0.1, 0.1, 0.1),
			bronze: new BABYLON.Color3(0.6, 0.4, 0.2),
			brown: new BABYLON.Color3(0.6, 0.35, 0.15),
			chrome: new BABYLON.Color3(0.9, 0.9, 1.0),
		};
		return colors[colorType] || colors.gray;
	},

	/**
	 * Get color values for lightsaber blades
	 * @param {string} color - The blade color (blue, red, green, etc.)
	 * @returns {BABYLON.Color3} The blade color object
	 */
	getBladeColor: function (color) {
		switch (color) {
			case "red":
				return new BABYLON.Color3(1, 0, 0);
			case "green":
				return new BABYLON.Color3(0, 1, 0);
			case "purple":
				return new BABYLON.Color3(0.8, 0, 1);
			case "yellow":
				return new BABYLON.Color3(1, 1, 0);
			case "white":
				return new BABYLON.Color3(1, 1, 1);
			case "orange":
				return new BABYLON.Color3(1, 0.5, 0);
			case "unstable":
				return new BABYLON.Color3(1, 0.2, 0.2);
			default: // blue
				return new BABYLON.Color3(0, 0.5, 1);
		}
	},

	/**
	 * Create a lightsaber pommel (bottom part)
	 * @param {string} type - The pommel type (basic, spiked, rounded, etc.)
	 * @param {BABYLON.Scene} scene - The Babylon.js scene
	 * @param {string} colorType - The color type for the pommel
	 * @returns {BABYLON.Mesh|BABYLON.TransformNode} The created pommel mesh
	 */
	createPommel: function (type, scene, colorType = "gray") {
		let pommel;

		switch (type) {
			case "spiked":
				pommel = BABYLON.MeshBuilder.CreateCylinder(
					"pommel",
					{
						height: 0.8,
						diameterTop: 0.6,
						diameterBottom: 0.4,
						tessellation: 8,
					},
					scene
				);
				break;
			case "rounded":
				pommel = BABYLON.MeshBuilder.CreateSphere(
					"pommel",
					{
						diameter: 0.7,
					},
					scene
				);
				break;
			case "heavy":
				pommel = BABYLON.MeshBuilder.CreateCylinder(
					"pommel",
					{
						height: 1.2,
						diameterTop: 0.8,
						diameterBottom: 0.6,
						tessellation: 12,
					},
					scene
				);
				break;
			case "curved":
				pommel = new BABYLON.TransformNode("curvedPommel", scene);
				const base = BABYLON.MeshBuilder.CreateCylinder(
					"pommelBase",
					{
						height: 0.4,
						diameter: 0.6,
					},
					scene
				);
				const curve = BABYLON.MeshBuilder.CreateTorus(
					"pommelCurve",
					{
						diameter: 0.8,
						thickness: 0.15,
						tessellation: 16,
					},
					scene
				);
				curve.rotation.x = Math.PI / 2;
				curve.position.y = 0.3;
				base.parent = pommel;
				curve.parent = pommel;
				break;
			case "ceremonial":
				pommel = BABYLON.MeshBuilder.CreateCylinder(
					"pommel",
					{
						height: 1.0,
						diameterTop: 0.9,
						diameterBottom: 0.5,
						tessellation: 16,
					},
					scene
				);
				break;
			case "coiled":
				pommel = new BABYLON.TransformNode("coiledPommel", scene);

				const coilBase = BABYLON.MeshBuilder.CreateCylinder(
					"coilBase",
					{
						height: 0.4,
						diameter: 0.6,
					},
					scene
				);
				coilBase.parent = pommel;

				for (let i = 0; i < 12; i++) {
					const coil = BABYLON.MeshBuilder.CreateTorus(
						"coil" + i,
						{
							diameter: 0.65,
							thickness: 0.04,
							tessellation: 16,
						},
						scene
					);
					coil.position.y = 0.2 + i * 0.05;
					coil.parent = pommel;
				}

				const endCap = BABYLON.MeshBuilder.CreateCylinder(
					"endCap",
					{
						height: 0.15,
						diameterTop: 0.5,
						diameterBottom: 0.65,
					},
					scene
				);
				endCap.position.y = 0.8;
				endCap.parent = pommel;
				break;
			case "layered":
				pommel = new BABYLON.TransformNode("layeredPommel", scene);

				const mainBase = BABYLON.MeshBuilder.CreateCylinder(
					"pommelMainBase",
					{
						height: 0.4,
						diameter: 0.8,
					},
					scene
				);
				mainBase.position.y = 0;
				mainBase.parent = pommel;

				const middleSection = BABYLON.MeshBuilder.CreateCylinder(
					"pommelMiddle",
					{
						height: 0.3,
						diameter: 0.65,
					},
					scene
				);
				middleSection.position.y = 0.35;
				middleSection.parent = pommel;

				const upperSection = BABYLON.MeshBuilder.CreateCylinder(
					"pommelUpper",
					{
						height: 0.25,
						diameter: 0.5,
					},
					scene
				);
				upperSection.position.y = 0.625;
				upperSection.parent = pommel;

				const topCap = BABYLON.MeshBuilder.CreateCylinder(
					"pommelTopCap",
					{
						height: 0.15,
						diameter: 0.35,
					},
					scene
				);
				topCap.position.y = 0.825;
				topCap.parent = pommel;

				for (let i = 0; i < 4; i++) {
					const angle = (i * Math.PI) / 2;
					const protrusion = BABYLON.MeshBuilder.CreateBox(
						`pommelProtrusion${i}`,
						{
							width: 0.15,
							height: 0.08,
							depth: 0.25,
						},
						scene
					);

					const radius = 0.45;
					protrusion.position.x = Math.cos(angle) * radius;
					protrusion.position.z = Math.sin(angle) * radius;
					protrusion.position.y = 0.05;
					protrusion.rotation.y = angle;
					protrusion.parent = pommel;
				}

				const detailRing1 = BABYLON.MeshBuilder.CreateCylinder(
					"pommelDetailRing1",
					{
						height: 0.05,
						diameter: 0.7,
					},
					scene
				);
				detailRing1.position.y = 0.225;
				detailRing1.parent = pommel;

				const detailRing2 = BABYLON.MeshBuilder.CreateCylinder(
					"pommelDetailRing2",
					{
						height: 0.04,
						diameter: 0.55,
					},
					scene
				);
				detailRing2.position.y = 0.525;
				detailRing2.parent = pommel;
				break;
			default: // basic
				pommel = BABYLON.MeshBuilder.CreateCylinder(
					"pommel",
					{
						height: 0.6,
						diameter: 0.6,
					},
					scene
				);
		}

		// Apply material
		const material = new BABYLON.StandardMaterial("pommelMaterial", scene);
		const baseColor = this.getPartColor(colorType);
		material.diffuseColor = baseColor;
		material.specularColor = new BABYLON.Color3(0.6, 0.6, 0.6);

		if (pommel.material !== undefined) {
			pommel.material = material;
		} else {
			pommel.getChildMeshes().forEach((child) => {
				child.material = material;
			});
		}

		return pommel;
	},

	/**
	 * Create a lightsaber grip (middle part)
	 * @param {string} type - The grip type (smooth, ribbed, segmented, etc.)
	 * @param {BABYLON.Scene} scene - The Babylon.js scene
	 * @param {string} colorType - The color type for the grip
	 * @returns {BABYLON.Mesh|BABYLON.TransformNode} The created grip mesh
	 */
	createGrip: function (type, scene, colorType = "gray") {
		let grip;

		switch (type) {
			case "ribbed":
				grip = new BABYLON.TransformNode("ribbedGrip", scene);

				const baseGrip = BABYLON.MeshBuilder.CreateCylinder(
					"baseGrip",
					{
						height: 2,
						diameter: 0.6,
					},
					scene
				);
				baseGrip.parent = grip;

				const ribbedBaseMaterial = new BABYLON.StandardMaterial(
					"baseGripMaterial",
					scene
				);
				ribbedBaseMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
				baseGrip.material = ribbedBaseMaterial;

				for (let i = 0; i < 8; i++) {
					const ring = BABYLON.MeshBuilder.CreateCylinder(
						`ring${i}`,
						{
							height: 0.1,
							diameter: 0.72,
						},
						scene
					);
					ring.position.y = -0.75 + i * 0.25;
					ring.parent = grip;
				}

				for (let i = 0; i < 2; i++) {
					const looseEnd = BABYLON.MeshBuilder.CreateBox(
						`looseEnd${i}`,
						{
							width: 0.06,
							height: 0.015,
							depth: 0.15 + Math.random() * 0.1,
						},
						scene
					);

					const angle = Math.random() * Math.PI * 2;
					looseEnd.position.x = Math.cos(angle) * 0.32;
					looseEnd.position.z = Math.sin(angle) * 0.32;
					looseEnd.position.y = -0.9 + Math.random() * 0.15;

					looseEnd.rotation.y = angle + (Math.random() - 0.5) * 0.3;
					looseEnd.rotation.x = (Math.random() - 0.5) * 0.2;
					looseEnd.rotation.z = (Math.random() - 0.5) * 0.15;

					looseEnd.parent = grip;

					const endMaterial = new BABYLON.StandardMaterial(
						`endMaterial${i}`,
						scene
					);
					const baseColor = this.getPartColor(colorType);
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
			case "segmented":
				grip = new BABYLON.TransformNode("segmentedGrip", scene);

				const connector = BABYLON.MeshBuilder.CreateCylinder(
					"connector",
					{
						height: 2,
						diameter: 0.55,
					},
					scene
				);
				connector.parent = grip;

				const connectorMaterial = new BABYLON.StandardMaterial(
					"connectorMaterial",
					scene
				);
				connectorMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
				connector.material = connectorMaterial;

				const segments = 4;
				for (let i = 0; i < segments; i++) {
					const segment = BABYLON.MeshBuilder.CreateCylinder(
						`segment${i}`,
						{
							height: 0.35,
							diameter: 0.62 + (i % 2) * 0.08,
						},
						scene
					);
					segment.position.y = -0.75 + i * 0.5;
					segment.parent = grip;
				}
				break;
			case "textured":
				grip = BABYLON.MeshBuilder.CreateCylinder(
					"grip",
					{
						height: 2,
						diameter: 0.62,
						tessellation: 12,
					},
					scene
				);
				break;
			case "curved":
				grip = BABYLON.MeshBuilder.CreateCylinder(
					"grip",
					{
						height: 2,
						diameterTop: 0.55,
						diameterBottom: 0.7,
						tessellation: 16,
					},
					scene
				);
				break;
			case "grooved":
				grip = new BABYLON.TransformNode("groovedGrip", scene);

				const mainGrip = BABYLON.MeshBuilder.CreateCylinder(
					"mainGrip",
					{
						height: 2,
						diameter: 0.62,
					},
					scene
				);
				mainGrip.parent = grip;

				const numGrooves = 8;
				for (let i = 0; i < numGrooves; i++) {
					const angle = (i * Math.PI * 2) / numGrooves;

					const raisedSection = BABYLON.MeshBuilder.CreateCylinder(
						`raisedSection${i}`,
						{
							height: 1.8,
							diameter: 0.1,
							tessellation: 6,
						},
						scene
					);

					const radius = 0.32;
					raisedSection.position.x = Math.cos(angle) * radius;
					raisedSection.position.z = Math.sin(angle) * radius;
					raisedSection.position.y = 0;
					raisedSection.parent = grip;
				}

				const topCap = BABYLON.MeshBuilder.CreateCylinder(
					"topCap",
					{
						height: 0.15,
						diameter: 0.68,
					},
					scene
				);
				topCap.position.y = 0.925;
				topCap.parent = grip;

				const bottomCap = BABYLON.MeshBuilder.CreateCylinder(
					"bottomCap",
					{
						height: 0.15,
						diameter: 0.68,
					},
					scene
				);
				bottomCap.position.y = -0.925;
				bottomCap.parent = grip;

				for (let i = 0; i < 3; i++) {
					const topRing = BABYLON.MeshBuilder.CreateCylinder(
						`topRing${i}`,
						{
							height: 0.03,
							diameter: 0.66,
						},
						scene
					);
					topRing.position.y = 0.7 + i * 0.08;
					topRing.parent = grip;

					const bottomRing = BABYLON.MeshBuilder.CreateCylinder(
						`bottomRing${i}`,
						{
							height: 0.03,
							diameter: 0.66,
						},
						scene
					);
					bottomRing.position.y = -0.7 - i * 0.08;
					bottomRing.parent = grip;
				}
				break;
			default: // smooth
				grip = BABYLON.MeshBuilder.CreateCylinder(
					"grip",
					{
						height: 2,
						diameter: 0.6,
					},
					scene
				);
		}

		// Apply material
		const material = new BABYLON.StandardMaterial("gripMaterial", scene);
		const baseColor = this.getPartColor(colorType);
		material.diffuseColor = baseColor;

		if (grip.material !== undefined) {
			grip.material = material;
		} else {
			grip.getChildMeshes().forEach((child) => {
				if (
					child.name === "baseGrip" ||
					child.name === "connector" ||
					child.name.startsWith("wrap") ||
					child.name === "baseWrap" ||
					child.name.startsWith("stripSegment") ||
					child.name.startsWith("looseEnd")
				) {
					return;
				}
				child.material = material;
			});
		}

		return grip;
	},

	/**
	 * Create a lightsaber emitter (top part that emits the blade)
	 * @param {string} type - The emitter type (standard, wide, focused, etc.)
	 * @param {BABYLON.Scene} scene - The Babylon.js scene
	 * @param {string} colorType - The color type for the emitter
	 * @returns {Object} Object containing the emitter mesh and height info
	 */
	createEmitter: function (type, scene, colorType = "gray") {
		let emitter;
		let emitterTopY = 0.5; // Default top position relative to emitter base

		switch (type) {
			case "wide":
				emitter = BABYLON.MeshBuilder.CreateCylinder(
					"emitter",
					{
						height: 1,
						diameterTop: 0.8,
						diameterBottom: 0.6,
					},
					scene
				);
				emitterTopY = 0.5;
				break;
			case "focused":
				emitter = BABYLON.MeshBuilder.CreateCylinder(
					"emitter",
					{
						height: 1.2,
						diameterTop: 0.4,
						diameterBottom: 0.6,
					},
					scene
				);
				emitterTopY = 0.6;
				break;
			case "shroud":
				emitter = new BABYLON.TransformNode("shroudEmitter", scene);
				const base = BABYLON.MeshBuilder.CreateCylinder(
					"emitterBase",
					{
						height: 1.2,
						diameter: 0.7,
					},
					scene
				);
				const shroud = BABYLON.MeshBuilder.CreateCylinder(
					"shroud",
					{
						height: 1.0,
						diameterTop: 0.5,
						diameterBottom: 0.8,
					},
					scene
				);
				shroud.position.y = 0.6;
				base.parent = emitter;
				shroud.parent = emitter;
				emitterTopY = 1.1;
				break;
			case "dual":
				emitter = new BABYLON.TransformNode("dualEmitter", scene);
				const main = BABYLON.MeshBuilder.CreateCylinder(
					"mainEmitter",
					{
						height: 1,
						diameter: 0.7,
					},
					scene
				);
				const side1 = BABYLON.MeshBuilder.CreateCylinder(
					"sideEmitter1",
					{
						height: 0.6,
						diameter: 0.3,
					},
					scene
				);
				const side2 = BABYLON.MeshBuilder.CreateCylinder(
					"sideEmitter2",
					{
						height: 0.6,
						diameter: 0.3,
					},
					scene
				);
				side1.position.set(0.4, 0, 0);
				side2.position.set(-0.4, 0, 0);
				main.parent = emitter;
				side1.parent = emitter;
				side2.parent = emitter;
				emitterTopY = 0.5;
				break;
			case "crossguard":
				emitter = new BABYLON.TransformNode("crossguardEmitter", scene);
				const mainEmitter = BABYLON.MeshBuilder.CreateCylinder(
					"mainEmitter",
					{
						height: 1,
						diameter: 0.7,
					},
					scene
				);
				const guard1 = BABYLON.MeshBuilder.CreateCylinder(
					"guard1",
					{
						height: 0.8,
						diameter: 0.25,
					},
					scene
				);
				const guard2 = BABYLON.MeshBuilder.CreateCylinder(
					"guard2",
					{
						height: 0.8,
						diameter: 0.25,
					},
					scene
				);
				guard1.position.set(0.5, 0.3, 0);
				guard1.rotation.z = Math.PI / 4;
				guard2.position.set(-0.5, 0.3, 0);
				guard2.rotation.z = -Math.PI / 4;
				mainEmitter.parent = emitter;
				guard1.parent = emitter;
				guard2.parent = emitter;
				emitterTopY = 0.5;
				break;
			case "complex":
				emitter = new BABYLON.TransformNode("complexEmitter", scene);

				const mainBase = BABYLON.MeshBuilder.CreateCylinder(
					"mainBase",
					{
						height: 0.6,
						diameter: 0.75,
					},
					scene
				);
				mainBase.position.y = -0.2;
				mainBase.parent = emitter;

				for (let i = 0; i < 8; i++) {
					const rib = BABYLON.MeshBuilder.CreateCylinder(
						"rib" + i,
						{
							height: 0.03,
							diameter: 0.8,
						},
						scene
					);
					rib.position.y = 0.1 + i * 0.04;
					rib.parent = emitter;
				}

				const upperSection = BABYLON.MeshBuilder.CreateCylinder(
					"upperSection",
					{
						height: 0.4,
						diameterTop: 0.6,
						diameterBottom: 0.75,
					},
					scene
				);
				upperSection.position.y = 0.55;
				upperSection.parent = emitter;

				const topRing = BABYLON.MeshBuilder.CreateCylinder(
					"topRing",
					{
						height: 0.08,
						diameter: 0.65,
					},
					scene
				);
				topRing.position.y = 0.8;
				topRing.parent = emitter;

				const emitterTip = BABYLON.MeshBuilder.CreateCylinder(
					"emitterTip",
					{
						height: 0.2,
						diameterTop: 0.45,
						diameterBottom: 0.6,
					},
					scene
				);
				emitterTip.position.y = 0.95;
				emitterTip.parent = emitter;
				emitterTopY = 1.05;
				break;
			case "layered":
				emitter = new BABYLON.TransformNode("layeredEmitter", scene);

				const layerBase = BABYLON.MeshBuilder.CreateCylinder(
					"layerBase",
					{
						height: 0.2,
						diameter: 0.5,
					},
					scene
				);
				layerBase.position.y = -0.4;
				layerBase.parent = emitter;

				const ringData = [
					{ diameter: 0.3, height: 0.3, y: -0.25 },
					{ diameter: 0.5, height: 0.08, y: -0.1 },
					{ diameter: 0.3, height: 0.1, y: -0.05 },
				];

				ringData.forEach((ring, index) => {
					const disc = BABYLON.MeshBuilder.CreateCylinder(
						`layerRing${index}`,
						{
							height: ring.height,
							diameter: ring.diameter,
						},
						scene
					);
					disc.position.y = ring.y;
					disc.parent = emitter;
				});

				const emitterOpening = BABYLON.MeshBuilder.CreateCylinder(
					"emitterOpening",
					{
						height: 0.2,
						diameterTop: 0.7,
						diameterBottom: 0.65,
					},
					scene
				);
				emitterOpening.position.y = 0.1;
				emitterOpening.parent = emitter;
				emitterTopY = 0.2;
				break;
			default: // standard
				emitter = BABYLON.MeshBuilder.CreateCylinder(
					"emitter",
					{
						height: 1,
						diameter: 0.7,
					},
					scene
				);
				emitterTopY = 0.5;
		}

		// Apply material
		const material = new BABYLON.StandardMaterial("emitterMaterial", scene);
		const baseColor = this.getPartColor(colorType);
		material.diffuseColor = baseColor;
		material.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);

		if (emitter.material !== undefined) {
			emitter.material = material;
		} else {
			emitter.getChildMeshes().forEach((child) => {
				child.material = material;
			});
		}

		return {
			mesh: emitter,
			height: emitterTopY,
		};
	},

	/**
	 * Create a lightsaber blade
	 * @param {string} color - The blade color (blue, red, green, etc.)
	 * @param {BABYLON.Scene} scene - The Babylon.js scene
	 * @param {BABYLON.GlowLayer} glowLayer - Optional glow layer for blade effect
	 * @returns {BABYLON.TransformNode} The created blade mesh
	 */
	createBlade: function (color, scene, glowLayer = null) {
		let blade;

		if (color === "unstable") {
			blade = new BABYLON.TransformNode("unstableBlade", scene);
			const mainBlade = BABYLON.MeshBuilder.CreateCylinder(
				"mainBlade",
				{
					height: 5.5,
					diameter: 0.25,
					tessellation: 16,
				},
				scene
			);

			const bladeTop = BABYLON.MeshBuilder.CreateSphere(
				"bladeTop",
				{
					diameter: 0.25,
				},
				scene
			);
			bladeTop.position.y = 2.75;
			bladeTop.parent = blade;

			for (let i = 0; i < 5; i++) {
				const spike = BABYLON.MeshBuilder.CreateCylinder(
					`spike${i}`,
					{
						height: 0.3,
						diameter: 0.08,
					},
					scene
				);
				spike.position.set(
					(Math.random() - 0.5) * 0.3,
					Math.random() * 4 - 2,
					(Math.random() - 0.5) * 0.3
				);
				spike.parent = blade;
			}
			mainBlade.parent = blade;
		} else {
			blade = new BABYLON.TransformNode("blade", scene);

			const mainBlade = BABYLON.MeshBuilder.CreateCylinder(
				"mainBlade",
				{
					height: 5.5,
					diameter: 0.25,
					tessellation: 16,
				},
				scene
			);

			const bladeTop = BABYLON.MeshBuilder.CreateSphere(
				"bladeTop",
				{
					diameter: 0.25,
				},
				scene
			);
			bladeTop.position.y = 2.75;

			mainBlade.parent = blade;
			bladeTop.parent = blade;
		}

		// Apply material
		const material = new BABYLON.StandardMaterial("bladeMaterial", scene);
		const bladeColor = this.getBladeColor(color);
		material.emissiveColor = bladeColor.scale(0.8);
		material.diffuseColor = bladeColor.scale(0.3);
		material.alpha = 0.9;

		if (color === "unstable") {
			material.emissiveColor = new BABYLON.Color3(1, 0.3, 0.3);
			material.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
		}

		// Apply materials and glow
		if (blade.material !== undefined) {
			blade.material = material;
			if (glowLayer) {
				glowLayer.addIncludedOnlyMesh(blade);
			}
		} else {
			blade.getChildMeshes().forEach((child) => {
				child.material = material;
				if (glowLayer) {
					glowLayer.addIncludedOnlyMesh(child);
				}
			});
		}

		return blade;
	},

	/**
	 * Create unstable blade flicker animation
	 * @param {BABYLON.TransformNode} blade - The blade mesh
	 * @param {BABYLON.StandardMaterial} material - The blade material
	 * @param {BABYLON.Scene} scene - The Babylon.js scene
	 * @returns {BABYLON.Animatable} The animation object
	 */
	createUnstableFlicker: function (blade, material, scene) {
		const flickerAnimation = new BABYLON.Animation(
			"unstableFlicker",
			"emissiveColor",
			60,
			BABYLON.Animation.ANIMATIONTYPE_COLOR3,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const keys = [];
		for (let i = 0; i <= 60; i++) {
			const intensity = 0.5 + Math.random() * 0.8;
			const redIntensity = 0.8 + Math.random() * 0.4;
			const flickerColor = new BABYLON.Color3(
				redIntensity * intensity,
				0.2 * intensity,
				0.1 * intensity
			);
			keys.push({
				frame: i,
				value: flickerColor,
			});
		}

		flickerAnimation.setKeys(keys);
		material.animations = [flickerAnimation];

		const colorAnimation = scene.beginAnimation(material, 0, 60, true, 2);

		const scaleFlickerAnimation = new BABYLON.Animation(
			"unstableScaleFlicker",
			"scaling",
			60,
			BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const scaleKeys = [];
		for (let i = 0; i <= 60; i++) {
			const scaleVariation = 0.95 + Math.random() * 0.1;
			scaleKeys.push({
				frame: i,
				value: new BABYLON.Vector3(scaleVariation, 1, scaleVariation),
			});
		}

		scaleFlickerAnimation.setKeys(scaleKeys);
		blade.animations = [scaleFlickerAnimation];

		const scaleAnimation = scene.beginAnimation(blade, 0, 60, true, 3);

		return {
			colorAnimation,
			scaleAnimation,
		};
	},

	/**
	 * Create blade extension animation
	 * @param {BABYLON.TransformNode} blade - The blade mesh
	 * @param {number} startY - Starting Y position
	 * @param {number} endY - Ending Y position
	 * @param {Function} onComplete - Callback when animation completes
	 * @returns {Object} Animation objects
	 */
	createBladeExtensionAnimation: function (
		blade,
		startY,
		endY,
		onComplete = null
	) {
		blade.position.y = startY;
		blade.scaling = new BABYLON.Vector3(1, 0, 1);

		const scaleAnimation = BABYLON.Animation.CreateAndStartAnimation(
			"bladeExtension",
			blade,
			"scaling.y",
			30,
			15,
			0,
			1,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		);

		const positionAnimation = BABYLON.Animation.CreateAndStartAnimation(
			"bladePositionExtension",
			blade,
			"position.y",
			30,
			15,
			startY,
			endY,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
			null,
			onComplete
		);

		return {
			scaleAnimation,
			positionAnimation,
		};
	},

	/**
	 * Create blade retraction animation
	 * @param {BABYLON.TransformNode} blade - The blade mesh
	 * @param {number} startY - Starting Y position
	 * @param {number} endY - Ending Y position
	 * @param {Function} onComplete - Callback when animation completes
	 * @returns {Object} Animation objects
	 */
	createBladeRetractionAnimation: function (
		blade,
		startY,
		endY,
		onComplete = null
	) {
		const scaleAnimation = BABYLON.Animation.CreateAndStartAnimation(
			"bladeRetraction",
			blade,
			"scaling.y",
			30,
			15,
			1,
			0,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		);

		const positionAnimation = BABYLON.Animation.CreateAndStartAnimation(
			"bladePositionRetraction",
			blade,
			"position.y",
			30,
			15,
			startY,
			endY,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
			null,
			onComplete
		);

		return {
			scaleAnimation,
			positionAnimation,
		};
	},
};

// Export for use in other files (if using modules)
if (typeof module !== "undefined" && module.exports) {
	module.exports = SaberDrawer;
}
