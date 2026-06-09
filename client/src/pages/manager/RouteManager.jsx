import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faPlay, faCircleNodes, faSpinner, faTruck, faVanShuttle, faCircleInfo, faMapPin } from '@fortawesome/free-solid-svg-icons';
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

const vrpRouteColors = [
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6'  // Teal
];

const kafrulPlaces = [
  { name: 'Hitech Dumping Site', lat: 23.788807, lng: 90.388232, load: 0.0 }, // Depot
  { name: 'Kafrul Police Station', lat: 23.791500, lng: 90.388000, load: 1.2 },
  { name: 'Kafrul Central Mosque', lat: 23.789200, lng: 90.390000, load: 0.8 },
  { name: 'Kafrul High School', lat: 23.789000, lng: 90.392000, load: 1.5 },
  { name: 'Kafrul Play Ground', lat: 23.790500, lng: 90.393000, load: 0.5 },
  { name: 'Kafrul Post Office', lat: 23.790000, lng: 90.387000, load: 1.0 },
  { name: 'Kafrul Bazar', lat: 23.787500, lng: 90.389000, load: 2.8 },
  { name: 'Ibrahimpur Pulpar Junction', lat: 23.786500, lng: 90.377500, load: 2.0 },
  { name: 'West Shewrapara Boundary', lat: 23.785000, lng: 90.379000, load: 1.5 },
  { name: 'Ibrahimpur Bazar', lat: 23.797500, lng: 90.384000, load: 3.5 },
  { name: 'Ibrahimpur Central Mosque', lat: 23.793000, lng: 90.383000, load: 1.8 },
  { name: 'Ibrahimpur Girls High School', lat: 23.795000, lng: 90.382000, load: 1.4 },
  { name: 'Cantonment Bypass Road Link', lat: 23.798000, lng: 90.381000, load: 2.5 }
];

