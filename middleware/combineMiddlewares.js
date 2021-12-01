/**
 * Combine multiple middleware together.
 *
 * @param {Function[]} mids functions of form:
 *   function(req, res, next) { ... }
 * @return {Function} single combined middleware
 */
function combineMiddleware([a, b]) {
    // return mids.reduce(function(a, b) {
    return function (req, res, next) {
        a(req, res, function (err) {
            if (err) {
                b(req, res, function (error) {
                    if (error) {
                        return next(error)
                    } else return next();
                });
            } else return next();
        });
    };
    // });
}

module.exports = combineMiddleware;