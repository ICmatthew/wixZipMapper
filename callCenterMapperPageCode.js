import wixData from 'wix-data';

$w.onReady(async function () {
  console.log("✅ Page loaded. Initializing Amazon Mapper...");

  const mapElement = $w("#htmlMap");
  if (!mapElement) return console.error("❌ htmlMap element not found");

  try {
    const { items } = await wixData.query("Import1").limit(1000).find();

    const zipMap = {};
    const siteData = items.map(site => {
      const zipList = (site.referringZips || "").split("|").filter(Boolean);
      zipList.forEach(zip => zipMap[zip] = site.name); // preserves ZIP3/ZIP4/ZIP5
      return {
        _id: site._id,
        locationName: site.name,
        address: site.address + (site.suite ? ` ${site.suite}` : ""),
        phone: site.telephone,
        email: site.email,
        website: site.website,
        imageUrl: site.imageUrl,
        hours: site.hours,
        category: site.category,
        latitude: site.latitude,
        longitude: site.longitude,
        referringZips: zipList
      };
    });

    mapElement.postMessage({ type: "initMap", sites: siteData, initialMap: zipMap });
    console.log("📤 Sent site data and initial zipMap to map iframe");
  } catch (err) {
    console.error("❌ Failed to load site data:", err);
  }
});

$w("#htmlMap").onMessage((event) => {
  const { type, zip3Map } = event.data;
  if (type === "zip3MapUpdate") {
    console.log("📥 Received zip3Map update", zip3Map);

    wixData.query("Import1").limit(1000).find()
      .then((res) => {
        const updates = res.items.map((item) => {
          // Determine which ZIPs are assigned to this location
          const assignedZips = Object.entries(zip3Map)
            .filter(([_, loc]) => loc === item.name)
            .map(([zip]) => zip)
            .sort();

          const currentZips = (item.referringZips || "").split("|").filter(Boolean).sort();

          // Compare stringified arrays
          const changed = assignedZips.join("|") !== currentZips.join("|");

          if (changed) {
            const updatedItem = {
              ...item,
              referringZips: assignedZips.join("|")
            };
            console.log(`🔄 Updating ${item.name} with ZIPs: ${assignedZips.join(", ")}`);
            return wixData.update("Import1", updatedItem);
          }

          return Promise.resolve(null);
        });

        return Promise.all(updates);
      })
      .then(() => console.log("✅ Referring ZIPs updated in Import1 collection"))
      .catch((err) => console.error("❌ Error saving referringZips:", err));
  }
});
