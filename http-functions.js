/**
 * HTTP Functions for icpartners.org - SECURE VERSION (Simple - Hardcoded Key)
 * 
 */

import { findLocationByZip } from 'backend/zipLookup';
import { ok, badRequest, serverError, forbidden } from 'wix-http-functions';

// SET YOUR API KEY HERE - Use the same key in the frontend code
const API_KEY = '4c77ad03db988e4e2820a49753f0811b06ef3833a6e10858bd69a30686211742'; 

// Standard export that Wix expects
export function get_locationByZip(request) {
  return Promise.resolve().then(async () => {
    // Set headers to prevent caching
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*', // Can restrict to specific domain for more security
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
    };

    try {
      // Get API key from request (query parameter or header)
      const providedApiKey = request.query?.apiKey || 
                            request.headers?.['x-api-key'] || 
                            request.headers?.['X-API-Key'];

      // Validate API key
      if (!providedApiKey || providedApiKey !== API_KEY) {
        return forbidden({
          headers: headers,
          body: {
            error: 'Unauthorized: Invalid or missing API key',
            timestamp: Date.now()
          }
        });
      }

      // Get zip code from query parameter
      let zip = null;
      
      if (request.query && request.query.zip) {
        zip = request.query.zip;
      } else if (request.path && request.path.length > 0) {
        zip = request.path[0];
      }

      // Validate zip code is provided
      if (!zip) {
        return badRequest({
        headers: headers,
        body: {
          error: 'Missing zip parameter. Use ?zip=12345&apiKey=YOUR_KEY',
          timestamp: Date.now()
        }
      });
      }

      // Validate zip code format (must be 5 digits)
      if (!/^\d{5}$/.test(String(zip))) {
        return badRequest({
          headers: headers,
          body: {
            error: 'Invalid zip code format. Must be exactly 5 digits.',
            timestamp: Date.now()
          }
        });
      }

      // Call the existing lookup function
      const result = await findLocationByZip(String(zip));

      // If no result found
      if (!result) {
        return ok({
          headers: headers,
          body: {
            error: 'No matching location found',
            timestamp: Date.now(),
            cached: false
          }
        });
      }

      // Return successful result
      return ok({
        headers: headers,
        body: {
          ...result,
          timestamp: Date.now(),
          cached: false
        }
      });

    } catch (error) {
      console.error('Error in get_locationByZip:', error);
      return serverError({
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: {
          error: 'Internal server error',
          message: error.message || 'Unknown error',
          timestamp: Date.now()
        }
      });
    }
  });
}

// Export with the exact name Wix is looking for
export function use_get_locationByZip(request) {
  return get_locationByZip(request);
}

