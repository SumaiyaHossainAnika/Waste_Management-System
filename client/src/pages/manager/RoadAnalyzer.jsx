import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faTruck, faVanShuttle, faPersonWalking, faLocationCrosshairs, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleColors = { 
  mini_truck: '#22c55e',   // Green
  van: '#eab308',     // Yellow
  manual: '#ef4444'   // Red
};

const vehicleIcons = { 
  mini_truck: faTruck, 
  van: faVanShuttle, 
  manual: faPersonWalking 
};

const vehicleLabels = { 
  mini_truck: 'Mini Truck (Wide Road > 7m)', 
  van: 'Rickshaw Van (Medium Road 3-7m)', 
  manual: 'Manual Collection (Narrow Alley < 3m)' 
};

const kafrulPlaces = [
  { name: 'Hitech Dumping Site', lat: 23.788807, lng: 90.388232 },
  { name: 'Kafrul Police Station', lat: 23.791500, lng: 90.388000 },
  { name: 'Kafrul Central Mosque', lat: 23.789200, lng: 90.390000 },
  { name: 'Kafrul High School', lat: 23.789000, lng: 90.392000 },
  { name: 'Kafrul Play Ground', lat: 23.790500, lng: 90.393000 },
  { name: 'Kafrul Post Office', lat: 23.790000, lng: 90.387000 },
  { name: 'Kafrul Bazar', lat: 23.787500, lng: 90.389000 },
  { name: 'Ibrahimpur Pulpar Junction', lat: 23.786500, lng: 90.377500 },
  { name: 'West Shewrapara Boundary', lat: 23.785000, lng: 90.379000 },
  { name: 'Ibrahimpur Bazar', lat: 23.797500, lng: 90.384000 },
  { name: 'Ibrahimpur Central Mosque', lat: 23.793000, lng: 90.383000 },
  { name: 'Ibrahimpur Girls High School', lat: 23.795000, lng: 90.382000 },
  { name: 'Cantonment Bypass Road Link', lat: 23.798000, lng: 90.381000 }
];

