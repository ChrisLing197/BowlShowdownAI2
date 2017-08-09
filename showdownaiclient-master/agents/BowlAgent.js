'use strict';

var Pokemon = require('../zarel/battle-engine').BattlePokemon;
var BattleSide = require('../zarel/battle-engine').BattleSide;

class BowlAgent{
	constructor(){
		this.name="Bowl";
		this.enemyTeam=[];
		this.currentEnemy=-1;

	}

	fetch_random_key(obj) {
        var temp_key, keys = [];
        for (temp_key in obj) {
            if (obj.hasOwnProperty(temp_key)) {
                keys.push(temp_key);
            }
        }
        return keys[Math.floor(Math.random() * keys.length)];
    }

    decide(gameState, options, mySide) {
       var nstate=gameState.copy();
       nstate.me = mySide.n;

       var d = new Date();
       var n = d.getTime();
       /*var b=true;
       for(var i=0;i<enemyTeam.length;i++){
       		if(enemyTeam[i].species==nstate.sides[1-nstate.me].active[0].species){
       			b=false;
       			currentEnemy=i;
       		}
       }
       if(b){
       		currentEnemy=enemyTeam.length;
       		enemyTeam.push(nstate.sides[1-nstate.me].active[0]);

       }
       */
       console.log("Our pokemon is a  "+nstate.sides[nstate.me].active[0].name+" with stats of "+nstate.sides[nstate.me].active[0].set.evs.def);
       console.log("This pokemon is a "+nstate.sides[1-nstate.me].active[0].name+" of level "+nstate.sides[1-nstate.me].active[0].set.level+" with def evs of "+nstate.sides[1-nstate.me].active[0].set.evs.def+" with base stats of "+nstate.sides[1-nstate.me].active[0].baseStats.def+" with stats of "+nstate.sides[1-nstate.me].active[0].stats.def);



       //Here for testing purposes
       /*while ((new Date()).getTime() - n < 19500) {

       }*/
       var choice = this.fetch_random_key(options);
       return choice;
    }

    assumePokemon(pname, plevel, pgender, side) {
        var nSet = {
            species: pname,
            name: pname,
            level: plevel,
            gender: pgender,
            evs: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            nature: "Hardy"
        };
        var basePokemon = new Pokemon(nSet, side);
        console.log("This is assumePokemon on "+nSet.name);
        // If the species only has one ability, then the pokemon's ability can only have the one ability.
        // Barring zoroark, skill swap, and role play nonsense.
        // This will be pretty much how we digest abilities as well
        if (Object.keys(basePokemon.template.abilities).length == 1) {
            basePokemon.baseAbility = toId(basePokemon.template.abilities['0']);
            basePokemon.ability = basePokemon.baseAbility;
            basePokemon.abilityData = { id: basePokemon.ability };
        }
        return basePokemon;
    }
    digest(line) {
    }

    getTeam(format) {
    }
}

exports.Agent=BowlAgent;