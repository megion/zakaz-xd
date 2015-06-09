function eachSeries(arr, iteratorFn, eachResultFn, callback) {
	iterateOneSeries(arr, 0, iteratorFn, eachResultFn, callback);
}

function iterateOneSeries(arr, count, iteratorFn, eachResultFn, callback) {
    console.log("count " + count);
    console.log("arr.length " + arr.length);
	if (count>=(arr.length)) {
		// finish
        console.log("finish ", callback);
		return callback(null);
	}
	
	iteratorFn(arr[count], function(err) {
        console.log("err ", err);
		if (err) {
			return callback(err);
		}
		
		// skip error argument
		var args = Array.prototype.slice.call(arguments, 1);
        console.log("args ", args);
		eachResultFn.apply(null, args);
		count++;
		iterateOneSeries(arr, count, iteratorFn, eachResultFn, callback);
	});
}

exports.eachSeries = eachSeries;
