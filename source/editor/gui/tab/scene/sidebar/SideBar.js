"use strict";

function SideBar(parent)
{
	Element.call(this, parent, "div");

	this.preventDragEvents();

	this.element.style.overflow = "visible";
	this.element.style.backgroundColor = Editor.theme.barColor;

	var position = 5;
	var size = 40;
	var self = this;

	var text = new Text(this);
	text.setText(Locale.tools);
	text.size.set(size, 20);
	text.position.set(0, position);
	text.updateInterface();
	position += text.size.y;

	//Select
	this.select = new ButtonImageToggle(this);
	this.select.setSelected(true);
	this.select.setImage(Editor.FILE_PATH + "icons/tools/select.png");
	this.select.size.set(size, size);
	this.select.position.set(0, position);
	this.select.setAltText(Locale.selectShortcut);
	this.select.updateInterface();
	this.select.setOnClick(function()
	{
		self.selectTool(Editor.SELECT);
	});
	position += size;

	//Move
	this.move = new ButtonImageToggle(this);
	this.move.setImage(Editor.FILE_PATH + "icons/tools/move.png");
	this.move.size.set(size, size);
	this.move.position.set(0, position);
	this.move.setAltText(Locale.moveShortcut);
	this.move.updateInterface();
	this.move.setOnClick(function()
	{
		self.selectTool(Editor.MOVE);
	});
	position += size;

	//Resize
	this.scale = new ButtonImageToggle(this);
	this.scale.setImage(Editor.FILE_PATH + "icons/tools/resize.png");
	this.scale.size.set(size, size);
	this.scale.position.set(0, position);
	this.scale.setAltText(Locale.scaleShortcut);
	this.scale.updateInterface();
	this.scale.setOnClick(function()
	{
		self.selectTool(Editor.SCALE);
	});
	position += size;

	//Rotate
	this.rotate = new ButtonImageToggle(this);
	this.rotate.setImage(Editor.FILE_PATH + "icons/tools/rotate.png");
	this.rotate.size.set(size, size);
	this.rotate.position.set(0, position);
	this.rotate.setAltText(Locale.rotateShortcut);
	this.rotate.updateInterface();
	this.rotate.setOnClick(function()
	{
		self.selectTool(Editor.ROTATE);
	});
	position += size;
	
	this.addText = new Text(this);
	this.addText.setText(Locale.add);
	this.addText.size.set(40, 20);
	this.addText.position.set(0, 190);
	this.addText.updateInterface();

	/**
	 * List of object placing buttons.
	 *
	 * @attribute buttons
	 * @type {Array}
	 */	
	this.buttons = [];

	this.createObject();

	this.more = new ButtonDrawer(this);
	this.more.setImage(Editor.FILE_PATH + "icons/misc/more.png");
	this.more.optionsPerLine = 1;
}

SideBar.prototype = Object.create(Element.prototype);

/**
 * Select object manipulation tool.
 *
 * @method selectTool
 * @param {Number} tool
 */
SideBar.prototype.selectTool = function(tool)
{
	this.select.setSelected(tool === Editor.SELECT);
	this.move.setSelected(tool === Editor.MOVE);
	this.scale.setSelected(tool === Editor.SCALE);
	this.rotate.setSelected(tool === Editor.ROTATE);
	
	this.parent.selectTool(tool);
};

SideBar.prototype.updateSize = function()
{
	Element.prototype.updateSize.call(this);

	var size = this.size.x;
	var position = 210, i = 0;

	while(position < this.size.y - 2 * size && i < this.buttons.length)
	{
		this.buttons[i].attachTo(this);
		this.buttons[i].size.set(size, size);
		this.buttons[i].position.set(0, position);
		this.buttons[i].optionsSize.set(size, size);
		this.buttons[i].visible = true;
		this.buttons[i].updateInterface();

		i++;
		position += size;
	}


	if(this.size.y < 250)
	{
		this.addText.setVisibility(false);
		this.more.setVisibility(false);
	}
	else
	{
		if(i < this.buttons.length)
		{
			this.more.optionsSize.set(size, size);
			this.more.size.set(size, size);
			this.more.position.set(0, position);
			this.more.visible = true;

			while(i < this.buttons.length)
			{
				this.more.insertOption(this.buttons[i]);
				i++;
			}

			this.more.updateOptions();
			this.more.updateInterface();
		}
		else
		{
			this.more.setVisibility(false);
		}

		this.addText.setVisibility(true);
	}
};

