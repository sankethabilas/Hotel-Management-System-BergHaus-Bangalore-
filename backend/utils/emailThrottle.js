// Utility to throttle email sending
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process items in batches with delay between each item
 * @param {Array} items - Items to process
 * @param {Function} processor - Async function to process each item
 * @param {Number} delayMs - Delay between items in milliseconds
 * @param {Number} batchSize - Number of items to process before a longer pause
 * @returns {Promise<Array>} Results array
 */
async function processBatch(items, processor, delayMs = 1000, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processor(items[i]);
      results.push(result);
      
      // Add delay between each send
      if (i < items.length - 1) {
        await delay(delayMs);
        
        // Longer pause after each batch
        if ((i + 1) % batchSize === 0) {
          await delay(delayMs * 2);
        }
      }
    } catch (error) {
      results.push({ error: error.message, item: items[i] });
    }
  }
  
  return results;
}

module.exports = { delay, processBatch };
