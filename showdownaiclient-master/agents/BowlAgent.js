'use strict';

var Pokemon = require('../zarel/battle-engine').BattlePokemon;
var BattleSide = require('../zarel/battle-engine').BattleSide;
var PriorityQueue = require('priorityqueuejs');



//States are evaluated based on our hp, their hp, our nondamaging status, their nondamaging status, the turn number, and whether we switched or not
function evaluateState(state, player){

    var myp = state.sides[player].active[0].hp / state.sides[player].active[0].maxhp;
    var thp = state.sides[1 - player].active[0].hp / state.sides[1 - player].active[0].maxhp;

    if(thp<=0){
      return 10-0.6*state.turn;
    }
    if(myp<=0){
      return -3-0.6*state.turn;
    }
    var mygotStatus=0;
    /*
    if(state.sides[player].active[0].status=='brn'){
      if(state.sides[player].active[0].stats.atk>=state.sides[player].active[0].stats.spa){
        mygotStatus=2.5;
      }
      else{
        mygotStatus=0.5;
      }
    }
    if(state.sides[player].active[0].status=='tox'){
      mygotStatus=2;
    }
    if(state.sides[player].active[0].status=='psn'){
      mygotStatus=1;
    }
     */
    if(state.sides[player].active[0].status=='slp'){
      if (state.sides[player].active[0].moves.includes(toId(Tools.getMove('sleeptalk')))){
        mygotStatus=0.75;
      }
      else{
        mygotStatus=3;
      }
    }
    //if(state.sides[player].active[0].status=='frz'){
    //  mygotStatus=3;
    //}
    if(state.sides[player].active[0].status=='par'){
      //The amount this is bad is proportional to the pokemon's speed relative to the speeds of opposing pokemon:
      //-Assume unknown enemy pokemon have a speed stat of 170
      var enemyspds=[state.enemyTeam[0].getStat('spe',false,false)];
      for (var i=1; i<state.enemyTeam.length; i++){
        enemyspds.push(state.enemyTeam[i].getStat('spe',false,false));
      }
      for (var i=0; i<6-(state.enemyTeam.length+state.enemiesFainted); i++){
        enemyspds.push(170);
      }
      //-healthyspd=(this pokemon's speed without being paralyzed, including things like choice scarf)
      var healthyspd=state.sides[player].active[0].getStat('spe',false,false)*4;
      var hnumFaster=0;
      //-for each enemy pokemon, if( healthyspd > (enemy pokemon's speed) ) {hnum_slower++;}
      for (var i=0; i<enemyspds.length; i++){
        if (healthyspd > enemyspds[i]){
          hnumFaster++;
        }
      }
      var pnumFaster=0;
      //-for each enemy pokemon, if( healthyspd/4 > (enemy pokemon's speed) ) {pnum_slower++;}
      for (var i=0; i<enemyspds.length; i++){
        if (healthyspd/4 >= enemyspds[i]){
          pnumFaster++;
        }
      }
      var paraimpact=hnumFaster-pnumFaster;
      if (paraimpact==0){
        mygotStatus=0.75;
      }
      else if(paraimpact==1){
        mygotStatus=1.5;
      }
      else if(paraimpact==2){
        mygotStatus=2;
      }
      else if(paraimpact==3){
        mygotStatus=2.5;
      }
      else{
        mygotStatus=3;
      }

    }

    var thgotStatus=0;
    /*
    if(state.sides[1-player].active[0].status=='brn'){
      if(state.sides[1-player].active[0].stats.atk>=state.sides[1-player].active[0].stats.spa){
        thgotStatus=2.5;
      }
      else{
        thgotStatus=0.5;
      }
    }
    if(state.sides[1-player].active[0].status=='tox'){
      thgotStatus=2;
    }
    if(state.sides[1-player].active[0].status=='psn'){
      thgotStatus=1;
    }
     */
    if(state.sides[1-player].active[0].status=='slp'){
      if (state.sides[1-player].active[0].moves.includes(toId(Tools.getMove('sleeptalk')))){
        thgotStatus=0.75;
      }
      else{
        thgotStatus=9;
      }
    }
    //if(state.sides[1-player].active[0].status=='frz'){
    //  thgotStatus=3;
    //}
    if(state.sides[1-player].active[0].status=='par'){
      //If paralyzing the opponent makes us faster when we would normally be slower
      if(state.sides[player].active[0].getStat('spe',false,false)>state.sides[1-player].active[0].getStat('spe',false,false)*4 && state.sides[player].active[0].getStat('spe',false,false)<state.sides[1-player].active[0].getStat('spe',false,false)){
        thgotStatus=9;
      }

      else
      {
        thgotStatus=1;
      }
    }


    return (myp+(thgotStatus/9)+state.thswitch)-(3*thp+(mygotStatus/9)+state.myswitch)-0.6*state.turn;
}



