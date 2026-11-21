const { httpGet } = require('./mock-http-interface');

/**
 * @param {GetArnieQuotesInput} urls
 * @returns {ArnieQuoteResponse}
 */
const getArnieQuotes = async (urls) => {
  // NOTE: The assessment states that it is not necessary to perform input validation,
  // so the following code assumes that `urls` is a string array
  return Promise.all(urls.map(async url => {
    try {
      const result = await httpGet(url);
      /**
       * A few assumptions are being made here:
       * - This is written assuming that the body field will always be valid JSON
       *   (if it's not, there's additional error handling in the catch block below,
       *    reasoning behind it also specified below)
       * - This is written assuming the `httpGet` call always has a `.message` field
       *   (if that's not a guarantee, then extra error handling will need to be added
       *    in order to handle when `responseBody.message === undefined`)
       * - If there is a true failure server-side then it is assumed that the `httpGet`
       *   implementation would then provide the expected failure message as specified
       *   in the requirements
       */
      const responseBody = JSON.parse(result.body);
      // NOTE: this is written in this structure to allow for passing the type checking
      // specified in `./src/types.js` since it explicitly looks for the hard-coded key
      // strings. Similarly for the below error handling
      if (result.status === 200) {
        return {
          'Arnie Quote': responseBody.message,
        }
      } else {
        return {
          'FAILURE': responseBody.message,
        }
      }
    } catch (err) {
      /**
       * There are two failure modes here. Either there's a network failure, or the
       * response body is malformed JSON, which can result in an error being thrown
       * from the `JSON.parse` call. In both cases, return a failure key with the
       * error message
       */
      if (err instanceof Error) {
        return {
          ['FAILURE']: err.message,
        }
      }
      // An absolute last resort, assuming everything else has failed so far
      return {
        ['FAILURE']: 'Your request has been terminated',
      }
    }
  }));
};

module.exports = {
  getArnieQuotes,
};
