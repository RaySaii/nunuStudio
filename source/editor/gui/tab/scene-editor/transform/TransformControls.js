"use strict";

/*
 * TranformControls is used to manipulate object in 3D space. It can be used to manipulate multiple Object3D instances simultaneously.
 *
 * The objects are transformed by Gizmos managed by the transform controls object, gizmos may be compatible with multiple types of objects (Object3D, Vector3, etc).
 *
 * @class TransformControls
 * @author arodic (github.com/arodic)
 * @param {THREE.Camera} camera
 * @param {Canvas} canvas
 * @param {Mouse} mouse
 */
function TransformControls(camera, canvas, mouse)
{
	THREE.Object3D.call(this);

	this.visible = false;

	/**
	 * View camera, the controls scale and behavior is calculated relative to the camera.
	 *
	 * The rotation and direction of the camera affects the appearence of the gizmos and the vectors applied to transform objects.
	 *
	 * Booth perspective or orthographic cameras are supported.
	 * 
	 * @attribute camera
	 * @type {THREE.Camera}
	 */
	this.camera = camera;

	/**
	 * DOM canvas where the scene is rendererd.
	 *
	 * Mouse input is calculated relative to this canvas position on screen.
	 *
	 * @attribute canvas
	 * @type {DOM} 
	 */
	this.canvas = canvas;
	
	/**
	 * Mouse to get user input from. Should be updated before updating the controls.
	 *
	 * @attribute mouse
	 * @type {Mouse}
	 */
	this.mouse = mouse;

	/**
	 * Object currently attached to the transform controls.
	 *
	 * @attribute objects
	 * @type {Array}
	 */
	this.objects = [];

	/**
	 * Object transform attributes for each selected object.
	 *
	 * Can be reused between selected objects.
	 *
	 * @attribute attributes
	 * @type {Array} 
	 */
	this.attributes = [];

	/**
	 * Transformation space defines how the transformations are applied.
	 *
	 * If set to WORLD the transformations are applied on the world referential.
	 *
	 * If set to LOCAL the transformations are applied relative to the object current transform
	 *
	 * After chaging 
	 *
	 * @attribute space
	 * @type {number}
	 */
	this.space = TransformControls.WORLD;

	/**
	 * Scale of the transform gizmo.
	 *
	 * Size of the gizmos is adjusted relative to the view camera distance.*
	 *
	 * @attribute size
	 * @type {number}
	 */
	this.size = 1;

	/**
	 * Axis of transformation selected stored as text. (e.g X, Y, Z).
	 *
	 * Can be a combination of multiple axis (e.g XYZ, XZ, etc)
	 *
	 * @attribute axis
	 * @type {string}
	 */
	this.axis = null;

	/**
	 * If set true the value set by the transform is always multiple of the snap ratio.
	 *
	 * Snap ratios are different for each transform gizmo.
	 *
	 * @attribute snap
	 * @type {boolean}
	 */
	this.snap = false;

	/**
	 * Snap ratio applies to translation transform.
	 *
	 * @attribute translationSnap
	 * @type {number}
	 */
	this.translationSnap = 1.0;

	/**
	 * Snap ratio applies to rotation transform.
	 *
	 * @attribute rotationSnap
	 * @type {number}
	 */
	this.rotationSnap = 0.1;

	/**
	 * Mode indicates the gizmo currently being used.
	 *
	 * @attribute mode
	 * @type {string}
	 */
	this.mode = TransformControls.TRANSLATE;

	/**
	 * If set true the pointer is currently being dragged around.
	 *
	 * @attribute dragging
	 * @type {boolean}
	 */
	this.dragging = false;

	/**
	 * If set true a object is currently being edited.
	 *
	 * @attribute editing
	 * @type {boolean}
	 */
	this.editing = false;

	/**
	 * Gizmo tools currenctly in use to edit the object.
	 *
	 * Defines what and how the attribute of the object is manipulated.
	 *
	 * @attribute gizmo
	 * @type {TransformGizmo}
	 */
	this.gizmo = new TransformGizmo();

	/**
	 * Raycaster object used to pick the gizmo sections.
	 *
	 * @attribute raycaster
	 * @type {THREE.Raycaster}
	 */
	this.raycaster = new THREE.Raycaster();

	/**
	 * Normalized vector containing the pointer coordinates used with the raycaster.
	 *
	 * @attribute pointerVector
	 * @type {THREE.Vector2}
	 */
	this.pointerVector = new THREE.Vector2();

	this.point = new THREE.Vector3();
	this.offset = new THREE.Vector3();

	this.toolRotation = new THREE.Vector3();
	this.toolScale = 1;
	this.offsetRotation = new THREE.Vector3();

	/**
	 * View and projection matrix combined.
	 *
	 * @attribute lookAtMatrix
	 * @type {THREE.Matrix4}
	 */
	this.lookAtMatrix = new THREE.Matrix4();

	/**
	 * Camera direction vector.
	 *
	 * @attribute eye
	 * @type {THREE.Vector3}
	 */
	this.eye = new THREE.Vector3();
	
	/**
	 * View camera position.
	 *
	 * @attribute camPosition
	 * @type {THREE.Vector3}
	 */
	this.camPosition = new THREE.Vector3();

	/**
	 * View camera rotation.
	 *
	 * @attribute camRotation
	 * @type {THREE.Vector3}
	 */
	this.camRotation = new THREE.Euler();

	// Temporary variables used for runtime calcs
	this.tempMatrix = new THREE.Matrix4();
	this.tempVector = new THREE.Vector3();
	this.tempQuaternion = new THREE.Quaternion();
	this.unitX = new THREE.Vector3(1, 0, 0);
	this.unitY = new THREE.Vector3(0, 1, 0);
	this.unitZ = new THREE.Vector3(0, 0, 1);
	this.quaternionXYZ = new THREE.Quaternion();
	this.quaternionX = new THREE.Quaternion();
	this.quaternionY = new THREE.Quaternion();
	this.quaternionZ = new THREE.Quaternion();
	this.quaternionE = new THREE.Quaternion();
}

