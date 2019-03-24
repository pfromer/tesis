export function UpdateArrayPrototype(){
    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
        });
    }

    Array.prototype.isProperSubsetOf = function(anotherArray){
        return this.length < anotherArray.length && this.every(x => anotherArray.includes(x));
    }
}