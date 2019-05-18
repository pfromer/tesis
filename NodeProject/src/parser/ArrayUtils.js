export function UpdateArrayPrototype(){
    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
        });
    }

    Array.prototype.isProperSubsetOf = function(anotherArray){
        return this.length < anotherArray.length && this.every(x => anotherArray.includes(x));
    }

    Array.prototype.permutations = function(){
        let ret = [];
      
        for (let i = 0; i < this.length; i = i + 1) {
          let rest = this.slice(0, i).concat(this.slice(i + 1)).permutations();
      
          if(rest.length == 0) {
            ret.push([this[i]])
          } else {
            for(let j = 0; j < rest.length; j = j + 1) {
              ret.push([this[i]].concat(rest[j]))
            }
          }
        }
        return ret;
      }
}