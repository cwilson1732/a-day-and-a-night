Crafty.c('DialogBox', {	
	
	init: function() {		
		this.requires('2D, Canvas, Image, Text')			
			.image(gameUrl + '/assets/images/message-window.png')
			.attr({
				z: 999,
				// Initialized here? w/h values are not set, sadly.
				// Hence, hard-coding. Sorry, old bean.		
				w: Game.view.width, h: Game.view.height / 4
			});
			
		this.text = Crafty.e('2D, DOM, Text')			
			.textFont({size: '24px'})
			.textColor('FFFFFF')
			.attr({ w: Game.view.width - 32, z: 999 });
		
		this.avatar = Crafty.e('2D, Canvas, Image')
			.attr({
				x: 11, y: 11, alpha: 0, z: this.z + 1,
				w: 128, h: 128 ////////// hard-coded
			})
		
		this.reposition();
		
		// Stay within the viewport. This fails on really small maps.			
		this.bind('ViewportScroll', function() {
			this.reposition()
		});
		
		this.bind('KeyDown', function(e) {
			if (typeof(closeNextKeyPress) != 'undefined' && e.key == Crafty.keys.SPACE) {
				this.close();
                delete this;
            }
		});
		
		this.bind('EnterFrame', function() {
			// 6 tiles squared
			var limit = 6 * 6 * Game.currentMap.tile.width * Game.currentMap.tile.height;
			if (this.source != null) {
				var dSquared = Math.pow(this.source.x - player.x, 2) + Math.pow(this.source.y - player.y, 2);								
				if (dSquared >= limit) {					
					this.close();
                    delete closeNextKeyPress;
				}
			}
		});
		
		if (typeof(characters) != 'undefined') {
			this.characters = characters();
		}
	},
	
	message: function(obj) {
		var self = this;
		delete closeNextKeyPress;
		// Only these types of messages are acceptable here:
		// 1) 	String (eg. "Hi mom!")
		// 2) 	Object. It can have an avatar (eg. { avatar: '/images/player.png', message: 'Lick my face?!' },
		// 			and a choice object (eg. { choices: ['Yes', 'No'], responses: ['Me too!', 'Oh, really? I disagree.'] }
		// 3) 	Array of any combination and number of the above
		if (typeof(obj) == 'string') {
			this.text.text(obj);
			this.avatar.attr({ alpha: 0 });
		} else { // object			
			var text = "";
			// Is it a character? A valid one? With an avatar?
			if (typeof(obj.character) != 'undefined') {
				if (typeof(this.characters) != 'undefined') {
					var id = obj.character;				
					if (id in this.characters) {
						var char = this.characters[id];
						if ('avatar' in char) {
							this.avatar.attr({ alpha: 1 });
							this.avatar.image(gameUrl + '/' + char.avatar);
						}
						if ('name' in char) {
							text = char.name + ': ';
						}
					} else {
						throw new Error("characters.js doesn't have a character named " + id);
					}
				} else {
					throw new Error("Dialog specifices a character, but /data/character.js doesn't exist or isn't loaded.");
				}
			}
			
			if (typeof(obj.choices) != 'undefined') {
                awaitingChoice = true;
				// Freeze when making choices
				player.freeze();
				var choices = obj.choices;
				var responses = obj.responses;
				if (choices.length != responses.length) {
					throw new Error("Choices and responses should be equal in number; got " + choices.length + " choices and " + responses.length + " responses.");
				}
				
				var choiceBox = Crafty.e('2D, Canvas, Image')
					.image(gameUrl + '/assets/images/choice-box.png')
					.attr({ x: (Game.view.width - 200) / 2, y: Game.view.height / 4, z: this.z + 1 });
				
				// TODO: less hacks, more codez.
				// At 24px, each line is 17px high, plus 11px space
				// With Y offset of 11, there are 21px above the first line
				// Assuming window is at X, the choices are from:
				// 1) 22-37
				// 2) 49-64
				// n) 21 + 28n
				// Or we could, you know, create one text per item. :)
				var choiceText = Crafty.e('2D, DOM, Text')
					.textFont({size: '24px'})
					.textColor('FFFFFF')
					.text(choices.join('<br />'))
					.attr({x: choiceBox.x + 11, y: choiceBox.y + 11, z: choiceBox.z + 2})
					.attr({w: choiceBox.w - 32, h: choiceBox.h - 32 });
					
				// Fix issue where you pressing space to show the choices, and
				// the first choice is automatically picked.
				var chose = false; 
				
				var selectionBox = Crafty.e('2D, Canvas, Color')
					.color('rgb(192, 225, 255)')
					// 26, not 24, because we pad by 2px.
					// Other places, 28, pad by 4 (2 + 2)
					.attr({x: choiceText.x - 2, y: choiceText.y, z: choiceText.z - 1 })
					.attr({w: choiceText.w + 4, h: 26 })
					.bind('KeyUp', function(e) {												
						if (e.key == Crafty.keys.UP_ARROW && selectionBox.y > choiceText.y) {
							selectionBox.y -= 28;							
						} else if (e.key == Crafty.keys.DOWN_ARROW && selectionBox.y + 26 <= choiceText.y + 21 + (28 * (choices.length - 1))) {
							selectionBox.y += 28;							
						} else if (e.key == Crafty.keys.SPACE) {					
							if (chose) {								
								var n = Math.floor((selectionBox.y - choiceBox.y) / 26);
								var decided = choices[n];

								player.unfreeze();
								choiceBox.destroy();
								choiceText.destroy();
								selectionBox.destroy();
								
								self.message(responses[n]);
								self.closeNextKeyPress = true;
                                delete awaitingChoice;
							} else { 
								chose = true;								
							}
						}
					});		
			}
			
			text += obj.text;
			this.text.text(text);									
		}
		this.alpha = 1;
		this.reposition(this.x, this.y);
	},
	
	setSource: function(npc, x, y) {
		// Changed conversations, maybe in the middle ...
		if (this.source != null && this.source.npc != npc) {
			delete conversationIndex;
		}
		this.source = { npc: npc, x: x, y: y };
	},
	
	reposition: function() {
		if (this.alpha == 1) {
			var x = -Crafty.viewport.x;
			var y = -Crafty.viewport.y;
			
			// Don't go off the screen (top/left)
			x = Math.max(0, x);
			y = Math.max(0, y);
			
			// Don't go off the screen (bottom/right)			
			x = Math.min(Game.width() - this.w, x);			
			y = Math.min(Game.height() - this.h - (Game.view.height - this.h), y);

			this.x = x;
			this.y = Game.view.height - this.h + y;
						
			this.text.x = this.x + 11;
			this.text.y = this.y + 11;
			this.text.w = this.w - 32;
			
			if (this.avatar.alpha > 0) {
				this.text.x += (this.avatar.w + 11);
				this.text.w -= (this.avatar.w + 11);
			}
			
			this.avatar.x = this.x + 11;
			this.avatar.y = this.y + 11;
		}
	},
	
	close: function() {
		this.text.text('');
		this.alpha = 0;
		this.avatar.alpha = 0;
		this.source = null;		
		// If it was a conversation, forget the conversation
		delete conversationIndex;        
	}
});