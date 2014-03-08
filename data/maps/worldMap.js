function worldMap() {
	var map = {		
		width:  30,
		height: 20,
		
		tile: {
			width:  32,
			height: 32
		},
		
		background: 'world_grass',
		
		audio: 'outside',		
		perimeter: 'world_wall',
		
		objects: [
			{
				type: 'Npc',
				sprite: 'sprite_npc2',
				messages: [[ { text: 'Do you like apples?', avatar: "assets/images/old-man-avatar.png" },  {
					avatar: "assets/images/old-man-avatar.png",
					text: "Well? Speak up!",
					choices: ['Yes', 'No'],
					responses: ['Me too!', 'Oh, really? Hmm.']
				} ]],
				x: 8, y: 8
			},
			{
				type: '2D',
				components: 'Actor, Interactive',
				sprite: 'sprite_mushroom',
				x: 2, y: 1,				
				messages: [
					[{ avatar: 'assets/images/main-character.png', text: '... A mushroom? Growing here, near the borders of the town? ... Hmm ...' },
					"Mushroom: BITE ME!",
					{ avatar: 'assets/images/main-character.png', text: '?!' }]
				],
				initialize: function(me, player) {					
					me.interact = me.talk;
				}				
			},
			{
				type: 'WalkingNpc',
				sprite: 'sprite_npc1',				
				x: 18, y: 11,
				velocity: { x: 90, y: 0 },
				onTalk: function() {
					var store = new SessionStore();
					var times = store.get('times_talked');
					if (times == null) {
						times = { times: 0 };
					}
					times.times += 1;					
					store.set('times_talked', times);
					return 'You talked to me ' + times.times + ' times!';
				}
			},
			{
				type: 'Npc',
				sprite: 'sprite_chicken_white',				
				x: 18, y: 18,	
				components: 'PositionalAudio',				
				initialize: function(me, player) {
					me.PositionalAudio('chicken', 5, player);
					me.play();
				}
			},
			{
				type: 'Npc',
				sprite: 'sprite_chicken_red',				
				x: 20, y: 15,	
				components: 'PositionalAudio',				
				initialize: function(me, player) {
					me.PositionalAudio('chicken2', 5, player);
					me.play();
				}
			},
			{
				range: { start: { x: 6, y: 10 }, end: { x: 16, y: 14 } },
				type: '2D, Actor, Solid, world_tree'
			},
			{
				range: { start: { x: 6, y: 15 }, end: { x: 10, y: 15 } },
				type: '2D, Actor, Solid, world_tree'
			},
			{
				range: { start: { x: 12, y: 15 }, end: { x: 16, y: 15 } },
				type: '2D, Actor, Solid, world_tree'
			},
			{
				type: 'Door',				
				x: 11,
				y: 15,
				initialize: function(me, player) {
					me.transitionsTo('house1', 3, 3);					
				}
			}
		]
	};
	
	return map;
}
