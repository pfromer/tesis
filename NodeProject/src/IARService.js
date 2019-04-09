import { getIarRepairs } from "./IrisCaller";

export async function intersectionRepairs(program){

   var facts = program.facts.map(f => f.toString());
   var tgds = program.tgds.map(t => t.toString());
   var ncs = program.ncs.map(nc => nc.toStringAsQuery()).concat(program.keys.map(k => k.toQueryString(program)));
   var repairs = [];

   var repairs = await getIarRepairs(facts,tgds, ncs, program.isGuarded());
   
   var intersection = getIntersection(repairs);

   return {intersection : intersection, repairs : repairs};
};

function getIntersection(setOfSets){
   var result = [];
   setOfSets.forEach(s => {
      s.forEach(v => {
         if(setOfSets.every(set => set.includes(v))){
            result.push(v);
         }
      })
   })
   return result.unique();
}