/**
 * Attributes that need to be stored for each object to keep their transform state.
 *
 * Each selected object has one state.
 *
 * @class TransformControlAtttributes
 */
function TransformControlAtttributes()
{
	this.parentRotationMatrix = new THREE.Matrix4();
	this.parentScale = new THREE.Vector3();
	this.worldRotationMatrix = new THREE.Matrix4();
	this.worldPosition = new THREE.Vector3();
	this.worldRotation = new THREE.Euler();
	this.oldPosition = new THREE.Vector3();
	this.oldScale = new THREE.Vector3();
	this.oldQuaternion = new THREE.Quaternion();
	this.oldRotationMatrix = new THREE.Matrix4();
}

TransformControls.NONE = "none";
TransformControls.TRANSLATE = "translate";
TransformControls.ROTATE = "rotate";
TransformControls.SCALE = "scale";

TransformControls.LOCAL = "local";
TransformControls.WORLD = "world";

TransformControls.prototype = Object.create(THREE.Object3D.prototype);

/**
 * Attach a list of objects to the transform controls.
 *
 * @method attach
 * @param {Array} objects Array of objects to be attached.
 */
TransformControls.prototype.attach = function(objects)
{
	this.objects = [];

	for(var i = 0; i < objects.length; i++)
	{
		if(objects[i].isObject3D && !objects[i].locked && objects[i].parent !== null)
		{
			this.objects.push(objects[i]);
		}
	}

	// Add more temporary attributes if necessary
	while(this.attributes.length < this.objects.length)
	{
		this.attributes.push(new TransformControlAtttributes());
	}

	if(this.objects.length > 0)
	{
		this.updatePose();
	}
	else
	{
		this.clear();
	}
};

/**
 * Detach/clear all objects attached to the transform controls.
 * 
 * @method clear
 */
TransformControls.prototype.clear = function()
{
	this.objects = [];
	this.visible = false;
	this.axis = null;
};

/**
 * Set canvas where the scene is being rendered.
 *
 * @method setCanvas
 * @param {DOM} canvas Canvas element.
 */
TransformControls.prototype.setCanvas = function(canvas)
{
	this.canvas = canvas;
};

/**
 * Set the transform gizmo to be used by the transform controls.
 *
 * @method setMode
 * @param {string} mode Name of the gizmo to be activated.
 */
