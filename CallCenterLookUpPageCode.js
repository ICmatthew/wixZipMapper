import { findLocationByZip } from 'backend/zipLookup';

$w.onReady(function () {
  async function doLookup() {
    const zip = $w('#zipInput').value.trim();

    // Reset UI and hide all result fields
    $w('#resultText').text = "";
    $w('#resultText').hide();
    $w('#resultLinkText').hide();
    $w('#resultImage').hide();

    if (!/^\d{5}$/.test(zip)) {
      $w('#resultText').text = "Please enter a valid 5-digit ZIP code.";
      $w('#resultText').show();
      return;
    }

	$w('#resultLinkText').text = "Searching ...";
	$w('#resultLinkText').show();

    const result = await findLocationByZip(zip);

    if (result) {
		console.log(`Match (${result.matchType}): ${result.location}`);
		$w('#resultText').text = result.location;
		$w('#resultText').show();

      if (result.calendarUrl) {
        $w('#buttonCalendarURL').link = result.calendarUrl;
        $w('#buttonCalendarURL').show();
      } else {
  
   
        $w('#buttonCalendarURL').hide();

        if (result.phone) {
          $w('#resultLinkText').text = result.phone;
          $w('#resultLinkText').show();
        } else {
          $w('#resultLinkText').hide();
        }

        if (result.contactPref) {
          $w('#contactPref').text = result.contactPref;
          $w('#contactPref').show();
        } else {
          $w('#contactPref').hide();
        }
      }

      if (result.imageUrl) {
        $w('#resultImage').src = result.imageUrl;
        $w('#resultImage').show();
      } else {
        $w('#resultImage').hide();
      }
    } else {
      $w('#resultText').text = "No matching location found.";
      $w('#resultText').show();
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