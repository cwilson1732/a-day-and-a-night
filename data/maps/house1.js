function house1() {
	var map = {		
		width:  16,
		height: 10,
		
		tile: {
			width:  32,
			height: 32
		},
		
		background: 'indoor_floor',
		
		audio: '',		
		perimeter: 'indoor_wall',
		
		objects: [		
			{
				type: 'Door',				
				x: 1,
				y: 1,
				initialize: function(me, player) {
					me.transitionsTo('worldMap', 11, 16);					
				}
			},
			{
				type: 'Npc',
				sprite: 'sprite_npc3',
				messages: ["Isn't my house awesome?", "Do you like my house?"],
				x: 6, y: 6
			},
		]
	};
	
	return map;
}
