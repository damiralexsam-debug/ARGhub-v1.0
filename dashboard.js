let deleteMode=false;
let lineMode=false;
let firstNode=null;
let connections=[];

const board=document.getElementById("board");
const svg=document.getElementById("lines");

function toggleDelete(){
  deleteMode=!deleteMode;
  lineMode=false;
  firstNode=null;
}

function toggleLine(){
  lineMode=!lineMode;
  deleteMode=false;
  firstNode=null;
}

function addThought(){
  let text=document.getElementById("thoughtInput").value;
  if(!text) return;

  let div=document.createElement("div");
  div.className="thought";
  div.innerText=text;

  div.style.left="50px";
  div.style.top="50px";

  makeDrag(div);

  div.onclick=()=>{
    if(deleteMode){
      removeConnections(div);
      div.remove();
    }
    else if(lineMode){
      handleLine(div);
    }
  };

  board.appendChild(div);
}

function makeDrag(el){
  let offsetX,offsetY;

  el.onmousedown=(e)=>{
    offsetX=e.offsetX;
    offsetY=e.offsetY;

    document.onmousemove=(e)=>{
      let x=e.pageX-board.offsetLeft-offsetX;
      let y=e.pageY-board.offsetTop-offsetY;

      x=Math.max(0,Math.min(x,board.clientWidth-el.offsetWidth));
      y=Math.max(0,Math.min(y,board.clientHeight-el.offsetHeight));

      el.style.left=x+"px";
      el.style.top=y+"px";

      updateLines();
    };

    document.onmouseup=()=>{
      document.onmousemove=null;
    };
  };
}

function handleLine(node){
  if(!firstNode){
    firstNode=node;
  }else{
    let line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("stroke","white");
    line.setAttribute("stroke-width","2");
    svg.appendChild(line);

    connections.push({a:firstNode,b:node,line});
    firstNode=null;
    updateLines();
  }
}

function updateLines(){
  connections.forEach(c=>{
    let ax=c.a.offsetLeft+c.a.offsetWidth/2;
    let ay=c.a.offsetTop+c.a.offsetHeight/2;

    let bx=c.b.offsetLeft+c.b.offsetWidth/2;
    let by=c.b.offsetTop+c.b.offsetHeight/2;

    c.line.setAttribute("x1",ax);
    c.line.setAttribute("y1",ay);
    c.line.setAttribute("x2",bx);
    c.line.setAttribute("y2",by);
  });
}

function removeConnections(node){
  connections=connections.filter(c=>{
    if(c.a===node||c.b===node){
      c.line.remove();
      return false;
    }
    return true;
  });
}