/** 
 * Create the icons to add objects to the scene.
 *
 * @method createObject
 */
SideBar.prototype.createObject = function()
{
	//Add Models
	var models = new ButtonDrawer(this);
	models.setImage(Editor.FILE_PATH + "icons/models/models.png");
	this.buttons.push(models);

	//Cube
	models.addOption(Editor.FILE_PATH + "icons/models/cube.png", function()
	{
		var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "cube";
		Editor.addObject(model);
	}, Locale.cube);

	//Cylinder
	models.addOption(Editor.FILE_PATH + "icons/models/cylinder.png", function()
	{
		var geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 32);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "cylinder";
		Editor.addObject(model);
	}, Locale.cylinder);

	//Sphere
	models.addOption(Editor.FILE_PATH + "icons/models/sphere.png", function()
	{
		var geometry = new THREE.SphereBufferGeometry(1, 32, 32);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "sphere";
		Editor.addObject(model);
	}, Locale.sphere);

	//Torus Knot
	models.addOption(Editor.FILE_PATH + "icons/models/torusknot.png", function()
	{
		var geometry = new THREE.TorusKnotBufferGeometry(1, 0.4, 128, 96, 2, 3);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "torus knot";
		Editor.addObject(model);
	}, Locale.torusKnot);
	
	//Torus
	models.addOption(Editor.FILE_PATH + "icons/models/torus.png", function()
	{
		var geometry = new THREE.TorusBufferGeometry(1, 0.5, 16, 96);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "torus";
		Editor.addObject(model);
	}, Locale.torus);

	//Cone
	models.addOption(Editor.FILE_PATH + "icons/models/cone.png", function()
	{
		var geometry = new THREE.ConeBufferGeometry(1, 2, 32);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "cone";
		Editor.addObject(model);
	}, Locale.cone);

	//Tetrahedron
	models.addOption(Editor.FILE_PATH + "icons/models/pyramid.png", function()
	{
		var geometry = new THREE.TetrahedronBufferGeometry(1, 0);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "tetrahedron";
		Editor.addObject(model);
	}, "Tetrahedron");

	//Dodecahedron
	models.addOption(Editor.FILE_PATH + "icons/models/dodecahedron.png", function()
	{
		var geometry = new THREE.DodecahedronBufferGeometry(1, 0);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "dodecahedron";
		Editor.addObject(model);
	}, "Dodecahedron");

	//Plane
	models.addOption(Editor.FILE_PATH + "icons/models/plane.png", function()
	{
		var geometry = new THREE.PlaneBufferGeometry(1, 1);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "plane";
		Editor.addObject(model);
	}, "Plane");

	//Circle
	models.addOption(Editor.FILE_PATH + "icons/models/circle.png", function()
	{
		var geometry = new THREE.CircleBufferGeometry(1, 32);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "circle";
		Editor.addObject(model);
	}, "Cicle");

	//Ring
	models.addOption(Editor.FILE_PATH + "icons/models/ring.png", function()
	{
		var geometry = new THREE.RingBufferGeometry(1, 5, 32, 1);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "ring";
		Editor.addObject(model);
	}, "Ring");

	//Parametric
	/*models.addOption(Editor.FILE_PATH + "icons/models/spline.png", function()
	{
		var klein = function (v, u, optionalTarget)
		{
			var result = optionalTarget || new THREE.Vector3();

			u *= Math.PI;
			v *= 2 * Math.PI;

			u = u * 2;
			var x, y, z;
			if (u < Math.PI)
			{
				x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
				z = - 8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
			}
			else
			{
				x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
				z = - 8 * Math.sin(u);
			}

			y = - 2 * (1 - Math.cos(u) / 2) * Math.sin(v);

			return result.set(x, y, z);
		};

		var geometry = new THREE.ParametricGeometry(klein, 25, 25);
		var model = new Mesh(geometry, Editor.defaultMaterial);
		model.name = "parametric";
		Editor.addObject(model);
	}, "Parametric");*/

	models.updateOptions();

	//Text
	var text = new ButtonDrawer(this);
	text.setImage(Editor.FILE_PATH + "icons/text/text.png");
	this.buttons.push(text);

	text.addOption(Editor.FILE_PATH + "icons/text/text.png", function()
	{
		Editor.addObject(new TextMesh("text", Editor.defaultMaterial, Editor.defaultFont));
	}, "Text Mesh");

	if(Nunu.developmentMode())
	{
		text.addOption(Editor.FILE_PATH + "icons/text/text.png", function()
		{
			var object = new TextBitmap(
			{
				font: JSON.parse(FileSystem.readFile(Editor.FILE_PATH + "sdf/roboto-bold.json")),
				text: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...",
				width: 500,
				align: TextBitmap.CENTER,
				letterSpacing: 3,
				color: 0xFFFFFF
			}, new Texture(Editor.FILE_PATH + "sdf/roboto-bold.png"), TextBitmap.SDF);
			object.scale.set(0.001, 0.001, 0.001);

			Editor.addObject(object);
		}, "Text Bitmap");

		text.addOption(Editor.FILE_PATH + "icons/text/text.png", function()
		{
			//TODO <ADD CODE HERE>
		}, "Text Sprite");
	}

	text.updateOptions();

	//Add lights
	var lights = new ButtonDrawer(this);
	lights.setImage(Editor.FILE_PATH + "icons/lights/point.png");
	this.buttons.push(lights);

	//Point Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/point.png", function()
	{
		Editor.addObject(new PointLight(0x444444));
	}, "Point Light");

	//Ambient Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/ambient.png", function()
	{
		Editor.addObject(new AmbientLight(0x444444));
	}, "Ambient Light");

	//Spot Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/spot.png", function()
	{
		Editor.addObject(new SpotLight(0x444444));
	}, "Spot Light");

	//Directional Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/directional.png", function()
	{
		Editor.addObject(new DirectionalLight(0x444444));
	}, "Directional Light");

	//Hemisphere Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/hemisphere.png", function()
	{
		Editor.addObject(new HemisphereLight(0x444444));
	}, "Hemisphere Light");

	//RectArea Light
	lights.addOption(Editor.FILE_PATH + "icons/lights/rectarea.png", function()
	{
		Editor.addObject(new RectAreaLight(0x444444, 100, 1, 1));
	}, "RectArea Light");

	//Sky
	lights.addOption(Editor.FILE_PATH + "icons/lights/sky.png", function()
	{
		Editor.addObject(new Sky());
	}, Locale.sky);

	lights.updateOptions();

	//Add camera
	var cameras = new ButtonDrawer(this);
	cameras.setImage(Editor.FILE_PATH + "icons/camera/camera.png");
	this.buttons.push(cameras);

	//Perspective camera
	cameras.addOption(Editor.FILE_PATH + "icons/camera/prespective.png", function()
	{
		Editor.addObject(new PerspectiveCamera(60, 1));
	}, "Perspective Camera");

	//Orthographic camera
	cameras.addOption(Editor.FILE_PATH + "icons/camera/orthographic.png", function()
	{
		Editor.addObject(new OrthographicCamera(3, 2, OrthographicCamera.RESIZE_HORIZONTAL));
	}, "Orthographic Camera");

	cameras.updateOptions();

	//Add script
	var scripts = new ButtonDrawer(this);
	scripts.setImage(Editor.FILE_PATH + "icons/script/script.png");
	this.buttons.push(scripts);

	//Javascript script
	scripts.addOption(Editor.FILE_PATH + "icons/script/script.png", function()
	{
		Editor.addObject(new Script());
	}, "Javascript Script");

	scripts.updateOptions();

	//Effects
	var effects = new ButtonDrawer(this);
	effects.setImage(Editor.FILE_PATH + "icons/misc/particles.png");
	this.buttons.push(effects);

	//Sprite
	effects.addOption(Editor.FILE_PATH + "icons/misc/sprite.png", function()
	{
		Editor.addObject(new Sprite(Editor.defaultSpriteMaterial));
	}, "Sprite");

	//Particle emitter
	effects.addOption(Editor.FILE_PATH + "icons/misc/particles.png", function()
	{
		var particle = new ParticleEmitter()
		particle.texture = Editor.defaultTextureParticle;
		particle.reload();
		Editor.addObject(particle);
	}, "Particle Emitter");

	//Container
	effects.addOption(Editor.FILE_PATH + "icons/misc/container.png", function()
	{
		Editor.addObject(new Container());
	}, "Container");

	//Cube Camera
	effects.addOption(Editor.FILE_PATH + "icons/misc/probe.png", function()
	{
		Editor.addObject(new CubeCamera());
	}, "Cube Camera")

	//Audio
	effects.addOption(Editor.FILE_PATH + "icons/misc/audio.png", function()
	{
		Editor.addObject(new AudioEmitter(Editor.defaultAudio));
	}, "Audio");

	//Positional Audio
	effects.addOption(Editor.FILE_PATH + "icons/misc/audio_positional.png", function()
	{
		Editor.addObject(new PositionalAudio(Editor.defaultAudio));
	}, "Positional Audio");

	//Lens flare
	effects.addOption(Editor.FILE_PATH + "icons/misc/flare.png", function()
	{
		var lensFlare = new LensFlare();

		lensFlare.addFlare(Editor.defaultTextureLensFlare[0], 700, 0.0);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[2], 512, 0.0);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[2], 512, 0.0);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[2], 512, 0.0);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[3], 60, 0.6);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[3], 70, 0.7);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[3], 120, 0.9);
		lensFlare.addFlare(Editor.defaultTextureLensFlare[3], 70, 1.0);

		Editor.addObject(lensFlare);
	}, "Lens flare");

	if(Nunu.developmentMode())
	{
		//Reflector
		effects.addOption(Editor.FILE_PATH + "icons/misc/mirror.png", function()
		{
			var object = new THREE.Reflector(new THREE.PlaneBufferGeometry());

			Editor.addObject(object);
		}, "Reflector");

		//Refractor
		effects.addOption(Editor.FILE_PATH + "icons/misc/waves.png", function()
		{
			var object = new THREE.Refractor(new THREE.PlaneBufferGeometry());
			Editor.addObject(object);
		}, "Refractor");
	}

	effects.updateOptions();

	//Physics
	var physics = new ButtonDrawer(this);
	physics.setImage(Editor.FILE_PATH + "icons/misc/physics.png");
	this.buttons.push(physics);

	//Physics box
	physics.addOption(Editor.FILE_PATH + "icons/models/cube.png", function()
	{
		var object = new PhysicsObject();
		object.body.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
		object.name = "box";
		Editor.addObject(obj);
	}, Locale.box);

	//Physics sphere
	physics.addOption(Editor.FILE_PATH + "icons/models/sphere.png", function()
	{
		var object = new PhysicsObject();
		object.body.addShape(new CANNON.Sphere(1.0));
		object.name = "sphere";
		Editor.addObject(obj);
	}, Locale.sphere);

	//Physics Cylinder
	physics.addOption(Editor.FILE_PATH + "icons/models/cylinder.png", function()
	{
		var object = new PhysicsObject();
		object.body.addShape(new CANNON.Cylinder(1.0, 1.0, 2.0, 8));
		object.name = "cylinder";
		Editor.addObject(obj);
	}, Locale.cylinder);

	//Physics Plane
	physics.addOption(Editor.FILE_PATH + "icons/models/plane.png", function()
	{
		var object = new PhysicsObject();
		object.rotation.x = -Math.PI / 2;
		object.body.addShape(new CANNON.Plane());
		object.body.type = CANNON.Body.KINEMATIC;
		object.name = "ground";
		Editor.addObject(obj);
	}, "Ground");

	//Physics Particle
	physics.addOption(Editor.FILE_PATH + "icons/models/point.png", function()
	{
		var object = new PhysicsObject();
		object.body.addShape(new CANNON.Particle());
		object.name = "particle";
		Editor.addObject(obj);
	}, "Particle");

	physics.updateOptions();

	//Add device
	var controls = new ButtonDrawer(this);
	controls.setImage(Editor.FILE_PATH + "icons/misc/controller.png");
	this.buttons.push(controls);

	//Orbit controls
	controls.addOption(Editor.FILE_PATH + "icons/misc/orbit.png", function()
	{
		Editor.addObject(new OrbitControls());
	}, "Orbit Controls");

	//FPS controls
	controls.addOption(Editor.FILE_PATH + "icons/misc/crosshair.png", function()
	{
		Editor.addObject(new FirstPersonControls());
	}, "First Person Controls");

	//Leap Hand
	controls.addOption(Editor.FILE_PATH + "icons/hw/leap.png", function()
	{
		Editor.addObject(new LeapMotion());
	}, "Leap Motion");

	//Kinect Skeleton
	controls.addOption(Editor.FILE_PATH + "icons/hw/kinect.png", function()
	{
		Editor.addObject(new KinectDevice());
	}, "Microsoft Kinect");

	controls.updateOptions();
};