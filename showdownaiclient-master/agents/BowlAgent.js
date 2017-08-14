'use strict';

var Pokemon = require('../zarel/battle-engine').BattlePokemon;
var BattleSide = require('../zarel/battle-engine').BattleSide;

class BowlAgent{
	constructor(){
		this.name="Bowl";
		this.enemyTeam=[];
		this.currentEnemy=-1;
		this.prevChoice=null;
		this.prevState=null;
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
       //var b=true;
       /*for(var i=0;i<this.enemyTeam.length;i++){
       		if(this.enemyTeam[i].species==nstate.sides[1-nstate.me].active[0].species){
       			b=false;
       			this.currentEnemy=i;
       		}
       }*/
       /*
       if(b){
       		this.currentEnemy=this.enemyTeam.length;
       		this.enemyTeam.push(nstate.sides[1-nstate.me].active[0]);

       }
       */
       
       console.log("Our pokemon is a  "+nstate.sides[nstate.me].active[0].name+" with stats of "+nstate.sides[nstate.me].active[0].set.evs.def);
       console.log("This pokemon is a "+nstate.sides[1-nstate.me].active[0].name+" of level "+nstate.sides[1-nstate.me].active[0].set.level+" with def evs of "+nstate.sides[1-nstate.me].active[0].set.evs.def+" with base stats of "+nstate.sides[1-nstate.me].active[0].baseStats.def+" with stats of "+nstate.sides[1-nstate.me].active[0].stats.def);



       //Here for testing purposes
       /*while ((new Date()).getTime() - n < 19500) {

       }*/
       var choice = this.fetch_random_key(options);
       this.prevChoice=choice;
       this.prevState=nstate;
       return choice;
    }

    assumePokemon(pname, plevel, pgender, side) {
        var nSet = {
            species: pname,
            name: pname,
            level: plevel,
            gender: pgender,
            evs: { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 },
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
        //this.enemyTeam.push(basePokemon)
        return basePokemon;
    }
    digest(line) {
    }

    getTeam(format) {
    }

    updatePokemon(pname, plevel, pgender, side, hp, atk, def, spA, spD, spe, item, ability){
    	var nSet = {
            species: pname,
            name: pname,
            level: plevel,
            gender: pgender,
            evs: { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            nature: "Hardy"
        };
        var basePokemon = new Pokemon(nSet, side);
        basePokemon.stats.hp=hp;
        basePokemon.stats.atk=atk;
        basePokemon.stats.def=def;
        basePokemon.stats.spa=spA;
        basePokemon.stats.spd=spD;
        basePokemon.stats.spe=spe;
        basePokemon.ability=ability;
        basePokemon.abilityData={id: basePokemon.ability};
        return basePokemon;
    }
}

exports.Agent=BowlAgent;