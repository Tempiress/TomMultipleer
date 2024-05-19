import Tomato from './Tomato.js';
import Bombs from './TomBombs.js';
import TomatoItem from './TomatoItem.js';

class Play extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'Play'});
    }

    init ()
    {
        this.scene.launch('UI');
    }

    create ()
    {   
        var self = this;
        self.tomato = null;
        this.socket = io();
        this.otherPlayers = this.physics.add.group();
        
        this.add.image(0, 0, 'background').setOrigin(0);
        this.wall_floor = this.physics.add.staticGroup();
        this.wall_floor.create(0, 0, 'wall').setOrigin(0);
        this.wall_floor.create(this.scale.width, 0, 'wall').setOrigin(1, 0).setFlipX(true);
        this.wall_floor.create(0, this.scale.height, 'floor').setOrigin(0, 1);
        this.wall_floor.refresh();
        this.wall_floor.getChildren()[2].setOffset(0, 15);

        //this.PlayersText.setText('AABBB');
        this.PlayersText = this.add.text(520, 30, "", {fontSize: '32px', fill: '#172547'});
        
          // Bombs
        this.bombsGroup = new Bombs({
            physicsWorld: this.physics.world,
            scene: this
        });

        // Items
        this.itemsGroup = new TomatoItem({
            physicsWorld: this.physics.world,
            scene: this
        });

        this.physics.add.collider(this.bombsGroup, this.wall_floor);


        //Получаем информацию о текущих игроках от сервера
        this.socket.on('currentPlayers', function(players){
            //Обновляем отображение всех текущих игроков
            console.log("My socket", self.socket.id);
            Object.keys(players).forEach(function(id)
            {   
                
                //Код для создания спрайта игрока на основе данных из players[id]
                if (players[id].playerId === self.socket.id)
                {   
                    console.log("addPlayer: ", players[id]);
                    this.
                    addPlayer(self, players[id]);
                }else
                {   
                    console.log("AddOtherPlayer: ", players[id]);
                    addOtherPlayers(self, players[id]);
                }
            });
        });
        

         this.socket.on('newPlayer', function(playerInfo){
            addOtherPlayers(self, playerInfo);
         });

        this.socket.on('playerDisconnect', function(playerId){
            console.log("PlayerId:", playerId);
            self.otherPlayers.getChildren().forEach(function(otherPlayer)
            {
                console.log("otherPlayer:", otherPlayer.playerId);
                if(playerId === otherPlayer.playerId)
                {   
                    console.log("Player was deleted!");
                    otherPlayer.destroy();
                }
            });
        });


        this.socket.on('playerMoved', function(playerInfo){

            self.otherPlayers.getChildren().forEach(function(otherPlayer){

                if(playerInfo.playerId === otherPlayer.playerId)
                {   
                    console.log("Player Moved: ", playerInfo.playerId);
                    otherPlayer.setRotation(0);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        

    function addPlayer(self, playerInfo)
    {
        // Персонаж
        self.tomato = new Tomato({
            scene: self,
            x: playerInfo.x,
            y: playerInfo.y,
        });

        self.physics.add.collider([self.tomato, self.bombsGroup], self.wall_floor);
        self.physics.add.overlap(self.tomato, self.bombsGroup, () => {
        self.tomato.bombCollision();
        });

        self.physics.add.overlap(self.itemsGroup, self.tomato, () => {
            self.sound.play('pop');
            self.registry.events.emit('update_points');
            self.itemsGroup.destroyItem();
            self.bombsGroup.addBomb();       
        });

    }


    function addOtherPlayers(self, playerInfo)
    {

        // Персонаж
        self.tomato = new Tomato({
            scene: self,
            x: playerInfo.x,
            y: playerInfo.y,
        });
   
        self.physics.add.collider([self.tomato, self.bombsGroup], self.wall_floor);
        self.physics.add.overlap(self.tomato, self.bombsGroup, () => {
            self.tomato.bombCollision();
        });
        
        self.physics.add.overlap(self.itemsGroup, self.tomato, () => {
            self.sound.play('pop');
            self.registry.events.emit('update_points');
            self.itemsGroup.destroyItem();
            self.bombsGroup.addBomb();               
        });

        const otherPlayer = self.tomato;
        otherPlayer.playerId = playerInfo.playerId;
        console.log("NEW PLAYER!:", playerInfo.playerId);
        self.otherPlayers.add(otherPlayer); 

    }


    }

    update ()
    {       
        if(this.tomato != null )//&& this.tomato)
            {
                this.tomato.update(this.socket); 
            }
        
        this.bombsGroup.update();
        
    }
}

export default Play;




        //this.RandomText = this.add.text(35, 16, 'How Are You?', {fontSize: '32px', fill: '#0000FF'});

        

