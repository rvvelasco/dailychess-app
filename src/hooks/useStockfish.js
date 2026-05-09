/**
 * useStockfish.js
 * Crea el worker como Blob URL para que funcione en cualquier hosting
 * incluyendo GitHub Pages (evita restricciones de CORS en Web Workers)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { DIFFICULTY_LEVELS } from '../utils/constants';

// ─── Código del worker como string ───────────────────────────────────────
// Al incrustarlo como Blob evitamos el problema de CORS en GitHub Pages
const WORKER_CODE = `
var stockfishEngine = null;
var engineReady = false;
var messageQueue = [];
var currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var skillLevel = 10;
var currentMovetime = 1000;
var isThinking = false;

function tryLoadStockfish() {
  try {
    importScripts('/stockfish.js');
    var engine = null;
    if (typeof Stockfish === 'function') engine = Stockfish();
    else if (typeof STOCKFISH === 'function') engine = STOCKFISH();
    if (engine) {
      engine.onmessage = function(event) {
        var line = typeof event === 'string' ? event : (event.data || '');
        handleLine(line);
      };
      engine.postMessage('uci');
      engine.postMessage('isready');
      stockfishEngine = engine;
      return true;
    }
  } catch(e) {}
  return false;
}

function handleLine(line) {
  if (!line) return;
  if (line === 'readyok' || line.indexOf('readyok') !== -1) {
    engineReady = true;
    postMessage({ type: 'ready' });
    while (messageQueue.length > 0) stockfishEngine.postMessage(messageQueue.shift());
  } else if (line.startsWith('bestmove')) {
    var parts = line.split(' ');
    var move = parts[1];
    isThinking = false;
    postMessage({ type: 'bestmove', move: (move && move !== '(none)' && move !== '0000') ? move : null });
  }
}

function sendCmd(cmd) {
  if (!stockfishEngine) return;
  if (engineReady) stockfishEngine.postMessage(cmd);
  else messageQueue.push(cmd);
}

/* ── Motor embebido (fallback) ── */
var FILES = 'abcdefgh';
var PV = { p:100,n:320,b:330,r:500,q:900,k:20000 };
var PST_P  = [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0];
var PST_N  = [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50];
var PST_B  = [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20];
var PST_R  = [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0];
var PST_Q  = [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20];
var PST_K  = [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20];
var PSTS = {p:PST_P,n:PST_N,b:PST_B,r:PST_R,q:PST_Q,k:PST_K};

function parseFen(fen) {
  var parts = fen.split(' '), board = new Array(64).fill(null), rows = parts[0].split('/');
  for (var r=0;r<8;r++){var col=0;for(var i=0;i<rows[r].length;i++){var c=rows[r][i];if(c>='1'&&c<='8')col+=parseInt(c);else{board[r*8+col]=c;col++;}}}
  return {board:board,turn:parts[1]||'w'};
}

function evalBoard(board,turn) {
  var score=0;
  for(var sq=0;sq<64;sq++){var p=board[sq];if(!p)continue;var w=p===p.toUpperCase();var pt=p.toLowerCase();var val=PV[pt]||0;var pst=PSTS[pt];var idx=w?sq:(56-Math.floor(sq/8)*8+sq%8);if(idx>=64)idx=sq;score+=w?(val+(pst?pst[idx]||0:0)):-(val+(pst?pst[idx]||0:0));}
  return turn==='w'?score:-score;
}

function applyMove(board,move) {
  var nb=board.slice(),ff=move.charCodeAt(0)-97,fr=8-parseInt(move[1]),tf=move.charCodeAt(2)-97,tr=8-parseInt(move[3]),promo=move[4];
  var piece=nb[fr*8+ff];
  nb[tr*8+tf]=promo?(piece===piece.toUpperCase()?promo.toUpperCase():promo):piece;
  nb[fr*8+ff]=null;return nb;
}

