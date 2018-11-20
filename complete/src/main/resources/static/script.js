$(document).ready(function() {
    /* WebSocket Start */
    
    var stompClient = null;
    var connect_btn = document.querySelector('#connect');
    var disconnect_btn = document.querySelector('#disconnect');
    var received = document.querySelector('#received');
    var socket = null;

    function connect() {
        disconnect_btn.style.display = "block";
        connect_btn.style.display = "none";

        socket = new SockJS('/gs-guide-websocket');
        stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect({}, function (frame) {

            $('.status.connected').show();
            $('.status.disconnected').hide();
            console.log('Connected: ' + frame);
            
            stompClient.subscribe('/stream/snapshots', function (data) {
                showSnapshot(JSON.parse(data.body).content);
            });

        }, function(error) {
            console.log(error);
            
            $('.status.connected').hide();
            $('.status.disconnected').show();
            disconnect();
        });
    }
    
    function disconnect() {
        connect_btn.style.display = "block";
        disconnect_btn.style.display = "none";
        $('.status.connected').hide();
        $('.status.disconnected').show();

        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }
    
    $('#connect').click(function() {
        connect();
    });
    
    $('#disconnect').click(function() {
        disconnect();
    });
    
    function sendSnapshot(data) {
        stompClient.send("/app/snapshot", {}, JSON.stringify({'data': data}));
    }
    
    function showSnapshot(data) {
        received.style.display = "block";
        received.setAttribute('src', data);
    }
    
    /* WebSocket End */
    
    // References to all the element we will need.
    var video = document.querySelector('#camera-stream'),
        image = document.querySelector('#snap'),
        start_camera = document.querySelector('#start-camera'),
        controls = document.querySelector('.controls'),
        take_photo_btn = document.querySelector('#take-photo'),
        delete_photo_btn = document.querySelector('#delete-photo'),
        download_photo_btn = document.querySelector('#download-photo'),
        error_message = document.querySelector('#error-message');


    // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
    navigator.getMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);


    if(!navigator.getMedia){
        displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
    }
    else{

        // Request the camera.
        navigator.getMedia(
            {
                audio: false,
                // video: true
                video: {
                    width: { max: 320 },
                    height: { max: 240 },
                }
            },
            // Success Callback
            function(stream){

                // Create an object URL for the video stream and
                // set it as src of our HTLM video element.
                video.src = window.URL.createObjectURL(stream);

                // Play the video element to start the stream.
                video.play();
                video.onplay = function() {
                    showVideo();
                };
         
            },
            // Error Callback
            function(err){
                displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
            }
        );

    }
    
    // Mobile browsers cannot play video without user input,
    // so here we're using a button to start it manually.
    start_camera.addEventListener("click", function(e){

        e.preventDefault();

        // Start video playback manually.
        video.play();
        showVideo();

    });
    
    take_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        var snap = takeSnapshot();
        
        sendSnapshot(snap);
        
        // alert(snap);

        // Show image. 
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Enable delete and save buttons
        delete_photo_btn.classList.remove("disabled");
        download_photo_btn.classList.remove("disabled");

        // Set the href attribute of the download button to the snap url.
        download_photo_btn.href = snap;

        // Pause video playback of stream.
        video.pause();
    });
    
    delete_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();
    });
    
    function showVideo(){
        // Display the video stream and the controls.

        hideUI();
        video.classList.add("visible");
        controls.classList.add("visible");
    }


    function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.  

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {
            
            // Resize canvas
            
            

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }
    
    /* Stream canvas video via WS
    var canvas = document.querySelector('canvas');
    var ctx    = canvas.getContext('2d');
    
    video.addEventListener('play', function () {
        var $this = this; //cache
        var width = video.videoWidth,
            height = video.videoHeight;
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage(video, 0, 0, width, height);
                sendSnapshot( canvas.toDataURL('image/png') );
                // setTimeout(loop, 1000 / 30); // drawing at 30fps
                setTimeout(loop, 1000 / 15); // drawing at 30fps
            }
        })();
    }, 0);
    */

    function displayErrorMessage(error_msg, error){
        error = error || "";
        if(error){
            console.error(error);
        }

        error_message.innerText = error_msg;

        hideUI();
        error_message.classList.add("visible");
    }

   
    function hideUI(){
        // Helper function for clearing the app UI.

        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        snap.classList.remove("visible");
        error_message.classList.remove("visible");
    }
});