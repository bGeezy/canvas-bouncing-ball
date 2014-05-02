(function(){

	var app = document.getElementById("app").getContext("2d"),
	    add = document.getElementById("add"),
	    rem = document.getElementById("remove"),
	    adj = document.getElementById("adjust"),
	    clr = document.getElementById("clear"),
       page = window.webkitRequestAnimationFrame,
   selected = false,
	  mouse = { x:0, y:0, down:false },
	  balls = [],
	   ball = null;
	   size = 50;

	/*
		Set Up Ball Properties
	*/

	//Define Ball Class
	function Ball(x,y){
		this.radius = size;
		this.surface = size*size;
		this.bounce = 0.8;
		this.friction = 0.99;
		this.velocity = { x:0, y:0 };
		this.gravity = { x:0, y:0.5 };
		this.last = { x: x || 0, y: y || 0 };
		this.x = this.last.x;
		this.y = this.last.y;
		this.active = true;
	}
	//Prepare the balls current speed and velocity
	Ball.prototype.prepareSpeed = function(){
		if(!this.active) return;
		this.velocity.x += this.gravity.x;
		this.velocity.y += this.gravity.y;
		this.last.x += this.velocity.x;
		this.last.y += this.velocity.y;
		//Prepare all vertical parameters
		if( this.last.y > app.canvas.height-this.radius ){
			this.velocity.y*=-this.bounce;
			this.velocity.x*=this.friction;
			this.last.y = app.canvas.height-this.radius;
		}else if(this.last.y < this.radius){
			this.velocity.y*=-this.bounce;
			this.last.y = this.radius;
		}
		//Prepare all horizontal parameters
		if( this.last.x > app.canvas.width-this.radius ){
			this.velocity.x*=-this.bounce;
			this.last.x = app.canvas.width-this.radius;
		}else if(this.last.x < this.radius){
			this.velocity.x*=-this.bounce;
			this.last.x = this.radius;
		}
	};
	//Render the ball instance
	Ball.prototype.render = function(){
		this.x = this.last.x;
		this.y = this.last.y;
		this.gradient = app.createLinearGradient(0,600,0,0);
		this.gradient.addColorStop(0,"orange");
		this.gradient.addColorStop(1,"red");
		app.fillStyle = this.gradient;
		app.beginPath();
		app.arc(this.x,this.y,this.radius,0,2*Math.PI);
		app.fill();
		app.stroke();
		app.closePath();
	};
	//Determine whether ball has been selected
	Ball.prototype.covered = function(x,y){
		return Math.pow((x-this.x),2) + Math.pow((y-this.y),2) <= this.surface;
	};
	//Calculate velocity based on distance between click starts and stops  
	Ball.prototype.distance = function(x,y){
		return Math.sqrt((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y));
	};
	//Calculate direction between origin and new destination
	Ball.prototype.angle = function(x,y){
		return Math.atan2(x-this.x,y-this.y)+(90*Math.PI/180);
	};
	/*End Ball (inherited) properties*/

	/*
		Begin App (game) methods
	*/

	//Scrub canvas between frames 
	function cleanFrame(c){
		c = c || "white";
		app.fillStyle = c;
		app.fillRect(0,0,app.canvas.width,app.canvas.height);
	}
	//Update trajectory of ball clicked on
	function updateBalls(){
		for(var i=0;i<balls.length;i++){
			var b = balls[i];
			if( mouse.down && b.covered(mouse.x,mouse.y) && ball === null){
				ball = b;
				selected = true;
				b.active = false;
			}
			b.prepareSpeed();
		}
	}
	//Render canvas frames for each individual ball 
	function renderBalls(){
		for(var i=0;i<balls.length;i++){
			var b = balls[i];
			b.render();
		}
	}
	//App runs forces against balls and listens for balls to change movement for 
	function loop(){
		//Sync to browser animation API for Chrome
		page(loop);
		updateBalls();
		
		if(!mouse.down && selected && ball!==null){
			selected = false;
			var angle = ball.angle(mouse.x,mouse.y);
			ball.velocity.x = Math.cos(angle)*(-(ball.distance(mouse.x,mouse.y)*0.1));
			ball.velocity.y = Math.sin(angle)*((ball.distance(mouse.x,mouse.y)*0.1));
			ball.active = true;
			ball = null;
		}

		cleanFrame();
		renderBalls();

	}
	//Add new ball per assignment bonus
	function addBall () {
		balls[balls.length] = new Ball(app.canvas.width/1,app.canvas.height/4);
		ball = balls[balls.length-1];
		ball.active = false;
		selected = true;
	}
	//Removes ball per assignment bonus
	function removeBall () { balls.pop(); }

	//Updates the ball sizes 
	function clearAll () { balls = []; }

	//Updates the ball sizes 
	function updateSize (size) { this.size = parseFloat(adj.value); }

	//Setup listeners and set/resize app size the same as window
	function initialize(){
		app.canvas.width = window.innerWidth;
		app.canvas.height = window.innerHeight;

		window.onresize = function(){
			app.canvas.width = window.innerWidth;
			app.canvas.height = window.innerHeight;
		};
		//Add First Ball
		balls[balls.length] = new Ball(app.canvas.width/2,app.canvas.height/7);
		//Register Event Listeners
		add.addEventListener('click', function(event) {  addBall(); });
		rem.addEventListener('click', function(event) {  removeBall(); });
		clr.addEventListener('click', function(event) {  clearAll(); });
		adj.addEventListener('click', function(event) {  updateSize(size); });
		app.canvas.addEventListener('mouseup', function(event) {  mouse.down = false; });
		app.canvas.addEventListener('mousedown', function(event) { mouse.down = true; });
		app.canvas.addEventListener('mousemove', function(event) {
			mouse.x = event.clientX-app.canvas.offsetLeft;
			mouse.y = event.clientY-app.canvas.offsetTop;
		});

		loop();
	}
	/*End App Methods*/

	/*Begin App once everythings loaded*/
	window.onload = initialize();

})();