function genMoves(board,turn) {
  var moves=[],w=turn==='w';
  for(var sq=0;sq<64;sq++){
    var piece=board[sq];if(!piece)continue;var pw=piece===piece.toUpperCase();if(pw!==w)continue;
    var r=Math.floor(sq/8),f=sq%8,pt=piece.toLowerCase(),from=FILES[f]+(8-r),targets=[];
    if(pt==='p'){var dir=w?-1:1,sr=w?6:1,nr=r+dir;if(nr>=0&&nr<8){if(!board[nr*8+f]){targets.push(nr*8+f);if(r===sr&&!board[(nr+dir)*8+f])targets.push((nr+dir)*8+f);}[-1,1].forEach(function(df){var nf=f+df;if(nf>=0&&nf<8){var cap=board[(nr)*8+nf];if(cap&&(cap===cap.toUpperCase())!==w)targets.push(nr*8+nf);}});}}
    else if(pt==='n'){[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(d){var nr=r+d[0],nf=f+d[1];if(nr>=0&&nr<8&&nf>=0&&nf<8){var t=board[nr*8+nf];if(!t||(t===t.toUpperCase())!==w)targets.push(nr*8+nf);}});}
    else if(pt==='k'){[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d){var nr=r+d[0],nf=f+d[1];if(nr>=0&&nr<8&&nf>=0&&nf<8){var t=board[nr*8+nf];if(!t||(t===t.toUpperCase())!==w)targets.push(nr*8+nf);}});}
    else{var dirs=[];if(pt==='r'||pt==='q')dirs=dirs.concat([[-1,0],[1,0],[0,-1],[0,1]]);if(pt==='b'||pt==='q')dirs=dirs.concat([[-1,-1],[-1,1],[1,-1],[1,1]]);dirs.forEach(function(d){var nr=r+d[0],nf=f+d[1];while(nr>=0&&nr<8&&nf>=0&&nf<8){var t=board[nr*8+nf];if(!t){targets.push(nr*8+nf);}else{if((t===t.toUpperCase())!==w)targets.push(nr*8+nf);break;}nr+=d[0];nf+=d[1];}});}
    targets.forEach(function(tSq){var to=FILES[tSq%8]+(8-Math.floor(tSq/8)),pt2=piece.toLowerCase();if(pt2==='p'&&(Math.floor(tSq/8)===0||Math.floor(tSq/8)===7))['q','r','b','n'].forEach(function(pr){moves.push(from+to+pr);});else moves.push(from+to);});
  }
  return moves;
}

function minimax(board,turn,depth,alpha,beta) {
  if(depth===0)return evalBoard(board,turn);
  var moves=genMoves(board,turn);if(!moves.length)return -20000;
  var nt=turn==='w'?'b':'w',best=-Infinity;
  for(var i=0;i<moves.length;i++){var s=-minimax(applyMove(board,moves[i]),nt,depth-1,-beta,-alpha);if(s>best)best=s;if(s>alpha)alpha=s;if(alpha>=beta)break;}
  return best;
}

function getFallbackMove(fen,skill) {
  var parsed=parseFen(fen),board=parsed.board,turn=parsed.turn,moves=genMoves(board,turn);
  if(!moves||!moves.length)return null;
  var depth=skill<=3?1:skill<=8?2:skill<=14?3:4;
  if(Math.random()<Math.max(0,(12-skill)/20))return moves[Math.floor(Math.random()*moves.length)];
  moves.sort(function(a,b){var ta=board[(8-parseInt(a[3]))*8+(a.charCodeAt(2)-97)],tb=board[(8-parseInt(b[3]))*8+(b.charCodeAt(2)-97)];return(tb?PV[tb.toLowerCase()]||0:0)-(ta?PV[ta.toLowerCase()]||0:0);});
  var nt=turn==='w'?'b':'w',best=null,bestS=-Infinity;
  for(var i=0;i<moves.length;i++){var s=-minimax(applyMove(board,moves[i]),nt,depth-1,-Infinity,Infinity)+((Math.random()-0.5)*(20-skill)*4);if(s>bestS){bestS=s;best=moves[i];}}
  return best;
}

