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
		this.prevTurn=[];
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

    getOptions(state, player) {
        if (typeof (player) == 'string' && player.startsWith('p')) {
            player = parseInt(player.substring(1)) - 1;
        }
        return Tools.parseRequestData(state.sides[player].getRequestData());
    }

    decide(gameState, options, mySide) {
       	var nstate=gameState.copy();
       	nstate.me = mySide.n;
       	this.mySide = mySide.id;
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
       //console.log(nstate.p1.getChoice)
       //console.log("This is the opponent's moves "+nstate.sides[1-nstate.me].active[0].moves);
      // console.log("Our pokemon is a  "+nstate.sides[nstate.me].active[0].name+" with stats of "+nstate.sides[nstate.me].active[0].set.evs.def);
       //console.log("This pokemon is a "+nstate.sides[1-nstate.me].active[0].name+" of level "+nstate.sides[1-nstate.me].active[0].set.level+" with def evs of "+nstate.sides[1-nstate.me].active[0].set.evs.def+" with base stats of "+nstate.sides[1-nstate.me].active[0].baseStats.def+" with stats of "+nstate.sides[1-nstate.me].active[0].stats.def);



       //Here for testing purposes
       /*while ((new Date()).getTime() - n < 19500) {

       }*/
       
       	var first=0;
       	var test=true;
       //console.log("my side "+this.mySide);
       	for(var i=0;i<this.prevTurn.length;i++){
       		//console.log("thing "+this.prevTurn[i][2]);
       		if(this.prevTurn[i][2]){
       			if(this.prevTurn[i][2].startsWith(this.mySide)&&first==0){
       				first=1;
       			}
       			else if(this.prevTurn[i][2].startsWith("p")&&first==0){
       				first=2;
       			}
       			test=false;
       		}
       	}
       	if(first==0){
       		console.log("turn is "+this.prevTurn[0][2]);
       		console.log(test);
       	}
       	console.log("first is "+first);
       	var choice = this.fetch_random_key(options);
       	console.log("the choice is "+choice);
      // console.log("the prevChoice is "+this.prevChoice);
      	this.prevChoice=choice;
    	this.prevState=nstate;
      	this.prevTurn=[];
     	return choice;
    }

    assumePokemon(pname, plevel, pgender, side) {
        var template = Tools.getTemplate(pname);
        var nSet = {
            species: pname,
            name: pname,
            level: plevel,
            gender: pgender,
            evs: { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            nature: "Hardy",
            moves: []
        };
        for (var moveid in template.randomBattleMoves) {
            nSet.moves.push(toId(template.randomBattleMoves[moveid]));
        }
        var basePokemon = new Pokemon(nSet, side);
       // console.log("This is assumePokemon on "+nSet.name);
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
    	line=line.split("|");
    	//console.log("line "+line);
    	this.prevTurn.push(line);
    	//console.log("thing "+this.prevTurn[0])
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
            nature: "Hardy",
            moves:[]
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