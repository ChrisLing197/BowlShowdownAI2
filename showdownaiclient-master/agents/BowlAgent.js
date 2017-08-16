'use strict';

var Pokemon = require('../zarel/battle-engine').BattlePokemon;
var BattleSide = require('../zarel/battle-engine').BattleSide;

class BowlAgent{
	constructor(){
		this.name="Bowl";
		this.enemyTeam=[];
		this.currentEnemy=-1;
		this.prevEnemy=-1;
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

   	evaluateState(state, prevState){

   		var myp = state.sides[state.me].active[0].hp / state.sides[state.me].active[0].maxhp;
        var thp = state.sides[1 - state.me].active[0].hp / state.sides[1 - state.me].active[0].maxhp;
        var prevMyP=prevState.sides[prevState.me].active[0].hp / prevState.sides[prevState.me].active[0].maxhp;
        var prevThP=prevState.sides[1-prevState.me].active[0].hp / prevState.sides[1-prevState.me].active[0].maxhp;

        var mygotStatus=0;
        if(state.sides[state.me].active[0].status!=''&&prevState.sides[prevState.me].active[0].status==''){
        	if(state.sides[state.me].active[0].status=='brn'){
        		if(state.sides[state.me].active[0].stats.atk>=state.sides[state.me].active[0].stats.spa){
        			mygotStatus=3;
        		}
        		if

        	}
        }

   	}

    getOptions(state, player) {
        if (typeof (player) == 'string' && player.startsWith('p')) {
            player = parseInt(player.substring(1)) - 1;
        }
        return Tools.parseRequestData(state.sides[player].getRequestData());
    }

    getFirst(){
    	
    	for(var i=0;i<this.prevTurn.length;i++){
       		//console.log("thing "+this.prevTurn[i][2]);
       		if(this.prevTurn[i][2]){
       			if(this.prevTurn[i][2].startsWith(this.mySide)){
       				console.log(this.prevTurn[i]);
       				return 1;
       			}
       			else if(this.prevTurn[i][2].startsWith("p")){
       				console.log(this.prevTurn[i]);
       				return 2;
       			}
       		}
       	}
       	return 0;
    }

    getLastOpponentMove(){
    	for(var i=0;i<this.prevTurn.length;i++){
       		//console.log("thing "+this.prevTurn[i][2]);
       		if(this.prevTurn[i][2]){
       			if(!this.prevTurn[i][2].startsWith(this.mySide)&&this.prevTurn[i][2].startsWith("p")){
       				if(this.prevTurn[i][1]=="switch"){
       					return "switch";
       				}
       				else if(this.prevTurn[i][1]=="move"){
       					return this.prevTurn[i][3];
       				}
       				else if(this.prevTurn[i][1]=="cant"){
       					return "cant";
       				}
       			}
       		}
       	}
       	return "snens";
    }

    minimax(gameState, options, mySide, enemyTeam, timeLeft, depth){
    	if(timeLeft<=0 || depth<=0){
    		return 0;
    	}

    	

    }
    /*
    changeMoveFormat(move){
    	move=move.toLowerCase();
    	move=move.split(" ");
    	var temp="";
    	for(var i=0;i<move.length;i++){
    		temp+=move[i];
    	}
    	return temp;
    }
    */
    decide(gameState, options, mySide) {
       	var nstate=gameState.copy();
       	nstate.me = mySide.n;
       	this.mySide = mySide.id;
       	var d = new Date();
       	var n = d.getTime();
      
       //Here for testing purposes
       /*while ((new Date()).getTime() - n < 19500) {

       }*/
       	
       	
       	for(var i=0;i<this.enemyTeam.length;i++){
       		if(this.enemyTeam[i].species==nstate.sides[1-nstate.me].active[0].species){
       			
       			
       			this.currentEnemy=i;
       		}
       	}

       	var first=this.getFirst();
       	
       
       	
       	
       	
       	       	
       	console.log("first is "+first);
       	if(this.prevState){
	       	if(first!=0){
	       		console.log("turn is "+this.prevTurn[0][2]);
	       		var lastMove=this.getLastOpponentMove();
	       		console.log(Tools.getMove(lastMove).priority);
	       		

	       		console.log("the prevChoice is "+this.prevChoice+" and opponent's was "+lastMove);
	       		if(lastMove!="switch"){
	       			if(Tools.getMove(lastMove).priority==Tools.getMove(toId(this.prevChoice.id))){
	       			//	console.log("test of move "+Tools.getMove(toId(this.prevChoice)).name);
	       				console.log("prev speed of ours is "+this.prevState.sides[this.prevState.me].active[0].stats.spe);
	       				console.log("prev speed of enemy is "+this.enemyTeam[this.prevEnemy].stats.spe);
	       				var ourBoosts=this.prevState.sides[this.prevState.me].active[0].boosts;
	       				var enBoosts=this.enemyTeam[this.prevEnemy].boosts;
	       				if(first==1&&this.prevState.sides[this.prevState.me].active[0].getStat('spe',false,false)<this.enemyTeam[this.prevEnemy].getStat('spe',false,false)){

	       					this.enemyTeam[this.prevEnemy].stats.spe=this.prevState.sides[this.prevState.me].active[0].stats.spe-1;
	       				}
	       				if(first==2&&this.prevState.sides[this.prevState.me].active[0].getStat('spe',false,false)>this.enemyTeam[this.prevEnemy].getStat('spe',false,false)){
	       					this.enemyTeam[this.prevEnemy].stats.spe=this.prevState.sides[this.prevState.me].active[0].stats.spe+1;
	       				}

	       			}
	       			if(lastMove!="cant"&&lastMove!="slp"){
	       				lastMove=Tools.getMove(lastMove);

	       			}
	       			
	       		}
	       		else if(lastMove=="snens"){
	       			throw new Error("Something went badly snens!");
	       		}
	       	}
       	}

       	nstate.sides[1-nstate.me].active[0]=this.enemyTeam[this.currentEnemy];
       	var choice = this.fetch_random_key(options);
       	//console.log("the choice is "+choice);
      	this.prevEnemy=this.currentEnemy;
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

        this.enemyTeam.push(basePokemon)
        return basePokemon;
    }
    digest(line) {
    	line=line.split("|");
    	//console.log("line "+line);
    	this.prevTurn.push(line);
    	//console.log("thing "+this.prevTurn[0])
    }

    getTeam(format) {
    	//throw new Error("Something went kek badly snens!");
    }
    /*
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
    */
}

exports.Agent=BowlAgent;