function startFallback() {
  engineReady=true;
  postMessage({type:'ready'});
  stockfishEngine={postMessage:function(cmd){
    if(cmd.startsWith('position fen'))currentFen=cmd.replace('position fen ','').split(' moves')[0];
    else if(cmd.startsWith('setoption name Skill Level value'))skillLevel=parseInt(cmd.split('value ')[1])||10;
    else if(cmd.startsWith('go')){
      var mt=cmd.match(/movetime (\\d+)/);if(mt)currentMovetime=parseInt(mt[1]);
      if(!isThinking){isThinking=true;var delay=Math.min(currentMovetime*0.6,1200);
        setTimeout(function(){var mv=null;try{mv=getFallbackMove(currentFen,skillLevel);}catch(e){}isThinking=false;postMessage({type:'bestmove',move:mv});},delay);}
    }else if(cmd==='stop'){isThinking=false;}
    else if(cmd==='ucinewgame'){currentFen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';isThinking=false;}
    else if(cmd==='isready')postMessage({type:'ready'});
  }};
}

var loaded=tryLoadStockfish();
if(!loaded)startFallback();

self.onmessage=function(event){
  var data=event.data,type=data.type,payload=data.payload||{};
  switch(type){
    case 'setPosition': currentFen=payload.fen; sendCmd('position fen '+payload.fen); break;
    case 'search':
      if(payload.movetime){currentMovetime=payload.movetime;sendCmd('go movetime '+payload.movetime);}
      else if(payload.depth)sendCmd('go depth '+payload.depth);
      else sendCmd('go movetime 1000');
      break;
    case 'setSkillLevel': skillLevel=payload.level; sendCmd('setoption name Skill Level value '+payload.level); break;
    case 'stop': isThinking=false; sendCmd('stop'); break;
    case 'newGame':
      currentFen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      isThinking=false; sendCmd('ucinewgame'); sendCmd('isready'); break;
  }
};
`;

export function useStockfish() {
  const workerRef   = useRef(null);
  const [isReady, setIsReady]     = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [stockfishAvailable, setStockfishAvailable] = useState(true);
  const callbackRef = useRef(null);

  useEffect(() => {
    try {
      // Crear worker desde Blob — funciona en GitHub Pages sin problemas de CORS
      const blob   = new Blob([WORKER_CODE], { type: 'application/javascript' });
      const url    = URL.createObjectURL(blob);
      workerRef.current = new Worker(url);

      workerRef.current.onmessage = ({ data }) => {
        const { type, move, message } = data;
        if (type === 'ready') {
          setIsReady(true);
        } else if (type === 'bestmove') {
          setIsThinking(false);
          if (callbackRef.current) {
            callbackRef.current(move || null);
            callbackRef.current = null;
          }
        } else if (type === 'error') {
          console.warn('Motor:', message);
        }
      };

      workerRef.current.onerror = (e) => {
        console.warn('Worker error:', e);
        setIsThinking(false);
      };

      // Revocar la URL del blob cuando ya no la necesitamos
      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.warn('No se pudo crear el worker:', err);
      setStockfishAvailable(false);
    }
  }, []);

  const getBestMove = useCallback((fen, difficultyKey, onMove) => {
    if (!workerRef.current) { onMove(null); return; }
    const config = DIFFICULTY_LEVELS[difficultyKey] || DIFFICULTY_LEVELS.medium;
    callbackRef.current = onMove;
    setIsThinking(true);
    workerRef.current.postMessage({ type:'setPosition', payload:{ fen } });
    workerRef.current.postMessage({ type:'setSkillLevel', payload:{ level: config.skill } });
    workerRef.current.postMessage({ type:'search', payload:{ movetime: config.movetime, depth: config.depth } });
  }, []);

  const newGame = useCallback(() => {
    if (!workerRef.current) return;
    setIsThinking(false);
    callbackRef.current = null;
    workerRef.current.postMessage({ type:'newGame' });
  }, []);

  const stopSearch = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type:'stop' });
    setIsThinking(false);
    callbackRef.current = null;
  }, []);

  const setDifficulty = useCallback((key) => {
    if (!workerRef.current || !isReady) return;
    const config = DIFFICULTY_LEVELS[key];
    if (config) workerRef.current.postMessage({ type:'setSkillLevel', payload:{ level: config.skill } });
  }, [isReady]);

  return { isReady, isThinking, stockfishAvailable, getBestMove, newGame, stopSearch, setDifficulty };
}