TransformControls.prototype.setMode = function(mode)
{
	if(this.mode === mode)
	{
		return;
	}

	this.mode = mode;

	// Remove old gizmo
	if(this.gizmo !== null)
	{
		if(this.gizmo.dismiss !== undefined)
		{
			this.gizmo.dismiss();
		}

		this.remove(this.gizmo);
		this.gizmo = null;
	}

	// Create gizmo for the mode selected
	if(this.mode === TransformControls.TRANSLATE)
	{
		this.gizmo = new TransformGizmoTranslate();
	}
	else if(this.mode === TransformControls.ROTATE)
	{
		this.gizmo = new TransformGizmoRotate();
	}
	else if(this.mode === TransformControls.SCALE)
	{
		// If scale mode force local space
		this.space = TransformControls.LOCAL;
		this.gizmo = new TransformGizmoScale();
	}
	else
	{
		this.gizmo = new TransformGizmo();
	}

	if(this.gizmo !== null)
	{
		this.add(this.gizmo);
	}


	this.visible = this.objects.length > 0;
	this.updatePose();
};

/**
 * Update the controls using mouse input provided takes camera of all the functionality of the controls.
 *
 * Should be called every frame to update the controls state.
 *
 * @method update
 */
TransformControls.prototype.update = function()
{
	if(this.mouse.buttonJustPressed(Mouse.LEFT))
	{
		this.onPointerDown();
	}
	
	if(this.mouse.buttonJustReleased(Mouse.LEFT))
	{
		this.onPointerUp();
	}

	if(this.mouse.delta.x !== 0 || this.mouse.delta.y !== 0)
	{
		this.onPointerHover();
		this.onPointerMove();
	}

	this.updatePose();

	return this.editing;
};

/**
 * Update the pose and transform of the controls and gizmos based on the selected objects and view camera.
 *
 * @method updatePose
 */
TransformControls.prototype.updatePose = function()
{
	if(this.objects.length === 0)
	{
		this.clear();
		return;
	}

	if(this.mode === TransformControls.NONE)
	{
		return;
	}
	
	this.visible = true;
	this.position.set(0, 0, 0);

	for(var i = 0; i < this.objects.length; i++)
	{
		this.attributes[i].worldPosition.setFromMatrixPosition(this.objects[i].matrixWorld);
		this.attributes[i].worldRotation.setFromRotationMatrix(this.tempMatrix.extractRotation(this.objects[i].matrixWorld));
		this.position.add(this.attributes[i].worldPosition);
	}

	if(this.objects.length > 0)
	{
		this.position.divideScalar(this.objects.length);
	}

	this.camPosition.setFromMatrixPosition(this.camera.matrixWorld);
	this.camRotation.setFromRotationMatrix(this.tempMatrix.extractRotation(this.camera.matrixWorld));

	if(this.camera instanceof THREE.PerspectiveCamera)
	{
		this.toolScale = this.position.distanceTo(this.camPosition) / 6 * this.size;
		this.scale.set(this.toolScale, this.toolScale, this.toolScale);
	}
	else
	{
		this.toolScale = this.camera.size / 6 * this.size;
		this.scale.set(this.toolScale, this.toolScale, this.toolScale);
	}
	
	this.eye.copy(this.camPosition).sub(this.position).normalize();

	if(this.mode !== TransformControls.NONE)
	{	
		if(this.space === TransformControls.LOCAL || this.mode === TransformControls.SCALE)
		{
			this.gizmo.update(this.attributes[0].worldRotation, this.eye);
		}
		else if(this.space === TransformControls.WORLD)
		{
			this.gizmo.update(new THREE.Euler(), this.eye);
		}

		this.gizmo.highlight(this.axis);
	}
};

TransformControls.prototype.onPointerHover = function()
{
	if(this.objects.length === 0 || this.dragging === true || this.mode === TransformControls.NONE)
	{
		return;
	}

	var intersect = this.intersectObjects(this.gizmo.pickers.children);
	var axis = null;

	if(intersect)
	{
		axis = intersect.object.name;
	}

	if(this.axis !== axis)
	{
		this.axis = axis;
		this.updatePose();
	}
};

TransformControls.prototype.onPointerDown = function()
{
	if(this.objects.length === 0 || this.dragging === true || this.mode === TransformControls.NONE)
	{
		return;
	}

	var intersect = this.intersectObjects(this.gizmo.pickers.children);

	if(intersect)
	{
		this.editing = true;
		this.axis = intersect.object.name;
		this.updatePose();

		this.eye.copy(this.camPosition).sub(this.position).normalize();
		this.gizmo.setActivePlane(this.axis, this.eye);

		var planeIntersect = this.intersectObjects([this.gizmo.activePlane]);
		if(planeIntersect)
		{
			for(var i = 0; i < this.objects.length; i++)
			{
				this.attributes[i].oldPosition.copy(this.objects[i].position);
				this.attributes[i].oldScale.copy(this.objects[i].scale);
				this.attributes[i].oldQuaternion.copy(this.objects[i].quaternion);
				this.attributes[i].oldRotationMatrix.extractRotation(this.objects[i].matrix);

				this.attributes[i].worldRotationMatrix.extractRotation(this.objects[i].matrixWorld);
				this.attributes[i].parentRotationMatrix.extractRotation(this.objects[i].parent.matrixWorld);
				this.attributes[i].parentScale.setFromMatrixScale(this.tempMatrix.getInverse(this.objects[i].parent.matrixWorld));
			}

			this.offset.copy(planeIntersect.point);
		}
	}

	this.dragging = true;
};