const kafrulRoadSegments = [
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Police Station',
    roadName: 'Kafrul Main Road',
    width_meters: 8.5,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.788807, 90.388232],
      [23.7895, 90.3881],
      [23.7905, 90.3879],
      [23.7915, 90.3880]
    ]
  },
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Post Office',
    roadName: 'Kafrul Post Office Road',
    width_meters: 4.8,
    recommended_vehicle: 'van',
    coordinates: [
      [23.788807, 90.388232],
      [23.7892, 90.3875],
      [23.7900, 90.3870]
    ]
  },
  {
    start: 'Kafrul Police Station',
    end: 'Kafrul Central Mosque',
    roadName: 'Central Mosque Road',
    width_meters: 5.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7915, 90.3880],
      [23.7905, 90.3890],
      [23.7892, 90.3900]
    ]
  },
  {
    start: 'Kafrul Central Mosque',
    end: 'Kafrul High School',
    roadName: 'Kafrul School Road',
    width_meters: 3.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7892, 90.3900],
      [23.7891, 90.3910],
      [23.7890, 90.3920]
    ]
  },
  {
    start: 'Kafrul High School',
    end: 'Kafrul Play Ground',
    roadName: 'Kafrul Playground Lane',
    width_meters: 2.5,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7890, 90.3920],
      [23.7900, 90.3925],
      [23.7905, 90.3930]
    ]
  },
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Bazar',
    roadName: 'Kafrul Bazar Road',
    width_meters: 7.2,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.788807, 90.388232],
      [23.7880, 90.3885],
      [23.7875, 90.3890]
    ]
  },
  {
    start: 'Kafrul Bazar',
    end: 'Ibrahimpur Pulpar Junction',
    roadName: 'East Shewrapara Road',
    width_meters: 5.0,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7875, 90.3890],
      [23.7895, 90.3850],
      [23.7900, 90.3820],
      [23.7895, 90.3780],
      [23.7865, 90.3775]
    ]
  },
  {
    start: 'Ibrahimpur Pulpar Junction',
    end: 'West Shewrapara Boundary',
    roadName: 'Shewrapara Link Lane',
    width_meters: 2.9,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7865, 90.3775],
      [23.7858, 90.3780],
      [23.7850, 90.3790]
    ]
  },
  {
    start: 'Kafrul Post Office',
    end: 'Ibrahimpur Central Mosque',
    roadName: 'Pulpar Road',
    width_meters: 4.5,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7900, 90.3870],
      [23.7915, 90.3850],
      [23.7930, 90.3830]
    ]
  },
  {
    start: 'Ibrahimpur Central Mosque',
    end: 'Ibrahimpur Bazar',
    roadName: 'Ibrahimpur Main Road',
    width_meters: 5.2,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7930, 90.3830],
      [23.7945, 90.3835],
      [23.7960, 90.3838],
      [23.7975, 90.3840]
    ]
  },
  {
    start: 'Ibrahimpur Bazar',
    end: 'Ibrahimpur Girls High School',
    roadName: 'Haji Ashraf Ali Road',
    width_meters: 2.2,
    recommended_vehicle: 'manual',
    coordinates: [
      [23.7975, 90.3840],
      [23.7960, 90.3830],
      [23.7950, 90.3820]
    ]
  },
  {
    start: 'Ibrahimpur Bazar',
    end: 'Cantonment Bypass Road Link',
    roadName: 'Kamal Khan Road',
    width_meters: 7.5,
    recommended_vehicle: 'mini_truck',
    coordinates: [
      [23.7975, 90.3840],
      [23.7978, 90.3825],
      [23.7980, 90.3810]
    ]
  },
  {
    start: 'Ibrahimpur Central Mosque',
    end: 'Ibrahimpur Girls High School',
    roadName: 'Ibrahimpur Girls School Lane',
    width_meters: 3.1,
    recommended_vehicle: 'van',
    coordinates: [
      [23.7930, 90.3830],
      [23.7940, 90.3825],
      [23.7950, 90.3820]
    ]
  }
];

const generateRoadSegments = (rawSegments, placesList) => {
  return rawSegments.map(seg => {
    const startNode = placesList.find(p => p.name === seg.start);
    const endNode = placesList.find(p => p.name === seg.end);
    const startCoords = startNode ? [startNode.lat, startNode.lng] : [23.828969, 90.365585];
    const endCoords = endNode ? [endNode.lat, endNode.lng] : [23.828969, 90.365585];
    const midLat = (startCoords[0] + endCoords[0]) / 2;
    const midLng = (startCoords[1] + endCoords[1]) / 2;
    const offsetLat = (startCoords[0] - endCoords[0]) * 0.15;
    const offsetLng = (startCoords[1] - endCoords[1]) * 0.15;
    return {
      ...seg,
      coordinates: [
        startCoords,
        [midLat + offsetLng, midLng - offsetLat],
        endCoords
      ]
    };
  });
};

