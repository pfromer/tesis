function getSubsetsRec(superSet, k, idx, current, solution) {
	    //successful stop clause
	    if (current.length == k) {
	        solution.push(Array.from(current));
	        return;
	    }
	    //unseccessful stop clause
	    if (idx == superSet.length) return;
	    var x = superSet[idx];
	    current.push(x);
	    //"guess" x is in the subset
	    getSubsetsRec(superSet, k, idx+1, current, solution);
	    current.pop();
	    //"guess" x is not in the subset
	    getSubsetsRec(superSet, k, idx+1, current, solution);
	}

	function getSubsets(superSet, k) {
	    var res = [];
	    getSubsetsRec(superSet, k, 0, [], res);
	    return res;
	}