/**
 * Called whenever the mouse is moved inside of the canvas.
 *
 * Constantly recaulculates the transforms being applied.
 *
 * @method onPointerMove
 */
TransformControls.prototype.onPointerMove = function()
{
	if(this.objects.length === 0 || this.axis === null || this.dragging === false || this.mode === TransformControls.NONE)
	{
		return;
	}

	var planeIntersect = this.intersectObjects([this.gizmo.activePlane]);
	if(planeIntersect === false) 
	{
		return;
	}
	
	if(this.mode === TransformControls.TRANSLATE)
	{
		for(var i = 0; i < this.objects.length; i++)
		{
			this.point.copy(planeIntersect.point);
			this.point.sub(this.offset);
			this.point.multiply(this.attributes[i].parentScale);

			if(this.axis.search("X") === -1)
			{
				this.point.x = 0;
			}
			if(this.axis.search("Y") === -1) 
			{
				this.point.y = 0;
			}
			if(this.axis.search("Z") === -1)
			{
				this.point.z = 0;
			}
					
			if(this.space === TransformControls.WORLD || this.axis.search("XYZ") !== -1)
			{
				this.point.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].parentRotationMatrix));

				for(var j = 0; j < this.objects.length; j++)
				{
					this.objects[j].position.copy(this.attributes[j].oldPosition);
					this.objects[j].position.add(this.point);
				}
			}
			else if(this.space === TransformControls.LOCAL)
			{
				if(this.axis.length > 1)
				{
					this.point.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].worldRotationMatrix));
					this.point.applyMatrix4(this.attributes[i].oldRotationMatrix);
				}
				else
				{
					this.point.applyMatrix4(this.attributes[i].oldRotationMatrix);
				}

				for(var j = 0; j < this.objects.length; j++)
				{
					this.objects[j].position.copy(this.attributes[j].oldPosition);
					this.objects[j].position.add(this.point);
				}
			}

			if(this.snap)
			{
				if(this.space === TransformControls.LOCAL)
				{
					this.objects[i].position.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].worldRotationMatrix));
				}

				if(this.axis.search("X") !== -1)
				{
					this.objects[i].position.x = Math.round(this.objects[i].position.x / this.translationSnap) * this.translationSnap;
				}
				if(this.axis.search("Y") !== -1)
				{
					this.objects[i].position.y = Math.round(this.objects[i].position.y / this.translationSnap) * this.translationSnap;
				}
				if(this.axis.search("Z") !== -1)
				{
					this.objects[i].position.z = Math.round(this.objects[i].position.z / this.translationSnap) * this.translationSnap;
				}

				if(this.space === TransformControls.LOCAL)
				{
					this.objects[i].position.applyMatrix4(this.attributes[i].worldRotationMatrix);
				}
			}
		}
	}
	else if(this.mode === TransformControls.SCALE)
	{
		for(var i = 0; i < this.objects.length; i++)
		{
			this.point.copy(planeIntersect.point);
			this.point.sub(this.offset);
			this.point.multiply(this.attributes[i].parentScale);

			if(this.axis === "XYZ")
			{
				this.toolScale = 1 + this.point.y;

				this.objects[i].scale.copy(this.attributes[i].oldScale);
				this.objects[i].scale.multiplyScalar(this.toolScale);
			}
			else
			{
				this.point.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].worldRotationMatrix));

				if(this.axis === "X")
				{
					this.objects[i].scale.x = this.attributes[i].oldScale.x * (1 + this.point.x);
				}
				else if(this.axis === "Y")
				{
					this.objects[i].scale.y = this.attributes[i].oldScale.y * (1 + this.point.y);
				}
				else if(this.axis === "Z")
				{
					this.objects[i].scale.z = this.attributes[i].oldScale.z * (1 + this.point.z);
				}
			}

			// Update physics objects
			if(this.objects[i] instanceof PhysicsObject)
			{
				var shapes = this.objects[i].body.shapes;
				var scale = this.objects[i].scale;

				for(var i = 0; i < shapes.length; i++)
				{
					var shape = shapes[i];
					
					if(shape.type === CANNON.Shape.types.BOX)
					{
						shape.halfExtents.x = scale.x / 2.0;
						shape.halfExtents.y = scale.y / 2.0;
						shape.halfExtents.z = scale.z / 2.0;
					}
					else if(shape.type === CANNON.Shape.types.SPHERE)
					{
						shape.radius = scale.x;
					}
				}
			}
		}
	}
	else if(this.mode === TransformControls.ROTATE)
	{
		for(var i = 0; i < this.objects.length; i++)
		{
			this.point.copy(planeIntersect.point);
			this.point.sub(this.attributes[i].worldPosition);
			this.point.multiply(this.attributes[i].parentScale);
			this.tempVector.copy(this.offset).sub(this.attributes[i].worldPosition);
			this.tempVector.multiply(this.attributes[i].parentScale);

			if(this.axis === "E")
			{
				this.point.applyMatrix4(this.tempMatrix.getInverse(this.lookAtMatrix));
				this.tempVector.applyMatrix4(this.tempMatrix.getInverse(this.lookAtMatrix));

				this.toolRotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x));
				this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x));

				this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.attributes[i].parentRotationMatrix));

				this.quaternionE.setFromAxisAngle(this.eye, this.toolRotation.z - this.offsetRotation.z);
				this.quaternionXYZ.setFromRotationMatrix(this.attributes[i].worldRotationMatrix);

				this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionE);
				this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ);

				this.objects[i].quaternion.copy(this.tempQuaternion);
			}
			else if(this.axis === "XYZE")
			{
				this.quaternionE.setFromEuler(this.point.clone().cross(this.tempVector).normalize()); // rotation axis

				this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.attributes[i].parentRotationMatrix));
				this.quaternionX.setFromAxisAngle(this.quaternionE, - this.point.clone().angleTo(this.tempVector));
				this.quaternionXYZ.setFromRotationMatrix(this.attributes[i].worldRotationMatrix);

				this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionX);
				this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ);

				this.objects[i].quaternion.copy(this.tempQuaternion);
			}
			else if(this.space === TransformControls.LOCAL)
			{
				this.point.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].worldRotationMatrix));

				this.tempVector.applyMatrix4(this.tempMatrix.getInverse(this.attributes[i].worldRotationMatrix));

				this.toolRotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x));
				this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x));

				this.quaternionXYZ.setFromRotationMatrix(this.attributes[i].oldRotationMatrix);

				if(this.snap)
				{
					this.quaternionX.setFromAxisAngle(this.unitX, Math.round((this.toolRotation.x - this.offsetRotation.x) / this.rotationSnap) * this.rotationSnap);
					this.quaternionY.setFromAxisAngle(this.unitY, Math.round((this.toolRotation.y - this.offsetRotation.y) / this.rotationSnap) * this.rotationSnap);
					this.quaternionZ.setFromAxisAngle(this.unitZ, Math.round((this.toolRotation.z - this.offsetRotation.z) / this.rotationSnap) * this.rotationSnap);
				}
				else
				{
					this.quaternionX.setFromAxisAngle(this.unitX, this.toolRotation.x - this.offsetRotation.x);
					this.quaternionY.setFromAxisAngle(this.unitY, this.toolRotation.y - this.offsetRotation.y);
					this.quaternionZ.setFromAxisAngle(this.unitZ, this.toolRotation.z - this.offsetRotation.z);
				}

				if(this.axis === "X")
				{
					this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionX);
				}
				else if(this.axis === "Y")
				{
					this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionY);
				}
				else if(this.axis === "Z")
				{
					this.quaternionXYZ.multiplyQuaternions(this.quaternionXYZ, this.quaternionZ);
				}

				this.objects[i].quaternion.copy(this.quaternionXYZ);
			}
			else if(this.space === TransformControls.WORLD)
			{
				this.toolRotation.set(Math.atan2(this.point.z, this.point.y), Math.atan2(this.point.x, this.point.z), Math.atan2(this.point.y, this.point.x));
				this.offsetRotation.set(Math.atan2(this.tempVector.z, this.tempVector.y), Math.atan2(this.tempVector.x, this.tempVector.z), Math.atan2(this.tempVector.y, this.tempVector.x));
				this.tempQuaternion.setFromRotationMatrix(this.tempMatrix.getInverse(this.attributes[i].parentRotationMatrix));

				if(this.snap)
				{
					this.quaternionX.setFromAxisAngle(this.unitX, Math.round((this.toolRotation.x - this.offsetRotation.x) / this.rotationSnap) * this.rotationSnap);
					this.quaternionY.setFromAxisAngle(this.unitY, Math.round((this.toolRotation.y - this.offsetRotation.y) / this.rotationSnap) * this.rotationSnap);
					this.quaternionZ.setFromAxisAngle(this.unitZ, Math.round((this.toolRotation.z - this.offsetRotation.z) / this.rotationSnap) * this.rotationSnap);
				}
				else
				{
					this.quaternionX.setFromAxisAngle(this.unitX, this.toolRotation.x - this.offsetRotation.x);
					this.quaternionY.setFromAxisAngle(this.unitY, this.toolRotation.y - this.offsetRotation.y);
					this.quaternionZ.setFromAxisAngle(this.unitZ, this.toolRotation.z - this.offsetRotation.z);
				}

				this.quaternionXYZ.setFromRotationMatrix(this.attributes[i].worldRotationMatrix);

				if(this.axis === "X")
				{
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionX);
				}
				else if(this.axis === "Y")
				{
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionY);
				}
				else if(this.axis === "Z")
				{
					this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionZ);
				}

				this.tempQuaternion.multiplyQuaternions(this.tempQuaternion, this.quaternionXYZ);

				this.objects[i].quaternion.copy(this.tempQuaternion);
			}
		}
	}

	this.updatePose();
};