const pallabiPlaces = [
  { name: 'Pallabi Dumping Site', lat: 23.828969, lng: 90.365585 }, // Depot

  // Ward 2 (13 areas)
  { name: 'BAGUN BARI TEK', lat: 23.8285, lng: 90.3562 },
  { name: 'CHAKULI', lat: 23.8312, lng: 90.3575 },
  { name: 'KALSHI', lat: 23.8290, lng: 90.3601 },
  { name: 'MIRPUR SEC-12 (BLOCK-A)', lat: 23.8325, lng: 90.3590 },
  { name: 'MIRPUR SEC-12 (BLOCK-B)', lat: 23.8331, lng: 90.3615 },
  { name: 'MIRPUR SEC-12 (BLOCK-C)', lat: 23.8278, lng: 90.3645 },
  { name: 'MIRPUR SEC-12 (BLOCK-D)', lat: 23.8310, lng: 90.3630 },
  { name: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', lat: 23.8295, lng: 90.3610 },
  { name: 'MIRPUR SEC-12 DOHS', lat: 23.8345, lng: 90.3598 },
  { name: 'MIRPUR SEC-12 (BLOCK-E)', lat: 23.8282, lng: 90.3622 },
  { name: 'MIRPUR SEC-12 (BLOCK-DHA)', lat: 23.8320, lng: 90.3620 },
  { name: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', lat: 23.8305, lng: 90.3605 },
  { name: 'MIRPUR SEC-12 (BLOCK-PA)', lat: 23.8338, lng: 90.3640 },

  // Ward 3 (6 areas)
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', lat: 23.8220, lng: 90.3570 },
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', lat: 23.8235, lng: 90.3595 },
  { name: 'MIRPUR SEC-10 (BLOCK-A)', lat: 23.8198, lng: 90.3585 },
  { name: 'MIRPUR SEC-10 (BLOCK-B)', lat: 23.8205, lng: 90.3610 },
  { name: 'MIRPUR SEC-10 (BLOCK-C)', lat: 23.8245, lng: 90.3625 },
  { name: 'MIRPUR SEC-10 (BLOCK-D)', lat: 23.8258, lng: 90.3640 },

  // Ward 5 (8 areas)
  { name: 'BAUNIABAD BASTI TINSHEED QTR.', lat: 23.8315, lng: 90.3685 },
  { name: 'MIRPUR SEC-11 (BLOCK-A)', lat: 23.8298, lng: 90.3678 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', lat: 23.8335, lng: 90.3692 },
  { name: 'MIRPUR SEC-11 (BLOCK-E)', lat: 23.8302, lng: 90.3705 },
  { name: 'MIRPUR SEC-11 (BLOCK-D)', lat: 23.8322, lng: 90.3712 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', lat: 23.8341, lng: 90.3701 },
  { name: 'MIRPUR SEC-11 (BLOCK-F)', lat: 23.8288, lng: 90.3715 },
  { name: 'PALASHNAGAR', lat: 23.8280, lng: 90.3690 },

  // Ward 6 (12 areas)
  { name: 'DOARI PARA', lat: 23.8250, lng: 90.3675 },
  { name: 'EASTERN HOUSING', lat: 23.8225, lng: 90.3682 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA/E)', lat: 23.8205, lng: 90.3672 },
  { name: 'MIRPUR SEC-6 (BLOCK-C)', lat: 23.8238, lng: 90.3698 },
  { name: 'MIRPUR SEC-6 (BLOCK-D)', lat: 23.8215, lng: 90.3705 },
  { name: 'MIRPUR SEC-6 (BLOCK-JA)', lat: 23.8255, lng: 90.3710 },
  { name: 'MIRPUR SEC-6 (BLOCK-JHA)', lat: 23.8242, lng: 90.3708 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA)', lat: 23.8195, lng: 90.3685 },
  { name: 'MIRPUR SEC-7', lat: 23.8200, lng: 90.3700 },
  { name: 'PALLABI (PART-1)', lat: 23.8262, lng: 90.3688 },
  { name: 'PALLABI (EXTENSION)', lat: 23.8258, lng: 90.3695 },
  { name: 'RUPNAGAR TINSHEED', lat: 23.8230, lng: 90.3715 },

  // Ward 7 (16 areas)
  { name: 'MIRPUR SEC-2(BLOCK-F)', lat: 23.8202, lng: 90.3735 },
  { name: 'MIRPUR SEC-6 (BLOCK-A)', lat: 23.8225, lng: 90.3745 },
  { name: 'MIRPUR SEC-6 (BLOCK-B)', lat: 23.8212, lng: 90.3758 },
  { name: 'MIRPUR SEC-2 (BLOCK-H)', lat: 23.8190, lng: 90.3740 },
  { name: 'MIRPUR SEC-2 (BLOCK-CHA)', lat: 23.8238, lng: 90.3732 },
  { name: 'MIRPUR SEC-2 (BLOCK-C)', lat: 23.8252, lng: 90.3748 },
  { name: 'MIRPUR SEC-2 (BLOCK-A)', lat: 23.8265, lng: 90.3738 },
  { name: 'MIRPUR SEC-2 (BLOCK-D)', lat: 23.8278, lng: 90.3752 },
  { name: 'MIRPUR SEC-2 (BLOCK-E)', lat: 23.8248, lng: 90.3765 },
  { name: 'MIRPUR SEC-2 (BLOCK-G)', lat: 23.8230, lng: 90.3775 },
  { name: 'MIRPUR SEC-2 (BLOCK-B)', lat: 23.8220, lng: 90.3785 },
  { name: 'MIRPUR SEC-2 (BLOCK-NEW-A)', lat: 23.8208, lng: 90.3772 },
  { name: 'ALOBDI', lat: 23.8325, lng: 90.3760 },
  { name: 'RUPNAGAR', lat: 23.8260, lng: 90.3780 },
  { name: 'SHIALBARI', lat: 23.8285, lng: 90.3792 },
  { name: 'RUPALI HOUSING ESTATE', lat: 23.8302, lng: 90.3778 }
];

const rawPallabiRoadSegments = [
  { start: 'Pallabi Dumping Site', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Mirpur Road 12', width_meters: 8.5, recommended_vehicle: 'mini_truck' },
  { start: 'MIRPUR SEC-12 (BLOCK-C)', end: 'MIRPUR SEC-12 (BLOCK-E)', roadName: 'Block C to E Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-E)', end: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', roadName: 'Block E to TA Uttar Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', end: 'MIRPUR SEC-12 (BLOCK-DHA)', roadName: 'TA Uttar to DHA Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-DHA)', end: 'MIRPUR SEC-12 (BLOCK-D)', roadName: 'DHA to Block D Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-D)', end: 'MIRPUR SEC-12 (BLOCK-PA)', roadName: 'Block D to PA Lane', width_meters: 3.2, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-PA)', end: 'MIRPUR SEC-12 DOHS', roadName: 'PA to DOHS Main Road', width_meters: 7.5, recommended_vehicle: 'mini_truck' },
  { start: 'MIRPUR SEC-12 DOHS', end: 'MIRPUR SEC-12 (BLOCK-B)', roadName: 'DOHS to Block B Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-B)', end: 'MIRPUR SEC-12 (BLOCK-A)', roadName: 'Block B to A Lane', width_meters: 3.2, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLOCK-A)', end: 'CHAKULI', roadName: 'Block A to Chakuli Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'CHAKULI', end: 'BAGUN BARI TEK', roadName: 'Chakuli to Bagun Bari Road', width_meters: 3.0, recommended_vehicle: 'manual' },
  { start: 'BAGUN BARI TEK', end: 'KALSHI', roadName: 'Bagun Bari to Kalshi Link', width_meters: 3.0, recommended_vehicle: 'manual' },
  { start: 'KALSHI', end: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', roadName: 'Kalshi to BLK-TA Dakshin Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Dakshin to Block C Road', width_meters: 4.5, recommended_vehicle: 'van' },

  // Ward 3
  { start: 'KALSHI', end: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', roadName: 'Kalshi to Sec-11 C2 Link', width_meters: 5.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', end: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', roadName: 'Sec-11 C2 to C1 Avenue', width_meters: 6.2, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', end: 'MIRPUR SEC-10 (BLOCK-A)', roadName: 'Sec-11 C1 to Sec-10 A Link', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-10 (BLOCK-A)', end: 'MIRPUR SEC-10 (BLOCK-B)', roadName: 'Sec-10 A to B Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-10 (BLOCK-B)', end: 'MIRPUR SEC-10 (BLOCK-C)', roadName: 'Sec-10 B to C Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-10 (BLOCK-C)', end: 'MIRPUR SEC-10 (BLOCK-D)', roadName: 'Sec-10 C to D Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-10 (BLOCK-D)', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Sec-10 D to Sec-12 C Link', width_meters: 4.5, recommended_vehicle: 'van' },

  // Ward 5
  { start: 'Pallabi Dumping Site', end: 'MIRPUR SEC-11 (BLOCK-A)', roadName: 'Pallabi to Sec-11 A Link', width_meters: 8.0, recommended_vehicle: 'mini_truck' },
  { start: 'MIRPUR SEC-11 (BLOCK-A)', end: 'PALASHNAGAR', roadName: 'Sec-11 A to Palashnagar Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'PALASHNAGAR', end: 'MIRPUR SEC-11 (BLOCK-F)', roadName: 'Palashnagar to Sec-11 F Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11 (BLOCK-F)', end: 'MIRPUR SEC-11 (BLOCK-E)', roadName: 'Sec-11 F to E Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11 (BLOCK-E)', end: 'MIRPUR SEC-11 (BLOCK-D)', roadName: 'Sec-11 E to D Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11 (BLOCK-D)', end: 'BAUNIABAD BASTI TINSHEED QTR.', roadName: 'Sec-11 D to Bauniabad Road', width_meters: 2.8, recommended_vehicle: 'manual' },
  { start: 'BAUNIABAD BASTI TINSHEED QTR.', end: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', roadName: 'Bauniabad to B1 Road', width_meters: 3.0, recommended_vehicle: 'manual' },
  { start: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', end: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', roadName: 'Sec-11 B1 to B2 Link', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', end: 'BAUNIABAD BASTI TINSHEED QTR.', roadName: 'Sec-11 B2 to Bauniabad Lane', width_meters: 2.8, recommended_vehicle: 'manual' },

  // Ward 6
  { start: 'PALASHNAGAR', end: 'PALLABI (PART-1)', roadName: 'Palashnagar to Pallabi Link', width_meters: 5.5, recommended_vehicle: 'van' },
  { start: 'PALLABI (PART-1)', end: 'PALLABI (EXTENSION)', roadName: 'Pallabi 1 to Ext Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'PALLABI (EXTENSION)', end: 'DOARI PARA', roadName: 'Pallabi Ext to Doaripara Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'DOARI PARA', end: 'EASTERN HOUSING', roadName: 'Doaripara to Eastern Housing Road', width_meters: 5.5, recommended_vehicle: 'van' },
  { start: 'EASTERN HOUSING', end: 'MIRPUR SEC-6 (BLOCK-TA)', roadName: 'Eastern Housing to Sec-6 TA Link', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-TA)', end: 'MIRPUR SEC-6 (BLOCK-TA/E)', roadName: 'Sec-6 TA to TA/E Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-TA/E)', end: 'MIRPUR SEC-7', roadName: 'Sec-6 TA/E to Sec-7 Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-7', end: 'MIRPUR SEC-6 (BLOCK-D)', roadName: 'Sec-7 to Sec-6 D Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-D)', end: 'MIRPUR SEC-6 (BLOCK-C)', roadName: 'Sec-6 D to C Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-C)', end: 'MIRPUR SEC-6 (BLOCK-JHA)', roadName: 'Sec-6 C to JHA Road', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-C)', end: 'MIRPUR SEC-6 (BLOCK-JA)', roadName: 'Sec-6 C to JA Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-JA)', end: 'RUPNAGAR TINSHEED', roadName: 'Sec-6 JA to Rupnagar Tinsheed Road', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'RUPNAGAR TINSHEED', end: 'DOARI PARA', roadName: 'Rupnagar Tinsheed to Doaripara Link', width_meters: 4.5, recommended_vehicle: 'van' },

  // Ward 7
  { start: 'RUPNAGAR TINSHEED', end: 'MIRPUR SEC-2(BLOCK-F)', roadName: 'Rupnagar Tinsheed to Sec-2 F Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2(BLOCK-F)', end: 'MIRPUR SEC-2 (BLOCK-H)', roadName: 'Sec-2 F to H Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-H)', end: 'MIRPUR SEC-2 (BLOCK-NEW-A)', roadName: 'Sec-2 H to New A Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-NEW-A)', end: 'MIRPUR SEC-2 (BLOCK-B)', roadName: 'Sec-2 New A to B Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-B)', end: 'MIRPUR SEC-2 (BLOCK-G)', roadName: 'Sec-2 B to G Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-G)', end: 'MIRPUR SEC-2 (BLOCK-E)', roadName: 'Sec-2 G to E Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-E)', end: 'MIRPUR SEC-2 (BLOCK-D)', roadName: 'Sec-2 E to D Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-D)', end: 'MIRPUR SEC-2 (BLOCK-C)', roadName: 'Sec-2 D to C Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-C)', end: 'MIRPUR SEC-2 (BLOCK-CHA)', roadName: 'Sec-2 C to CHA Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-CHA)', end: 'MIRPUR SEC-2 (BLOCK-A)', roadName: 'Sec-2 CHA to A Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-2 (BLOCK-A)', end: 'RUPNAGAR', roadName: 'Sec-2 A to Rupnagar Road', width_meters: 5.5, recommended_vehicle: 'van' },
  { start: 'RUPNAGAR', end: 'MIRPUR SEC-6 (BLOCK-A)', roadName: 'Rupnagar to Sec-6 A Link', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-A)', end: 'MIRPUR SEC-6 (BLOCK-B)', roadName: 'Sec-6 A to B Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'MIRPUR SEC-6 (BLOCK-B)', end: 'SHIALBARI', roadName: 'Sec-6 B to Shialbari Link', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'SHIALBARI', end: 'RUPALI HOUSING ESTATE', roadName: 'Shialbari to Rupali Housing Road', width_meters: 4.5, recommended_vehicle: 'van' },
  { start: 'RUPALI HOUSING ESTATE', end: 'ALOBDI', roadName: 'Rupali Housing to Alobdi Lane', width_meters: 3.5, recommended_vehicle: 'van' },
  { start: 'ALOBDI', end: 'SHIALBARI', roadName: 'Alobdi to Shialbari Road', width_meters: 4.5, recommended_vehicle: 'van' }
];

const pallabiRoadSegments = generateRoadSegments(rawPallabiRoadSegments, pallabiPlaces);

let places = kafrulPlaces;
let roadSegments = kafrulRoadSegments;

function MapController({ selectedCoords }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords && selectedCoords.length > 0) {
      const bounds = L.latLngBounds(selectedCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedCoords, map]);
  return null;
}

