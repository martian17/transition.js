//utility functions!!!

let transition = function(duration,cb,endcb=()=>{}){
    let req;
    let ongoing = true;
    cb(0);
    let start = 0;
    let going = true;
    let animate = function(t){
        if(start === 0) start = t;
        if(t-start > duration){
            cb(1);
            endcb();
            return;
        }
        cb((t-start)/duration);
        if(going)req = requestAnimationFrame(animate);
    };
    req = requestAnimationFrame(animate);
    return {
        terminate:()=>{
            cancelAnimationFrame(req);
            going = false;
        }
    }
};


let interpolate = function(x){
     return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
     //return Math.sin((r * Math.PI) / 2);
};


//these assume baseline transform to be 0
let pre_transition = function(elem){
    elem.transition = elem.transition || {
        offset:{x:0,y:0}
    };
    let trans = elem.transition;
    trans.start = elem.e.getBoundingClientRect();
};


let post_transition = function(elem){
    let trans = elem.transition;
    let rect = elem.e.getBoundingClientRect();
    rect.x -= trans.offset.x;
    rect.y -= trans.offset.y;
    trans.end = rect;
    if(trans.terminate){
        trans.terminate();
    }
    let going = true;
    trans.terminate = function(){
        going = false;
    }
    let animation = transition(100,(r)=>{
        if(!going){
            animation.terminate();
            return;
        }
        r = interpolate(r);
        //set the position
        let tx = (1-r)*(trans.start.x-trans.end.x);
        let ty = (1-r)*(trans.start.y-trans.end.y);
        trans.offset.x = tx;
        trans.offset.y = ty;
        elem.style(`transform:translate(${tx}px, ${ty}px)`);
    },()=>{//after it has all ended
        trans.terminate = false;
        elem.style(`transform:none;`);//ground it to truth
    });
};