/**
 * Method called when user input button is released.
 *
 * Changes made to the object are added to the editor action history.
 * 
 * @method onPointerUp
 */
TransformControls.prototype.onPointerUp = function()
{
	if(this.editing)
	{
		if(this.mode === TransformControls.TRANSLATE)
		{
			var actions = [];

			for(var i = 0; i < this.objects.length; i++)
			{
				var object = this.objects[i].position;
				actions.push(new ChangeAction(object, "x", object.x, this.attributes[i].oldPosition.x));
				actions.push(new ChangeAction(object, "y", object.y, this.attributes[i].oldPosition.y));
				actions.push(new ChangeAction(object, "z", object.z, this.attributes[i].oldPosition.z));
			}

			Editor.addAction(new ActionBundle(actions));
		}
		else if(this.mode === TransformControls.SCALE)
		{
			var actions = [];

			for(var i = 0; i < this.objects.length; i++)
			{
				var object = this.objects[i].scale;
				actions.push(new ChangeAction(object, "x", object.x, this.attributes[i].oldScale.x));
				actions.push(new ChangeAction(object, "y", object.y, this.attributes[i].oldScale.y));
				actions.push(new ChangeAction(object, "z", object.z, this.attributes[i].oldScale.z));
			}
			
			Editor.addAction(new ActionBundle(actions));
		}
		else if(this.mode === TransformControls.ROTATE)
		{
			var actions = [];

			for(var i = 0; i < this.objects.length; i++)
			{
				var object = this.objects[i].quaternion;
				actions.push(new ChangeAction(object, "x", object.x, this.attributes[i].oldQuaternion.x));
				actions.push(new ChangeAction(object, "y", object.y, this.attributes[i].oldQuaternion.y));
				actions.push(new ChangeAction(object, "z", object.z, this.attributes[i].oldQuaternion.z));
				actions.push(new ChangeAction(object, "w", object.w, this.attributes[i].oldQuaternion.w));
			}
			
			Editor.addAction(new ActionBundle(actions));
		}
	}

	this.editing = false;
	this.dragging = false;
};

/**
 * Check if the mouse is currently intersecting objects inside of the canvas.
 *
 * @method intersectObjects
 * @param {Array} objects Object to be tested.
 * @return {Object} Object intersected is any, false otherwise.
 */
TransformControls.prototype.intersectObjects = function(objects)
{
	var rect = this.canvas.getBoundingClientRect();
	var x = this.mouse.position.x / rect.width;
	var y = this.mouse.position.y / rect.height;

	this.pointerVector.set((x * 2) - 1, - (y * 2) + 1);
	this.raycaster.setFromCamera(this.pointerVector, this.camera);

	var intersections = this.raycaster.intersectObjects(objects, true);

	return intersections.length > 0 ? intersections[0] : false;
};
