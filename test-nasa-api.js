#!/usr/bin/env node

/**
 * Simple test script to verify NASA API integration
 * Run with: node test-nasa-api.js
 */

import axios from 'axios';

// NASA API Configuration (from .env)
const NASA_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFrc2hheXJhajIwMjYiLCJleHAiOjE3NjQ3Njc5NjMsImlhdCI6MTc1OTU4Mzk2MywiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.XNx_SsyVzpYmT89bsNPVoTYAO2XL70rxIMHSgKYz1UWAANPywRDxKXVKcIIJeseB_Ktt3wzHJ1rCkQjSykhV0yfn1S3OyDYbFh_flXnjxbwEZzcttlA6EQbAmaDng4JBMB7wicg24GZitsBysEEgyo53e6xdZVkNutxpOx2BCpDvX-pwiH8Bz6g1-vbjUXMP-McvOJuN2TMZhn_bbHzU_ps76j8JjXcMwUNCLxuisDr-jewAdB26PfYMqTYQi0NWAExfV_Vsh1BSBt7qMqiz4PQAAyBdep3czzYlNgJt-YPvF1mIgWLBX7ITtwtjPfxl8f8vTknnb2J5BRL6ZIGyuQ';

// Test endpoints
const endpoints = {
  cmr: 'https://cmr.earthdata.nasa.gov/search/granules.json',
  worldview: 'https://worldview.earthdata.nasa.gov/api/v1',
  gibs: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'
};

async function testNASAAPI() {
  console.log('🚀 Testing NASA Earthdata API Integration...\n');

  // Test 1: CMR Search API
  try {
    console.log('1️⃣ Testing CMR Search API...');
    const cmrResponse = await axios.get(endpoints.cmr, {
      headers: {
        'Authorization': `Bearer ${NASA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        collection_concept_id: 'C2748088093-LARC_ASDC', // TEMPO NO2
        bounding_box: '-74.5,40.2,-73.5,41.2', // NYC area
        page_size: 5
      }
    });
    
    console.log(`✅ CMR API Response: ${cmrResponse.status}`);
    if (cmrResponse.data && cmrResponse.data.feed) {
      console.log(`   Found ${cmrResponse.data.feed.entry?.length || 0} TEMPO granules`);
    }
  } catch (error) {
    console.log(`❌ CMR API Error: ${error.response?.status || error.message}`);
  }

  // Test 2: NASA Worldview Snapshot
  try {
    console.log('\n2️⃣ Testing NASA Worldview...');
    const worldviewUrl = 'https://worldview.earthdata.nasa.gov/snapshot?v=-180,-90,180,90&t=2025-10-05&l=MODIS_Terra_CorrectedReflectance_TrueColor&lg=false&s=-79,35.5,-69,45.5';
    
    const worldviewResponse = await axios.head(worldviewUrl, {
      timeout: 10000
    });
    
    console.log(`✅ Worldview Snapshot: ${worldviewResponse.status}`);
  } catch (error) {
    console.log(`❌ Worldview Error: ${error.response?.status || error.message}`);
  }

  // Test 3: GIBS Tile Service
  try {
    console.log('\n3️⃣ Testing GIBS Tile Service...');

    // Test multiple tile URLs with different dates and zoom levels
    const testTiles = [
      {
        url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-10-01/GoogleMapsCompatible_Level9/5/10/12.jpg'
      },
      {
        name: 'MODIS Terra (Lower Zoom)',
        url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-10-01/GoogleMapsCompatible_Level9/3/3/2.jpg'
      },
      {
        name: 'MODIS Aerosol',
        url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/2024-10-01/GoogleMapsCompatible_Level6/3/3/2.png'
      }
    ];

    for (const tile of testTiles) {
      try {
        const response = await axios.head(tile.url, { timeout: 5000 });
        console.log(`✅ ${tile.name}: ${response.status}`);
        console.log(`   ${tile.url}`);
      } catch (error) {
        console.log(`❌ ${tile.name}: ${error.response?.status || error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ GIBS Test Error: ${error.message}`);
  }

  console.log('\n🏁 NASA API Test Complete!');
  console.log('\n📝 Notes:');
  console.log('- If you see 401/403 errors, the API token may need refresh');
  console.log('- If you see 404 errors, the endpoints or parameters may need adjustment');
}

// Run the test
testNASAAPI().catch(console.error);