const findPath = (startName, endName) => {
  if (!startName || !endName) return null;
  if (startName === endName) return null;

  const adj = {};
  places.forEach(p => {
    adj[p.name] = [];
  });

  roadSegments.forEach((seg) => {
    adj[seg.start].push({ neighbor: seg.end, segment: seg });
    adj[seg.end].push({ neighbor: seg.start, segment: seg });
  });

  const queue = [[startName, []]];
  const visited = new Set([startName]);

  while (queue.length > 0) {
    const [curr, path] = queue.shift();

    if (curr === endName) {
      return path;
    }

    const connections = adj[curr] || [];
    for (const conn of connections) {
      if (!visited.has(conn.neighbor)) {
        visited.add(conn.neighbor);
        queue.push([conn.neighbor, [...path, conn.segment]]);
      }
    }
  }

  return null;
};

export default function RoadAnalyzer() {
  const { user } = useAuth();
  const isHelal = user?.email?.toLowerCase() === 'helal@gmail.com';

  // Assign places & roadSegments dynamically
  places = isHelal ? pallabiPlaces : kafrulPlaces;
  roadSegments = isHelal ? pallabiRoadSegments : kafrulRoadSegments;

  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (startPoint && endPoint) {
      const path = findPath(startPoint, endPoint);
      if (path && path.length > 0) {
        const minWidth = Math.min(...path.map(s => s.width_meters));
        let recVehicle = 'mini_truck';
        if (minWidth < 3) recVehicle = 'manual';
        else if (minWidth <= 7) recVehicle = 'van';

        const routeNodeNames = [startPoint];
        let current = startPoint;
        path.forEach(seg => {
          current = (seg.start === current) ? seg.end : seg.start;
          routeNodeNames.push(current);
        });

        setSelectedRoute({
          segments: path,
          routeNodes: routeNodeNames,
          roadName: path.map(s => s.roadName).join(' -> '),
          width_meters: minWidth,
          recommended_vehicle: recVehicle,
          coordinates: path.flatMap(s => s.coordinates)
        });

        // Set matching road dropdown value if it is a single road segment
        if (path.length === 1) {
          setSelectedRoad(path[0].roadName);
        } else {
          setSelectedRoad('');
        }
      } else {
        setSelectedRoute(null);
        setSelectedRoad('');
      }
    } else {
      setSelectedRoute(null);
      setSelectedRoad('');
    }
  }, [startPoint, endPoint]);

  const handleRoadSelect = (roadName) => {
    setSelectedRoad(roadName);
    if (roadName) {
      const seg = roadSegments.find(s => s.roadName === roadName);
      if (seg) {
        setStartPoint(seg.start);
        setEndPoint(seg.end);
      }
    } else {
      setStartPoint('');
      setEndPoint('');
    }
  };

  const isSegmentInRoute = (road) => {
    if (!selectedRoute) return false;
    return selectedRoute.segments.some(s => 
      (s.start === road.start && s.end === road.end) || 
      (s.start === road.end && s.end === road.start)
    );
  };

  const reset = () => {
    setStartPoint('');
    setEndPoint('');
    setSelectedRoad('');
    setSelectedRoute(null);
  };

  const center = isHelal ? [23.828969, 90.365585] : [23.791, 90.385];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-eco-text mb-1">{isHelal ? 'Wards 2, 3, 5, 6, 7 Road Width Map' : 'Ward 16 Road Width Map'}</h1>
        <p className="text-eco-secondary text-sm">Interactive routing and optimal vehicle analyzer for waste collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="space-y-6 min-w-0">
          <div className="glass rounded-2xl p-6 border border-eco-primary/10">
            <h3 className="text-eco-text font-semibold text-base mb-4 flex items-center gap-2 border-b border-eco-primary/10 pb-2">
              <FontAwesomeIcon icon={faLocationCrosshairs} className="text-eco-accent" />
              Select Road Segment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">Or Select Road Segment</label>
                <select 
                  value={selectedRoad} 
                  onChange={(e) => handleRoadSelect(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Choose Road Segment --</option>
                  {roadSegments.map(road => (
                    <option key={road.roadName} value={road.roadName}>{road.roadName}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-eco-primary/10"></div>
                <span className="flex-shrink mx-4 text-eco-secondary text-[10px] font-bold uppercase tracking-wider">OR CHOOSE LANDMARKS</span>
                <div className="flex-grow border-t border-eco-primary/10"></div>
              </div>

              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">Start Point</label>
                <select 
                  value={startPoint} 
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Select Landmark --</option>
                  {places.map(p => (
                    <option key={p.name} value={p.name} disabled={p.name === endPoint}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-eco-secondary text-xs font-semibold mb-2 uppercase tracking-wide">End Point</label>
                <select 
                  value={endPoint} 
                  onChange={(e) => setEndPoint(e.target.value)}
                  className="w-full bg-eco-surface border border-eco-primary/20 rounded-xl px-4 py-3 text-eco-text text-sm focus:border-eco-accent/50 outline-none transition-all"
                >
                  <option value="">-- Select Landmark --</option>
                  {places.map(p => (
                    <option key={p.name} value={p.name} disabled={p.name === startPoint}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={reset} 
                className="flex-1 px-4 py-3 rounded-xl bg-eco-surface/40 hover:bg-eco-surface/60 text-eco-text text-sm font-semibold transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Analysis Info Card */}
          <AnimatePresence mode="wait">
            {selectedRoute ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="glass rounded-2xl p-6 border border-eco-accent/30 bg-gradient-to-br from-eco-primary/5 to-eco-accent/5"
              >
                <h3 className="text-eco-text font-bold text-lg mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faRoad} className="text-eco-accent" />
                  Road Specifications
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider">Route Path</span>
                    <p className="text-eco-text text-sm font-semibold leading-relaxed mt-1">{selectedRoute.roadName}</p>
                  </div>

                  <div>
                    <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider">Narrowest Width</span>
                    <p className="text-eco-accent text-3xl font-mono font-bold mt-1">{selectedRoute.width_meters}m</p>
                  </div>

                  <div 
                    className="p-4 rounded-xl flex items-center gap-3 border"
                    style={{ 
                      background: `${vehicleColors[selectedRoute.recommended_vehicle]}10`, 
                      borderColor: `${vehicleColors[selectedRoute.recommended_vehicle]}30` 
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${vehicleColors[selectedRoute.recommended_vehicle]}20` }}
                    >
                      <FontAwesomeIcon 
                        icon={vehicleIcons[selectedRoute.recommended_vehicle]} 
                        style={{ color: vehicleColors[selectedRoute.recommended_vehicle] }} 
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <span className="text-eco-secondary text-[10px] uppercase font-bold tracking-wider block">Recommended Mode</span>
                      <span className="text-eco-text font-bold text-sm capitalize">{selectedRoute.recommended_vehicle}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 text-center border border-eco-primary/10"
              >
                <div 
                  className="w-12 h-12 rounded-xl bg-eco-primary/10 flex items-center justify-center mb-4"
                  style={{ marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="text-eco-primary/50 text-xl" />
                </div>
                <p className="text-eco-text font-semibold text-sm mb-1">No Route Selected</p>
                <p className="text-eco-secondary text-xs leading-relaxed">Choose a Start and End landmark to analyze the connecting road segment.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Legend */}
          <div className="glass rounded-2xl p-6 border border-eco-primary/10 space-y-4">
            <h4 className="text-eco-text font-semibold text-sm flex items-center gap-2 border-b border-eco-primary/10 pb-2">
              <FontAwesomeIcon icon={faRoad} className="text-eco-accent text-xs" />
              Collection Classification
            </h4>
            <div className="space-y-3">
              {Object.entries(vehicleLabels).map(([key, label]) => {
                const parts = label.split(' (');
                const title = parts[0];
                const desc = parts[1] ? parts[1].replace(')', '') : '';
                return (
                  <div 
                    key={key} 
                    className="p-3 rounded-xl border flex items-center gap-3 transition-all hover:translate-x-1"
                    style={{ 
                      background: `${vehicleColors[key]}08`, 
                      borderColor: `${vehicleColors[key]}25` 
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ 
                        background: `${vehicleColors[key]}15`,
                        borderColor: `${vehicleColors[key]}30`,
                        color: vehicleColors[key]
                      }}
                    >
                      <FontAwesomeIcon icon={vehicleIcons[key]} className="text-sm" />
                    </div>
                    <div>
                      <p className="text-eco-text font-semibold text-xs capitalize">{title}</p>
                      {desc && <p className="text-[10px] text-eco-secondary font-medium">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden border border-eco-primary/10 responsive-map-container analyzer">
          <MapContainer center={center} zoom={14.5} style={{ height: '100%', width: '100%' }}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
            />

            {/* Auto-focus Controller */}
            {selectedRoute && <MapController selectedCoords={selectedRoute.coordinates} />}

            {/* All Ward 16 Roads */}
            {roadSegments.map((road, idx) => {
              const isSelected = isSegmentInRoute(road);
              return (
                <Polyline 
                  key={idx}
                  positions={road.coordinates}
                  pathOptions={{ 
                    color: isSelected ? vehicleColors[selectedRoute.recommended_vehicle] : vehicleColors[road.recommended_vehicle], 
                    weight: isSelected ? 9 : 4, 
                    opacity: isSelected ? 1.0 : 0.25,
                    dashArray: isSelected ? '5, 8' : undefined
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-sm text-eco-text mb-1">{road.roadName}</p>
                      <p className="text-eco-secondary">Width: <strong className="text-eco-accent">{road.width_meters}m</strong></p>
                      <p className="text-eco-secondary">Vehicle: <span className="capitalize font-semibold" style={{ color: vehicleColors[road.recommended_vehicle] }}>{road.recommended_vehicle}</span></p>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Landmark Markers */}
            {places.map(p => (
              <Marker key={p.name} position={[p.lat, p.lng]}>
                <Popup>
                  <div className="text-xs font-semibold text-eco-text">
                    {p.name}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
