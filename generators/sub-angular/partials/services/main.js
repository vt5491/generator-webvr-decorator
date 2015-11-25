

    var factory = {};

    factory.animationActive = true;
    factory.INIT_POSITION = new THREE.Vector3(0, 1.5, 2);
    factory.BasePosition = new THREE.Vector3();
    factory.BasePosition.copy( factory.INIT_POSITION);
    factory.INIT_ROTATION = new THREE.Quaternion();
    factory.BaseRotation = new THREE.Quaternion();
    factory.BaseRotation.copy(factory.INIT_ROTATION);

    factory.xyProjectionPlaneQuat = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), base.ONE_DEGREE * 0.2 );
    factory.cubeQuat = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), base.ONE_DEGREE * 0.2 );

    // these have to be function scope variables because they are set via
    // or need to be accessed from asynchronous callbacks.
    var scene;

    factory.initWebGl = function () {
       this.width = $window.innerWidth;
       this.height = $window.innerHeight;

       try {
         this.canvas = document.getElementById('viewer');

         this.renderer = new THREE.WebGLRenderer({
           antialias: true,
           //canvas: angular.element(document.getElementById('viewer'))
           canvas: document.getElementById('viewer')
         });
       }
       catch(e){
         //console.log('This application needs WebGL enabled!');
         alert('This application needs WebGL enabled! error=' + e);
         return false;
       }

       // this controls the ambient background color e.g of the the "sky"
       //this.renderer.setClearColor(0x131313, 1.0);
       this.renderer.setClearColor(0x431353, 1.0);
       this.renderer.setSize(this.width, this.height);

       this.container = document.getElementById('container');
       this.canvas.focus();
     };

//   factory.initScene = function() {
      factory.initScene = function() {
        scene = new THREE.Scene();

        // use the injected camera service
        //this.camera = factory.camera;

        // we have to get the camera ourselves manually.  For some reason the cameraObject
        // in the camera factory doesn't work right
        this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 10000);

        this.camera.position.copy(this.BasePosition);
        this.camera.position.z = 100;
        this.camera.quaternion.copy(this.BaseRotation);

        this.camera.quaternion.copy( this.BaseRotation);

        this.controls = new THREE.VRControls(this.camera);
        this.effect = new THREE.VREffect(this.renderer);
        this.effect.setSize(this.width, this.height);

        this.vrManager = new WebVRManager(this.renderer, this.effect);

        this.xyProjectionPlane = new THREE.Object3D();

        var geometry, material;
        
        //geometry = new THREE.PlaneGeometry( 4,2 );
        geometry = new THREE.PlaneBufferGeometry( 4,2 );
        material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );

        this.xyProjectionMesh = new THREE.Mesh( geometry, material );
        this.xyProjectionPlane.add(this.xyProjectionMesh);

        //plane.position = new THREE.Vector3(0,0, -2);
        this.xyProjectionPlane.position.set(0, 1, -8);
        
        scene.add(this.xyProjectionPlane);

        geometry = new THREE.BoxGeometry(25, 25, 25);
        material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh(geometry, material);

        scene.add(this.cube);

      };

    factory.init = function() {
      this.initWebGl();
      this.initScene();
    };
      
   //factory.render = function () {
   factory.render = function () {
     // This basically extracts the rotation and position from the Rift and puts
     // it into the cameras rotation and position.  We previously defined the VRControl
     // to be attached to our camera.
     this.controls.update();

     // var m = new THREE.Matrix4();
     // var mat = m.makeRotationY(base.ONE_DEGREE * 0.2);
     // this.xyProjectionPlane.geometry.applyMatrix(mat);
     this.xyProjectionPlane.quaternion.multiply(this.xyProjectionPlaneQuat);
     this.cube.quaternion.multiply(this.cubeQuat);

//     if (this.vrManager.isVRMode()) {
//       this.effect.render(scene, this.camera);
//       //console.log("patha");
//     }
//     else {
//       this.renderer.render(scene, this.camera);
//       //console.log("pathb");
//     }
     this.camera.position.z = 100;
     this.vrManager.render(scene, this.camera);

   };
      
   factory.mainLoop =  function () {
     if( this.animationActive) {
       // we basically ask that we invoke ourselves in 1/60 of a second.  This is
       // basically timed recursion.
       // after doing this fall through and do the rest of the function (call render)
       window.requestAnimationFrame( this.mainLoop.bind(this) );
     }

     // update one render scene and leave.  mainLoop will invoke again in 1/60 second
     // if requestAnimationFrame was previously called.
     this.render();
   };
      

    return factory;
//    });
