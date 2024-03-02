import Phaser from "phaser";

class GameScene extends Phaser.Scene {
  /**
   * Load any assets you might need here!
   */
  preload() {
    this.load.spritesheet("player", "assets/player2.png", {
      frameWidth: 20,
      frameHeight: 20,
    })

    this.load.image("wallHorizontal", "assets/wallHorizontal.png");
    this.load.image("wallVertical", "assets/wallVertical.png");

    this.load.image("coin", "assets/coin.png");
    // TODO 1: load the enemy image from "assets/enemy.png" into "enemy"
    this.load.image("enemy", "assets/enemy.png")
    // TODO 6.1: load in the audio for 'jump', 'coin', and 'dead'
    this.load.audio("jump", ["assets/jump.ogg", "assets/jump.mp3"]);
    this.load.audio("coin", ["assets/coin.ogg", "assets/coin.mp3"]);
    this.load.audio("dead", ["assets/dead.ogg", "assets/dead.mp3"]);
    //load the tileset image
    this.load.image("tileset", "assets/tileset.png");
    //load the tiled tilemap JSON
    this.load.tilemapTiledJSON("map", "assets/map.json")

  }

  /**
   * Called once. Create any objects you need here!
   */
  create() {
    // create the player sprite
    this.player = this.physics.add.sprite(this.game.config.width/2, this.game.config.height/2,"player");

    // TODO 7: add the player movement animations!
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { frames: [1, 2] }),
      framteRate: 8,
      repeat: -1, //repeat indefinitely
    })
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { frames: [3, 4] }),
      framteRate: 8,
      repeat: -1, //repeat indefinitely
    })
    // add gravity to make the player fall
    this.player.body.gravity.y = 500;

    // create arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    this.createWalls();

    // Make the player collide with walls
    this.physics.add.collider(this.player, this.walls);

    this.coin = this.physics.add.sprite(60, 130, "coin");

    // Display the score
    this.scoreLabel = this.add.text(30, 25, "score: 0", {
      font: "18px Arial",
      fill: "#ffffff",
    });

    this.score = 0;

    // TODO 2.1: create an instance variable called 'enemies' that is a new physics group!
    this.enemies = this.physics.add.group();
    // TODO 2.2: add a new enemy every 2.3 seconds
    this.time.addEvent({
      delay: 2300, //in ms
      callback: () => this.addEnemy(),
      loop: true, //boolean value true or false, whether we should repeat this code
    })

    // TODO 3.3: make the enemies and walls collide!
    //let means it can be muated, but const means it is constant
    this.physics.add.collider(this.enemies, this.walls)

    // TODO 5.1: if the player collides with an enemy, kill the player!
    this.physics.add.collider(this.player, this.enemies, () => { this.handlePlayerDeath() })
    // TODO 6.2: add jumpSound, coinSound, and deadSound as instance variables!
    this.jumpSound = this.sound.add("jump");
    this.coinSound = this.sound.add("coin");
    this.deadSound = this.sound.add("dead");
  }

  /**
   * Creates the walls of the game
   */
  createWalls() {
    //this.walls = this.physics.add.staticGroup();

    //this.walls.create(10, 170, "wallVertical"); // Left
    //this.walls.create(490, 170, "wallVertical"); // Right

    //this.walls.create(50, 10, "wallHorizontal"); // Top left
    //this.walls.create(450, 10, "wallHorizontal"); // Top right
    // this.walls.create(50, 330, "wallHorizontal"); // Bottom left
    // this.walls.create(450, 330, "wallHorizontal"); // Bottom right

    // this.walls.create(0, 170, "wallHorizontal"); // Middle left
    // this.walls.create(500, 170, "wallHorizontal"); // Middle right
    // this.walls.create(250, 90, "wallHorizontal"); // Middle top
    // this.walls.create(250, 250, "wallHorizontal"); // Middle bottom
    // create tilemap
    let map = this.add.tilemap("map");
    // add tileset to the map
    let tileset = map.addTilesetImage("tileset", "tileset")
    this.walls = map.createLayer("Level 1", tileset);
    //enable collision to prvent them from going through walls
    this.walls.setCollision(1);
  }

  /**
   * Phaser calls this function once a frame (60 times a second).
   *
   * Use this function to move the player in response to actions,
   * check for win conditions, etc.
   */
  update() {
    this.movePlayer();
    this.checkCoinCollisions();

    // TODO 5.2: if the player goes out of bounds, kill the player
    if (this.player.y > this.game.config.height || this.player.y < 0) {
      this.handlePlayerDeath();
    }
  } s

  /**
   * Handles moving the player with the arrow keys
   */
  movePlayer() {
    // TODO 8: update movePlayer() to play the movement animations!
    // check for active input
    if (this.cursors.left.isDown) {
      // move left
      this.player.body.velocity.x = -200;
      // TODO 8.1: play the 'left' animation
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      // move right
      this.player.body.velocity.x = 200;
      // TODO 8.2: play the 'right' animation
      this.player.anims.play("right", true);
    } else {
      // stop moving in the horizontal
      this.player.body.velocity.x = 0;
      // TODO 8.3: set the player sprite to the 'still' frame!
      this.player.setFrame(0);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      // jump if the player is on the ground
      this.player.body.velocity.y = -320;
      // TODO 6.3: play jumpSound on jump
      this.jumpSound.play()
    }
  }

  /**
   * Check to see whether the player has collided with any coins
   */
  checkCoinCollisions() {
    if (this.physics.overlap(this.player, this.coin)) {
      // the player has taken a coin!
      // add 5 to the score
      this.score += 5;
      // update the score label
      this.scoreLabel.setText("score: " + this.score);
      // move the coin to a new spot
      this.moveCoin();

      // TODO 6.4: play the coin sound!
      this.coinSound.play();
    }
  }

  /**
   * Move the coin to a different random location
   */
  moveCoin() {
    // these are the possible positions the coin can move to
    let positions = [
      { x: 120, y: 135 },
      { x: 120, y: 295 },
      { x: 120, y: 455 },
      { x: 680, y: 135 },
      { x: 680, y: 295 },
      { x: 680, y: 455 },
    ];

    // don't move to the same location it was already at
    positions = positions.filter(
      (p) => !(p.x === this.coin.x && p.y === this.coin.y),
    );

    let newPosition = Phaser.Math.RND.pick(positions);
    this.coin.setPosition(newPosition.x, newPosition.y);
    this.coin.setScale(0);

    this.coin.setPosition(newPosition.x, newPosition.y);
    // TODO 9: add tweens for the coin & player!
    this.tweens.add({
      targets: this.coin,
      scale: 1,
      duration: 300, //in ms
    });
    this.tweens.add({
      targets: this.player,
      scale: 1.3,
      duration: 100, //in m/s
      yoyo: true, //performs the tween forward and backward 
    });

  }

  // TODO 3: Implement addEnemy()!
  /**
   * Create a new enemy
   */
  addEnemy() {
    // TODO 3.1: Create the enemy sprite at (250, -10), and store this in a variable called 'enemy'
    // hint: how did we create our walls at a specific coordinate?
    let enemy = this.enemies.create(this.game.config.width/2, -10, "enemy");

    // TODO 3.2: add gravity to the enemy to make it fall! use the same gravity as the player
    enemy.body.gravity.y = 500;
    // TODO 3.4: randomly make the enemy move left or right, with a velocity of -200 or 200!
    // hint: use Phaser.Math.RND.pick(array of options)
    enemy.body.velocity.x = Phaser.Math.RND.pick([200, -200])

    // TODO 3.5: make the enemy bounce back when it hits a wall!
    // when an enemy hits a wall, we want it to bounce back 
    // in the opposite direction without losing speed
    enemy.body.bounce.x = 1;
    // TODO 3.6: destroy the enemy after 15 seconds, using enemy.destroy()!
    // this is roughly how long it takes to fall through the hole
    // hint: what did we use to create the enemy every 2.2 seconds?
    this.time.addEvent({
      delay: 15000, //in ms
      callback: () => enemy.destroy(), //function that happens after delay
      loop: false, //do not exactly need this line bc automatically false

    })

  }

  // TODO 4: Implement handlePlayerDeath()!
  /**
   * Called when the player dies. Restart the game
   */
  handlePlayerDeath() {
    // TODO 4.1: restart the scene
    this.scene.restart();
    // TODO 4.2: log to the console that we died :(((
    console.log('TO BE or NOT TO BE- that is ze question')
    // TODO 6.5: play the death sound!
    this.deadSound.play();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 560,
  scene: GameScene,
  physics: {
    default: "arcade",
  },
  backgroundColor: "#3498db",
};

const game = new Phaser.Game(config);
