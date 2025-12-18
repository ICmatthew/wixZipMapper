/**
 * Frontend code for iclegal.org using HTTP Functions approach - SECURE VERSION (Simple)
 * 
 * This version includes API key authentication with a hardcoded key.
 * 
 * SETUP:
 * 1. Generate a random API key (see instructions below)
 * 2. Replace 'YOUR_API_KEY_HERE' on line 18 with your generated key
 * 3. Use the SAME key in http-functions-secure-simple.js on icpartners.org
 * 
 * To generate an API key:
 * - Visit: https://www.uuidgenerator.net/ (generate a UUID)
 * - Or use: openssl rand -hex 32 (in terminal)
 * 
 * Example: 'a7f3b9c2-d4e6-4f8a-9b1c-2d3e4f5a6b7c'
 * 
 * INSTRUCTIONS:
 * 1. Replace the contents of lookupPage.js with this code
 * 2. Update the API_KEY constant with your generated key
 * 3. The API_URL is already set correctly
 * 4. Ensure the LocalICSites collection exists with mapperName and url fields
 */

import wixData from 'wix-data';

$w.onReady(function () {
  // Update this URL to match your HTTP function endpoint on icpartners.org
  const API_URL = 'https://www.icpartners.org/_functions/get_locationByZip';
  
  const API_KEY = '4c77ad03db988e4e2820a49753f0811b06ef3833a6e10858bd69a30686211742';
  
  // Verify required elements exist
  try {
    const zipInput = $w('#zipInput');
    const searchButton = $w('#searchButton');
    if (!zipInput || !searchButton) {
      console.error('Required elements not found. Make sure zipInput and searchButton exist on the page.');
      return;
    }
    console.log('All required elements found. Page ready.');
  } catch (error) {
    console.error('Error checking elements:', error);
    return;
  }
  
  async function doLookup() {
    const zip = $w('#zipInput').value.trim();

    // Reset UI and hide all result fields
    $w('#resultText').text = "";
    $w('#resultText').hide();
    $w('#resultAddress').hide(); // ADD THIS if you want to display address
    $w('#resultLinkText1').hide();
    $w('#buttonCalendarURL').hide();
    $w('#contactPref').hide();

    if (!/^\d{5}$/.test(zip)) {
      $w('#resultText').text = "Please enter a valid 5-digit ZIP code.";
      $w('#resultText').show();
      return;
    }

    $w('#resultLinkText1').text = "Searching ...";
    $w('#resultLinkText1').show();

    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const url = `${API_URL}?zip=${zip}&apiKey=${encodeURIComponent(API_KEY)}&_t=${timestamp}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY // Also send in header as alternative
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized: Invalid API key');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Check if result contains an error
      if (result.error) {
        $w('#resultText').text = result.error;
        $w('#resultText').show();
        $w('#resultLinkText1').hide();
        return;
      }

      // Check if location was found
      if (result && result.location) {
        console.log(`Match (${result.matchType}): ${result.location}`);
        
        // Clear "Searching ..." text but keep element visible for phone number if needed
        $w('#resultLinkText1').text = "";
        
        $w('#resultText').text = result.location;
        $w('#resultText').show();

        // Display address if available
        if (result.address) {
          $w('#resultAddress').text = result.address;
          $w('#resultAddress').show();
        } else {
          $w('#resultAddress').hide();
        }

        // Query LocalICSites collection to find matching internal URL
        try {
          const localSiteQuery = await wixData.query("LocalICSites")
            .eq("mapperName", result.location)
            .find();

          if (localSiteQuery.items.length > 0 && localSiteQuery.items[0].url) {
            // Use the internal URL from LocalICSites collection
            $w('#buttonCalendarURL').link = localSiteQuery.items[0].url;
            $w('#buttonCalendarURL').show();
          } else {
            // No match in LocalICSites, hide button and show phone/contact info
            $w('#buttonCalendarURL').hide();

            if (result.phone) {
              $w('#resultLinkText1').text = result.phone;
              $w('#resultLinkText1').show();
            } else {
              $w('#resultLinkText1').hide();
            }

            if (result.contactPref) {
              $w('#contactPref').text = result.contactPref;
              $w('#contactPref').show();
            } else {
              $w('#contactPref').hide();
            }
          }
        } catch (queryError) {
          console.error('Error querying LocalICSites:', queryError);
          // Fallback: hide button and show phone/contact info
          $w('#buttonCalendarURL').hide();

          if (result.phone) {
            $w('#resultLinkText1').text = result.phone;
            $w('#resultLinkText1').show();
          } else {
            $w('#resultLinkText1').hide();
          }

          if (result.contactPref) {
            $w('#contactPref').text = result.contactPref;
            $w('#contactPref').show();
          } else {
            $w('#contactPref').hide();
          }
        }
      } else {
        // Clear "Searching ..." text and hide element since no results
        $w('#resultLinkText1').text = "";
        $w('#resultLinkText1').hide();
        $w('#resultText').text = "No matching location found.";
        $w('#resultText').show();
      }
    } catch (error) {
      console.error('Lookup error:', error);
      if (error.message && error.message.includes('Unauthorized')) {
        $w('#resultText').text = "Authentication error. Please contact support.";
      } else {
        $w('#resultText').text = "Error searching for location. Please try again.";
      }
      $w('#resultText').show();
      $w('#resultLinkText1').hide();
    }
  }

  $w('#searchButton').onClick(() => {
    doLookup();
  });

  $w('#zipInput').onKeyPress((event) => {
    if (event.key === "Enter") {
      doLookup();
    }
  });
});