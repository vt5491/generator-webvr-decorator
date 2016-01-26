    return {
      
      restrict: 'A',

      link: function postLink(scope, element, attrs) {
        
        var kbdHandler = function(event) {

          // prevent browser from handling as well
          event.preventDefault();

          //vt add
          //console.log('vt: canvasKeys: event.keyCode=' + event.keyCode);
          //vt end

          switch( event.keyCode) {
            case 'S'.charCodeAt(0):
              <%= mainService %>.camera.translateZ(<%= baseService %>.CAMERA_MOVE_DELTA); 
            break;
            
            case 'W'.charCodeAt(0):
              <%= mainService %>.camera.translateZ(-<%= baseService %>.CAMERA_MOVE_DELTA);
            break;
            
            case 'A'.charCodeAt(0):
              <%= mainService %>.camera.translateX(<%= baseService %>.CAMERA_MOVE_DELTA);
            break;
            
            case 'D'.charCodeAt(0):
              <%= mainService %>.camera.translateX(-<%= baseService %>.CAMERA_MOVE_DELTA);
            break;

            case 'Q'.charCodeAt(0):
              <%= mainService %>.cube.rotation.z +=  <%= baseService %>.ONE_DEGREE * <%= baseService %>.CAMERA_ROT_DELTA;
            break;
            
            case 'E'.charCodeAt(0):
              <%= mainService %>.cube.rotation.z +=  -<%= baseService %>.ONE_DEGREE * <%= baseService %>.CAMERA_ROT_DELTA;
            break;
            
            case 'P'.charCodeAt(0):
              <%= mainService %>.camera.translateY(-<%= baseService %>.CAMERA_MOVE_DELTA);
            break;
            
            case 'N'.charCodeAt(0):
              <%= mainService %>.camera.translateY(<%= baseService %>.CAMERA_MOVE_DELTA);
            break;
            
            case 'R'.charCodeAt(0):
              <%= mainService %>.BasePosition.copy(<%= mainService %>.INIT_POSITION);
              <%= mainService %>.BaseRotation.copy(<%= mainService %>.INIT_ROTATION);
            break;            
          }
        };

        // I have to bind to $document for runtime and to element for testing.  I think I should
        // be able to use element for both, but for now just bind to both
        $document.on("keydown", kbdHandler);
        element.on("keydown", kbdHandler);
      }
    };