class BowlAgent{
  constructor(){
    this.name="Bowl";
    this.enemyTeam=[];
    this.enemyMoves=[];
    this.currentEnemy=-1;
    this.prevEnemy=-1;
    this.prevChoice=null;
    this.prevState=null;
    this.prevTurn=[];
    this.enemiesFainted=0;
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

  
  //Worst outcome states are averaged to remove states that might have been the result of luck. This minimax agent assumes the opponent chooses the 'best move'
  getWorstOutcome(state, playerChoice, player) {
    var nstate = state.copy();
    var oppChoices = this.getOptions(nstate, 1 - player);
    var worststate = null;
    var worstChoice=null;
    var oldAverage=0;
    var checkTime=5;
    for (var choice in oppChoices) {
      var states=[];
      var average=0;
      for(var i=0;i<checkTime;i++){
        var cstate = nstate.copy();
        cstate.myswitch=0;
        
        if(playerChoice.startsWith('switch')){
          
          cstate.myswitch=0.7;
        }
        
        cstate.thswitch=0;
        if(choice.startsWith('switch')){
          
          //console.log(choice);

          cstate.thswitch=0.7;

          cstate.choose('p' + (player + 1), playerChoice);
          cstate.choose('p' + (1 - player + 1), choice);
          //console.log(choice+" "+evaluateState(cstate,player)+" "+evaluateState(cstate,1-player)+" "+playerChoice);
          
        }else if(choice.startsWith('move')&&nstate.sides[1-nstate.me].active[0].moves.includes(Tools.getMove(toId(choice.substring(choice.indexOf(' ')))).id)){
          //console.log(choice);
          cstate.choose('p' + (player + 1), playerChoice);
          cstate.choose('p' + (1 - player + 1), choice);
          //console.log(choice+" "+evaluateState(cstate,player)+" "+evaluateState(cstate,1-player)+" "+playerChoice);
          
        }
        states.push(cstate);
        average+=evaluateState(cstate,player);
      }
      average/=checkTime;
      var index=-1;
      var difference=-1;
      for(var i=0;i<checkTime;i++){
        if(index<0||Math.abs(evaluateState(states[i],player)-average)<difference){
          index=i;
          difference=Math.abs(evaluateState(states[i],player)-average);
        }
      }
      if (worststate == null || average <oldAverage) {
          worststate = states[index];
          worstChoice=choice;
          oldAverage=average;
        }
    }
    
    
    
    return worststate;
  }

  //This method is used to see who went first last turn
  getFirst(){

    for(var i=0;i<this.prevTurn.length;i++){
      //console.log("thing "+this.prevTurn[i][2]);
      if(this.prevTurn[i][2]){
        if(this.prevTurn[i][2].startsWith(this.mySide)){
          //console.log(this.prevTurn[i]);
          return 1;
        }
        else if(this.prevTurn[i][2].startsWith("p")){
          //  console.log(this.prevTurn[i]);
          return 2;
        }
      }
    }
    return 0;
  }

  
  //This method is used to determine which move was used by the opponent last turn. This method will also change the opponent's ability if that ability is revealed and is different than the current ability
  getLastOpponentMove(){
    var val ="error";
    for(var i=0;i<this.prevTurn.length;i++){
      //console.log("thing "+this.prevTurn[i][2]);
      if(this.prevTurn[i][2]){

        if(!this.prevTurn[i][2].startsWith(this.mySide)&&this.prevTurn[i][2].startsWith("p")){
          //console.log(this.prevTurn[i][1]);
          if(this.prevTurn[i][1]=="switch"){
            val="switch";
            //return "switch";
          }
          else if(this.prevTurn[i][1]=="move"){
            val=this.prevTurn[i][3];
            //return this.prevTurn[i][3];
          }
          else if(this.prevTurn[i][1]=="cant"){
            val="cant";
            //return "cant";
          }
          else if(this.prevTurn[i][1]=="-ability"){
            var ability=this.prevTurn[i][3];
            ability=Tools.getAbility(ability);
            if(this.enemyTeam[this.currentEnemy].baseAbility!=toId(ability)){
              //console.log(this.enemyTeam[this.currentEnemy].species);
              // console.log(ability);
              this.enemyTeam[this.currentEnemy].baseAbility = toId(ability);
              this.enemyTeam[this.currentEnemy].ability = this.enemyTeam[this.currentEnemy].baseAbility;
              this.enemyTeam[this.currentEnemy].abilityData = { id: this.enemyTeam[this.currentEnemy].ability };
            }
          }
          //Log for some reason does not post this correctly. Due to time constraints, it was not implemented
          /*
          else if(this.prevTurn[i][1]=="faint"){
            var species=Tools.getSpecies(this.prevTurn[i][2].substring(this.prevTurn[i][2].indexOf(" ")+1));
            console.log(species+" fainted");
            for(var x=0;x<this.enemyTeam.length;x++){
              if(species==this.enemyTeam[x].species){
                
                if(x==this.prevEnemy){
                  this.prevEnemy=-1;
                }
                this.enemyTeam.splice(x,1);
                if(x<this.currentEnemy){
                  this.currentEnemy--;
                }
                this.enemiesFainted++;
              }
            }
          }
          */
        }

      }
    }
    return val;
  }



  decide(gameState, options, mySide) {
    
    var d = new Date();
    var n = d.getTime();
    
    // It is important to start by making a deep copy of gameState.  We want to avoid accidentally modifying the gamestate.
    var nstate = gameState.copy();
    nstate.p1.currentRequest = 'move';
    nstate.p2.currentRequest = 'move';
    nstate.me = mySide.n;
    this.mySID = mySide.n;
    this.mySide = mySide.id;

    function battleSend(type, data) {
      if (this.sides[1 - this.me].active[0].hp == 0) {
        this.isTerminal = true;
      }
      else if (this.sides[1 - this.me].currentRequest == 'switch' || this.sides[this.me].active[0].hp == 0) {
        this.badTerminal = true;
      }
    }

    nstate.send = battleSend;

    

    //Stores the enemy team so stats, abilty, and moves can be updated
    for(var i=0;i<this.enemyTeam.length;i++){
      if(this.enemyTeam[i].species==nstate.sides[1-nstate.me].active[0].species){


        this.currentEnemy=i;
      }
    }

    var first=this.getFirst();

    var changeMoves=false;

    //  console.log("first is "+first);
    if(this.prevState){

      if(first!=0){
        
        //console.log("turn is "+this.prevTurn[0][2]);
        var lastMove=this.getLastOpponentMove();
        //  console.log(Tools.getMove(lastMove).priority);


        //  console.log("the prevChoice is "+this.prevChoice+" and opponent's was "+lastMove);

        if(lastMove!="switch"&&!this.prevChoice.startsWith('switch')&&this.prevEnemy>=0){
            
            
          //Update the speed stat to to lowest/highest number it can be if we guessed wrong
          if(Tools.getMove(lastMove).priority==Tools.getMove(toId(this.prevChoice.substring(this.prevChoice.indexOf(' ')))).priority){
            
            //console.log(lastMove+ " "+this.prevChoice);
            var ourBoosts=this.prevState.sides[this.prevState.me].active[0].boosts;
            var enBoosts=this.prevState.sides[1-this.prevState.me].active[0].boosts;
            let boostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
            var ourMult=Math.pow(boostTable[Math.abs(ourBoosts)],Math.sign(ourBoosts));
            var enMult=Math.pow(boostTable[Math.abs(ourBoosts)],Math.sign(enBoosts));
            if(first==1&&this.prevState.sides[this.prevState.me].active[0].getStat('spe',false,false)*ourMult<this.enemyTeam[this.prevEnemy].getStat('spe',false,false)*enMult){

              this.enemyTeam[this.prevEnemy].stats.spe=Math.floor(this.prevState.sides[this.prevState.me].active[0].stats.spe/enMult)-Math.ceil(enMult);
            }
            if(first==2&&this.prevState.sides[this.prevState.me].active[0].getStat('spe',false,false)*ourMult>this.enemyTeam[this.prevEnemy].getStat('spe',false,false)*enMult){
              this.enemyTeam[this.prevEnemy].stats.spe=Math.floor(this.prevState.sides[this.prevState.me].active[0].stats.spe/enMult)+Math.floor(enMult);
            }

          }

          lastMove=Tools.getMove(lastMove);
          
          if(!this.enemyMoves[this.prevEnemy].includes(toId(lastMove))&&this.enemyTeam[this.prevEnemy].moves.includes(toId(lastMove))){
            this.enemyMoves[this.prevEnemy].push(toId(lastMove));

            if(this.enemyMoves[this.prevEnemy].length==4){
             
              this.enemyTeam[this.prevEnemy].moves=this.enemyMoves[this.prevEnemy];
              changeMoves=true;
            }
          }


        }
        else if(lastMove=="error"){
          //throw new Error("Something went badly error error!");
        }
      }
    }
    
    nstate.sides[1-nstate.me].active[0]=this.enemyTeam[this.currentEnemy];
    
    nstate.enemyTeam=this.enemyTeam;
    nstate.enemiesFainted=this.enemiesFainted;
    var pQueue = new PriorityQueue(function (a, b) {
      var aeval=evaluateState(a, a.me);
      var beval=evaluateState(b, b.me);
     
      return aeval>beval;
      });

    for (var choice in options) {
      var cstate = nstate.copy();
      
      cstate.baseMove = choice;

      var badstate = this.getWorstOutcome(cstate, choice, nstate.me);
      
      if (badstate.isTerminal) {
        
        this.prevEnemy=this.currentEnemy;
        this.prevChoice=badstate.baseMove;
        this.prevState=nstate;
        this.prevTurn=[];
        return this.prevChoice;
      }
      if (!badstate.badTerminal) {
        pQueue.enq(badstate);
      }
    }


    while ((new Date()).getTime() - n <= 19000) {
      if (pQueue.isEmpty()) {
        
        this.prevEnemy=this.currentEnemy;
        this.prevChoice=this.fetch_random_key(options);
        this.prevState=nstate;
        this.prevTurn=[];
        return this.prevChoice;
      }
      var cState = pQueue.deq();

      var myTurnOptions = this.getOptions(cState, mySide.id);
      for (var choice in myTurnOptions) {
        var dstate = this.getWorstOutcome(cState, choice, cState.me);
        
        if (dstate && dstate.isTerminal) {
          
          this.prevEnemy=this.currentEnemy;
          this.prevChoice=dstate.baseMove;
          this.prevState=nstate;
          this.prevTurn=[];
          return this.prevChoice;
        }
        if (dstate && !dstate.badTerminal) {
          pQueue.enq(dstate);
        }
      }


    }
    
    if (!pQueue.isEmpty()) {
      var bestState=pQueue.deq();
      
      this.prevEnemy=this.currentEnemy;
      
      this.prevChoice=bestState.baseMove;
      this.prevState=nstate;
      this.prevTurn=[];
      
      return this.prevChoice;
    }
    
    var choice = this.fetch_random_key(options);
    
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

    //We should assume the opposing pokemon has an ability even if that is not the correct ability
    //if (Object.keys(basePokemon.template.abilities).length == 1) {
    basePokemon.baseAbility = toId(basePokemon.template.abilities['0']);
    basePokemon.ability = basePokemon.baseAbility;
    basePokemon.abilityData = { id: basePokemon.ability };
    // }
    basePokemon.trapped=false;
    this.enemyTeam.push(basePokemon);
    this.enemyMoves.push([]);
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

}

exports.Agent=BowlAgent;