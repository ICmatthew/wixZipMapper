# Wix ZIP Code Mapper

A Wix-based ZIP code routing system for **Immigrant Connection** - a network of immigration legal services locations across the United States.

## Overview

This system enables:

1. **Visual ZIP Code Assignment** - Admins assign ZIP codes to locations using an interactive Leaflet.js map
2. **Call Center Routing** - Staff lookup locations by ZIP code for caller routing
3. **External API Access** - Third-party sites can query location data via REST API
4. **Corporate Partnerships** - Dedicated lookup pages for partners (e.g., Amazon employees)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    icpartners.org (Wix)                         │
├─────────────────────────────────────────────────────────────────┤
│  Import1 Collection (locations + referringZips)                 │
│                            │                                    │
│    ┌───────────────────────┼───────────────────────┐           │
│    │                       │                       │           │
│    ▼                       ▼                       ▼           │
│  Admin Mapper    Call Center Lookup         HTTP API           │
│  (Leaflet.js)    (/amazon-lookup)      (/_functions/...)       │
└─────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
                                          iclegal.org
                                       (External consumer)
```

## Key Features

- **Dual ZIP Resolution**: Supports both ZIP3 (regional) and ZIP5 (specific) codes
- **Priority System**: ZIP5 assignments override ZIP3 for granular control
- **API Authentication**: Secure external access with API key
- **Real-time Updates**: Changes in admin mapper immediately update the database

## Files

| File | Description |
|------|-------------|
| `callCenterMapperPageCode.js` | Wix Velo page code for admin ZIP mapper |
| `htmlMapIframeCode.html` | Interactive Leaflet.js map (iframe) |
| `CallCenterLookUpPageCode.js` | Call center/Amazon lookup page code |
| `zipLookup.jsw` | Backend ZIP lookup logic |
| `http-functions.js` | HTTP API endpoints |
| `remoteSearchByZipPageCode.js` | External site (iclegal.org) page code |
| `zip3-us.json` | GeoJSON boundaries for 3-digit ZIP codes |
| `zip5-us.json` | GeoJSON boundaries for 5-digit ZIP codes |
| `SYSTEM_DOCUMENTATION.md` | Comprehensive technical documentation |

## Documentation

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) for complete technical documentation including:

- Detailed architecture diagrams
- Data flow explanations
- API reference
- UI element mappings
- Troubleshooting guide

## Tech Stack

- **Platform**: Wix (Velo)
- **Mapping**: Leaflet.js 1.9.4
- **Base Tiles**: OpenStreetMap
- **Data**: Wix Data Collections
- **API**: Wix HTTP Functions

## Live URLs

| Interface | URL |
|-----------|-----|
| Admin Mapper | `icpartners.org/call-center-mapper` |
| Amazon Lookup | `icpartners.org/amazon-lookup` |
| External Lookup | `iclegal.org` |

## License

Private - Immigrant Connection

## Contact

For questions about this system, contact the Immigrant Connection technical team.