const kafrulRoadSegments = [
  {
    start: 'Hitech Dumping Site',
    end: 'Kafrul Police Station',
    roadName: 'Kafrul Main Road',
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
  { name: 'Pallabi Dumping Site', lat: 23.828969, lng: 90.365585, load: 0.0 }, // Depot

  // Ward 2 (13 areas)
  { name: 'BAGUN BARI TEK', lat: 23.8285, lng: 90.3562, load: 1.5 },
  { name: 'CHAKULI', lat: 23.8312, lng: 90.3575, load: 1.8 },
  { name: 'KALSHI', lat: 23.8290, lng: 90.3601, load: 2.0 },
  { name: 'MIRPUR SEC-12 (BLOCK-A)', lat: 23.8325, lng: 90.3590, load: 1.6 },
  { name: 'MIRPUR SEC-12 (BLOCK-B)', lat: 23.8331, lng: 90.3615, load: 1.4 },
  { name: 'MIRPUR SEC-12 (BLOCK-C)', lat: 23.8278, lng: 90.3645, load: 1.2 },
  { name: 'MIRPUR SEC-12 (BLOCK-D)', lat: 23.8310, lng: 90.3630, load: 1.7 },
  { name: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', lat: 23.8295, lng: 90.3610, load: 1.3 },
  { name: 'MIRPUR SEC-12 DOHS', lat: 23.8345, lng: 90.3598, load: 2.1 },
  { name: 'MIRPUR SEC-12 (BLOCK-E)', lat: 23.8282, lng: 90.3622, load: 1.5 },
  { name: 'MIRPUR SEC-12 (BLOCK-DHA)', lat: 23.8320, lng: 90.3620, load: 1.9 },
  { name: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', lat: 23.8305, lng: 90.3605, load: 1.1 },
  { name: 'MIRPUR SEC-12 (BLOCK-PA)', lat: 23.8338, lng: 90.3640, load: 1.8 },

  // Ward 3 (6 areas)
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', lat: 23.8220, lng: 90.3570, load: 1.8 },
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', lat: 23.8235, lng: 90.3595, load: 2.0 },
  { name: 'MIRPUR SEC-10 (BLOCK-A)', lat: 23.8198, lng: 90.3585, load: 1.5 },
  { name: 'MIRPUR SEC-10 (BLOCK-B)', lat: 23.8205, lng: 90.3610, load: 2.5 },
  { name: 'MIRPUR SEC-10 (BLOCK-C)', lat: 23.8245, lng: 90.3625, load: 1.6 },
  { name: 'MIRPUR SEC-10 (BLOCK-D)', lat: 23.8258, lng: 90.3640, load: 2.2 },

  // Ward 5 (8 areas)
  { name: 'BAUNIABAD BASTI TINSHEED QTR.', lat: 23.8315, lng: 90.3685, load: 3.0 },
  { name: 'MIRPUR SEC-11 (BLOCK-A)', lat: 23.8298, lng: 90.3678, load: 1.4 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', lat: 23.8335, lng: 90.3692, load: 2.1 },
  { name: 'MIRPUR SEC-11 (BLOCK-E)', lat: 23.8302, lng: 90.3705, load: 1.8 },
  { name: 'MIRPUR SEC-11 (BLOCK-D)', lat: 23.8322, lng: 90.3712, load: 1.4 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', lat: 23.8341, lng: 90.3701, load: 1.7 },
  { name: 'MIRPUR SEC-11 (BLOCK-F)', lat: 23.8288, lng: 90.3715, load: 2.0 },
  { name: 'PALASHNAGAR', lat: 23.8280, lng: 90.3690, load: 1.9 },

  // Ward 6 (12 areas)
  { name: 'DOARI PARA', lat: 23.8250, lng: 90.3675, load: 2.2 },
  { name: 'EASTERN HOUSING', lat: 23.8225, lng: 90.3682, load: 1.5 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA/E)', lat: 23.8205, lng: 90.3672, load: 1.6 },
  { name: 'MIRPUR SEC-6 (BLOCK-C)', lat: 23.8238, lng: 90.3698, load: 1.8 },
  { name: 'MIRPUR SEC-6 (BLOCK-D)', lat: 23.8215, lng: 90.3705, load: 2.0 },
  { name: 'MIRPUR SEC-6 (BLOCK-JA)', lat: 23.8255, lng: 90.3710, load: 1.4 },
  { name: 'MIRPUR SEC-6 (BLOCK-JHA)', lat: 23.8242, lng: 90.3708, load: 1.3 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA)', lat: 23.8195, lng: 90.3685, load: 1.7 },
  { name: 'MIRPUR SEC-7', lat: 23.8200, lng: 90.3700, load: 2.5 },
  { name: 'PALLABI (PART-1)', lat: 23.8262, lng: 90.3688, load: 1.6 },
  { name: 'PALLABI (EXTENSION)', lat: 23.8258, lng: 90.3695, load: 1.5 },
  { name: 'RUPNAGAR TINSHEED', lat: 23.8230, lng: 90.3715, load: 1.8 },

  // Ward 7 (16 areas)
  { name: 'MIRPUR SEC-2(BLOCK-F)', lat: 23.8202, lng: 90.3735, load: 2.2 },
  { name: 'MIRPUR SEC-6 (BLOCK-A)', lat: 23.8225, lng: 90.3745, load: 1.7 },
  { name: 'MIRPUR SEC-6 (BLOCK-B)', lat: 23.8212, lng: 90.3758, load: 2.8 },
  { name: 'MIRPUR SEC-2 (BLOCK-H)', lat: 23.8190, lng: 90.3740, load: 1.6 },
  { name: 'MIRPUR SEC-2 (BLOCK-CHA)', lat: 23.8238, lng: 90.3732, load: 1.5 },
  { name: 'MIRPUR SEC-2 (BLOCK-C)', lat: 23.8252, lng: 90.3748, load: 2.1 },
  { name: 'MIRPUR SEC-2 (BLOCK-A)', lat: 23.8265, lng: 90.3738, load: 1.9 },
  { name: 'MIRPUR SEC-2 (BLOCK-D)', lat: 23.8278, lng: 90.3752, load: 1.8 },
  { name: 'MIRPUR SEC-2 (BLOCK-E)', lat: 23.8248, lng: 90.3765, load: 2.0 },
  { name: 'MIRPUR SEC-2 (BLOCK-G)', lat: 23.8230, lng: 90.3775, load: 1.4 },
  { name: 'MIRPUR SEC-2 (BLOCK-B)', lat: 23.8220, lng: 90.3785, load: 1.6 },
  { name: 'MIRPUR SEC-2 (BLOCK-NEW-A)', lat: 23.8208, lng: 90.3772, load: 1.5 },
  { name: 'ALOBDI', lat: 23.8325, lng: 90.3760, load: 2.3 },
  { name: 'RUPNAGAR', lat: 23.8260, lng: 90.3780, load: 1.5 },
  { name: 'SHIALBARI', lat: 23.8285, lng: 90.3792, load: 2.0 },
  { name: 'RUPALI HOUSING ESTATE', lat: 23.8302, lng: 90.3778, load: 1.7 }
];

const rawPallabiRoadSegments = [
  { start: 'Pallabi Dumping Site', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Mirpur Road 12' },
  { start: 'MIRPUR SEC-12 (BLOCK-C)', end: 'MIRPUR SEC-12 (BLOCK-E)', roadName: 'Block C to E Road' },
  { start: 'MIRPUR SEC-12 (BLOCK-E)', end: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', roadName: 'Block E to TA Uttar Lane' },
  { start: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', end: 'MIRPUR SEC-12 (BLOCK-DHA)', roadName: 'TA Uttar to DHA Road' },
  { start: 'MIRPUR SEC-12 (BLOCK-DHA)', end: 'MIRPUR SEC-12 (BLOCK-D)', roadName: 'DHA to Block D Road' },
  { start: 'MIRPUR SEC-12 (BLOCK-D)', end: 'MIRPUR SEC-12 (BLOCK-PA)', roadName: 'Block D to PA Lane' },
  { start: 'MIRPUR SEC-12 (BLOCK-PA)', end: 'MIRPUR SEC-12 DOHS', roadName: 'PA to DOHS Main Road' },
  { start: 'MIRPUR SEC-12 DOHS', end: 'MIRPUR SEC-12 (BLOCK-B)', roadName: 'DOHS to Block B Road' },
  { start: 'MIRPUR SEC-12 (BLOCK-B)', end: 'MIRPUR SEC-12 (BLOCK-A)', roadName: 'Block B to A Lane' },
  { start: 'MIRPUR SEC-12 (BLOCK-A)', end: 'CHAKULI', roadName: 'Block A to Chakuli Road' },
  { start: 'CHAKULI', end: 'BAGUN BARI TEK', roadName: 'Chakuli to Bagun Bari Road' },
  { start: 'BAGUN BARI TEK', end: 'KALSHI', roadName: 'Bagun Bari to Kalshi Link' },
  { start: 'KALSHI', end: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', roadName: 'Kalshi to BLK-TA Dakshin Road' },
  { start: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Dakshin to Block C Road' },

  // Ward 3
  { start: 'KALSHI', end: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', roadName: 'Kalshi to Sec-11 C2 Link' },
  { start: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', end: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', roadName: 'Sec-11 C2 to C1 Avenue' },
  { start: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', end: 'MIRPUR SEC-10 (BLOCK-A)', roadName: 'Sec-11 C1 to Sec-10 A Link' },
  { start: 'MIRPUR SEC-10 (BLOCK-A)', end: 'MIRPUR SEC-10 (BLOCK-B)', roadName: 'Sec-10 A to B Road' },
  { start: 'MIRPUR SEC-10 (BLOCK-B)', end: 'MIRPUR SEC-10 (BLOCK-C)', roadName: 'Sec-10 B to C Lane' },
  { start: 'MIRPUR SEC-10 (BLOCK-C)', end: 'MIRPUR SEC-10 (BLOCK-D)', roadName: 'Sec-10 C to D Road' },
  { start: 'MIRPUR SEC-10 (BLOCK-D)', end: 'MIRPUR SEC-12 (BLOCK-C)', roadName: 'Sec-10 D to Sec-12 C Link' },

  // Ward 5
  { start: 'Pallabi Dumping Site', end: 'MIRPUR SEC-11 (BLOCK-A)', roadName: 'Pallabi to Sec-11 A Link' },
  { start: 'MIRPUR SEC-11 (BLOCK-A)', end: 'PALASHNAGAR', roadName: 'Sec-11 A to Palashnagar Road' },
  { start: 'PALASHNAGAR', end: 'MIRPUR SEC-11 (BLOCK-F)', roadName: 'Palashnagar to Sec-11 F Road' },
  { start: 'MIRPUR SEC-11 (BLOCK-F)', end: 'MIRPUR SEC-11 (BLOCK-E)', roadName: 'Sec-11 F to E Lane' },
  { start: 'MIRPUR SEC-11 (BLOCK-E)', end: 'MIRPUR SEC-11 (BLOCK-D)', roadName: 'Sec-11 E to D Road' },
  { start: 'MIRPUR SEC-11 (BLOCK-D)', end: 'BAUNIABAD BASTI TINSHEED QTR.', roadName: 'Sec-11 D to Bauniabad Road' },
  { start: 'BAUNIABAD BASTI TINSHEED QTR.', end: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', roadName: 'Bauniabad to B1 Road' },
  { start: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', end: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', roadName: 'Sec-11 B1 to B2 Link' },
  { start: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', end: 'BAUNIABAD BASTI TINSHEED QTR.', roadName: 'Sec-11 B2 to Bauniabad Lane' },

  // Ward 6
  { start: 'PALASHNAGAR', end: 'PALLABI (PART-1)', roadName: 'Palashnagar to Pallabi Link' },
  { start: 'PALLABI (PART-1)', end: 'PALLABI (EXTENSION)', roadName: 'Pallabi 1 to Ext Road' },
  { start: 'PALLABI (EXTENSION)', end: 'DOARI PARA', roadName: 'Pallabi Ext to Doaripara Road' },
  { start: 'DOARI PARA', end: 'EASTERN HOUSING', roadName: 'Doaripara to Eastern Housing Road' },
  { start: 'EASTERN HOUSING', end: 'MIRPUR SEC-6 (BLOCK-TA)', roadName: 'Eastern Housing to Sec-6 TA Link' },
  { start: 'MIRPUR SEC-6 (BLOCK-TA)', end: 'MIRPUR SEC-6 (BLOCK-TA/E)', roadName: 'Sec-6 TA to TA/E Road' },
  { start: 'MIRPUR SEC-6 (BLOCK-TA/E)', end: 'MIRPUR SEC-7', roadName: 'Sec-6 TA/E to Sec-7 Road' },
  { start: 'MIRPUR SEC-7', end: 'MIRPUR SEC-6 (BLOCK-D)', roadName: 'Sec-7 to Sec-6 D Lane' },
  { start: 'MIRPUR SEC-6 (BLOCK-D)', end: 'MIRPUR SEC-6 (BLOCK-C)', roadName: 'Sec-6 D to C Road' },
  { start: 'MIRPUR SEC-6 (BLOCK-C)', end: 'MIRPUR SEC-6 (BLOCK-JHA)', roadName: 'Sec-6 C to JHA Road' },
  { start: 'MIRPUR SEC-6 (BLOCK-C)', end: 'MIRPUR SEC-6 (BLOCK-JA)', roadName: 'Sec-6 C to JA Road' },
  { start: 'MIRPUR SEC-6 (BLOCK-JA)', end: 'RUPNAGAR TINSHEED', roadName: 'Sec-6 JA to Rupnagar Tinsheed Road' },
  { start: 'RUPNAGAR TINSHEED', end: 'DOARI PARA', roadName: 'Rupnagar Tinsheed to Doaripara Link' },

  // Ward 7
  { start: 'RUPNAGAR TINSHEED', end: 'MIRPUR SEC-2(BLOCK-F)', roadName: 'Rupnagar Tinsheed to Sec-2 F Road' },
  { start: 'MIRPUR SEC-2(BLOCK-F)', end: 'MIRPUR SEC-2 (BLOCK-H)', roadName: 'Sec-2 F to H Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-H)', end: 'MIRPUR SEC-2 (BLOCK-NEW-A)', roadName: 'Sec-2 H to New A Lane' },
  { start: 'MIRPUR SEC-2 (BLOCK-NEW-A)', end: 'MIRPUR SEC-2 (BLOCK-B)', roadName: 'Sec-2 New A to B Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-B)', end: 'MIRPUR SEC-2 (BLOCK-G)', roadName: 'Sec-2 B to G Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-G)', end: 'MIRPUR SEC-2 (BLOCK-E)', roadName: 'Sec-2 G to E Lane' },
  { start: 'MIRPUR SEC-2 (BLOCK-E)', end: 'MIRPUR SEC-2 (BLOCK-D)', roadName: 'Sec-2 E to D Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-D)', end: 'MIRPUR SEC-2 (BLOCK-C)', roadName: 'Sec-2 D to C Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-C)', end: 'MIRPUR SEC-2 (BLOCK-CHA)', roadName: 'Sec-2 C to CHA Lane' },
  { start: 'MIRPUR SEC-2 (BLOCK-CHA)', end: 'MIRPUR SEC-2 (BLOCK-A)', roadName: 'Sec-2 CHA to A Road' },
  { start: 'MIRPUR SEC-2 (BLOCK-A)', end: 'RUPNAGAR', roadName: 'Sec-2 A to Rupnagar Road' },
  { start: 'RUPNAGAR', end: 'MIRPUR SEC-6 (BLOCK-A)', roadName: 'Rupnagar to Sec-6 A Link' },
  { start: 'MIRPUR SEC-6 (BLOCK-A)', end: 'MIRPUR SEC-6 (BLOCK-B)', roadName: 'Sec-6 A to B Road' },
  { start: 'MIRPUR SEC-6 (BLOCK-B)', end: 'SHIALBARI', roadName: 'Sec-6 B to Shialbari Link' },
  { start: 'SHIALBARI', end: 'RUPALI HOUSING ESTATE', roadName: 'Shialbari to Rupali Housing Road' },
  { start: 'RUPALI HOUSING ESTATE', end: 'ALOBDI', roadName: 'Rupali Housing to Alobdi Lane' },
  { start: 'ALOBDI', end: 'SHIALBARI', roadName: 'Alobdi to Shialbari Road' }
];

const pallabiRoadSegments = generateRoadSegments(rawPallabiRoadSegments, pallabiPlaces);

let places = kafrulPlaces;
let roadSegments = kafrulRoadSegments;

// Distance helpers
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getSegmentDistance = (seg) => {
  let dist = 0;
  for (let i = 0; i < seg.coordinates.length - 1; i++) {
    dist += haversineDistance(
      seg.coordinates[i][0],
      seg.coordinates[i][1],
      seg.coordinates[i + 1][0],
      seg.coordinates[i + 1][1]
    );
  }
  return dist;
};

const cleanConsecutiveRoads = (roadNamesStr) => {
  if (!roadNamesStr) return '';
  const parts = roadNamesStr.split(' -> ').map(s => s.trim());
  const cleaned = parts.filter((name, idx) => idx === 0 || name !== parts[idx - 1]);
  return cleaned.join(' -> ');
};

// Graph structure construction
const buildGraphAdjacency = () => {
  const adj = {};
  places.forEach((p) => {
    adj[p.name] = [];
  });
  roadSegments.forEach((seg) => {
    const dist = getSegmentDistance(seg);
    adj[seg.start].push({ node: seg.end, weight: dist, coords: seg.coordinates, name: seg.roadName });
    adj[seg.end].push({ node: seg.start, weight: dist, coords: [...seg.coordinates].reverse(), name: seg.roadName });
  });
  return adj;
};

// Dijkstra Solver
const runDijkstra = (startName, endName) => {
  const adj = buildGraphAdjacency();
  const dist = {};
  const prev = {};
  const prevEdge = {};
  const visited = new Set();

  places.forEach((p) => {
    dist[p.name] = Infinity;
    prev[p.name] = null;
  });

  dist[startName] = 0;

  while (true) {
    let current = null;
    let minDist = Infinity;

    places.forEach((p) => {
      if (!visited.has(p.name) && dist[p.name] < minDist) {
        minDist = dist[p.name];
        current = p.name;
      }
    });

    if (current === null || current === endName) break;
    visited.add(current);

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const alt = dist[current] + edge.weight;
      if (alt < dist[edge.node]) {
        dist[edge.node] = alt;
        prev[edge.node] = current;
        prevEdge[edge.node] = edge;
      }
    }
  }

  if (dist[endName] === Infinity) return null;

  const pathNodes = [];
  const pathCoords = [];
  const pathEdges = [];
  let curr = endName;

  while (curr !== startName) {
    pathNodes.unshift(curr);
    const edge = prevEdge[curr];
    pathCoords.unshift(...edge.coords);
    pathEdges.unshift(edge.name);
    curr = prev[curr];
  }
  pathNodes.unshift(startName);

  return {
    nodes: pathNodes,
    coordinates: pathCoords,
    roadNames: pathEdges.join(' -> '),
    distance: dist[endName]
  };
};

// A* Solver
const runAStar = (startName, endName) => {
  const targetNode = places.find((p) => p.name === endName);
  const heuristic = (name) => {
    const node = places.find((p) => p.name === name);
    if (!node || !targetNode) return 0;
    return haversineDistance(node.lat, node.lng, targetNode.lat, targetNode.lng);
  };

  const adj = buildGraphAdjacency();
  const openSet = new Set([startName]);
  const cameFrom = {};
  const cameFromEdge = {};
  const gScore = {};
  const fScore = {};

  places.forEach((p) => {
    gScore[p.name] = Infinity;
    fScore[p.name] = Infinity;
  });

  gScore[startName] = 0;
  fScore[startName] = heuristic(startName);

  while (openSet.size > 0) {
    let current = null;
    let minF = Infinity;

    openSet.forEach((node) => {
      if (fScore[node] < minF) {
        minF = fScore[node];
        current = node;
      }
    });

    if (current === endName) {
      const pathNodes = [];
      const pathCoords = [];
      const pathEdges = [];
      let curr = endName;

      while (curr !== startName) {
        pathNodes.unshift(curr);
        const edge = cameFromEdge[curr];
        pathCoords.unshift(...edge.coords);
        pathEdges.unshift(edge.name);
        curr = cameFrom[curr];
      }
      pathNodes.unshift(startName);

      return {
        nodes: pathNodes,
        coordinates: pathCoords,
        roadNames: pathEdges.join(' -> '),
        distance: gScore[endName]
      };
    }

    openSet.delete(current);

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const tentativeG = gScore[current] + edge.weight;
      if (tentativeG < gScore[edge.node]) {
        cameFrom[edge.node] = current;
        cameFromEdge[edge.node] = edge;
        gScore[edge.node] = tentativeG;
        fScore[edge.node] = tentativeG + heuristic(edge.node);
        openSet.add(edge.node);
      }
    }
  }

  return null;
};

// All pairs shortest path matrix helper
const getShortestPathMatrix = () => {
  const matrix = {};
  places.forEach((p1) => {
    matrix[p1.name] = {};
    places.forEach((p2) => {
      if (p1.name === p2.name) {
        matrix[p1.name][p2.name] = { distance: 0, path: [] };
      } else {
        const path = runDijkstra(p1.name, p2.name);
        matrix[p1.name][p2.name] = path
          ? { distance: path.distance, path: path }
          : { distance: Infinity, path: null };
      }
    });
  });
  return matrix;
};

// TSP Solver
const runTSP = () => {
  const matrix = getShortestPathMatrix();
  const unvisited = new Set(places.map((p) => p.name).filter((name) => name !== places[0].name));
  const tour = [places[0].name];

  let current = places[0].name;
  while (unvisited.size > 0) {
    let nearest = null;
    let minDist = Infinity;

    unvisited.forEach((node) => {
      const dist = matrix[current][node].distance;
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    });

    if (nearest) {
      tour.push(nearest);
      unvisited.delete(nearest);
      current = nearest;
    } else {
      break;
    }
  }
  tour.push(places[0].name);

  let totalDistance = 0;
  const pathCoordinates = [];
  const roadNamesList = [];

  for (let i = 0; i < tour.length - 1; i++) {
    const from = tour[i];
    const to = tour[i + 1];
    const segmentPath = matrix[from][to].path;
    if (segmentPath) {
      totalDistance += segmentPath.distance;
      pathCoordinates.push(...segmentPath.coordinates);
      roadNamesList.push(segmentPath.roadNames);
    }
  }

  return {
    nodes: tour,
    coordinates: pathCoordinates,
    roadNames: cleanConsecutiveRoads(roadNamesList.filter(Boolean).join(' -> ')),
    distance: totalDistance
  };
};

// VRP Solver
const runVRP = (vehicleCount, vehicleType) => {
  const capacity = vehicleType === 'truck' ? 10.0 : 3.0;

  const matrix = getShortestPathMatrix();
  const unvisited = new Set(places.map((p) => p.name).filter((name) => name !== places[0].name));

  const routes = [];
  for (let v = 0; v < vehicleCount; v++) {
    routes.push({
      nodes: [places[0].name],
      load: 0,
      coordinates: [],
      distance: 0,
      roadNames: []
    });
  }

  while (unvisited.size > 0) {
    let bestNode = null;
    let bestDist = Infinity;
    let targetRouteIdx = -1;

    for (let r = 0; r < vehicleCount; r++) {
      const route = routes[r];
      const current = route.nodes[route.nodes.length - 1];

      unvisited.forEach((node) => {
        const placeObj = places.find((p) => p.name === node);
        const load = placeObj ? placeObj.load : 1.0;
        if (route.load + load <= capacity) {
          const dist = matrix[current][node].distance;
          if (dist < bestDist) {
            bestDist = dist;
            bestNode = node;
            targetRouteIdx = r;
          }
        }
      });
    }

    if (bestNode && targetRouteIdx !== -1) {
      const route = routes[targetRouteIdx];
      const from = route.nodes[route.nodes.length - 1];
      const segmentPath = matrix[from][bestNode].path;
      const placeObj = places.find((p) => p.name === bestNode);

      route.nodes.push(bestNode);
      route.load += placeObj ? placeObj.load : 1.0;
      if (segmentPath && segmentPath.coordinates) {
        route.distance += segmentPath.distance;
        route.coordinates.push(...segmentPath.coordinates);
        route.roadNames.push(segmentPath.roadNames);
      }
      unvisited.delete(bestNode);
    } else {
      const remainingNode = Array.from(unvisited)[0];
      if (!remainingNode) break;

      let minLoadIdx = 0;
      let minLoad = Infinity;
      for (let r = 0; r < vehicleCount; r++) {
        if (routes[r].load < minLoad) {
          minLoad = routes[r].load;
          minLoadIdx = r;
        }
      }

      const route = routes[minLoadIdx];
      const from = route.nodes[route.nodes.length - 1];
      const segmentPath = matrix[from][remainingNode].path;
      const placeObj = places.find((p) => p.name === remainingNode);

      route.nodes.push(remainingNode);
      route.load += placeObj ? placeObj.load : 1.0;
      if (segmentPath && segmentPath.coordinates) {
        route.distance += segmentPath.distance;
        route.coordinates.push(...segmentPath.coordinates);
        route.roadNames.push(segmentPath.roadNames);
      }
      unvisited.delete(remainingNode);
    }
  }

  routes.forEach((route) => {
    const from = route.nodes[route.nodes.length - 1];
    const segmentPath = matrix[from][places[0].name].path;
    route.nodes.push(places[0].name);
    if (segmentPath && segmentPath.coordinates) {
      route.distance += segmentPath.distance;
      route.coordinates.push(...segmentPath.coordinates);
      route.roadNames.push(segmentPath.roadNames);
    }
  });

  const activeRoutes = routes.filter((r) => r.nodes.length > 2);

  return {
    routes: activeRoutes.map((r, idx) => ({
      vehicle: idx + 1,
      nodes: r.nodes,
      load: Math.round(r.load * 10) / 10,
      distance: Math.round(r.distance * 100) / 100,
      coordinates: r.coordinates,
      roadNames: cleanConsecutiveRoads(r.roadNames.filter(Boolean).join(' -> '))
    })),
    totalDistance: Math.round(activeRoutes.reduce((acc, r) => acc + r.distance, 0) * 100) / 100
  };
};

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

export default function RouteManager() {
  const { user } = useAuth();
  const isHelal = user?.email?.toLowerCase() === 'helal@gmail.com';

  // Assign places & roadSegments dynamically
  places = isHelal ? pallabiPlaces : kafrulPlaces;
  roadSegments = isHelal ? pallabiRoadSegments : kafrulRoadSegments;

  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [destination, setDestination] = useState('');
  const [vehicleCount, setVehicleCount] = useState(2);
  const [vehicleType, setVehicleType] = useState('van');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setResult(null);
  }, [algorithm, destination, vehicleCount, vehicleType]);

  const optimize = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        if ((algorithm === 'dijkstra' || algorithm === 'a_star') && !destination) {
          setError('Please select a destination landmark.');
          setLoading(false);
          return;
        }

        if (algorithm === 'dijkstra') {
          const pathRes = runDijkstra(places[0].name, destination);
          if (pathRes) {
            setResult({
              algorithm: 'dijkstra',
              totalDistance: Math.round(pathRes.distance * 100) / 100,
              path: pathRes.nodes,
              roadName: pathRes.roadNames,
              coordinates: pathRes.coordinates
            });
          } else {
            setError('No path found to the destination.');
          }
        } else if (algorithm === 'a_star') {
          const pathRes = runAStar(places[0].name, destination);
          if (pathRes) {
            setResult({
              algorithm: 'a_star',
              totalDistance: Math.round(pathRes.distance * 100) / 100,
              path: pathRes.nodes,
              roadName: pathRes.roadNames,
              coordinates: pathRes.coordinates
            });
          } else {
            setError('No path found to the destination.');
          }
        } else if (algorithm === 'tsp') {
          const pathRes = runTSP();
          setResult({
            algorithm: 'tsp',
            totalDistance: Math.round(pathRes.distance * 100) / 100,
            path: pathRes.nodes,
            roadName: pathRes.roadNames,
            coordinates: pathRes.coordinates
          });
        } else if (algorithm === 'vrp') {
          const vrpRes = runVRP(vehicleCount, vehicleType);
          setResult({
            algorithm: 'vrp',
            totalDistance: vrpRes.totalDistance,
            routes: vrpRes.routes,
            coordinates: vrpRes.routes.flatMap((r) => r.coordinates)
          });
        }
      } catch (err) {
        console.error('Optimization error:', err);
        setError('An error occurred during path optimization.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const algorithms = [
    { id: 'dijkstra', name: 'Dijkstra', desc: 'Shortest path to target area' },
    { id: 'a_star', name: 'A* Search', desc: 'Heuristic-guided shortest path' },
    { id: 'tsp', name: 'TSP (1 Vehicle)', desc: 'Visit all areas in 1 round trip' },
    { id: 'vrp', name: 'VRP (Multi-Vehicle)', desc: 'Multi-vehicle dispatch & capacities' }
  ];

  const center = isHelal ? [23.828969, 90.365585] : [23.791, 90.385];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-eco-text mb-1">Route Optimizer</h1>
        <p className="text-eco-secondary text-sm">Optimize garbage collection routes across {isHelal ? 'Dhaka Wards 2, 3, 5, 6, 7' : 'Dhaka Ward 16'} using advanced mathematical models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6 min-w-0">
          {/* Algorithm Selection */}
          <div className="glass rounded-2xl p-6 border border-eco-primary/10">
            <h3 className="text-eco-text font-semibold text-sm mb-4 flex items-center gap-2 border-b border-eco-primary/10 pb-2">
              <FontAwesomeIcon icon={faCircleNodes} className="text-eco-accent text-xs" />
              Routing Model
            </h3>
            <div className="space-y-2">
              {algorithms.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAlgorithm(a.id)}
                  className={`algo-btn transition-all ${algorithm === a.id ? 'active' : ''}`}
                >
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-[10px] mt-0.5 opacity-70 leading-relaxed">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="glass rounded-2xl p-5 !mt-5">
            <h3 className="text-eco-text font-semibold text-sm mb-5">Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-eco-secondary text-xs mb-1 block">Start Depot (Origin)</label>
                <div className="w-full px-3 py-2.5 rounded-xl bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapPin} className="text-eco-accent text-xs shrink-0" />
                  <span className="text-eco-text font-medium">{places[0].name} (Depot)</span>
                </div>
              </div>

              {(algorithm === 'dijkstra' || algorithm === 'a_star') && (
                <div>
                  <label className="text-eco-secondary text-xs mb-1 block">Target Landmark Area</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm focus:outline-none focus:border-eco-accent/50"
                  >
                    <option value="">-- Choose Destination --</option>
                    {places
                      .filter((p) => p.name !== places[0].name)
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {algorithm === 'vrp' && (
                <>
                  <div>
                    <label className="text-eco-secondary text-xs mb-1 block">Number of Vehicles</label>
                    <input
                      type="number"
                      min={1}
                      value={vehicleCount}
                      onChange={(e) => setVehicleCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 rounded-xl bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm focus:outline-none focus:border-eco-accent/50"
                    />
                  </div>

                  <div>
                    <label className="text-eco-secondary text-xs mb-1 block">Vehicle Capacity Profile</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-eco-bg/60 border border-eco-primary/20 text-eco-text text-sm focus:outline-none focus:border-eco-accent/50"
                    >
                      <option value="van">Rickshaw Van (Capacity: 3 Tons)</option>
                      <option value="truck">Big Truck (Capacity: 10 Tons)</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={optimize}
                disabled={loading}
                className="btn-primary w-full justify-center !mt-6"
              >
                <FontAwesomeIcon icon={loading ? faSpinner : faPlay} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Optimizing...' : 'Run Optimization'}
              </button>

              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Panel & Direction List */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="glass rounded-2xl overflow-hidden border border-eco-primary/10 responsive-map-container optimizer"
          >
            <MapContainer center={center} zoom={14.5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Auto-focus Viewport Controller */}
              {result && <MapController selectedCoords={result.coordinates} />}

              {/* Inactive Base Streets */}
              {roadSegments.map((road, idx) => (
                <Polyline
                  key={`base-${idx}`}
                  positions={road.coordinates}
                  pathOptions={{ color: '#1e293b', weight: 2.5, opacity: 0.4 }}
                />
              ))}

              {/* Highlighted Optimization Routes */}
              {result &&
                (result.algorithm !== 'vrp' ? (
                  <Polyline
                    positions={result.coordinates}
                    pathOptions={{
                      color: '#22c55e', // Green for single optimal path
                      weight: 8,
                      opacity: 0.95,
                      dashArray: '5, 8'
                    }}
                  />
                ) : (
                  result.routes.map((r) => (
                    <Polyline
                      key={`vrp-poly-${r.vehicle}`}
                      positions={r.coordinates}
                      pathOptions={{
                        color: vrpRouteColors[(r.vehicle - 1) % vrpRouteColors.length],
                        weight: 7,
                        opacity: 0.9,
                        dashArray: '5, 10'
                      }}
                    />
                  ))
                ))}

              {/* Landmark Markers */}
              {places.map((p) => {
                const isStartDepot = p.name === places[0].name;
                return (
                  <Marker
                    key={p.name}
                    position={[p.lat, p.lng]}
                    icon={
                      isStartDepot
                        ? L.divIcon({
                            className: 'custom-depot-marker',
                            html: `<div class="w-7 h-7 rounded-xl bg-eco-accent border-2 border-eco-text shadow-xl flex items-center justify-center text-eco-bg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>`,
                            iconSize: [28, 28],
                            iconAnchor: [14, 14]
                          })
                        : L.divIcon({
                            className: 'custom-customer-marker',
                            html: `<div class="w-6 h-6 rounded-lg bg-eco-primary/80 border border-eco-accent/30 shadow-lg flex flex-col items-center justify-center text-[8px] text-eco-text font-bold"><span>${p.load}T</span></div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                          })
                    }
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold text-sm text-eco-text mb-1">{p.name}</p>
                        {isStartDepot ? (
                          <p className="text-eco-accent font-semibold">Origin Waste Depot</p>
                        ) : (
                          <>
                            <p className="text-eco-secondary">
                              Waste Generation: <strong>{p.load} Tons / day</strong>
                            </p>
                            <p className="text-eco-secondary/80 text-[10px] mt-0.5">
                              Lat: {p.lat.toFixed(6)}, Lng: {p.lng.toFixed(6)}
                            </p>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Step-by-step Direction Path below the Map */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass rounded-2xl p-5 border border-eco-primary/10 bg-gradient-to-br from-eco-surface/20 to-eco-accent/5"
              >
                <h3 className="text-eco-text font-semibold text-sm mb-4 border-b border-eco-primary/10 pb-2">
                  Optimization Path Sequence
                </h3>
                {result.algorithm !== 'vrp' ? (
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-2 text-xs">
                    {result.path.map((nodeName, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="inline-flex items-center justify-center h-11 rounded-xl bg-eco-surface border border-eco-primary/20 text-eco-text text-xs font-semibold whitespace-nowrap shadow-sm"
                          style={{ paddingLeft: '28px', paddingRight: '28px' }}
                        >
                          {nodeName}
                        </div>
                        {idx < result.path.length - 1 && <span className="text-eco-accent/60 font-bold font-mono">➔</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.routes.map((r) => (
                      <div key={r.vehicle} className="space-y-2">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: vrpRouteColors[(r.vehicle - 1) % vrpRouteColors.length] }}
                        >
                          Vehicle #{r.vehicle} Dispatch Sequence:
                        </p>
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-2 text-xs">
                          {r.nodes.map((nodeName, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div
                                className="inline-flex items-center justify-center h-10 rounded-lg bg-eco-surface border border-eco-primary/20 text-eco-text text-xs font-semibold whitespace-nowrap shadow-sm"
                                style={{ paddingLeft: '24px', paddingRight: '24px' }}
                              >
                                {nodeName}
                              </div>
                              {idx < r.nodes.length - 1 && <span className="opacity-60 font-mono">➔</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step-by-step Routing Specifications below the path sequence */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass rounded-2xl p-5 border border-eco-primary/10 bg-gradient-to-br from-eco-surface/20 to-eco-accent/5"
              >
                <h3 className="text-eco-text font-semibold text-sm mb-4 border-b border-eco-primary/10 pb-2">
                  Routing Specifications
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-eco-secondary text-xs mb-1 block">
                        Total Distance
                      </span>
                      <p className="text-eco-accent text-2xl font-mono font-bold mt-1">
                        {result.totalDistance} km
                      </p>
                    </div>
                    <div>
                      <span className="text-eco-secondary text-xs mb-1 block">
                        Active Sites
                      </span>
                      <p className="text-eco-text text-2xl font-mono font-bold mt-1">
                        {result.algorithm === 'vrp'
                          ? places.length - 1
                          : result.path.length - 2 > 0
                          ? result.path.length - 2
                          : 0}
                      </p>
                    </div>
                  </div>

                  {result.algorithm !== 'vrp' ? (
                    <div>
                      <span className="text-eco-secondary text-xs mb-1 block">
                        Traversed Streets
                      </span>
                      <p className="text-eco-text text-xs font-semibold leading-relaxed mt-1">
                        {result.roadName}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-eco-primary/10">
                      <span className="text-eco-secondary text-xs mb-1 block">
                        Dispatched Routes
                      </span>
                      {result.routes.map((r) => (
                        <div
                          key={r.vehicle}
                          className="p-3 rounded-xl border text-xs bg-eco-surface/50 border-eco-primary/20"
                        >
                          <div className="flex justify-between items-center font-bold mb-1">
                            <span style={{ color: vrpRouteColors[(r.vehicle - 1) % vrpRouteColors.length] }}>
                              Vehicle #{r.vehicle} ({vehicleType.toUpperCase()})
                            </span>
                            <span className="text-eco-text/90 font-mono">
                              {r.distance} km | Load: {r.load}T
                            </span>
                          </div>
                          <p className="text-eco-secondary text-[10px] leading-relaxed">
                            {r.roadNames}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
